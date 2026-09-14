import os
import uuid
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, status
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole
from app.models.project import Proyek, ProyekStatus, MediaType
from app.models.evaluation import EvaluasiPembangunan, DokumentasiEvaluasi, EvaluasiStatusLog, EvaluasiStatus
from app.schemas.evaluation import (
    EvaluasiCreate, EvaluasiVerifikasiRequest, EvaluasiResponse,
    DokumentasiEvaluasiResponse, EvaluasiStatusLogResponse
)
from app.schemas.auth import UserBrief
from app.services.gemini_service import analyze_evaluation_with_ai

router = APIRouter(tags=["Evaluasi Pasca-Proyek (Fitur 12)"])

@router.post("/proyek/{id}/evaluasi", response_model=EvaluasiResponse, status_code=status.HTTP_201_CREATED)
def submit_post_project_evaluation(
    id: int,
    req: EvaluasiCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Fitur 12 PRD: Mekanisme pengajuan laporan atas proyek berstatus 'Selesai' yang terindikasi
    cacat/tidak sesuai spesifikasi.
    Dilengkapi analisis otomatis Gemini AI untuk skor urgensi (1-5) dan ringkasan teknis.
    Mencatat entri awal ke log audit trail.
    """
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    if proyek.status != ProyekStatus.selesai:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Evaluasi cacat pembangunan hanya dapat diajukan untuk proyek yang telah berstatus 'Selesai'."
        )

    # Analisis otomatis dengan AI (Google Gemini)
    ai_result = analyze_evaluation_with_ai(
        kategori_masalah=req.kategori_masalah,
        deskripsi=req.deskripsi,
        nama_proyek=proyek.nama_proyek,
        kategori_proyek=proyek.kategori.value
    )

    evaluasi = EvaluasiPembangunan(
        proyek_id=id,
        user_id=current_user.id,
        kategori_masalah=req.kategori_masalah,
        deskripsi=req.deskripsi,
        skor_urgensi_ai=ai_result.get("skor_urgensi_ai", 3),
        ringkasan_analisis_ai=ai_result.get("ringkasan_analisis_ai", ""),
        status=EvaluasiStatus.menunggu_verifikasi
    )
    db.add(evaluasi)
    db.commit()
    db.refresh(evaluasi)

    # Catat audit trail pertama kali
    log_entry = EvaluasiStatusLog(
        evaluasi_id=evaluasi.id,
        status_sebelumnya=None,
        status_baru=EvaluasiStatus.menunggu_verifikasi.value,
        diubah_oleh=current_user.id,
        catatan="Laporan evaluasi fisik pasca-proyek diajukan oleh pengguna."
    )
    db.add(log_entry)
    db.commit()

    return get_evaluation_detail(evaluasi.id, db)

@router.get("/evaluasi", response_model=List[EvaluasiResponse])
def get_evaluations(
    status_filter: Optional[EvaluasiStatus] = Query(None, alias="status"),
    proyek_id: Optional[int] = Query(None),
    min_urgensi: Optional[int] = Query(None, ge=1, le=5),
    db: Session = Depends(get_db)
):
    """
    Mengambil daftar laporan evaluasi pembangunan pasca-proyek
    (antrean verifikasi admin dinas dan pimpinan instansi).
    """
    query = db.query(EvaluasiPembangunan)
    if status_filter:
        query = query.filter(EvaluasiPembangunan.status == status_filter)
    if proyek_id:
        query = query.filter(EvaluasiPembangunan.proyek_id == proyek_id)
    if min_urgensi:
        query = query.filter(EvaluasiPembangunan.skor_urgensi_ai >= min_urgensi)

    evaluations = query.order_by(EvaluasiPembangunan.created_at.desc()).all()
    results = []
    for e in evaluations:
        results.append(get_evaluation_detail(e.id, db))
    return results

@router.get("/evaluasi/{eval_id}", response_model=EvaluasiResponse)
def get_evaluation_detail(eval_id: int, db: Session = Depends(get_db)):
    """Mengambil detail lengkap laporan evaluasi pasca-proyek, riwayat log status, dan berkas bukti."""
    evaluasi = db.query(EvaluasiPembangunan).filter(EvaluasiPembangunan.id == eval_id).first()
    if not evaluasi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluasi tidak ditemukan.")

    # Susun respon dengan relasi
    res = EvaluasiResponse(
        id=evaluasi.id,
        proyek_id=evaluasi.proyek_id,
        nama_proyek=evaluasi.proyek.nama_proyek if evaluasi.proyek else "",
        user_id=evaluasi.user_id,
        kategori_masalah=evaluasi.kategori_masalah,
        deskripsi=evaluasi.deskripsi,
        skor_urgensi_ai=evaluasi.skor_urgensi_ai,
        ringkasan_analisis_ai=evaluasi.ringkasan_analisis_ai,
        status=evaluasi.status,
        ditinjau_oleh=evaluasi.ditinjau_oleh,
        created_at=evaluasi.created_at,
        updated_at=evaluasi.updated_at,
        pelapor=UserBrief.model_validate(evaluasi.pelapor) if evaluasi.pelapor else None,
        peninjau=UserBrief.model_validate(evaluasi.peninjau) if evaluasi.peninjau else None,
        dokumentasi_list=[
            DokumentasiEvaluasiResponse.model_validate(d) for d in evaluasi.dokumentasi_list
        ],
        status_logs=[
            EvaluasiStatusLogResponse(
                id=log.id,
                evaluasi_id=log.evaluasi_id,
                status_sebelumnya=log.status_sebelumnya,
                status_baru=log.status_baru,
                diubah_oleh=log.diubah_oleh,
                catatan=log.catatan,
                created_at=log.created_at,
                nama_pengubah=log.pengubah.nama if log.pengubah else "Sistem"
            ) for log in evaluasi.status_logs
        ]
    )
    return res

@router.patch("/evaluasi/{eval_id}/verifikasi", response_model=EvaluasiResponse)
def verify_evaluation(
    eval_id: int,
    req: EvaluasiVerifikasiRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin_dinas, UserRole.pimpinan_instansi]))
):
    """
    Fitur 12 PRD: Verifikasi dan tindak lanjut laporan evaluasi oleh admin dinas/pimpinan.
    Mencatat jejak audit trail lengkap ke tabel evaluasi_status_log.
    """
    evaluasi = db.query(EvaluasiPembangunan).filter(EvaluasiPembangunan.id == eval_id).first()
    if not evaluasi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluasi tidak ditemukan.")

    status_lama = evaluasi.status.value
    evaluasi.status = req.status
    evaluasi.ditinjau_oleh = current_user.id

    # Catat audit log
    log = EvaluasiStatusLog(
        evaluasi_id=evaluasi.id,
        status_sebelumnya=status_lama,
        status_baru=req.status.value,
        diubah_oleh=current_user.id,
        catatan=req.catatan
    )
    db.add(log)
    db.commit()
    db.refresh(evaluasi)

    return get_evaluation_detail(eval_id, db)

@router.post("/evaluasi/{eval_id}/dokumentasi", response_model=DokumentasiEvaluasiResponse, status_code=status.HTTP_201_CREATED)
def upload_evaluation_proof(
    eval_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mengunggah foto atau video bukti kerusakan fisik pasca-proyek."""
    evaluasi = db.query(EvaluasiPembangunan).filter(EvaluasiPembangunan.id == eval_id).first()
    if not evaluasi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Evaluasi tidak ditemukan.")

    original_filename = file.filename or ""
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""
    if ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Format file tidak didukung. Ekstensi yang diizinkan: {settings.ALLOWED_EXTENSIONS}"
        )

    video_exts = ["mp4", "mov", "avi", "webm"]
    tipe_media = MediaType.video if ext in video_exts else MediaType.foto

    upload_dir = os.path.join(os.getcwd(), settings.UPLOAD_DIR)
    os.makedirs(upload_dir, exist_ok=True)

    unique_name = f"eval_{eval_id}_{uuid.uuid4().hex[:10]}.{ext}"
    target_path = os.path.join(upload_dir, unique_name)

    with open(target_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_url = f"/uploads/{unique_name}"

    dok = DokumentasiEvaluasi(
        evaluasi_id=eval_id,
        tipe_media=tipe_media,
        url_file=file_url
    )
    db.add(dok)
    db.commit()
    db.refresh(dok)

    return dok

from typing import List, Optional
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_roles
from app.models.user import User, UserRole, WilayahAdministratif, Dinas
from app.models.project import Proyek, TahapanProgres, ProyekKategori, ProyekStatus
from app.models.report import RatingKepuasan
from app.schemas.project import (
    ProyekCreate, ProyekUpdate, ProyekResponse, ProyekListItem, PaginatedProyekResponse,
    TahapanCreate, TahapanResponse
)
from app.services.notification_service import notify_project_subscribers

router = APIRouter(prefix="/proyek", tags=["Proyek Pembangunan (Fitur 2, 3, 7)"])

@router.get("", response_model=PaginatedProyekResponse)
def get_projects(
    wilayah_id: Optional[int] = Query(None, description="Filter wilayah administratif (hierarkis)"),
    kategori: Optional[ProyekKategori] = Query(None, description="Filter kategori: jalan, taman, drainase, dll"),
    status_proyek: Optional[ProyekStatus] = Query(None, alias="status", description="Filter status pengerjaan"),
    min_anggaran: Optional[Decimal] = Query(None, description="Filter anggaran minimum"),
    max_anggaran: Optional[Decimal] = Query(None, description="Filter anggaran maksimum"),
    q: Optional[str] = Query(None, description="Pencarian kata kunci nama proyek atau deskripsi"),
    page: int = Query(1, ge=1, description="Nomor halaman"),
    page_size: int = Query(10, ge=1, le=100, description="Jumlah item per halaman"),
    db: Session = Depends(get_db)
):
    """
    Fitur 7 PRD: Pencarian dan Filter Proyek Berjenjang.
    Menyaring data proyek berdasarkan lokasi wilayah, kategori, status, anggaran, dan kata kunci.
    """
    query = db.query(Proyek)

    if wilayah_id:
        # Menangani hierarki wilayah: jika wilayah adalah kecamatan/kabupaten, ambil juga sub-wilayahnya
        sub_ids = [wilayah_id]
        child_wilayah = db.query(WilayahAdministratif.id).filter(WilayahAdministratif.parent_id == wilayah_id).all()
        for c in child_wilayah:
            sub_ids.append(c[0])
            grand_child = db.query(WilayahAdministratif.id).filter(WilayahAdministratif.parent_id == c[0]).all()
            for gc in grand_child:
                sub_ids.append(gc[0])
        query = query.filter(Proyek.wilayah_id.in_(sub_ids))

    if kategori:
        query = query.filter(Proyek.kategori == kategori)
    if status_proyek:
        query = query.filter(Proyek.status == status_proyek)
    if min_anggaran is not None:
        query = query.filter(Proyek.anggaran >= min_anggaran)
    if max_anggaran is not None:
        query = query.filter(Proyek.anggaran <= max_anggaran)
    if q:
        search_pattern = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Proyek.nama_proyek.ilike(search_pattern),
                Proyek.deskripsi.ilike(search_pattern)
            )
        )

    total = query.count()
    offset = (page - 1) * page_size
    projects = query.order_by(Proyek.updated_at.desc()).offset(offset).limit(page_size).all()

    items = []
    for p in projects:
        # Hitung rating rata-rata
        rating_stats = db.query(
            func.avg(RatingKepuasan.skor),
            func.count(RatingKepuasan.id)
        ).filter(RatingKepuasan.proyek_id == p.id).first()

        avg_score = float(rating_stats[0]) if rating_stats[0] is not None else None
        rating_count = int(rating_stats[1]) if rating_stats[1] is not None else 0

        item = ProyekListItem(
            id=p.id,
            nama_proyek=p.nama_proyek,
            kategori=p.kategori,
            deskripsi=p.deskripsi,
            latitude=p.latitude,
            longitude=p.longitude,
            wilayah_id=p.wilayah_id,
            dinas_id=p.dinas_id,
            anggaran=p.anggaran,
            status=p.status,
            progres_persen=p.progres_persen,
            tanggal_mulai=p.tanggal_mulai,
            estimasi_selesai=p.estimasi_selesai,
            created_at=p.created_at,
            updated_at=p.updated_at,
            nama_wilayah=p.wilayah.nama_wilayah if p.wilayah else None,
            nama_dinas=p.dinas.nama_dinas if p.dinas else None,
            rata_rata_rating=avg_score,
            jumlah_rating=rating_count
        )
        items.append(item)

    return PaginatedProyekResponse(
        total=total,
        page=page,
        page_size=page_size,
        items=items
    )

@router.get("/{id}", response_model=ProyekResponse)
def get_project_detail(id: int, db: Session = Depends(get_db)):
    """
    Fitur 2 PRD: Mengambil detail lengkap proyek beserta linimasa tahapan (timeline)
    dan galeri dokumentasi foto/video secara kronologis.
    """
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    rating_stats = db.query(
        func.avg(RatingKepuasan.skor),
        func.count(RatingKepuasan.id)
    ).filter(RatingKepuasan.proyek_id == proyek.id).first()

    response = ProyekResponse.model_validate(proyek)
    response.rata_rata_rating = float(rating_stats[0]) if rating_stats[0] is not None else None
    response.jumlah_rating = int(rating_stats[1]) if rating_stats[1] is not None else 0
    return response

@router.post("", response_model=ProyekResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    req: ProyekCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin_dinas, UserRole.pimpinan_instansi]))
):
    """
    Fitur 3 PRD: Dashboard Pemerintah - Tambah Proyek Baru oleh Admin Dinas / Pimpinan.
    Memvalidasi koordinat spasial, wilayah terdaftar, dan dinas penanggung jawab.
    """
    # Verifikasi wilayah
    wilayah = db.query(WilayahAdministratif).filter(WilayahAdministratif.id == req.wilayah_id).first()
    if not wilayah:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Wilayah administratif tidak valid.")

    # Verifikasi dinas
    dinas = db.query(Dinas).filter(Dinas.id == req.dinas_id).first()
    if not dinas:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Dinas penanggung jawab tidak valid.")

    # Jika admin dinas, pastikan dinas sesuai dengan instansinya jika terikat
    if current_user.role == UserRole.admin_dinas and current_user.dinas_id and current_user.dinas_id != req.dinas_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin dinas hanya diperkenankan menginput proyek untuk dinas instansinya sendiri."
        )

    proyek = Proyek(
        nama_proyek=req.nama_proyek,
        kategori=req.kategori,
        deskripsi=req.deskripsi,
        latitude=req.latitude,
        longitude=req.longitude,
        wilayah_id=req.wilayah_id,
        dinas_id=req.dinas_id,
        anggaran=req.anggaran,
        status=req.status,
        progres_persen=req.progres_persen,
        tanggal_mulai=req.tanggal_mulai,
        estimasi_selesai=req.estimasi_selesai,
        dibuat_oleh=current_user.id
    )
    db.add(proyek)
    db.commit()
    db.refresh(proyek)

    # Catat tahapan awal jika progres > 0
    if req.progres_persen > 0:
        tahap_awal = TahapanProgres(
            proyek_id=proyek.id,
            nama_tahap="Pekerjaan Awal Dimulai",
            progres_persen=req.progres_persen,
            catatan="Inisialisasi progres awal proyek.",
            dicatat_oleh=current_user.id
        )
        db.add(tahap_awal)
        db.commit()
        db.refresh(proyek)

    return get_project_detail(proyek.id, db)

@router.put("/{id}", response_model=ProyekResponse)
def update_project(
    id: int,
    req: ProyekUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin_dinas, UserRole.pimpinan_instansi]))
):
    """Fitur 3 PRD: Sunting data proyek oleh admin dinas / pimpinan."""
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    if current_user.role == UserRole.admin_dinas and current_user.dinas_id and current_user.dinas_id != proyek.dinas_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Anda tidak memiliki wewenang untuk mengedit proyek milik dinas lain."
        )

    update_data = req.model_dump(exclude_unset=True)
    catatan_perubahan = update_data.pop("catatan_perubahan", None)

    # Validasi aturan PRD 10.1: Progres tidak boleh menurun tanpa keterangan
    if "progres_persen" in update_data and update_data["progres_persen"] is not None:
        new_progres = update_data["progres_persen"]
        if new_progres < proyek.progres_persen and not catatan_perubahan:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Penurunan persentase progres wajib menyertakan alasan keterangan (catatan_perubahan), misal revisi teknis atau penghentian sementara."
            )

    for field, value in update_data.items():
        setattr(proyek, field, value)

    # Jika progres mencapai 100%, update status menjadi selesai
    if proyek.progres_persen == 100 and proyek.status != ProyekStatus.selesai:
        proyek.status = ProyekStatus.selesai

    db.commit()
    db.refresh(proyek)

    # Notifikasi pembaruan data proyek ke subscriber
    notify_project_subscribers(
        db,
        proyek,
        f"Pembaruan Data: Proyek '{proyek.nama_proyek}' diperbarui. Status: {proyek.status.value}, Progres: {proyek.progres_persen}%."
    )

    return get_project_detail(proyek.id, db)

@router.post("/{id}/tahapan", response_model=TahapanResponse, status_code=status.HTTP_201_CREATED)
def add_project_stage(
    id: int,
    req: TahapanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin_dinas, UserRole.pimpinan_instansi]))
):
    """
    Fitur 2 PRD: Tambah Riwayat Tahapan Linimasa (Timeline) & Perbarui Progres Proyek.
    Sesuai PRD 10.1: Progres tidak boleh turun tanpa catatan/keterangan.
    Memicu notifikasi otomatis ke semua warga yang subscribe (Fitur 6).
    """
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    if current_user.role == UserRole.admin_dinas and current_user.dinas_id and current_user.dinas_id != proyek.dinas_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya dinas penanggung jawab yang berwenang menambahkan tahapan progres proyek ini."
        )

    # Validasi aturan PRD 10.1: Penurunan progres wajib memiliki catatan
    if req.progres_persen < proyek.progres_persen and not req.catatan:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Penurunan persentase progres tidak diizinkan tanpa catatan/keterangan resmi (misal: revisi spesifikasi)."
        )

    tahap = TahapanProgres(
        proyek_id=proyek.id,
        nama_tahap=req.nama_tahap,
        progres_persen=req.progres_persen,
        catatan=req.catatan,
        dicatat_oleh=current_user.id
    )
    db.add(tahap)

    # Sinkronkan persentase progres di proyek utama
    proyek.progres_persen = req.progres_persen
    if req.progres_persen == 100:
        proyek.status = ProyekStatus.selesai

    db.commit()
    db.refresh(tahap)

    # Pemicu notifikasi otomatis (Fitur 6 PRD)
    pesan_notif = f"Pembaruan Proyek: Tahap '{req.nama_tahap}' dicatat. Progres '{proyek.nama_proyek}' mencapai {req.progres_persen}%."
    notify_project_subscribers(db, proyek, pesan_notif)

    return tahap

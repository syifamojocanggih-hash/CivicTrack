import logging
from typing import List, Optional, Tuple
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_optional_current_user
from app.models.user import User
from app.models.project import Proyek
from app.models.ai_route import RekomendasiRute, PrioritasRute
from app.schemas.route import RekomendasiRuteResponse, GenerateRuteRequest
from app.services.gemini_service import generate_ai_alternative_routes

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/proyek", tags=["Rekomendasi Rute AI"])

def validate_ai_route(item: dict) -> Tuple[bool, str]:
    """
    Validasi output AI rekomendasi rute sebelum disajikan ke publik:
    1. nama_rute tidak boleh kosong/placeholder minimalis (min 5 karakter)
    2. prioritas wajib salah satu dari enum ('utama', 'kedua', 'tambahan')
    3. estimasi_jarak_km dan estimasi_waktu_menit bernilai positif dalam batas wajar
    4. alasan_rekomendasi tidak boleh kosong/placeholder
    """
    nama_rute = str(item.get("nama_rute", "")).strip()
    if not nama_rute or len(nama_rute) < 5:
        return False, "nama_rute terlalu pendek atau kosong (< 5 karakter)"

    invalid_placeholders = [
        "string", "...", "n/a", "unknown", "tidak ada", "nama rute",
        "nama jalan atau urutan simpang jalan", "jalur alternatif", "jalan alternatif"
    ]
    if nama_rute.lower() in invalid_placeholders:
        return False, f"nama_rute terindikasi placeholder: '{nama_rute}'"

    prioritas_str = str(item.get("prioritas", "")).strip().lower()
    if prioritas_str not in ["utama", "kedua", "tambahan"]:
        return False, f"prioritas '{prioritas_str}' bukan enum valid ('utama', 'kedua', 'tambahan')"

    try:
        jarak = float(item.get("estimasi_jarak_km", 0))
        if jarak <= 0 or jarak > 100.0:
            return False, f"estimasi_jarak_km tidak realistis: {jarak} km"
    except (ValueError, TypeError):
        return False, "estimasi_jarak_km bukan format numerik valid"

    try:
        waktu = int(item.get("estimasi_waktu_menit", 0))
        if waktu <= 0 or waktu > 300:
            return False, f"estimasi_waktu_menit tidak realistis: {waktu} menit"
    except (ValueError, TypeError):
        return False, "estimasi_waktu_menit bukan integer valid"

    alasan = str(item.get("alasan_rekomendasi", "")).strip()
    if not alasan or len(alasan) < 5 or alasan.lower() in invalid_placeholders:
        return False, "alasan_rekomendasi kosong atau berupa placeholder"

    return True, "valid"

@router.post("/{id}/generate-rute", response_model=List[RekomendasiRuteResponse])
def generate_alternative_routes(
    id: int,
    req: GenerateRuteRequest = GenerateRuteRequest(),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Menghasilkan rekomendasi rute alternatif penutupan jalan menggunakan Google Gemini API.
    Menyajikan rute terstruktur dalam 3 tingkat skala prioritas:
    - 'utama': Jalur pengalihan jalan besar untuk seluruh kendaraan
    - 'kedua': Jalur lingkar sekunder pengurai kepadatan
    - 'tambahan': Rute lingkungan khusus sepeda motor
    Dilengkapi validasi otomatis integritas keluaran AI (is_valid).
    """
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    nama_wilayah = proyek.wilayah.nama_wilayah if proyek.wilayah else "Kota"
    
    # Hapus rekomendasi lama jika ada untuk diganti dengan hasil baru
    db.query(RekomendasiRute).filter(RekomendasiRute.proyek_id == id).delete()
    db.commit()

    # Panggil layanan AI Gemini
    ai_results = generate_ai_alternative_routes(
        nama_proyek=proyek.nama_proyek,
        kategori=proyek.kategori.value,
        nama_wilayah=nama_wilayah,
        latitude=float(proyek.latitude),
        longitude=float(proyek.longitude),
        catatan_penutupan=req.catatan_penutupan
    )

    created_routes = []
    for item in ai_results:
        is_valid, validation_msg = validate_ai_route(item)
        if not is_valid:
            logger.warning(f"Rute AI untuk proyek #{id} gagal validasi: {validation_msg} | payload: {item}")

        prioritas_str = item.get("prioritas", "utama").lower()
        if prioritas_str not in ["utama", "kedua", "tambahan"]:
            prioritas_str = "utama"

        rute = RekomendasiRute(
            proyek_id=id,
            nama_rute=item.get("nama_rute", "Jalur Alternatif"),
            prioritas=PrioritasRute(prioritas_str),
            estimasi_jarak_km=Decimal(str(item.get("estimasi_jarak_km", 3.0))),
            estimasi_waktu_menit=int(item.get("estimasi_waktu_menit", 10)),
            alasan_rekomendasi=item.get("alasan_rekomendasi", ""),
            raw_response_ai=item,
            is_valid=is_valid
        )
        db.add(rute)
        created_routes.append(rute)

    db.commit()
    for r in created_routes:
        db.refresh(r)

    return created_routes

@router.get("/{id}/rute-alternatif", response_model=List[RekomendasiRuteResponse])
def get_alternative_routes(id: int, db: Session = Depends(get_db)):
    """
    Mengambil daftar rute alternatif penutupan lalu lintas hasil analisis AI.
    Hanya mengembalikan rekomendasi yang telah lolos validasi integritas (is_valid == True).
    """
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    return db.query(RekomendasiRute).filter(
        RekomendasiRute.proyek_id == id,
        RekomendasiRute.is_valid == True
    ).order_by(RekomendasiRute.prioritas.asc()).all()

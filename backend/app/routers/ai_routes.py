from typing import List
from decimal import Decimal
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import User, UserRole
from app.models.project import Proyek
from app.models.ai_route import RekomendasiRute, PrioritasRute
from app.schemas.route import RekomendasiRuteResponse, GenerateRuteRequest
from app.services.gemini_service import generate_ai_alternative_routes

router = APIRouter(prefix="/proyek", tags=["Rekomendasi Rute AI (Fitur 11)"])

@router.post("/{id}/generate-rute", response_model=List[RekomendasiRuteResponse])
def generate_alternative_routes(
    id: int,
    req: GenerateRuteRequest = GenerateRuteRequest(),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin_dinas, UserRole.pimpinan_instansi]))
):
    """
    Fitur 11 PRD: Menghasilkan rekomendasi rute alternatif penutupan jalan menggunakan Google Gemini API.
    Menyajikan rute terstruktur dalam 3 tingkat skala prioritas:
    - 'utama': Jalur pengalihan jalan besar untuk seluruh kendaraan
    - 'kedua': Jalur lingkar sekunder pengurai kepadatan
    - 'tambahan': Rute lingkungan khusus sepeda motor
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
            is_valid=True
        )
        db.add(rute)
        created_routes.append(rute)

    db.commit()
    for r in created_routes:
        db.refresh(r)

    return created_routes

@router.get("/{id}/rute-alternatif", response_model=List[RekomendasiRuteResponse])
def get_alternative_routes(id: int, db: Session = Depends(get_db)):
    """Mengambil daftar rute alternatif penutupan lalu lintas hasil analisis AI."""
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    return db.query(RekomendasiRute).filter(
        RekomendasiRute.proyek_id == id
    ).order_by(RekomendasiRute.prioritas.asc()).all()

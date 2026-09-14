from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.project import Proyek, ProyekStatus
from app.models.report import RatingKepuasan
from app.schemas.rating import RatingCreate, RatingResponse, RatingSummaryResponse

router = APIRouter(tags=["Rating Kepuasan Masyarakat"])

@router.post("/proyek/{id}/rating", response_model=RatingResponse, status_code=status.HTTP_201_CREATED)
def submit_project_rating(
    id: int,
    req: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Memberikan penilaian bintang (1-5) dan ulasan publik.
    Validasi: Penilaian HANYA dapat diberikan untuk proyek yang berstatus 'Selesai'.
    Satu warga hanya dapat memberikan satu kali penilaian untuk tiap proyek.
    """
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    if proyek.status != ProyekStatus.selesai:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Penilaian kepuasan masyarakat hanya dapat diberikan untuk proyek yang telah berstatus 'Selesai'."
        )

    # Cek apakah user sudah pernah memberi rating
    existing_rating = db.query(RatingKepuasan).filter(
        RatingKepuasan.proyek_id == id,
        RatingKepuasan.user_id == current_user.id
    ).first()

    if existing_rating:
        # Perbarui rating yang sudah ada
        existing_rating.skor = req.skor
        existing_rating.komentar = req.komentar.strip() if req.komentar else None
        db.commit()
        db.refresh(existing_rating)
        res = RatingResponse.model_validate(existing_rating)
        res.nama_user = current_user.nama
        return res

    new_rating = RatingKepuasan(
        proyek_id=id,
        user_id=current_user.id,
        skor=req.skor,
        komentar=req.komentar.strip() if req.komentar else None
    )
    db.add(new_rating)
    db.commit()
    db.refresh(new_rating)

    res = RatingResponse.model_validate(new_rating)
    res.nama_user = current_user.nama
    return res

@router.get("/proyek/{id}/rating", response_model=RatingSummaryResponse)
def get_project_rating_summary(id: int, db: Session = Depends(get_db)):
    """Mengambil rekapitulasi rating kepuasan (rata-rata bintang & sebaran skor 1-5)."""
    proyek = db.query(Proyek).filter(Proyek.id == id).first()
    if not proyek:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proyek tidak ditemukan.")

    ratings = db.query(RatingKepuasan).filter(RatingKepuasan.proyek_id == id).all()
    total = len(ratings)
    if total == 0:
        return RatingSummaryResponse(
            proyek_id=id,
            rata_rata=0.0,
            total_ulasan=0,
            sebaran={"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
        )

    sebaran = {"1": 0, "2": 0, "3": 0, "4": 0, "5": 0}
    total_skor = 0
    for r in ratings:
        total_skor += r.skor
        sebaran[str(r.skor)] = sebaran.get(str(r.skor), 0) + 1

    return RatingSummaryResponse(
        proyek_id=id,
        rata_rata=round(total_skor / total, 2),
        total_ulasan=total,
        sebaran=sebaran
    )

@router.get("/proyek/{id}/ulasan", response_model=List[RatingResponse])
def get_project_reviews(id: int, db: Session = Depends(get_db)):
    """Mengambil daftar komentar ulasan publik terhadap hasil proyek selesai."""
    ratings = db.query(RatingKepuasan).filter(
        RatingKepuasan.proyek_id == id
    ).order_by(RatingKepuasan.created_at.desc()).all()

    result = []
    for r in ratings:
        item = RatingResponse.model_validate(r)
        item.nama_user = r.user.nama if r.user else "Warga"
        result.append(item)
    return result

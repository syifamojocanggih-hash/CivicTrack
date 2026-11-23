from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import Dinas, UserRole, User, WilayahAdministratif
from app.schemas.dinas import DinasCreate, DinasResponse

router = APIRouter(prefix="/dinas", tags=["Master Dinas"])

@router.get("", response_model=List[DinasResponse])
def get_all_dinas(db: Session = Depends(get_db)):
    """Mengambil daftar instansi / dinas pemerintah penanggung jawab proyek."""
    return db.query(Dinas).all()

@router.get("/{id}", response_model=DinasResponse)
def get_dinas_by_id(id: int, db: Session = Depends(get_db)):
    """Mengambil detail satu instansi/dinas."""
    dinas = db.query(Dinas).filter(Dinas.id == id).first()
    if not dinas:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dinas tidak ditemukan.")
    return dinas

@router.post("", response_model=DinasResponse, status_code=status.HTTP_201_CREATED)
def create_dinas(
    req: DinasCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin_dinas, UserRole.pimpinan_instansi]))
):
    """Menambahkan data dinas baru."""
    if req.wilayah_id is not None:
        wilayah = db.query(WilayahAdministratif).filter(WilayahAdministratif.id == req.wilayah_id).first()
        if not wilayah:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Wilayah administratif dengan ID {req.wilayah_id} tidak ditemukan."
            )

    new_dinas = Dinas(
        nama_dinas=req.nama_dinas,
        wilayah_id=req.wilayah_id
    )
    db.add(new_dinas)
    db.commit()
    db.refresh(new_dinas)
    return new_dinas

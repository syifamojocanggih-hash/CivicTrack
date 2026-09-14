from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import require_roles
from app.models.user import WilayahAdministratif, WilayahLevel, UserRole, User
from app.schemas.wilayah import WilayahCreate, WilayahResponse, WilayahBrief

router = APIRouter(prefix="/wilayah", tags=["Wilayah Administratif"])

@router.get("", response_model=List[WilayahResponse])
def get_wilayah_list(
    level: Optional[WilayahLevel] = Query(None, description="Filter tingkat wilayah (kabupaten, kecamatan, desa)"),
    parent_id: Optional[int] = Query(None, description="Filter berdasarkan ID wilayah induk"),
    db: Session = Depends(get_db)
):
    """
    Menampilkan data wilayah berjenjang beserta poligon batas wilayah (GeoJSON)
    untuk kebutuhan layer peta interaktif.
    """
    query = db.query(WilayahAdministratif)
    if level:
        query = query.filter(WilayahAdministratif.level == level)
    if parent_id is not None:
        query = query.filter(WilayahAdministratif.parent_id == parent_id)
    return query.all()

@router.get("/{id}", response_model=WilayahResponse)
def get_wilayah_by_id(id: int, db: Session = Depends(get_db)):
    """Mengambil detail satu wilayah administratif beserta data spasial batas poligonnya."""
    wilayah = db.query(WilayahAdministratif).filter(WilayahAdministratif.id == id).first()
    if not wilayah:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Wilayah tidak ditemukan.")
    return wilayah

@router.post("", response_model=WilayahResponse, status_code=status.HTTP_201_CREATED)
def create_wilayah(
    req: WilayahCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles([UserRole.admin_dinas, UserRole.pimpinan_instansi]))
):
    """Membuat entri wilayah administratif baru (khusus admin/pimpinan)."""
    existing = db.query(WilayahAdministratif).filter(WilayahAdministratif.kode_wilayah == req.kode_wilayah).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Kode wilayah sudah digunakan.")

    new_wilayah = WilayahAdministratif(
        kode_wilayah=req.kode_wilayah,
        nama_wilayah=req.nama_wilayah,
        level=req.level,
        parent_id=req.parent_id,
        geom_boundary=req.geom_boundary
    )
    db.add(new_wilayah)
    db.commit()
    db.refresh(new_wilayah)
    return new_wilayah

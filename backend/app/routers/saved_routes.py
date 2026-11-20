import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.models.user import User
from app.models.ai_route import SavedRoute, ModaTransportasi
from app.schemas.route import SavedRouteCreate, SavedRouteResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Rute Tersimpan"])

def _get_user_saved_routes(db: Session, current_user: User):
    return db.query(SavedRoute).filter(
        SavedRoute.user_id == current_user.id
    ).order_by(SavedRoute.created_at.desc()).all()

def _save_user_route(req: SavedRouteCreate, db: Session, current_user: User):
    current_count = db.query(SavedRoute).filter(SavedRoute.user_id == current_user.id).count()
    if current_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Batas maksimal 3 rute harian telah tercapai. Hapus salah satu rute terlebih dahulu sebelum menyimpan rute baru."
        )

    if not req.polyline_data or len(req.polyline_data) < 2:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Data garis rute (polyline_data) harus memiliki minimal 2 titik koordinat."
        )

    moda = ModaTransportasi.mobil
    if req.moda_transportasi:
        try:
            moda = ModaTransportasi(req.moda_transportasi)
        except Exception:
            moda = ModaTransportasi.mobil

    new_route = SavedRoute(
        user_id=current_user.id,
        nama_rute=req.nama_rute.strip(),
        koordinat_asal=req.koordinat_asal,
        koordinat_tujuan=req.koordinat_tujuan,
        polyline_data=req.polyline_data,
        moda_transportasi=moda,
        jarak_km=req.jarak_km,
        estimasi_menit=req.estimasi_menit,
        catatan=req.catatan.strip() if req.catatan else None
    )

    db.add(new_route)
    db.commit()
    db.refresh(new_route)
    return new_route

def _delete_user_saved_route(id: int, db: Session, current_user: User):
    route = db.query(SavedRoute).filter(
        SavedRoute.id == id,
        SavedRoute.user_id == current_user.id
    ).first()

    if not route:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Rute tersimpan tidak ditemukan atau Anda tidak memiliki hak akses untuk menghapusnya."
        )

    db.delete(route)
    db.commit()
    return {"success": True, "message": "Rute tersimpan berhasil dihapus."}

# Endpoint primer sesuai spesifikasi PRD Fase 3 (/api/v1/rute-tersimpan)
@router.get("/rute-tersimpan", response_model=List[SavedRouteResponse])
def get_user_saved_routes_primary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_user_saved_routes(db, current_user)

@router.post("/rute-tersimpan", response_model=SavedRouteResponse, status_code=status.HTTP_201_CREATED)
def save_user_route_primary(req: SavedRouteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _save_user_route(req, db, current_user)

@router.delete("/rute-tersimpan/{id}", status_code=status.HTTP_200_OK)
def delete_user_saved_route_primary(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _delete_user_saved_route(id, db, current_user)

# Alias backward compatibility (/api/v1/routes/saved)
@router.get("/routes/saved", response_model=List[SavedRouteResponse])
def get_user_saved_routes_alias(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _get_user_saved_routes(db, current_user)

@router.post("/routes/saved", response_model=SavedRouteResponse, status_code=status.HTTP_201_CREATED)
def save_user_route_alias(req: SavedRouteCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _save_user_route(req, db, current_user)

@router.delete("/routes/saved/{id}", status_code=status.HTTP_200_OK)
def delete_user_saved_route_alias(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return _delete_user_saved_route(id, db, current_user)


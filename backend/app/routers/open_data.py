from typing import Optional, Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.project import Proyek

router = APIRouter(prefix="/open-data", tags=["Open Data API"])

@router.get("/proyek")
def get_open_data_projects(
    format: str = Query("json", description="Format output: 'json' atau 'geojson'"),
    db: Session = Depends(get_db)
) -> Any:
    """
    Endpoint Open Data API Terbuka.
    Menyediakan akses dataset proyek pembangunan daerah secara bebas bagi publik,
    jurnalis investigasi, LSM, dan peneliti akademisi tanpa kewajiban login.
    Mendukung format standar JSON dan GeoJSON FeatureCollection.
    """
    proyek_list = db.query(Proyek).all()

    if format.lower() == "geojson":
        features = []
        for p in proyek_list:
            feature = {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [float(p.longitude), float(p.latitude)]
                },
                "properties": {
                    "id": p.id,
                    "nama_proyek": p.nama_proyek,
                    "kategori": p.kategori.value,
                    "deskripsi": p.deskripsi,
                    "wilayah": p.wilayah.nama_wilayah if p.wilayah else None,
                    "kode_wilayah": p.wilayah.kode_wilayah if p.wilayah else None,
                    "dinas": p.dinas.nama_dinas if p.dinas else None,
                    "anggaran": float(p.anggaran) if p.anggaran else None,
                    "status": p.status.value,
                    "progres_persen": p.progres_persen,
                    "tanggal_mulai": str(p.tanggal_mulai),
                    "estimasi_selesai": str(p.estimasi_selesai),
                    "created_at": p.created_at.isoformat() if p.created_at else None,
                    "updated_at": p.updated_at.isoformat() if p.updated_at else None
                }
            }
            features.append(feature)

        return {
            "type": "FeatureCollection",
            "metadata": {
                "source": "CivicTrack Open Government Data Platform",
                "total_records": len(features),
                "license": "Open Data Commons / Keterbukaan Informasi Publik"
            },
            "features": features
        }

    # Format JSON biasa
    data = []
    for p in proyek_list:
        data.append({
            "id": p.id,
            "nama_proyek": p.nama_proyek,
            "kategori": p.kategori.value,
            "deskripsi": p.deskripsi,
            "koordinat": {
                "latitude": float(p.latitude),
                "longitude": float(p.longitude)
            },
            "wilayah": {
                "id": p.wilayah.id if p.wilayah else None,
                "nama": p.wilayah.nama_wilayah if p.wilayah else None,
                "kode": p.wilayah.kode_wilayah if p.wilayah else None
            },
            "dinas": {
                "id": p.dinas.id if p.dinas else None,
                "nama": p.dinas.nama_dinas if p.dinas else None
            },
            "anggaran": float(p.anggaran) if p.anggaran else None,
            "status": p.status.value,
            "progres_persen": p.progres_persen,
            "tanggal_mulai": str(p.tanggal_mulai),
            "estimasi_selesai": str(p.estimasi_selesai),
            "updated_at": p.updated_at.isoformat() if p.updated_at else None
        })

    return {
        "status": "success",
        "total_records": len(data),
        "data": data
    }

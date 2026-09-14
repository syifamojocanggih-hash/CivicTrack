import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.routers import (
    auth, wilayah, dinas, projects, documentation,
    reports, subscriptions, stats, open_data, ratings,
    ai_routes, evaluations
)

# Inisialisasi Aplikasi FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="""
# CivicTrack Backend REST API
Platform Transparansi dan Akuntabilitas Proyek Pembangunan Daerah.
Mengintegrasikan visualisasi linimasa, pelaporan partisipasi warga, sistem notifikasi terpadu,
Open Data API, dan Google Gemini AI untuk analisis dampak pengalihan rute serta evaluasi mutu infrastruktur.
    """,
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Konfigurasi CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pastikan folder uploads tersedia dan dimount sebagai static files
upload_path = os.path.join(os.getcwd(), settings.UPLOAD_DIR)
os.makedirs(upload_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=upload_path), name="uploads")

# Pendaftaran Seluruh Router API v1 (12 Fitur PRD)
api_prefix = "/api/v1"
app.include_router(auth.router, prefix=api_prefix)
app.include_router(wilayah.router, prefix=api_prefix)
app.include_router(dinas.router, prefix=api_prefix)
app.include_router(projects.router, prefix=api_prefix)
app.include_router(documentation.router, prefix=api_prefix)
app.include_router(reports.router, prefix=api_prefix)
app.include_router(subscriptions.router, prefix=api_prefix)
app.include_router(stats.router, prefix=api_prefix)
app.include_router(open_data.router, prefix=api_prefix)
app.include_router(ratings.router, prefix=api_prefix)
app.include_router(ai_routes.router, prefix=api_prefix)
app.include_router(evaluations.router, prefix=api_prefix)

@app.get("/", tags=["Sistem"])
def root_endpoint():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
        "open_data_api": f"{api_prefix}/open-data/proyek"
    }

@app.get("/health", tags=["Sistem"])
def health_check():
    return {"status": "healthy"}

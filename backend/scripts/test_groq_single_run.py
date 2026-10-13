import sys
import os

# Tambahkan direktori root backend ke sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.services.gemini_service import (
    generate_ai_alternative_routes,
    analyze_evaluation_with_ai
)

def main():
    print("=" * 60)
    print("CivicTrack: Uji Coba Tunggal (1x) Integrasi Groq API (Llama 3.3)")
    print("=" * 60)
    
    if not settings.GROQ_API_KEY or not settings.GROQ_API_KEY.strip():
        print("[PERINGATAN] GROQ_API_KEY belum diisi di backend/.env!")
        print("Silakan masukkan GROQ_API_KEY=gsk_... ke dalam backend/.env terlebih dahulu.")
        print("Panduan: Buka https://console.groq.com/keys untuk mendapatkan key gratis.")
        sys.exit(1)

    print(f"Menggunakan Model Groq: {settings.GROQ_MODEL}")
    print(f"API Key Terdeteksi: {settings.GROQ_API_KEY[:8]}...{settings.GROQ_API_KEY[-4:] if len(settings.GROQ_API_KEY) > 12 else ''}")
    print("-" * 60)

    # 1. Uji Langsung Service AI Rekomendasi Rute
    print("[1/3] Menjalankan generate_ai_alternative_routes...")
    routes = generate_ai_alternative_routes(
        nama_proyek="Pelebaran Jalan Raya Babat",
        kategori="jalan",
        nama_wilayah="Kecamatan Babat",
        latitude=-7.1050,
        longitude=112.1640,
        catatan_penutupan="Penutupan total jalur utama pertigaan pasar Babat"
    )

    print(f"-> Jumlah rute dihasilkan: {len(routes)}")
    for i, r in enumerate(routes, 1):
        source = r.get("source", "tidak_ada")
        geo_verified = r.get("geografis_terverifikasi", False)
        print(f"   Rute #{i} [{r.get('prioritas')}]: {r.get('nama_rute')} ({r.get('estimasi_jarak_km')} km, {r.get('estimasi_waktu_menit')} menit)")
        print(f"            Sumber ('source'): {source}")
        print(f"            Geografis Terverifikasi (OSM): {geo_verified}")

    # 2. Uji Service Evaluasi Pembangunan
    print("\n[2/3] Menjalankan analyze_evaluation_with_ai...")
    eval_res = analyze_evaluation_with_ai(
        kategori_masalah="Retak Struktural",
        deskripsi="Pondasi gorong-gorong ambles dan aspal jalan di atasnya patah sepanjang 4 meter.",
        nama_proyek="Jembatan Penghubung Desa Sukodadi",
        kategori_proyek="jembatan"
    )

    raw_ai = eval_res.get("raw_response_ai", {})
    eval_source = raw_ai.get("source", "tidak_ada")
    print(f"-> Skor Urgensi AI: {eval_res.get('skor_urgensi_ai')} / 5")
    print(f"-> Ringkasan Analisis: {eval_res.get('ringkasan_analisis_ai')}")
    print(f"-> Sumber ('source'): {eval_source}")

    # 3. Verifikasi Penyimpanan di Database SQLite In-Memory
    print("\n[3/3] Memverifikasi persistensi database...")
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    from app.core.database import Base
    from app.models.project import Proyek, ProyekKategori, ProyekStatus
    from app.models.ai_route import RekomendasiRute, PrioritasRute
    from decimal import Decimal

    test_engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=test_engine)
    Session = sessionmaker(bind=test_engine)
    db = Session()
    from datetime import date
    from app.models.user import WilayahAdministratif, WilayahLevel, Dinas, User, UserRole
    dummy_wilayah = WilayahAdministratif(id=1, kode_wilayah="35.24.01", nama_wilayah="Kecamatan Babat", level=WilayahLevel.kecamatan)
    db.add(dummy_wilayah)
    dummy_dinas = Dinas(id=1, nama_dinas="Dinas Pekerjaan Umum", wilayah_id=1)
    db.add(dummy_dinas)
    dummy_user = User(
        id=1,
        nama="Admin Test",
        email="admin@test.com",
        password_hash="fakehash",
        role=UserRole.admin_dinas,
        dinas_id=1
    )
    db.add(dummy_user)
    db.commit()

    # Buat dummy proyek
    dummy_proyek = Proyek(
        id=1,
        nama_proyek="Pelebaran Jalan Raya Babat",
        kategori=ProyekKategori.jalan,
        wilayah_id=1,
        dinas_id=1,
        deskripsi="Uji rute Groq",
        latitude=Decimal("-7.1050"),
        longitude=Decimal("112.1640"),
        anggaran=Decimal("500000000"),
        status=ProyekStatus.berjalan,
        progres_persen=30,
        tanggal_mulai=date(2026, 1, 1),
        estimasi_selesai=date(2026, 12, 31),
        dibuat_oleh=1
    )
    db.add(dummy_proyek)
    db.commit()

    # Simpan rute hasil Groq ke database
    for r in routes:
        p_str = r.get("prioritas", "utama").lower()
        if p_str not in ["utama", "kedua", "tambahan"]:
            p_str = "utama"
        db_rute = RekomendasiRute(
            proyek_id=1,
            nama_rute=r.get("nama_rute", "Jalur Alternatif"),
            prioritas=PrioritasRute(p_str),
            estimasi_jarak_km=Decimal(str(r.get("estimasi_jarak_km", 3.0))),
            estimasi_waktu_menit=int(r.get("estimasi_waktu_menit", 10)),
            alasan_rekomendasi=r.get("alasan_rekomendasi", ""),
            raw_response_ai=r,
            is_valid=True
        )
        db.add(db_rute)
    db.commit()

    # Baca kembali dari database
    saved_routes = db.query(RekomendasiRute).filter(RekomendasiRute.proyek_id == 1).all()
    print(f"-> Berhasil membaca {len(saved_routes)} rute dari tabel rekomendasi_rute.")
    for sr in saved_routes:
        db_source = sr.raw_response_ai.get("source") if sr.raw_response_ai else None
        print(f"   DB Record #{sr.id} ({sr.nama_rute}) -> raw_response_ai['source'] = '{db_source}'")
    db.close()

    print("=" * 60)
    if eval_source == "groq" and any(sr.raw_response_ai.get("source") == "groq" for sr in saved_routes):
        print("[SUKSES PENUH] Provider Groq aktif dan tersimpan di database dengan source='groq'!")
    else:
        print(f"[STATUS] Provider saat ini: '{eval_source}'")
    print("=" * 60)

if __name__ == "__main__":
    main()

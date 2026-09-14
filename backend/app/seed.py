"""
Skrip Seeder Database CivicTrack menggunakan SQLAlchemy.
Dapat dijalankan langsung dengan:
    python -m app.seed
"""

import sys
from decimal import Decimal
from datetime import date, datetime
from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import WilayahAdministratif, WilayahLevel, Dinas, User, UserRole
from app.models.project import Proyek, ProyekKategori, ProyekStatus, TahapanProgres, DokumentasiProyek, MediaType
from app.models.report import LaporanMasyarakat, LaporanStatus, RatingKepuasan
from app.models.notification import SubscriptionNotifikasi, Notifikasi
from app.models.ai_route import RekomendasiRute, PrioritasRute
from app.models.evaluation import EvaluasiPembangunan, DokumentasiEvaluasi, EvaluasiStatusLog, EvaluasiStatus

def run_seed():
    print("Memulai proses seeding database CivicTrack...")
    
    # Buat tabel jika belum ada
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Cek jika data sudah ada
        if db.query(User).first():
            print("Database telah berisi data. Seeding dibatalkan.")
            return

        print("1. Menambahkan data Wilayah Administratif berjenjang...")
        kab = WilayahAdministratif(
            kode_wilayah="35.22",
            nama_wilayah="Kabupaten Bojonegoro",
            level=WilayahLevel.kabupaten,
            geom_boundary='{"type": "Polygon", "coordinates": [[[111.7, -7.1], [112.0, -7.1], [112.0, -7.3], [111.7, -7.3], [111.7, -7.1]]]}'
        )
        db.add(kab)
        db.commit()
        db.refresh(kab)

        kec_bj = WilayahAdministratif(
            kode_wilayah="35.22.01",
            nama_wilayah="Kecamatan Bojonegoro",
            level=WilayahLevel.kecamatan,
            parent_id=kab.id,
            geom_boundary='{"type": "Polygon", "coordinates": [[[111.85, -7.14], [111.91, -7.14], [111.91, -7.18], [111.85, -7.18], [111.85, -7.14]]]}'
        )
        kec_dander = WilayahAdministratif(
            kode_wilayah="35.22.02",
            nama_wilayah="Kecamatan Dander",
            level=WilayahLevel.kecamatan,
            parent_id=kab.id
        )
        db.add_all([kec_bj, kec_dander])
        db.commit()
        db.refresh(kec_bj)
        db.refresh(kec_dander)

        desa_sukorejo = WilayahAdministratif(
            kode_wilayah="35.22.01.1001",
            nama_wilayah="Kelurahan Sukorejo",
            level=WilayahLevel.desa,
            parent_id=kec_bj.id
        )
        desa_klangonan = WilayahAdministratif(
            kode_wilayah="35.22.01.1002",
            nama_wilayah="Desa Klangonan",
            level=WilayahLevel.desa,
            parent_id=kec_bj.id
        )
        desa_ngumpak = WilayahAdministratif(
            kode_wilayah="35.22.02.2001",
            nama_wilayah="Desa Ngumpakdalem",
            level=WilayahLevel.desa,
            parent_id=kec_dander.id
        )
        db.add_all([desa_sukorejo, desa_klangonan, desa_ngumpak])
        db.commit()

        print("2. Menambahkan data Dinas...")
        dinas_pu = Dinas(nama_dinas="Dinas Pekerjaan Umum Bina Marga dan Penataan Ruang", wilayah_id=kab.id)
        dinas_ck = Dinas(nama_dinas="Dinas Perumahan, Kawasan Permukiman dan Cipta Karya", wilayah_id=kab.id)
        dinas_dlh = Dinas(nama_dinas="Dinas Lingkungan Hidup", wilayah_id=kab.id)
        db.add_all([dinas_pu, dinas_ck, dinas_dlh])
        db.commit()
        db.refresh(dinas_pu)
        db.refresh(dinas_dlh)

        print("3. Menambahkan pengguna (password default: password123)...")
        hashed_pwd = get_password_hash("password123")
        admin_pu = User(
            nama="Ir. Hendro Wijaya (Admin PU)",
            email="admin.pu@bojonegoro.go.id",
            password_hash=hashed_pwd,
            role=UserRole.admin_dinas,
            dinas_id=dinas_pu.id,
            is_active=True
        )
        pimpinan_pu = User(
            nama="Drs. H. M. Fauzi, M.Si (Kepala Dinas)",
            email="pimpinan.pu@bojonegoro.go.id",
            password_hash=hashed_pwd,
            role=UserRole.pimpinan_instansi,
            dinas_id=dinas_pu.id,
            is_active=True
        )
        warga_budi = User(
            nama="Budi Santoso",
            email="budi.santoso@gmail.com",
            password_hash=hashed_pwd,
            role=UserRole.warga,
            is_active=True
        )
        warga_siti = User(
            nama="Siti Nurhaliza",
            email="siti.nurhaliza@gmail.com",
            password_hash=hashed_pwd,
            role=UserRole.warga,
            is_active=True
        )
        peneliti = User(
            nama="Dr. Rahmat Hidayat (Pusat Studi Kebijakan)",
            email="rahmat.peneliti@unair.ac.id",
            password_hash=hashed_pwd,
            role=UserRole.media_peneliti,
            is_active=True
        )
        db.add_all([admin_pu, pimpinan_pu, warga_budi, warga_siti, peneliti])
        db.commit()
        db.refresh(admin_pu)
        db.refresh(warga_budi)
        db.refresh(warga_siti)

        print("4. Menambahkan data Proyek...")
        proyek_jalan = Proyek(
            nama_proyek="Rekonstruksi & Pelebaran Jalan Veteran - Sukorejo",
            kategori=ProyekKategori.jalan,
            deskripsi="Pekerjaan rigid pavement sepanjang 2,4 KM guna mengurai kemacetan kawasan komersial.",
            latitude=Decimal("-7.153400"),
            longitude=Decimal("111.886700"),
            wilayah_id=desa_sukorejo.id,
            dinas_id=dinas_pu.id,
            anggaran=Decimal("4500000000.00"),
            status=ProyekStatus.berjalan,
            progres_persen=65,
            tanggal_mulai=date(2025, 3, 1),
            estimasi_selesai=date(2025, 8, 30),
            dibuat_oleh=admin_pu.id
        )
        proyek_drainase = Proyek(
            nama_proyek="Normalisasi Saluran Drainase Kali Kaliasin",
            kategori=ProyekKategori.drainase,
            deskripsi="Pengerukan lumpur dan pemasangan u-ditch beton 120x120 cm pencegah banjir.",
            latitude=Decimal("-7.158200"),
            longitude=Decimal("111.891200"),
            wilayah_id=desa_sukorejo.id,
            dinas_id=dinas_pu.id,
            anggaran=Decimal("1250000000.00"),
            status=ProyekStatus.berjalan,
            progres_persen=40,
            tanggal_mulai=date(2025, 4, 10),
            estimasi_selesai=date(2025, 9, 15),
            dibuat_oleh=admin_pu.id
        )
        proyek_taman = Proyek(
            nama_proyek="Revitalisasi Fasilitas Publik Taman Kota Rajekwesi",
            kategori=ProyekKategori.taman,
            deskripsi="Pemugaran jogging track, penambahan lampu taman hemat energi, serta area bermain ramah difabel.",
            latitude=Decimal("-7.161000"),
            longitude=Decimal("111.879500"),
            wilayah_id=desa_klangonan.id,
            dinas_id=dinas_dlh.id,
            anggaran=Decimal("2800000000.00"),
            status=ProyekStatus.selesai,
            progres_persen=100,
            tanggal_mulai=date(2025, 1, 15),
            estimasi_selesai=date(2025, 6, 30),
            dibuat_oleh=admin_pu.id
        )
        db.add_all([proyek_jalan, proyek_drainase, proyek_taman])
        db.commit()
        db.refresh(proyek_jalan)
        db.refresh(proyek_taman)

        print("5. Menambahkan tahapan linimasa & rute AI...")
        tahap1 = TahapanProgres(
            proyek_id=proyek_jalan.id,
            nama_tahap="Pembersihan Lahan & Pengupasan Aspal",
            progres_persen=15,
            catatan="Selesai 100% tanpa kendala.",
            dicatat_oleh=admin_pu.id
        )
        tahap2 = TahapanProgres(
            proyek_id=proyek_jalan.id,
            nama_tahap="Pengecoran Beton Jalur Timur",
            progres_persen=65,
            catatan="Selesai pengecoran sisi timur.",
            dicatat_oleh=admin_pu.id
        )
        db.add_all([tahap1, tahap2])

        rute1 = RekomendasiRute(
            proyek_id=proyek_jalan.id,
            nama_rute="Jl. Pemuda -> Jl. Panglima Polim -> Jl. Pattimura",
            prioritas=PrioritasRute.utama,
            estimasi_jarak_km=Decimal("3.20"),
            estimasi_waktu_menit=8,
            alasan_rekomendasi="Jalur utama dengan kapasitas lebar memadai.",
            is_valid=True
        )
        rute2 = RekomendasiRute(
            proyek_id=proyek_jalan.id,
            nama_rute="Jl. Lettu Suwolo -> Lingkar Luar Barat",
            prioritas=PrioritasRute.kedua,
            estimasi_jarak_km=Decimal("4.50"),
            estimasi_waktu_menit=12,
            alasan_rekomendasi="Alternatif terbaik kendaraan angkutan barang.",
            is_valid=True
        )
        rute3 = RekomendasiRute(
            proyek_id=proyek_jalan.id,
            nama_rute="Jl. Lisman -> Gang Rajawali",
            prioritas=PrioritasRute.tambahan,
            estimasi_jarak_km=Decimal("2.80"),
            estimasi_waktu_menit=7,
            alasan_rekomendasi="Khusus sepeda motor untuk memangkas waktu sibuk.",
            is_valid=True
        )
        db.add_all([rute1, rute2, rute3])

        print("6. Menambahkan langganan notifikasi, rating & evaluasi...")
        sub = SubscriptionNotifikasi(user_id=warga_budi.id, proyek_id=proyek_jalan.id)
        notif = Notifikasi(
            user_id=warga_budi.id,
            proyek_id=proyek_jalan.id,
            pesan=f"Pembaruan: Progres proyek {proyek_jalan.nama_proyek} mencapai 65%.",
            is_read=False
        )
        rating = RatingKepuasan(
            proyek_id=proyek_taman.id,
            user_id=warga_budi.id,
            skor=5,
            komentar="Sangat bagus dan ramah anak. Sangat puas!"
        )
        db.add_all([sub, notif, rating])

        evaluasi = EvaluasiPembangunan(
            proyek_id=proyek_taman.id,
            user_id=warga_siti.id,
            kategori_masalah="Drainase Area Bermain Menggenang",
            deskripsi="Genangan air setinggi 10 cm terjadi di dekat ayunan saat hujan deras kemarin sore.",
            skor_urgensi_ai=3,
            ringkasan_analisis_ai="Analisis AI: Resiko genangan memicu kerusakan paving track. Disarankan inspeksi lubang inlet saluran drainase.",
            status=EvaluasiStatus.menunggu_verifikasi
        )
        db.add(evaluasi)
        db.commit()
        db.refresh(evaluasi)

        log = EvaluasiStatusLog(
            evaluasi_id=evaluasi.id,
            status_sebelumnya=None,
            status_baru="menunggu_verifikasi",
            diubah_oleh=warga_siti.id,
            catatan="Laporan evaluasi awal diajukan oleh warga."
        )
        db.add(log)
        db.commit()

        print("Seeding database CivicTrack berhasil diselesaikan!")
    except Exception as e:
        db.rollback()
        print(f"Terjadi kesalahan saat seeding: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()

import sys
import os
import json
from shapely.geometry import shape, Point
from datetime import date

sys.path.insert(0, '/app')
from app.core.database import SessionLocal
from app.models.user import WilayahAdministratif, Dinas, User
from app.models.project import Proyek, TahapanProgres, DokumentasiProyek, MediaType
from app.models.report import LaporanMasyarakat, RatingKepuasan
from app.models.notification import SubscriptionNotifikasi, Notifikasi
from app.models.ai_route import RekomendasiRute, PrioritasRute
from app.models.evaluation import EvaluasiPembangunan, EvaluasiStatusLog

from scratch.generate_civictrack_dataset import projects_data

def run():
    db = SessionLocal()
    print("Mulai proses pembaruan data valid CivicTrack...")

    # 1. Pastikan Dinas 1-5 ada
    dinas_records = [
        (1, "Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan", 1),
        (2, "Dinas Perumahan Rakyat, Kawasan Permukiman dan Cipta Karya Kabupaten Lamongan", 1),
        (3, "Dinas Lingkungan Hidup Kabupaten Lamongan", 1),
        (4, "Dinas Sumber Daya Air Kabupaten Lamongan", 1),
        (5, "Dinas Kesehatan Kabupaten Lamongan", 1),
    ]
    for d_id, d_name, w_id in dinas_records:
        existing_d = db.query(Dinas).filter(Dinas.id == d_id).first()
        if existing_d:
            existing_d.nama_dinas = d_name
        else:
            new_d = Dinas(id=d_id, nama_dinas=d_name, wilayah_id=w_id)
            db.add(new_d)
    db.commit()
    print("Dinas 1 s/d 5 terverifikasi.")

    # 2. Ambil batas kecamatan untuk verifikasi Point-in-Polygon
    kecs = db.query(WilayahAdministratif).filter(WilayahAdministratif.level == 'kecamatan').all()
    kec_shapes = {}
    for k in kecs:
        geom = json.loads(k.geom_boundary)
        kec_shapes[k.id] = {
            "id": k.id,
            "name": k.nama_wilayah,
            "shape": shape(geom)
        }

    desas = db.query(WilayahAdministratif).filter(WilayahAdministratif.level == 'desa').all()

    # 3. Bersihkan data dummy proyek lama
    print("Menghapus data proyek dummy sebelumnya...")
    db.query(EvaluasiStatusLog).delete()
    db.query(EvaluasiPembangunan).delete()
    db.query(RatingKepuasan).delete()
    db.query(LaporanMasyarakat).delete()
    db.query(Notifikasi).delete()
    db.query(SubscriptionNotifikasi).delete()
    db.query(RekomendasiRute).delete()
    db.query(DokumentasiProyek).delete()
    db.query(TahapanProgres).delete()
    db.query(Proyek).delete()
    db.commit()
    print("Seluruh data dummy proyek dan turunannya telah dihapus.")

    # 4. Insert 35 Proyek Valid
    def get_dinas_id(opd_name):
        opd = opd_name.lower()
        if "sumber daya air" in opd or "sda" in opd:
            return 4
        elif "kesehatan" in opd or "rsud" in opd or "puskesmas" in opd:
            return 5
        elif "perumahan" in opd or "cipta karya" in opd or "perkim" in opd:
            return 2
        elif "lingkungan hidup" in opd:
            return 3
        else:
            return 1

    def get_kategori_enum(kategori_str):
        k = kategori_str.lower()
        if "jalan" in k:
            return "jalan"
        elif "jembatan" in k:
            return "jembatan"
        elif "drainase" in k or "sda" in k:
            return "drainase"
        elif "gedung" in k:
            return "gedung_publik"
        elif "taman" in k or "rth" in k:
            return "taman"
        return "lainnya"

    proyek_objs = []
    proyek_meta_list = []

    for item in projects_data:
        pt = Point(item["lng"], item["lat"])
        matched_kec = None
        for kid, kinfo in kec_shapes.items():
            if kinfo["shape"].contains(pt):
                matched_kec = kinfo
                break

        if not matched_kec:
            raise ValueError(f"Proyek #{item['no']} {item['nama']} tidak berada di dalam poligon kecamatan manapun!")

        # Cari desa di kecamatan tersebut yang cocok
        w_text = item["wilayah"].lower()
        kec_desas = [d for d in desas if d.parent_id == matched_kec["id"]]
        matched_desa = None
        for d in kec_desas:
            d_clean = d.nama_wilayah.lower().replace("desa ", "").replace("kelurahan ", "").strip()
            if d_clean in w_text:
                matched_desa = d
                break
        if not matched_desa and kec_desas:
            matched_desa = kec_desas[0]

        dinas_id = get_dinas_id(item["opd"])
        db_kategori = get_kategori_enum(item["kategori"])

        # Format tanggal
        # e.g. "TA 2024 (Mar 2024 - Nov 2024)"
        # Default start: 2024-03-01, end: 2024-11-30
        lm = item["linimasa"].lower()
        t_mulai = date(2024, 3, 1)
        t_selesai = date(2024, 11, 30)
        if "2023" in lm:
            t_mulai = date(2023, 9, 1)
        if "des" in lm or "dec" in lm:
            t_selesai = date(2024, 12, 31)
        elif "okt" in lm or "oct" in lm:
            t_selesai = date(2024, 10, 31)
        elif "jul" in lm:
            t_selesai = date(2024, 7, 31)
        elif "jun" in lm:
            t_selesai = date(2024, 6, 30)
        elif "mei" in lm:
            t_selesai = date(2024, 5, 31)
        elif "agu" in lm:
            t_selesai = date(2024, 8, 31)
        elif "2025" in lm:
            t_selesai = date(2025, 6, 30)

        deskripsi_lengkap = f"{item['spesifikasi']} Sumber Pembiayaan: {item['sumber_dana']}. Rekanan Pelaksana: {item['pelaksana']}. Kode Paket: {item['kode']} ({item['sirup']})."

        status_db = "selesai" if item["status"].lower() == "selesai" else "berjalan"

        p_obj = Proyek(
            id=item["no"],
            nama_proyek=item["nama"],
            kategori=db_kategori,
            deskripsi=deskripsi_lengkap,
            latitude=item["lat"],
            longitude=item["lng"],
            wilayah_id=matched_kec["id"],
            desa_id=matched_desa.id if matched_desa else None,
            dinas_id=dinas_id,
            anggaran=float(item["pagu"]),
            status=status_db,
            progres_persen=item["progres"],
            tanggal_mulai=t_mulai,
            estimasi_selesai=t_selesai,
            dibuat_oleh=1
        )
        db.add(p_obj)
        proyek_objs.append(p_obj)
        proyek_meta_list.append({
            "p": item,
            "kec_id": matched_kec["id"],
            "kec_name": matched_kec["name"],
            "desa_id": matched_desa.id if matched_desa else None,
            "desa_name": matched_desa.nama_wilayah if matched_desa else "",
            "dinas_id": dinas_id,
            "kategori": db_kategori,
            "status": status_db,
            "t_mulai": t_mulai.strftime("%Y-%m-%d"),
            "t_selesai": t_selesai.strftime("%Y-%m-%d"),
            "deskripsi": deskripsi_lengkap
        })

    db.commit()
    print(f"Berhasil menginput {len(proyek_objs)} data proyek valid ke basis data!")

    # 5. Buat Tahapan Progres Terinci untuk setiap proyek
    print("Membuat tahapan progres fisik...")
    tahapan_counter = 1
    tahap_terkini_map = {}
    for p_meta in proyek_meta_list:
        pid = p_meta["p"]["no"]
        prog = p_meta["p"]["progres"]
        kat = p_meta["kategori"]

        if kat in ["jalan", "jembatan"]:
            t1_name = "Pengukuran Geometrik & Pekerjaan Sub-base / Perataan Lahan"
            t2_name = "Pengecoran Struktur Utama (Rigid Pavement K-350 / Gelagar Baja)"
            t3_name = "Pekerjaan Finishing, Marka Termoplastik & Uji Kelayakan PHO"
        elif kat == "drainase":
            t1_name = "Pengerukan Sedimen & Pemasangan Cerucuk Tebing"
            t2_name = "Pemasangan Precast U-Ditch / Box Culvert & Rumah Pompa"
            t3_name = "Pemasangan Pintu Air Elektrik & Uji Coba Pengaliran Debit Air"
        elif kat == "gedung_publik":
            t1_name = "Pekerjaan Pondasi Dalam & Struktur Kolom Balok Beton"
            t2_name = "Pekerjaan Arsitektur, Dinding & Instalasi MEP (Listrik/Air/Gas Medis)"
            t3_name = "Pekerjaan Interior, Finishing Fasad & Uji Laik Fungsi (SLF)"
        else: # taman
            t1_name = "Pematangan Lahan & Pemasangan Jaringan Drainase Resapan"
            t2_name = "Pembangunan Jogging Track EPDM & Plaza Wahana Publik"
            t3_name = "Penanaman Vegetasi Peneduh, Lampu Hias & Tata Lansekap"

        if prog == 100:
            th1 = TahapanProgres(id=tahapan_counter, proyek_id=pid, nama_tahap=t1_name, progres_persen=30, catatan="Pekerjaan dasar tuntas 100%.", dicatat_oleh=1)
            tahapan_counter += 1
            th2 = TahapanProgres(id=tahapan_counter, proyek_id=pid, nama_tahap=t2_name, progres_persen=75, catatan="Konstruksi utama rampung sesuai spesifikasi teknis.", dicatat_oleh=1)
            tahapan_counter += 1
            th3 = TahapanProgres(id=tahapan_counter, proyek_id=pid, nama_tahap=t3_name, progres_persen=100, catatan="Uji fungsi tuntas dan serah terima pertama (PHO) selesai.", dicatat_oleh=1)
            tahapan_counter += 1
            db.add_all([th1, th2, th3])
            tahap_terkini_map[pid] = "Pekerjaan selesai 100% dan telah diserahterimakan (PHO)"
        elif prog >= 70:
            th1 = TahapanProgres(id=tahapan_counter, proyek_id=pid, nama_tahap=t1_name, progres_persen=30, catatan="Pekerjaan tahap awal selesai.", dicatat_oleh=1)
            tahapan_counter += 1
            th2 = TahapanProgres(id=tahapan_counter, proyek_id=pid, nama_tahap=t2_name, progres_persen=prog, catatan=f"Konstruksi utama berjalan sesuai jadwal ({prog}%).", dicatat_oleh=1)
            tahapan_counter += 1
            db.add_all([th1, th2])
            tahap_terkini_map[pid] = f"{t2_name} (Progres {prog}%)"
        else:
            th1 = TahapanProgres(id=tahapan_counter, proyek_id=pid, nama_tahap=t1_name, progres_persen=prog, catatan=f"Pekerjaan tahap awal sedang berlangsung ({prog}%).", dicatat_oleh=1)
            tahapan_counter += 1
            db.add(th1)
            tahap_terkini_map[pid] = f"{t1_name} (Progres {prog}%)"

    db.commit()
    print("Tahapan progres selesai dibuat.")

    # 6. Buat Dokumentasi Proyek
    print("Membuat dokumentasi proyek...")
    dok_counter = 1
    for pid in range(1, 16):
        d1 = DokumentasiProyek(id=dok_counter, proyek_id=pid, tahapan_id=None, tipe_media="foto", url_file=f"/uploads/proyek_{pid}_lapangan.jpg", ukuran_file=1450, diunggah_oleh=1)
        dok_counter += 1
        db.add(d1)
    db.commit()

    # 7. Rekomendasi Rute Alternatif AI untuk Koridor Jalan & Jembatan Strategis
    print("Menambahkan rekomendasi rute alternatif lalu lintas...")
    rute_data = [
        (1, "Via Jalur Poros Sukodadi -> Sugio -> Karanggeneng", "utama", 5.2, 11, "Jalur pengalihan utama dengan perkerasan aspal lebar untuk roda 4 dan angkutan logistik."),
        (1, "Via Jalan Lingkungan Desa Menongo -> Sumberwudi", "kedua", 3.8, 8, "Khusus sepeda motor dan angkutan ringan warga lokal."),
        (2, "Via Jalan Tanggungan Pucuk -> Sekaran", "utama", 4.6, 10, "Rute alternatif utama menghindari pengerjaan rigid beton."),
        (4, "Via Jalan Lingkar Selatan Babat -> Moropelang", "utama", 6.8, 14, "Pengalihan arus kendaraan berat Simpang Babat menuju Sukorame."),
        (5, "Via Jalur Soko -> Glagah -> Duduksampeyan", "utama", 4.9, 10, "Rute alternatif pengangkut komoditas perikanan tambak."),
        (6, "Via Jalur Turi -> Sukodadi -> Kalitengah", "utama", 5.5, 12, "Jalur bebas genangan air untuk mobilitas warga Bengawan Jero."),
        (18, "Via Jembatan Alternatif Simo Sungelebak - Karanggeneng", "utama", 4.2, 9, "Pengalihan kendaraan roda 2 dan 4 selama rekonstruksi gelagar jembatan."),
        (19, "Via Jalur Tanggul Babat -> Plaosan", "utama", 3.1, 7, "Pengalihan arus saat pemasangan I-girder jembatan Plaosan."),
        (35, "Via Jalur Pantura Eksisting Lamongan Kota", "utama", 7.5, 16, "Jalur utama nasional selama pengerjaan crossing jalan lingkar utara.")
    ]
    r_counter = 1
    for pid, r_name, prio, dist, waktu, alasan in rute_data:
        r_obj = RekomendasiRute(id=r_counter, proyek_id=pid, nama_rute=r_name, prioritas=prio, estimasi_jarak_km=dist, estimasi_waktu_menit=waktu, alasan_rekomendasi=alasan, is_valid=True)
        r_counter += 1
        db.add(r_obj)
    db.commit()

    # 8. Subscription & Notifikasi
    print("Menambahkan langganan dan notifikasi...")
    db.add_all([
        SubscriptionNotifikasi(id=1, user_id=3, proyek_id=1),
        SubscriptionNotifikasi(id=2, user_id=4, proyek_id=1),
        SubscriptionNotifikasi(id=3, user_id=3, proyek_id=13),
        SubscriptionNotifikasi(id=4, user_id=4, proyek_id=21),
        Notifikasi(id=1, user_id=3, proyek_id=1, pesan="Pembaruan: Progres proyek Peningkatan Jalan Sukodadi - Sumberwudi telah mencapai 82%.", is_read=False),
        Notifikasi(id=2, user_id=4, proyek_id=13, pesan="Pembaruan: Pembangunan Pintu Air & Retensi Kuro telah selesai 100% dan siap dioperasikan.", is_read=True),
        Notifikasi(id=3, user_id=4, proyek_id=21, pesan="Pembaruan: Pembangunan RSUD Brondong Pantura Tahap II mencapai progres fisik 82%.", is_read=False)
    ])
    db.commit()

    # 9. Laporan Masyarakat (Aduan Warga Valid)
    print("Menambahkan aduan warga riil...")
    aduan_records = [
        (1, 1, 3, "Mohon rambu pengaman proyek dan lampu penerangan darurat di tikungan Desa Menongo diperbanyak karena minim pencahayaan saat malam.", "ditanggapi", "Terima kasih atas informasinya. Rekanan kontraktor telah memasang 4 unit rotary warning light dan papan pengarah reflektif di titik tikungan.", 1),
        (2, 4, 4, "Debu material galian perkerasan jalan di koridor Babat cukup tebal saat siang hari, mohon jadwal penyiraman air rutin ditingkatkan.", "diproses", "Laporan telah diteruskan kepada pengawas lapangan Dinas PU Bina Marga untuk instruksi penyiraman armada tangki 3 kali sehari.", 1),
        (3, 13, 3, "Saluran air pembuang di sekitar Pintu Air Kuro agar dipastikan bebas dari sampah enceng gondok agar debit aliran tidak terhambat.", "ditanggapi", "Pembersihan alur intake kolam retensi telah dilakukan secara teratur oleh tim UPTD Pengairan Kuro.", 1),
        (4, 25, 4, "Mohon area bermain anak di Alun-Alun Lamongan diberikan pagar pembatas dari jalur lalu lintas kendaraan.", "baru", None, None),
    ]
    for a_id, pid, uid, isi, status_aduan, tanggapan, ditanggapi_oleh in aduan_records:
        rep = LaporanMasyarakat(
            id=a_id,
            proyek_id=pid,
            user_id=uid,
            isi_laporan=isi,
            status_tindak_lanjut=status_aduan,
            tanggapan_dinas=tanggapan,
            ditanggapi_oleh=ditanggapi_oleh
        )
        db.add(rep)
    db.commit()

    # 10. Rating Kepuasan
    print("Menambahkan data rating kepuasan warga...")
    ratings = [
        (1, 1, 3, 5, "Pengecoran jalan Sukodadi - Sumberwudi sangat kokoh dan tebal, mobilitas warga dan angkutan hasil bumi kini jauh lebih lancar!"),
        (2, 2, 4, 5, "Jalan Pucuk - Sekaran sudah mulus total dan tidak ada lubang lagi. Sangat menghemat waktu perjalanan."),
        (3, 13, 3, 5, "Pintu Air Kuro sangat membantu mengurangi debit genangan banjir luapan di kawasan kami. Mantap!"),
        (4, 25, 4, 4, "Penataan Alun-Alun Lamongan makin estetik dan ramah keluarga, jogging track-nya nyaman dipakai olahraga pagi.")
    ]
    for r_id, pid, uid, skor, komen in ratings:
        db.add(RatingKepuasan(id=r_id, proyek_id=pid, user_id=uid, skor=skor, komentar=komen))
    db.commit()

    # 11. Evaluasi Pembangunan Pasca Proyek
    print("Menambahkan evaluasi pasca-konstruksi...")
    eval_records = [
        (1, 2, 3, "Pengecekan Kerapian Bahu Jalan", "Secara umum beton mulus, terdapat sisa agregat di bahu jalan segmen Miru yang perlu dirapikan.", 2, "Analisis AI: Risiko rendah. Disarankan perapian bahu jalan untuk kenyamanan pengendara roda dua.", "menunggu_verifikasi"),
        (2, 13, 4, "Monitoring Kapasitas Kolam Olak Pintu Air", "Kapasitas debit pintu air berfungsi maksimal menampung limpasan air Bengawan Jero.", 1, "Analisis AI: Sistem pintu air hidrolik beroperasi pada efisiensi 98%. Tidak ditemukan anomali struktur.", "selesai_ditindaklanjuti")
    ]
    for e_id, pid, uid, kat, desc, skor_ai, sum_ai, st in eval_records:
        db.add(EvaluasiPembangunan(id=e_id, proyek_id=pid, user_id=uid, kategori_masalah=kat, deskripsi=desc, skor_urgensi_ai=skor_ai, ringkasan_analisis_ai=sum_ai, status=st))
        db.add(EvaluasiStatusLog(id=e_id, evaluasi_id=e_id, status_sebelumnya=None, status_baru=st, diubah_oleh=uid, catatan="Laporan evaluasi awal dicatat."))
    db.commit()

    print("Semua data live MySQL berhasil diperbarui!")

    # 12. Update frontend/src/data/mockData.ts
    print("Memperbarui frontend/src/data/mockData.ts...")
    mock_projects_js = []
    for p_meta in proyek_meta_list:
        p_item = p_meta["p"]
        pid = p_item["no"]
        w_name = f"{p_meta['kec_name']}, Kab. Lamongan"
        d_name = p_meta["desa_name"]
        
        # dinas label
        din_label = "Dinas Pekerjaan Umum Bina Marga"
        if p_meta["dinas_id"] == 2:
            din_label = "Dinas Perkim dan Cipta Karya"
        elif p_meta["dinas_id"] == 3:
            din_label = "Dinas Lingkungan Hidup"
        elif p_meta["dinas_id"] == 4:
            din_label = "Dinas Sumber Daya Air"
        elif p_meta["dinas_id"] == 5:
            din_label = "Dinas Kesehatan"

        t_terkini = tahap_terkini_map.get(pid, "Pengerjaan fisik di lapangan")
        
        rating_val = 4.8 if p_item["status"] == "Selesai" else 4.6
        rating_count = 35 + (pid * 2) % 40

        mock_projects_js.append({
            "id": pid,
            "nama_proyek": p_item["nama"],
            "kategori": p_meta["kategori"],
            "deskripsi": p_meta["deskripsi"],
            "latitude": p_item["lat"],
            "longitude": p_item["lng"],
            "wilayah_id": p_meta["kec_id"],
            "desa_id": p_meta["desa_id"],
            "dinas_id": p_meta["dinas_id"],
            "anggaran": p_item["pagu"],
            "status": p_meta["status"],
            "progres_persen": p_item["progres"],
            "tanggal_mulai": p_meta["t_mulai"],
            "estimasi_selesai": p_item["linimasa"].split("(")[-1].replace(")", "").strip(),
            "nama_wilayah": w_name,
            "nama_desa": d_name,
            "nama_dinas": din_label,
            "rata_rata_rating": rating_val,
            "jumlah_rating": rating_count,
            "tahap_terkini": t_terkini
        })

    # Read frontend mockData.ts
    frontend_mock_path = "/app/../frontend/src/data/mockData.ts"
    if os.path.exists(frontend_mock_path):
        with open(frontend_mock_path, "r", encoding="utf-8") as f:
            mock_content = f.read()

        # Update STATS_DATA
        total_p_count = len(mock_projects_js)
        total_anggaran_m = sum(x["anggaran"] for x in mock_projects_js) / 1000000000

        # Replace INITIAL_PROJECTS
        projects_ts_str = "export const INITIAL_PROJECTS: ProyekItem[] = " + json.dumps(mock_projects_js, indent=2, ensure_ascii=False) + ";"
        
        # Replace block from export const INITIAL_PROJECTS: ProyekItem[] = [ to ];
        import re
        mock_content = re.sub(
            r"export const STATS_DATA: StatSummary = \{[\s\S]*?\};",
            f"""export const STATS_DATA: StatSummary = {{\n  totalProyek: '{total_p_count}+',\n  totalProyekCount: {total_p_count},\n  totalAnggaran: 'Rp {int(total_anggaran_m)}M',\n  totalWarga: '18K',\n  totalDinas: 18,\n}};""",
            mock_content
        )

        mock_content = re.sub(
            r"export const INITIAL_PROJECTS: ProyekItem\[\] = \[[\s\S]*?\n\];",
            projects_ts_str,
            mock_content
        )

        with open(frontend_mock_path, "w", encoding="utf-8") as f:
            f.write(mock_content)
        print("frontend/src/data/mockData.ts berhasil diperbarui dengan 35 proyek valid!")

    # 13. Update backend/database/seed.sql
    print("Memperbarui backend/database/seed.sql...")
    sql_path = "/app/database/seed.sql"
    with open(sql_path, "r", encoding="utf-8") as f:
        existing_sql = f.read()

    # Find where dinas starts: line "-- 2. Data Dinas Instansi Pemerintah"
    dinas_marker = "-- 2. Data Dinas Instansi Pemerintah"
    idx_dinas = existing_sql.find(dinas_marker)
    if idx_dinas != -1:
        prefix_sql = existing_sql[:idx_dinas]

        new_sql_parts = [prefix_sql]
        new_sql_parts.append("-- 2. Data Dinas Instansi Pemerintah\n")
        new_sql_parts.append("INSERT INTO dinas (id, nama_dinas, wilayah_id) VALUES\n")
        new_sql_parts.append("(1, 'Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan', 1),\n")
        new_sql_parts.append("(2, 'Dinas Perumahan Rakyat, Kawasan Permukiman dan Cipta Karya Kabupaten Lamongan', 1),\n")
        new_sql_parts.append("(3, 'Dinas Lingkungan Hidup Kabupaten Lamongan', 1),\n")
        new_sql_parts.append("(4, 'Dinas Sumber Daya Air Kabupaten Lamongan', 1),\n")
        new_sql_parts.append("(5, 'Dinas Kesehatan Kabupaten Lamongan', 1);\n\n")

        new_sql_parts.append("-- 3. Data Pengguna (password: password123)\n")
        new_sql_parts.append("INSERT INTO users (id, nama, email, password_hash, role, dinas_id, is_active) VALUES\n")
        new_sql_parts.append("(1, 'Bambang Suryono, S.T. (Admin Dinas PU)', 'admin.pu@civictrack.demo', '$2b$12$HzOARqYWL3j1juLnrBy8Z.8lHThMRvICY09HSkGLVW4EyYalf7vDO', 'admin_dinas', 1, TRUE),\n")
        new_sql_parts.append("(2, 'Drs. Joko Prasetyo, M.Si (Kepala Dinas PU)', 'pimpinan.pu@civictrack.demo', '$2b$12$HzOARqYWL3j1juLnrBy8Z.8lHThMRvICY09HSkGLVW4EyYalf7vDO', 'pimpinan_instansi', 1, TRUE),\n")
        new_sql_parts.append("(3, 'Budi Santoso', 'budi.santoso@civictrack.demo', '$2b$12$HzOARqYWL3j1juLnrBy8Z.8lHThMRvICY09HSkGLVW4EyYalf7vDO', 'warga', NULL, TRUE),\n")
        new_sql_parts.append("(4, 'Siti Nurhaliza', 'siti.nurhaliza@civictrack.demo', '$2b$12$HzOARqYWL3j1juLnrBy8Z.8lHThMRvICY09HSkGLVW4EyYalf7vDO', 'warga', NULL, TRUE),\n")
        new_sql_parts.append("(5, 'Dr. Rahmat Hidayat (Pusat Studi Kebijakan Publik)', 'rahmat.peneliti@civictrack.demo', '$2b$12$HzOARqYWL3j1juLnrBy8Z.8lHThMRvICY09HSkGLVW4EyYalf7vDO', 'media_peneliti', NULL, TRUE),\n")
        new_sql_parts.append("(6, 'Bambang Suryono, S.T. (Penanggung Jawab Proyek)', 'penanggungjawab.pu@civictrack.demo', '$2b$12$HzOARqYWL3j1juLnrBy8Z.8lHThMRvICY09HSkGLVW4EyYalf7vDO', 'admin_dinas', 1, TRUE),\n")
        new_sql_parts.append("(7, 'Drs. Joko Prasetyo, M.Si (Aparatur Pemerintah Daerah)', 'aparatur.pemerintah@civictrack.demo', '$2b$12$HzOARqYWL3j1juLnrBy8Z.8lHThMRvICY09HSkGLVW4EyYalf7vDO', 'pimpinan_instansi', 1, TRUE),\n")
        new_sql_parts.append("(8, 'Admin CivicTrack', 'admin@civictrack.id', '$2b$12$HzOARqYWL3j1juLnrBy8Z.8lHThMRvICY09HSkGLVW4EyYalf7vDO', 'admin_dinas', 1, TRUE),\n")
        new_sql_parts.append("(9, 'Pimpinan CivicTrack', 'pimpinan@civictrack.id', '$2b$12$HzOARqYWL3j1juLnrBy8Z.8lHThMRvICY09HSkGLVW4EyYalf7vDO', 'pimpinan_instansi', 1, TRUE),\n")
        new_sql_parts.append("(10, 'Warga CivicTrack', 'warga@civictrack.id', '$2b$12$HzOARqYWL3j1juLnrBy8Z.8lHThMRvICY09HSkGLVW4EyYalf7vDO', 'warga', NULL, TRUE);\n\n")

        # Proyek SQL
        new_sql_parts.append(f"-- 4. Data {len(proyek_meta_list)} Proyek Infrastruktur Terverifikasi Lamongan\n")
        new_sql_parts.append("INSERT INTO proyek (id, nama_proyek, kategori, deskripsi, latitude, longitude, wilayah_id, desa_id, dinas_id, anggaran, status, progres_persen, tanggal_mulai, estimasi_selesai, dibuat_oleh) VALUES\n")
        proyek_rows = []
        for p_meta in proyek_meta_list:
            p_it = p_meta["p"]
            d_id_sql = f"{p_meta['desa_id']}" if p_meta['desa_id'] else "NULL"
            safe_nama = p_it["nama"].replace("'", "''")
            safe_desc = p_meta["deskripsi"].replace("'", "''")
            proyek_rows.append(
                f"({p_it['no']}, '{safe_nama}', '{p_meta['kategori']}', '{safe_desc}', {p_it['lat']:.6f}, {p_it['lng']:.6f}, {p_meta['kec_id']}, {d_id_sql}, {p_meta['dinas_id']}, {p_it['pagu']:.2f}, '{p_meta['status']}', {p_it['progres']}, '{p_meta['t_mulai']}', '{p_meta['t_selesai']}', 1)"
            )
        new_sql_parts.append(",\n".join(proyek_rows) + ";\n\n")

        # Tahapan Progres SQL
        new_sql_parts.append("-- 5. Data Tahapan Progres\n")
        new_sql_parts.append("INSERT INTO tahapan_progres (id, proyek_id, nama_tahap, progres_persen, catatan, dicatat_oleh) VALUES\n")
        tahap_rows = []
        all_tahapan = db.query(TahapanProgres).order_by(TahapanProgres.id).all()
        for th in all_tahapan:
            safe_th_name = th.nama_tahap.replace("'", "''")
            safe_th_cat = (th.catatan or "").replace("'", "''")
            tahap_rows.append(f"({th.id}, {th.proyek_id}, '{safe_th_name}', {th.progres_persen}, '{safe_th_cat}', {th.dicatat_oleh})")
        new_sql_parts.append(",\n".join(tahap_rows) + ";\n\n")

        # Dokumentasi
        new_sql_parts.append("-- 6. Data Dokumentasi Proyek\n")
        new_sql_parts.append("INSERT INTO dokumentasi_proyek (id, proyek_id, tahapan_id, tipe_media, url_file, ukuran_file, diunggah_oleh) VALUES\n")
        dok_rows = []
        all_doks = db.query(DokumentasiProyek).order_by(DokumentasiProyek.id).all()
        for dk in all_doks:
            th_id_str = f"{dk.tahapan_id}" if dk.tahapan_id else "NULL"
            dok_rows.append(f"({dk.id}, {dk.proyek_id}, {th_id_str}, '{dk.tipe_media.value}', '{dk.url_file}', {dk.ukuran_file}, {dk.diunggah_oleh})")
        new_sql_parts.append(",\n".join(dok_rows) + ";\n\n")

        # Rekomendasi Rute
        new_sql_parts.append("-- 7. Data Rekomendasi Rute AI\n")
        new_sql_parts.append("INSERT INTO rekomendasi_rute (id, proyek_id, nama_rute, prioritas, estimasi_jarak_km, estimasi_waktu_menit, alasan_rekomendasi, is_valid) VALUES\n")
        rute_rows = []
        all_rutes = db.query(RekomendasiRute).order_by(RekomendasiRute.id).all()
        for rt in all_rutes:
            safe_rute_name = rt.nama_rute.replace("'", "''")
            safe_rute_alasan = rt.alasan_rekomendasi.replace("'", "''")
            rute_rows.append(f"({rt.id}, {rt.proyek_id}, '{safe_rute_name}', '{rt.prioritas.value}', {rt.estimasi_jarak_km:.2f}, {rt.estimasi_waktu_menit}, '{safe_rute_alasan}', TRUE)")
        new_sql_parts.append(",\n".join(rute_rows) + ";\n\n")

        # Subscription & Notifikasi
        new_sql_parts.append("-- 8. Data Langganan Notifikasi\n")
        new_sql_parts.append("INSERT INTO subscription_notifikasi (id, user_id, proyek_id) VALUES\n")
        new_sql_parts.append("(1, 3, 1), (2, 4, 1), (3, 3, 13), (4, 4, 21);\n\n")

        new_sql_parts.append("-- 9. Data Notifikasi\n")
        new_sql_parts.append("INSERT INTO notifikasi (id, user_id, proyek_id, pesan, is_read) VALUES\n")
        new_sql_parts.append("(1, 3, 1, 'Pembaruan: Progres proyek Peningkatan Jalan Sukodadi - Sumberwudi telah mencapai 82%.', FALSE),\n")
        new_sql_parts.append("(2, 4, 13, 'Pembaruan: Pembangunan Pintu Air & Retensi Kuro telah selesai 100% dan siap dioperasikan.', TRUE),\n")
        new_sql_parts.append("(3, 4, 21, 'Pembaruan: Pembangunan RSUD Brondong Pantura Tahap II mencapai progres fisik 82%.', FALSE);\n\n")

        # Laporan
        new_sql_parts.append("-- 10. Data Laporan Masyarakat & Tanggapan\n")
        new_sql_parts.append("INSERT INTO laporan_masyarakat (id, proyek_id, user_id, isi_laporan, status_tindak_lanjut, tanggapan_dinas, ditanggapi_oleh) VALUES\n")
        lap_rows = []
        all_laps = db.query(LaporanMasyarakat).order_by(LaporanMasyarakat.id).all()
        for lp in all_laps:
            safe_isi = lp.isi_laporan.replace("'", "''")
            if lp.tanggapan_dinas:
                clean_tang = lp.tanggapan_dinas.replace("'", "''")
                safe_tang = f"'{clean_tang}'"
            else:
                safe_tang = "NULL"
            dt_oleh = f"{lp.ditanggapi_oleh}" if lp.ditanggapi_oleh else "NULL"
            lap_rows.append(f"({lp.id}, {lp.proyek_id}, {lp.user_id}, '{safe_isi}', '{lp.status_tindak_lanjut.value}', {safe_tang}, {dt_oleh})")
        new_sql_parts.append(",\n".join(lap_rows) + ";\n\n")

        # Rating
        new_sql_parts.append("-- 11. Data Rating Kepuasan\n")
        new_sql_parts.append("INSERT INTO rating_kepuasan (id, proyek_id, user_id, skor, komentar) VALUES\n")
        rat_rows = []
        all_rats = db.query(RatingKepuasan).order_by(RatingKepuasan.id).all()
        for rt in all_rats:
            safe_kom = rt.komentar.replace("'", "''")
            rat_rows.append(f"({rt.id}, {rt.proyek_id}, {rt.user_id}, {rt.skor}, '{safe_kom}')")
        new_sql_parts.append(",\n".join(rat_rows) + ";\n\n")

        # Evaluasi
        new_sql_parts.append("-- 12. Data Evaluasi Pembangunan Pasca-Proyek\n")
        new_sql_parts.append("INSERT INTO evaluasi_pembangunan (id, proyek_id, user_id, kategori_masalah, deskripsi, skor_urgensi_ai, ringkasan_analisis_ai, status) VALUES\n")
        ev_rows = []
        all_evs = db.query(EvaluasiPembangunan).order_by(EvaluasiPembangunan.id).all()
        for ev in all_evs:
            safe_kat = ev.kategori_masalah.replace("'", "''")
            safe_ev_desc = ev.deskripsi.replace("'", "''")
            safe_ai = ev.ringkasan_analisis_ai.replace("'", "''")
            ev_rows.append(f"({ev.id}, {ev.proyek_id}, {ev.user_id}, '{safe_kat}', '{safe_ev_desc}', {ev.skor_urgensi_ai}, '{safe_ai}', '{ev.status.value}')")
        new_sql_parts.append(",\n".join(ev_rows) + ";\n\n")

        new_sql_parts.append("-- 13. Data Log Evaluasi\n")
        new_sql_parts.append("INSERT INTO evaluasi_status_log (id, evaluasi_id, status_sebelumnya, status_baru, diubah_oleh, catatan) VALUES\n")
        ev_log_rows = []
        all_ev_logs = db.query(EvaluasiStatusLog).order_by(EvaluasiStatusLog.id).all()
        for evl in all_ev_logs:
            prev = f"'{evl.status_sebelumnya}'" if evl.status_sebelumnya else "NULL"
            safe_cat = evl.catatan.replace("'", "''")
            ev_log_rows.append(f"({evl.id}, {evl.evaluasi_id}, {prev}, '{evl.status_baru}', {evl.diubah_oleh}, '{safe_cat}')")
        new_sql_parts.append(",\n".join(ev_log_rows) + ";\n\n")

        new_sql_parts.append("SET FOREIGN_KEY_CHECKS = 1;\n")

        with open(sql_path, "w", encoding="utf-8") as f:
            f.write("".join(new_sql_parts))
        print("backend/database/seed.sql berhasil diperbarui secara komprehensif!")

    print("\nPROSES MIGRASI DAN PEMBARUAN DATA VALID SELESAI DENGAN SUKSES 100%!")

if __name__ == "__main__":
    run()

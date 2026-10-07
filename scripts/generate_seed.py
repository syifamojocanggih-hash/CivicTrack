"""
Generator Skrip Seed Tunggal untuk CivicTrack (Kabupaten Lamongan).
Membaca data resmi dari:
- frontend/src/data/lamonganKecamatanGeoJSON.json (27 kecamatan batas BPS/BIG)
- frontend/src/data/mockData.ts (27 proyek infrastruktur Lamongan)

Menghasilkan:
- backend/database/seed.sql (raw SQL untuk Docker entrypoint / MySQL init)
- backend/app/seed.py (SQLAlchemy seeder dengan validasi ketat Point-in-Polygon)
"""

import json
import re
import os
from shapely.geometry import shape, Point, mapping
from shapely.ops import unary_union

def main():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    geojson_path = os.path.join(root_dir, "frontend", "src", "data", "lamonganKecamatanGeoJSON.json")
    mock_path = os.path.join(root_dir, "frontend", "src", "data", "mockData.ts")
    out_sql_path = os.path.join(root_dir, "backend", "database", "seed.sql")
    out_py_path = os.path.join(root_dir, "backend", "app", "seed.py")

    print(f"Membaca GeoJSON dari: {geojson_path}")
    with open(geojson_path, "r", encoding="utf-8") as f:
        geojson = json.load(f)

    print(f"Membaca mockData.ts dari: {mock_path}")
    with open(mock_path, "r", encoding="utf-8") as f:
        mock_content = f.read()

    # 1. Bangun Data Wilayah Administratif
    # ID 1: Kabupaten Lamongan (Union dari 27 kecamatan)
    kec_shapes = []
    wilayah_list = []
    
    # Kumpulkan kecamatan
    # Urutkan berdasarkan kode BPS
    features = sorted(geojson["features"], key=lambda x: x["properties"]["id"])
    
    # Buat map kode & nama ke shape
    kec_lookup = {}
    for idx, feat in enumerate(features):
        props = feat["properties"]
        geom_shape = shape(feat["geometry"])
        kec_shapes.append(geom_shape)
        
        wid = idx + 2 # ID 2 s/d 28
        kec_info = {
            "id": wid,
            "kode_wilayah": props["id"], # '35.24.01' s/d '35.24.27'
            "nama_wilayah": props["nama"], # 'Kecamatan Sukorame', etc.
            "kecamatan_clean": props["kecamatan"], # 'Sukorame', etc.
            "level": "kecamatan",
            "parent_id": 1,
            "geom_boundary": json.dumps(feat["geometry"]),
            "shape": geom_shape
        }
        wilayah_list.append(kec_info)
        kec_lookup[props["nama"].lower()] = kec_info
        kec_lookup[props["kecamatan"].lower()] = kec_info

    # Union untuk Kabupaten Lamongan
    kab_union = unary_union(kec_shapes)
    # Sederhanakan sedikit agar string batas kabupaten bersih dan valid
    kab_union_simple = kab_union.simplify(0.0005, preserve_topology=True)
    kab_info = {
        "id": 1,
        "kode_wilayah": "35.24",
        "nama_wilayah": "Kabupaten Lamongan",
        "level": "kabupaten",
        "parent_id": None,
        "geom_boundary": json.dumps(mapping(kab_union_simple)),
        "shape": kab_union
    }

    # Load 474 desa/kelurahan resmi Kemendagri
    desa_json_path = os.path.join(root_dir, "backend", "database", "lamongan_desa_kemendagri.json")
    print(f"Membaca data desa Kemendagri dari: {desa_json_path}")
    with open(desa_json_path, "r", encoding="utf-8") as f:
        desa_raw = json.load(f)

    kec_by_code = {k["kode_wilayah"]: k for k in wilayah_list}
    desa_list = []
    base_desa_id = 28 # ID 1 = kab, ID 2..28 = 27 kecamatan
    for d_idx, d_item in enumerate(desa_raw):
        p_kec = kec_by_code.get(d_item["kecamatan_kode"])
        if not p_kec:
            raise ValueError(f"Kecamatan dengan kode {d_item['kecamatan_kode']} tidak ditemukan!")
        desa_id = base_desa_id + d_idx + 1 # ID 29 s/d 502
        desa_list.append({
            "id": desa_id,
            "kode_wilayah": d_item["kode_wilayah"],
            "nama_wilayah": d_item["nama_wilayah"],
            "level": "desa",
            "parent_id": p_kec["id"],
            "geom_boundary": None
        })

    all_wilayah = [kab_info] + wilayah_list + desa_list

    print(f"Total wilayah administratif: {len(all_wilayah)} (1 kabupaten, {len(wilayah_list)} kecamatan, {len(desa_list)} desa)")

    # 2. Parse 27 Proyek dari mockData.ts
    # Ekstrak objek proyek
    raw_projects = re.findall(
        r"\{\s*id:\s*(\d+),\s*nama_proyek:\s*'([^']+)',\s*kategori:\s*'([^']+)',\s*deskripsi:\s*'([^']+)',\s*latitude:\s*([-\d.]+),\s*longitude:\s*([-\d.]+),\s*wilayah_id:\s*(\d+),\s*dinas_id:\s*(\d+),\s*anggaran:\s*(\d+),\s*status:\s*'([^']+)',\s*progres_persen:\s*(\d+),\s*tanggal_mulai:\s*'([^']+)',\s*estimasi_selesai:\s*'([^']+)',\s*nama_wilayah:\s*'([^']+)',\s*nama_dinas:\s*'([^']+)'",
        mock_content
    )
    
    if len(raw_projects) != 27:
        raise ValueError(f"Ditemukan {len(raw_projects)} proyek di mockData.ts, diharapkan tepat 27!")

    proyek_list = []
    print("\nMemvalidasi Point-in-Polygon untuk 27 proyek:")
    for p in raw_projects:
        pid, name, cat, desc, lat, lng, wid, did, angg, status, prog, tmulai, tselesai, nwil, ndin = p
        lat_f = float(lat)
        lng_f = float(lng)
        
        # Cari kecamatan yang cocok
        clean_kw = nwil.split(",")[0].replace("Kec. ", "").replace("Kecamatan ", "").replace(" (Kota)", "").strip().lower()
        matched_kec = None
        for k_key, k_obj in kec_lookup.items():
            if clean_kw in k_key:
                matched_kec = k_obj
                break
                
        if not matched_kec:
            raise ValueError(f"Tidak dapat mencocokkan kecamatan untuk wilayah '{nwil}' (Proyek #{pid} {name})")
            
        # Point-in-Polygon check
        pt = Point(lng_f, lat_f)
        if not matched_kec["shape"].contains(pt):
            dist = matched_kec["shape"].distance(pt)
            raise ValueError(
                f"VALIDASI GAGAL: Koordinat ({lat_f}, {lng_f}) proyek '{name}' berada di luar poligon {matched_kec['nama_wilayah']} (jarak: {dist:.6f} deg)!"
            )
            
        db_kategori = "gedung_publik" if cat == "fasilitas" else cat
        proyek_list.append({
            "id": int(pid),
            "nama_proyek": name,
            "kategori": db_kategori,
            "deskripsi": desc,
            "latitude": lat_f,
            "longitude": lng_f,
            "wilayah_id": matched_kec["id"],
            "desa_id": None,
            "nama_wilayah": matched_kec["nama_wilayah"],
            "dinas_id": int(did) if int(did) in [1, 2, 3] else 1,
            "anggaran": float(angg),
            "status": status,
            "progres_persen": int(prog),
            "tanggal_mulai": tmulai,
            "estimasi_selesai": "2025-12-31" if "Des" in tselesai else "2025-10-31",
            "dibuat_oleh": 1
        })
        print(f"  [PASS] Proyek #{pid:>2}: {name[:36]:<36} -> {matched_kec['nama_wilayah']} ({lat_f}, {lng_f})")

    # 3. Data Dinas
    dinas_list = [
        {"id": 1, "nama_dinas": "Dinas Pekerjaan Umum Bina Marga Kabupaten Lamongan", "wilayah_id": 1},
        {"id": 2, "nama_dinas": "Dinas Perumahan Rakyat, Kawasan Permukiman dan Cipta Karya Kabupaten Lamongan", "wilayah_id": 1},
        {"id": 3, "nama_dinas": "Dinas Lingkungan Hidup Kabupaten Lamongan", "wilayah_id": 1},
    ]

    # 4. Data Users (Fictional officials & @civictrack.demo domain)
    # Password: password123 (valid bcrypt hash)
    bcrypt_hash = "$2b$12$m8mdBGlPmxfee5.o0U5buOycugO.lp2od50Veqte6zMbp4y2t5svO"
    users_list = [
        {
            "id": 1,
            "nama": "Bambang Suryono, S.T. (Admin Dinas PU)",
            "email": "admin.pu@civictrack.demo",
            "password_hash": bcrypt_hash,
            "role": "admin_dinas",
            "dinas_id": 1,
            "is_active": True
        },
        {
            "id": 2,
            "nama": "Drs. Joko Prasetyo, M.Si (Kepala Dinas PU)",
            "email": "pimpinan.pu@civictrack.demo",
            "password_hash": bcrypt_hash,
            "role": "pimpinan_instansi",
            "dinas_id": 1,
            "is_active": True
        },
        {
            "id": 3,
            "nama": "Budi Santoso",
            "email": "budi.santoso@civictrack.demo",
            "password_hash": bcrypt_hash,
            "role": "warga",
            "dinas_id": None,
            "is_active": True
        },
        {
            "id": 4,
            "nama": "Siti Nurhaliza",
            "email": "siti.nurhaliza@civictrack.demo",
            "password_hash": bcrypt_hash,
            "role": "warga",
            "dinas_id": None,
            "is_active": True
        },
        {
            "id": 5,
            "nama": "Dr. Rahmat Hidayat (Pusat Studi Kebijakan Publik)",
            "email": "rahmat.peneliti@civictrack.demo",
            "password_hash": bcrypt_hash,
            "role": "media_peneliti",
            "dinas_id": None,
            "is_active": True
        },
        {
            "id": 6,
            "nama": "Bambang Suryono, S.T. (Penanggung Jawab Proyek)",
            "email": "penanggungjawab.pu@civictrack.demo",
            "password_hash": bcrypt_hash,
            "role": "admin_dinas",
            "dinas_id": 1,
            "is_active": True
        },
        {
            "id": 7,
            "nama": "Drs. Joko Prasetyo, M.Si (Aparatur Pemerintah Daerah)",
            "email": "aparatur.pemerintah@civictrack.demo",
            "password_hash": bcrypt_hash,
            "role": "pimpinan_instansi",
            "dinas_id": 1,
            "is_active": True
        }
    ]

    # 5. Data Tahapan Progres
    tahapan_list = [
        {"id": 1, "proyek_id": 1, "nama_tahap": "Pembongkaran Fasilitas Lama & Pembersihan Lahan", "progres_persen": 20, "catatan": "Pembersihan area Alun-Alun tuntas 100%.", "dicatat_oleh": 1},
        {"id": 2, "proyek_id": 1, "nama_tahap": "Pemasangan Paving Block & Drainage Track", "progres_persen": 45, "catatan": "Paving terpasang di sisi timur dan utara.", "dicatat_oleh": 1},
        {"id": 3, "proyek_id": 1, "nama_tahap": "Instalasi Penerangan Taman & Area Bermain Anak", "progres_persen": 65, "catatan": "Tiang lampu taman berdiri, menunggu instalasi kabel bawah tanah.", "dicatat_oleh": 1},
        {"id": 4, "proyek_id": 2, "nama_tahap": "Pengupasan Bahu Jalan & Saluran Tepi Poros Deket", "progres_persen": 15, "catatan": "Alat berat beroperasi di segmen Deket Kulon.", "dicatat_oleh": 1},
        {"id": 5, "proyek_id": 2, "nama_tahap": "Pengecoran Lapis Pondasi Semen Agregat", "progres_persen": 38, "catatan": "Pengecoran lajur kiri selebar 3 meter selesai.", "dicatat_oleh": 1},
        {"id": 6, "proyek_id": 3, "nama_tahap": "Pembangunan Mini Amphitheater & Wahana Ramah Anak", "progres_persen": 60, "catatan": "Struktur panggung selesai, dilanjutkan penanaman tabebuya.", "dicatat_oleh": 1},
        {"id": 7, "proyek_id": 4, "nama_tahap": "Pengecoran Pilar Jembatan & Penataan Frontage", "progres_persen": 45, "catatan": "Pilar tengah terpasang, rekayasa lalu lintas simpang Babat lancar.", "dicatat_oleh": 1},
    ]

    # 6. Data Dokumentasi Proyek
    dokumentasi_list = [
        {"id": 1, "proyek_id": 1, "tahapan_id": 1, "tipe_media": "foto", "url_file": "/uploads/proyek_1_tahap_1.jpg", "ukuran_file": 1240, "diunggah_oleh": 1},
        {"id": 2, "proyek_id": 1, "tahapan_id": 2, "tipe_media": "foto", "url_file": "/uploads/proyek_1_tahap_2.jpg", "ukuran_file": 2150, "diunggah_oleh": 1},
        {"id": 3, "proyek_id": 1, "tahapan_id": 3, "tipe_media": "foto", "url_file": "/uploads/proyek_1_tahap_3.jpg", "ukuran_file": 1890, "diunggah_oleh": 1},
        {"id": 4, "proyek_id": 2, "tahapan_id": 4, "tipe_media": "foto", "url_file": "/uploads/proyek_2_tahap_1.jpg", "ukuran_file": 1420, "diunggah_oleh": 1},
    ]

    # 7. Data Rekomendasi Rute AI (Rute riil jalan Lamongan untuk Proyek 1)
    rute_list = [
        {"id": 1, "proyek_id": 1, "nama_rute": "Jl. Lamongrejo -> Jl. Sunan Drajat -> Jl. Veteran", "prioritas": "utama", "estimasi_jarak_km": 3.20, "estimasi_waktu_menit": 8, "alasan_rekomendasi": "Jalur alternatif utama melintasi jalan kolektor lebar dengan koordinasi lampu lalu lintas optimal.", "is_valid": True},
        {"id": 2, "proyek_id": 1, "nama_rute": "Jl. Basuki Rahmat -> Jl. KH. Ahmad Dahlan", "prioritas": "kedua", "estimasi_jarak_km": 4.50, "estimasi_waktu_menit": 12, "alasan_rekomendasi": "Alternatif terbaik untuk kendaraan roda 4 dan angkutan barang guna menghindari kepadatan pusat kota.", "is_valid": True},
        {"id": 3, "proyek_id": 1, "nama_rute": "Jl. KH. Hasyim Asy'ari -> Jl. Dr. Wahidin Sudirohusodo", "prioritas": "tambahan", "estimasi_jarak_km": 2.80, "estimasi_waktu_menit": 7, "alasan_rekomendasi": "Khusus pengendara sepeda motor untuk memangkas waktu tempuh pada jam sibuk pagi dan sore.", "is_valid": True},
    ]

    # 8. Subscription & Notifikasi
    subscription_list = [
        {"id": 1, "user_id": 3, "proyek_id": 1},
        {"id": 2, "user_id": 4, "proyek_id": 1},
        {"id": 3, "user_id": 3, "proyek_id": 2},
    ]
    notifikasi_list = [
        {"id": 1, "user_id": 3, "proyek_id": 1, "pesan": "Pembaruan: Progres proyek Renovasi Alun-Alun & Taman Centennial Lamongan mencapai 65%.", "is_read": False},
        {"id": 2, "user_id": 4, "proyek_id": 1, "pesan": "Pembaruan: Progres proyek Renovasi Alun-Alun & Taman Centennial Lamongan mencapai 65%.", "is_read": True},
    ]

    # 9. Laporan Masyarakat
    laporan_list = [
        {"id": 1, "proyek_id": 1, "user_id": 3, "isi_laporan": "Mohon rambu pembatas di sisi barat Alun-Alun diperjelas agar anak-anak tidak mendekati alat berat.", "status_tindak_lanjut": "ditanggapi", "tanggapan_dinas": "Terima kasih atas masukannya. Tim lapangan dinas telah memasang barikade pengaman ekstra dan papan peringatan radius 10 meter.", "ditanggapi_oleh": 1},
        {"id": 2, "proyek_id": 2, "user_id": 4, "isi_laporan": "Debu material galian di koridor Deket cukup tebal saat siang hari, mohon disiram berkala.", "status_tindak_lanjut": "diproses", "tanggapan_dinas": "Laporan telah diteruskan ke mandor pelaksana jalan untuk penyiraman rutin dua kali sehari.", "ditanggapi_oleh": 1},
    ]

    # 10. Rating Kepuasan & Evaluasi
    rating_list = [
        {"id": 1, "proyek_id": 1, "user_id": 3, "skor": 5, "komentar": "Pengerjaan Alun-Alun Lamongan sangat rapi, desain jogging track dan pencahayaannya modern!"},
        {"id": 2, "proyek_id": 1, "user_id": 4, "skor": 4, "komentar": "Sangat bagus ruang terbukanya, semoga kebersihannya terus dirawat."},
    ]
    evaluasi_list = [
        {"id": 1, "proyek_id": 1, "user_id": 3, "kategori_masalah": "Genangan Air Sudut Timur Lapangan", "deskripsi": "Saluran pembuangan air di sudut timur agak lambat mengalir saat hujan deras.", "skor_urgensi_ai": 2, "ringkasan_analisis_ai": "Analisis AI: Risiko genangan ringan. Disarankan pembersihan berkala sisa pasir pada grill inlet drainase.", "status": "menunggu_verifikasi"}
    ]

    # ==========================================================
    # GENERATE seed.sql
    # ==========================================================
    print("\nMenghasilkan backend/database/seed.sql...")
    sql_lines = [
        "-- ==========================================================",
        "-- Data Seed Resmi CivicTrack Kabupaten Lamongan (MySQL 8.0+)",
        "-- Dihasilkan secara otomatis oleh scripts/generate_seed.py",
        "-- Sumber Batas: Badan Pusat Statistik (BPS) & Badan Informasi Geospasial (BIG)",
        "-- Password default semua user: password123",
        "-- ==========================================================",
        "",
        "USE civictrack_db;",
        "",
        "-- 1. Data Wilayah Administratif Berjenjang (Kabupaten Lamongan & 27 Kecamatan)",
        "INSERT INTO wilayah_administratif (id, kode_wilayah, nama_wilayah, level, parent_id, geom_boundary) VALUES"
    ]

    w_values = []
    for w in all_wilayah:
        pid_str = "NULL" if w["parent_id"] is None else str(w["parent_id"])
        if w.get("geom_boundary") is None:
            geom_str = "NULL"
        else:
            geom_escaped = w["geom_boundary"].replace("'", "''")
            geom_str = f"'{geom_escaped}'"
        w_values.append(
            f"({w['id']}, '{w['kode_wilayah']}', '{w['nama_wilayah']}', '{w['level']}', {pid_str}, {geom_str})"
        )
    sql_lines.append(",\n".join(w_values) + ";")
    sql_lines.append("")

    # 2. Dinas
    sql_lines.append("-- 2. Data Dinas Instansi Pemerintah")
    sql_lines.append("INSERT INTO dinas (id, nama_dinas, wilayah_id) VALUES")
    d_values = [f"({d['id']}, '{d['nama_dinas']}', {d['wilayah_id']})" for d in dinas_list]
    sql_lines.append(",\n".join(d_values) + ";")
    sql_lines.append("")

    # 3. Users
    sql_lines.append("-- 3. Data Pengguna (@civictrack.demo, password: password123)")
    sql_lines.append("INSERT INTO users (id, nama, email, password_hash, role, dinas_id, is_active) VALUES")
    u_values = []
    for u in users_list:
        did_str = "NULL" if u["dinas_id"] is None else str(u["dinas_id"])
        u_values.append(
            f"({u['id']}, '{u['nama']}', '{u['email']}', '{u['password_hash']}', '{u['role']}', {did_str}, TRUE)"
        )
    sql_lines.append(",\n".join(u_values) + ";")
    sql_lines.append("")

    # 4. Proyek
    sql_lines.append("-- 4. Data 27 Proyek Infrastruktur Lamongan")
    sql_lines.append("INSERT INTO proyek (id, nama_proyek, kategori, deskripsi, latitude, longitude, wilayah_id, desa_id, dinas_id, anggaran, status, progres_persen, tanggal_mulai, estimasi_selesai, dibuat_oleh) VALUES")
    p_values = []
    for p in proyek_list:
        desc_esc = p["deskripsi"].replace("'", "''")
        desa_id_str = "NULL" if p.get("desa_id") is None else str(p["desa_id"])
        p_values.append(
            f"({p['id']}, '{p['nama_proyek']}', '{p['kategori']}', '{desc_esc}', {p['latitude']:.6f}, {p['longitude']:.6f}, {p['wilayah_id']}, {desa_id_str}, {p['dinas_id']}, {p['anggaran']:.2f}, '{p['status']}', {p['progres_persen']}, '{p['tanggal_mulai']}', '{p['estimasi_selesai']}', {p['dibuat_oleh']})"
        )
    sql_lines.append(",\n".join(p_values) + ";")
    sql_lines.append("")

    # 5. Tahapan Progres
    sql_lines.append("-- 5. Data Tahapan Progres")
    sql_lines.append("INSERT INTO tahapan_progres (id, proyek_id, nama_tahap, progres_persen, catatan, dicatat_oleh) VALUES")
    t_values = [f"({t['id']}, {t['proyek_id']}, '{t['nama_tahap']}', {t['progres_persen']}, '{t['catatan']}', {t['dicatat_oleh']})" for t in tahapan_list]
    sql_lines.append(",\n".join(t_values) + ";")
    sql_lines.append("")

    # 6. Dokumentasi
    sql_lines.append("-- 6. Data Dokumentasi Proyek")
    sql_lines.append("INSERT INTO dokumentasi_proyek (id, proyek_id, tahapan_id, tipe_media, url_file, ukuran_file, diunggah_oleh) VALUES")
    dok_values = [f"({d['id']}, {d['proyek_id']}, {d['tahapan_id']}, '{d['tipe_media']}', '{d['url_file']}', {d['ukuran_file']}, {d['diunggah_oleh']})" for d in dokumentasi_list]
    sql_lines.append(",\n".join(dok_values) + ";")
    sql_lines.append("")

    # 7. Rute AI
    sql_lines.append("-- 7. Data Rekomendasi Rute AI")
    sql_lines.append("INSERT INTO rekomendasi_rute (id, proyek_id, nama_rute, prioritas, estimasi_jarak_km, estimasi_waktu_menit, alasan_rekomendasi, is_valid) VALUES")
    r_values = []
    for r in rute_list:
        r_desc_esc = r['alasan_rekomendasi'].replace("'", "''")
        r_name_esc = r['nama_rute'].replace("'", "''")
        r_values.append(
            f"({r['id']}, {r['proyek_id']}, '{r_name_esc}', '{r['prioritas']}', {r['estimasi_jarak_km']:.2f}, {r['estimasi_waktu_menit']}, '{r_desc_esc}', TRUE)"
        )
    sql_lines.append(",\n".join(r_values) + ";")
    sql_lines.append("")

    # 8. Subscription & Notifikasi
    sql_lines.append("-- 8. Data Langganan Notifikasi")
    sql_lines.append("INSERT INTO subscription_notifikasi (id, user_id, proyek_id) VALUES")
    sub_values = [f"({s['id']}, {s['user_id']}, {s['proyek_id']})" for s in subscription_list]
    sql_lines.append(",\n".join(sub_values) + ";")
    sql_lines.append("")

    sql_lines.append("-- 9. Data Notifikasi")
    sql_lines.append("INSERT INTO notifikasi (id, user_id, proyek_id, pesan, is_read) VALUES")
    n_values = [f"({n['id']}, {n['user_id']}, {n['proyek_id']}, '{n['pesan']}', {'TRUE' if n['is_read'] else 'FALSE'})" for n in notifikasi_list]
    sql_lines.append(",\n".join(n_values) + ";")
    sql_lines.append("")

    # 10. Laporan Masyarakat
    sql_lines.append("-- 10. Data Laporan Masyarakat & Tanggapan")
    sql_lines.append("INSERT INTO laporan_masyarakat (id, proyek_id, user_id, isi_laporan, status_tindak_lanjut, tanggapan_dinas, ditanggapi_oleh) VALUES")
    lap_values = [f"({l['id']}, {l['proyek_id']}, {l['user_id']}, '{l['isi_laporan']}', '{l['status_tindak_lanjut']}', '{l['tanggapan_dinas']}', {l['ditanggapi_oleh']})" for l in laporan_list]
    sql_lines.append(",\n".join(lap_values) + ";")
    sql_lines.append("")

    # 11. Rating
    sql_lines.append("-- 11. Data Rating Kepuasan")
    sql_lines.append("INSERT INTO rating_kepuasan (id, proyek_id, user_id, skor, komentar) VALUES")
    rat_values = [f"({rt['id']}, {rt['proyek_id']}, {rt['user_id']}, {rt['skor']}, '{rt['komentar']}')" for rt in rating_list]
    sql_lines.append(",\n".join(rat_values) + ";")
    sql_lines.append("")

    # 12. Evaluasi
    sql_lines.append("-- 12. Data Evaluasi Pembangunan Pasca-Proyek")
    sql_lines.append("INSERT INTO evaluasi_pembangunan (id, proyek_id, user_id, kategori_masalah, deskripsi, skor_urgensi_ai, ringkasan_analisis_ai, status) VALUES")
    ev_values = [f"({ev['id']}, {ev['proyek_id']}, {ev['user_id']}, '{ev['kategori_masalah']}', '{ev['deskripsi']}', {ev['skor_urgensi_ai']}, '{ev['ringkasan_analisis_ai']}', '{ev['status']}')" for ev in evaluasi_list]
    sql_lines.append(",\n".join(ev_values) + ";")
    sql_lines.append("")

    sql_lines.append("-- 13. Data Log Evaluasi")
    sql_lines.append("INSERT INTO evaluasi_status_log (id, evaluasi_id, status_sebelumnya, status_baru, diubah_oleh, catatan) VALUES")
    sql_lines.append("(1, 1, NULL, 'menunggu_verifikasi', 3, 'Laporan evaluasi awal diajukan oleh warga.');")

    with open(out_sql_path, "w", encoding="utf-8") as f:
        f.write("\n".join(sql_lines) + "\n")
    print(f"Berhasil membuat: {out_sql_path} ({os.path.getsize(out_sql_path) / 1024:.1f} KB)")

    # ==========================================================
    # GENERATE seed.py
    # ==========================================================
    print("\nMenghasilkan backend/app/seed.py...")
    # Serialize data to embed in seed.py
    seed_py_content = f'''"""
Skrip Seeder Database CivicTrack menggunakan SQLAlchemy.
Dihasilkan secara otomatis oleh scripts/generate_seed.py.
Mencakup data resmi Kabupaten Lamongan (27 Kecamatan, batas BPS/BIG)
dan 27 proyek infrastruktur dengan validasi Point-in-Polygon ketat.

Dapat dijalankan langsung dengan:
    python -m app.seed
"""

import sys
import json
from decimal import Decimal
from datetime import date, datetime
from shapely.geometry import shape, Point

from app.core.database import SessionLocal, Base, engine
from app.core.security import get_password_hash
from app.models.user import WilayahAdministratif, WilayahLevel, Dinas, User, UserRole
from app.models.project import Proyek, ProyekKategori, ProyekStatus, TahapanProgres, DokumentasiProyek, MediaType
from app.models.report import LaporanMasyarakat, LaporanStatus, RatingKepuasan
from app.models.notification import SubscriptionNotifikasi, Notifikasi
from app.models.ai_route import RekomendasiRute, PrioritasRute
from app.models.evaluation import EvaluasiPembangunan, DokumentasiEvaluasi, EvaluasiStatusLog, EvaluasiStatus

# Data Wilayah Administratif
RAW_WILAYAH = json.loads({repr(json.dumps([{k: v for k, v in w.items() if k != "shape"} for w in all_wilayah], ensure_ascii=False))})

# Data Dinas
RAW_DINAS = json.loads({repr(json.dumps(dinas_list, ensure_ascii=False))})

# Data Users
RAW_USERS = json.loads({repr(json.dumps(users_list, ensure_ascii=False))})

# Data Proyek
RAW_PROYEK = json.loads({repr(json.dumps(proyek_list, ensure_ascii=False))})

# Data Tahapan
RAW_TAHAPAN = json.loads({repr(json.dumps(tahapan_list, ensure_ascii=False))})

# Data Dokumentasi
RAW_DOKUMENTASI = json.loads({repr(json.dumps(dokumentasi_list, ensure_ascii=False))})

# Data Rute AI
RAW_RUTE = json.loads({repr(json.dumps(rute_list, ensure_ascii=False))})

# Data Subscription & Notifikasi
RAW_SUBS = json.loads({repr(json.dumps(subscription_list, ensure_ascii=False))})
RAW_NOTIF = json.loads({repr(json.dumps(notifikasi_list, ensure_ascii=False))})

# Data Laporan, Rating, Evaluasi
RAW_LAPORAN = json.loads({repr(json.dumps(laporan_list, ensure_ascii=False))})
RAW_RATING = json.loads({repr(json.dumps(rating_list, ensure_ascii=False))})
RAW_EVALUASI = json.loads({repr(json.dumps(evaluasi_list, ensure_ascii=False))})

def run_seed():
    print("Memulai proses seeding database CivicTrack (Kabupaten Lamongan)...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Cek jika data sudah ada
        if db.query(User).first():
            print("Database telah berisi data. Seeding dibatalkan.")
            return

        print("1. Menambahkan data Wilayah Administratif (Kabupaten Lamongan + 27 Kecamatan + 474 Desa)...")
        wilayah_map = {{}}
        for w in RAW_WILAYAH:
            if w["level"] == "kabupaten":
                level_enum = WilayahLevel.kabupaten
            elif w["level"] == "kecamatan":
                level_enum = WilayahLevel.kecamatan
            else:
                level_enum = WilayahLevel.desa
            obj = WilayahAdministratif(
                id=w["id"],
                kode_wilayah=w["kode_wilayah"],
                nama_wilayah=w["nama_wilayah"],
                level=level_enum,
                parent_id=w["parent_id"],
                geom_boundary=w["geom_boundary"]
            )
            db.add(obj)
            if w.get("geom_boundary"):
                wilayah_map[w["id"]] = (obj, shape(json.loads(w["geom_boundary"])))

        db.commit()

        print("2. Menambahkan data Dinas...")
        for d in RAW_DINAS:
            db.add(Dinas(
                id=d["id"],
                nama_dinas=d["nama_dinas"],
                wilayah_id=d["wilayah_id"]
            ))
        db.commit()

        print("3. Menambahkan pengguna demo (@civictrack.demo)...")
        for u in RAW_USERS:
            db.add(User(
                id=u["id"],
                nama=u["nama"],
                email=u["email"],
                password_hash=u["password_hash"],
                role=UserRole(u["role"]),
                dinas_id=u["dinas_id"],
                is_active=u["is_active"]
            ))
        db.commit()

        print("4. Menambahkan 27 Proyek Infrastruktur (Dengan Validasi Ketat Point-in-Polygon)...")
        for p in RAW_PROYEK:
            # Validasi Point-in-Polygon ketat: Gagal keras bila di luar poligon
            target_wilayah = wilayah_map.get(p["wilayah_id"])
            if not target_wilayah:
                raise ValueError(f"Wilayah ID {{p['wilayah_id']}} tidak ditemukan untuk proyek '{{p['nama_proyek']}}'!")
            
            w_obj, w_shape = target_wilayah
            pt = Point(p["longitude"], p["latitude"])
            if not w_shape.contains(pt):
                dist = w_shape.distance(pt)
                raise ValueError(
                    f"VALIDASI GAGAL KERAS: Koordinat ({{p['latitude']}}, {{p['longitude']}}) proyek '{{p['nama_proyek']}}' "
                    f"berada di luar poligon {{w_obj.nama_wilayah}} (jarak: {{dist:.6f}} derajat)!"
                )

            # Parse tanggal
            t_mulai = datetime.strptime(p["tanggal_mulai"], "%Y-%m-%d").date()
            t_selesai = datetime.strptime(p["estimasi_selesai"], "%Y-%m-%d").date()

            db.add(Proyek(
                id=p["id"],
                nama_proyek=p["nama_proyek"],
                kategori=ProyekKategori(p["kategori"]),
                deskripsi=p["deskripsi"],
                latitude=Decimal(str(p["latitude"])),
                longitude=Decimal(str(p["longitude"])),
                wilayah_id=p["wilayah_id"],
                desa_id=p.get("desa_id"),
                dinas_id=p["dinas_id"],
                anggaran=Decimal(str(p["anggaran"])),
                status=ProyekStatus(p["status"]),
                progres_persen=p["progres_persen"],
                tanggal_mulai=t_mulai,
                estimasi_selesai=t_selesai,
                dibuat_oleh=p["dibuat_oleh"]
            ))
        db.commit()

        print("5. Menambahkan tahapan pengerjaan & dokumentasi...")
        for t in RAW_TAHAPAN:
            db.add(TahapanProgres(
                id=t["id"],
                proyek_id=t["proyek_id"],
                nama_tahap=t["nama_tahap"],
                progres_persen=t["progres_persen"],
                catatan=t["catatan"],
                dicatat_oleh=t["dicatat_oleh"]
            ))
        for dk in RAW_DOKUMENTASI:
            db.add(DokumentasiProyek(
                id=dk["id"],
                proyek_id=dk["proyek_id"],
                tahapan_id=dk["tahapan_id"],
                tipe_media=MediaType(dk["tipe_media"]),
                url_file=dk["url_file"],
                ukuran_file=dk["ukuran_file"],
                diunggah_oleh=dk["diunggah_oleh"]
            ))
        db.commit()

        print("6. Menambahkan rekomendasi rute AI jalan Lamongan...")
        for r in RAW_RUTE:
            db.add(RekomendasiRute(
                id=r["id"],
                proyek_id=r["proyek_id"],
                nama_rute=r["nama_rute"],
                prioritas=PrioritasRute(r["prioritas"]),
                estimasi_jarak_km=Decimal(str(r["estimasi_jarak_km"])),
                estimasi_waktu_menit=r["estimasi_waktu_menit"],
                alasan_rekomendasi=r["alasan_rekomendasi"],
                is_valid=r["is_valid"]
            ))
        db.commit()

        print("7. Menambahkan notifikasi, laporan masyarakat, rating, dan evaluasi...")
        for s in RAW_SUBS:
            db.add(SubscriptionNotifikasi(id=s["id"], user_id=s["user_id"], proyek_id=s["proyek_id"]))
        for n in RAW_NOTIF:
            db.add(Notifikasi(id=n["id"], user_id=n["user_id"], proyek_id=n["proyek_id"], pesan=n["pesan"], is_read=n["is_read"]))
        for l in RAW_LAPORAN:
            db.add(LaporanMasyarakat(
                id=l["id"],
                proyek_id=l["proyek_id"],
                user_id=l["user_id"],
                isi_laporan=l["isi_laporan"],
                status_tindak_lanjut=LaporanStatus(l["status_tindak_lanjut"]),
                tanggapan_dinas=l["tanggapan_dinas"],
                ditanggapi_oleh=l["ditanggapi_oleh"]
            ))
        for rt in RAW_RATING:
            db.add(RatingKepuasan(
                id=rt["id"],
                proyek_id=rt["proyek_id"],
                user_id=rt["user_id"],
                skor=rt["skor"],
                komentar=rt["komentar"]
            ))
        for ev in RAW_EVALUASI:
            db.add(EvaluasiPembangunan(
                id=ev["id"],
                proyek_id=ev["proyek_id"],
                user_id=ev["user_id"],
                kategori_masalah=ev["kategori_masalah"],
                deskripsi=ev["deskripsi"],
                skor_urgensi_ai=ev["skor_urgensi_ai"],
                ringkasan_analisis_ai=ev["ringkasan_analisis_ai"],
                status=EvaluasiStatus(ev["status"])
            ))
        db.commit()

        db.add(EvaluasiStatusLog(
            id=1,
            evaluasi_id=1,
            status_sebelumnya=None,
            status_baru="menunggu_verifikasi",
            diubah_oleh=3,
            catatan="Laporan evaluasi awal diajukan oleh warga."
        ))
        db.commit()

        print("Seeding database CivicTrack Lamongan berhasil diselesaikan 100%!")
    except Exception as e:
        db.rollback()
        print(f"Terjadi kesalahan saat seeding: {{e}}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_seed()
'''

    with open(out_py_path, "w", encoding="utf-8") as f:
        f.write(seed_py_content)
    print(f"Berhasil membuat: {out_py_path} ({os.path.getsize(out_py_path) / 1024:.1f} KB)")

if __name__ == "__main__":
    main()

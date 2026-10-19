import json
import logging
import re
from typing import Dict, Any, List, Optional
from decimal import Decimal
import httpx
from app.core.config import settings
from app.services.osm_service import (
    get_nearby_osm_streets,
    get_nearby_osm_data,
    chain_road_geometries
)

logger = logging.getLogger(__name__)

def _clean_json_markdown(text: str) -> str:
    """Membersihkan markdown codeblock ```json ... ``` jika LLM mengembalikannya."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    brace_match = re.search(r"(\{[\s\S]*\})", text)
    if brace_match:
        return brace_match.group(1).strip()
    return text

def _call_groq_chat(prompt: str, system_message: str = "Anda adalah asisten AI tata kota. Hasilkan output dalam format json valid.") -> str:
    """
    Memanggil Groq Cloud REST API (OpenAI-compatible) untuk model yang dikonfigurasi.
    """
    if not settings.GROQ_API_KEY or not settings.GROQ_API_KEY.strip():
        raise ValueError("GROQ_API_KEY belum dikonfigurasi.")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY.strip()}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": settings.GROQ_MODEL or "openai/gpt-oss-20b",
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "response_format": {"type": "json_object"}
    }

    with httpx.Client(timeout=15.0) as client:
        resp = client.post(url, json=payload, headers=headers)
        if resp.status_code != 200:
            raise RuntimeError(f"Groq API error HTTP {resp.status_code}: {resp.text}")
        data = resp.json()
        return data["choices"][0]["message"]["content"]

def _attach_osm_geometries(
    item: dict,
    nearby_streets: List[str],
    road_geometries: Dict[str, Any],
    is_osm_grounded: bool
) -> None:
    """Menghubungkan geometri koordinat jalan nyata OSM ke item rekomendasi rute AI."""
    item["osm_streets_context"] = nearby_streets if is_osm_grounded else []
    if not is_osm_grounded or not road_geometries:
        item["koordinat_rute"] = []
        item["geografis_terverifikasi"] = False
        return

    nama_rute = str(item.get("nama_rute", "")).lower()
    matched_streets = []
    for st in nearby_streets:
        st_clean = st.lower().strip()
        stripped_st = re.sub(r"^(jalan|jl\.|jl|gang|gg\.)\s+", "", st_clean).strip()
        if (len(st_clean) >= 4 and st_clean in nama_rute) or (len(stripped_st) >= 4 and stripped_st in nama_rute):
            matched_streets.append(st)

    if matched_streets:
        coords = chain_road_geometries(matched_streets, road_geometries)
        item["koordinat_rute"] = coords
        item["geografis_terverifikasi"] = bool(coords and len(coords) >= 2)
    else:
        item["koordinat_rute"] = []
        item["geografis_terverifikasi"] = False

def generate_ai_alternative_routes(
    nama_proyek: str,
    kategori: str,
    nama_wilayah: str,
    latitude: float,
    longitude: float,
    catatan_penutupan: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Fitur 11 PRD: Menghasilkan rekomendasi rute alternatif penutupan akses jalan
    menggunakan Groq API dengan grounding data jalan asli OpenStreetMap (OSM) dan caching.
    Menyajikan rute terstruktur dalam 3 tingkat prioritas:
    1. Utama (Jalur utama dengan kapasitas kendaraan besar/umum)
    2. Kedua (Jalur alternatif sekunder / lingkar luar)
    3. Tambahan (Jalur tikus/lingkungan khusus kendaraan roda dua)
    """
    # Ambil data nama-nama jalan asli terverifikasi DAN geometri di sekitar lokasi via Overpass API / Cache
    nearby_streets, road_geometries = get_nearby_osm_data(latitude, longitude)
    is_osm_grounded = bool(nearby_streets and len(nearby_streets) >= 2)

    osm_context_prompt = ""
    if is_osm_grounded:
        streets_bullet = "\n".join(f"- {s}" for s in nearby_streets[:35])
        osm_context_prompt = f"""
DAFTAR NAMA JALAN ASLI DI SEKITAR PROYEK (Terverifikasi OpenStreetMap):
{streets_bullet}

INSTRUKSI PENTING GROUNDING GEOGRAFIS:
1. Anda WAJIB MEMILIH dan MENYUSUN rute alternatif HANYA dari daftar nama jalan asli di atas!
2. DILARANG KERAS mengarang nama jalan baru yang tidak tercantum dalam daftar di atas!
3. Format nama_rute harus menyebutkan kombinasi jalan asli dari daftar (misal: "Jalan X ➔ Jalan Y").
"""
    else:
        osm_context_prompt = """
CATATAN GEOGRAFIS: Data OpenStreetMap tidak tersedia untuk radius ini. Susun rute dengan estimasi rekayasa lalu lintas umum.
"""

    prompt = f"""
Anda adalah sistem navigasi cerdas tata kota untuk proyek infrastruktur publik.
Terdapat proyek pembangunan:
- Nama Proyek: {nama_proyek}
- Kategori: {kategori}
- Wilayah: {nama_wilayah} (Koordinat: {latitude}, {longitude})
- Info Penutupan/Rekayasa: {catatan_penutupan or 'Penutupan jalan utama sebagian/penuh selama konstruksi'}

{osm_context_prompt}

Buatlah TEPAT 3 rekomendasi rute alternatif untuk mengalihkan lalu lintas masyarakat, terbagi dalam 3 skala prioritas:
1. 'utama': Rute utama berkapasitas besar untuk semua jenis kendaraan
2. 'kedua': Rute lingkar atau jalur sekunder pengurai kepadatan
3. 'tambahan': Rute pintas lingkungan khusus pengendara sepeda motor / jalan alternatif darurat

Format JSON wajib persis seperti ini:
{{
  "rute": [
    {{
      "nama_rute": "Nama jalan asli atau urutan simpang jalan",
      "prioritas": "utama",
      "estimasi_jarak_km": 3.5,
      "estimasi_waktu_menit": 10,
      "alasan_rekomendasi": "Penjelasan ringkas mengapa rute ini diprioritaskan"
    }},
    {{
      "nama_rute": "Nama jalan lingkar",
      "prioritas": "kedua",
      "estimasi_jarak_km": 4.8,
      "estimasi_waktu_menit": 15,
      "alasan_rekomendasi": "Jalur alternatif sekunder"
    }},
    {{
      "nama_rute": "Nama gang atau jalur lingkungan",
      "prioritas": "tambahan",
      "estimasi_jarak_km": 2.6,
      "estimasi_waktu_menit": 7,
      "alasan_rekomendasi": "Jalur pintas roda dua"
    }}
  ]
}}
"""

    # 1. Coba Groq API terlebih dahulu
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip():
        try:
            content = _call_groq_chat(prompt, system_message="Anda adalah sistem navigasi cerdas tata kota berbasis data geospasial nyata. Hasilkan format JSON valid.")
            clean_text = _clean_json_markdown(content)
            parsed = json.loads(clean_text)

            routes_list = []
            if isinstance(parsed, list):
                routes_list = parsed
            elif isinstance(parsed, dict):
                for k in ["rute", "routes", "rekomendasi", "data"]:
                    if isinstance(parsed.get(k), list):
                        routes_list = parsed[k]
                        break
                if not routes_list:
                    for val in parsed.values():
                        if isinstance(val, list):
                            routes_list = val
                            break

            if isinstance(routes_list, list) and len(routes_list) >= 3:
                result = []
                for item in routes_list[:3]:
                    if isinstance(item, dict):
                        item["source"] = "groq"
                        _attach_osm_geometries(item, nearby_streets, road_geometries, is_osm_grounded)
                        result.append(item)
                if len(result) == 3:
                    return result
        except Exception as e:
            logger.warning(f"Gagal memanggil Groq API untuk rute: {e}. Mengalihkan ke cadangan heuristik...")

    # 2. Heuristic fallback adaptif jika API key kosong, kuota habis, atau Groq gagal
    origin_name = None
    dest_name = None
    if catatan_penutupan:
        m1 = re.search(
            r"(?:rute\s+)?dari\s+(.+?)\s+(?:menuju|ke)\s+(.+?)(?:\s+(?:melintasi|melewati|lewat|sekitar)\b|$)",
            catatan_penutupan,
            re.IGNORECASE
        )
        if m1:
            origin_name = m1.group(1).strip()
            dest_name = m1.group(2).strip()
        else:
            m2 = re.search(
                r"^(.+?)\s*(?:->|ke|menuju)\s*(.+?)(?:\s+(?:melintasi|melewati|lewat)\b|$)",
                catatan_penutupan,
                re.IGNORECASE
            )
            if m2:
                origin_name = m2.group(1).strip()
                dest_name = m2.group(2).strip()

    if origin_name and dest_name:
        orig_disp = origin_name.title() if origin_name.islower() else origin_name
        dest_disp = dest_name.title() if dest_name.islower() else dest_name
        return [
            {
                "nama_rute": f"Jalur Arteri {orig_disp} ➔ Bypass ➔ {dest_disp}",
                "prioritas": "utama",
                "estimasi_jarak_km": 3.8,
                "estimasi_waktu_menit": 11,
                "alasan_rekomendasi": f"Jalur arteri beraspal lebar menghindari penutupan proyek {nama_proyek}, menghubungkan {orig_disp} menuju {dest_disp} untuk semua jenis kendaraan.",
                "source": "heuristic_fallback",
                "geografis_terverifikasi": False,
                "koordinat_rute": [],
                "osm_streets_context": []
            },
            {
                "nama_rute": f"Jalan Lingkar ({orig_disp} ➔ Lingkar Luar ➔ {dest_disp})",
                "prioritas": "kedua",
                "estimasi_jarak_km": 5.2,
                "estimasi_waktu_menit": 15,
                "alasan_rekomendasi": f"Jalur lingkar sekunder pengurai kepadatan jam sibuk rute {orig_disp} - {dest_disp} via lingkar luar {nama_wilayah}.",
                "source": "heuristic_fallback",
                "geografis_terverifikasi": False,
                "koordinat_rute": [],
                "osm_streets_context": []
            },
            {
                "nama_rute": f"Jalur Pemukiman ({orig_disp} ➔ Gang Warga ➔ {dest_disp})",
                "prioritas": "tambahan",
                "estimasi_jarak_km": 2.5,
                "estimasi_waktu_menit": 7,
                "alasan_rekomendasi": f"Rute pintas pemukiman berkecepatan rendah dari {orig_disp} menuju {dest_disp} khusus bagi pengendara sepeda motor.",
                "source": "heuristic_fallback",
                "geografis_terverifikasi": False,
                "koordinat_rute": [],
                "osm_streets_context": []
            }
        ]

    return [
        {
            "nama_rute": f"Jalur Arteri Utama Penghubung {nama_wilayah}",
            "prioritas": "utama",
            "estimasi_jarak_km": 3.2,
            "estimasi_waktu_menit": 9,
            "alasan_rekomendasi": "Jalur lebar beraspal baik dengan penerangan memadai, direkomendasikan untuk kendaraan roda empat dan angkutan umum.",
            "source": "heuristic_fallback",
            "geografis_terverifikasi": False,
            "koordinat_rute": [],
            "osm_streets_context": []
        },
        {
            "nama_rute": f"Jalan Lingkar Sekunder Sekitar {nama_wilayah}",
            "prioritas": "kedua",
            "estimasi_jarak_km": 4.6,
            "estimasi_waktu_menit": 13,
            "alasan_rekomendasi": "Menghindari persimpangan padat dan memecah volume kendaraan saat jam sibuk kerja dan sekolah.",
            "source": "heuristic_fallback",
            "geografis_terverifikasi": False,
            "koordinat_rute": [],
            "osm_streets_context": []
        },
        {
            "nama_rute": f"Jalur Pemukiman Warga (Akses Khusus Roda Dua)",
            "prioritas": "tambahan",
            "estimasi_jarak_km": 2.4,
            "estimasi_waktu_menit": 6,
            "alasan_rekomendasi": "Rute pintas melalui gang perumahan berkecepatan rendah khusus bagi pengendara sepeda motor dan sepeda.",
            "source": "heuristic_fallback",
            "geografis_terverifikasi": False,
            "koordinat_rute": [],
            "osm_streets_context": []
        }
    ]

def analyze_evaluation_with_ai(
    kategori_masalah: str,
    deskripsi: str,
    nama_proyek: str,
    kategori_proyek: str
) -> Dict[str, Any]:
    """
    Fitur 12 PRD: Evaluasi Pembangunan Pasca-Proyek.
    Menganalisis laporan kerusakan fisik proyek berstatus 'Selesai' menggunakan Groq API
    sebagai prioritas utama, dengan fallback ke heuristik deterministik.
    Menghasilkan skor urgensi (1-5) dan ringkasan indikasi teknis masalah.
    """
    prompt = f"""
Anda adalah insinyur sipil senior dan auditor mutu infrastruktur publik daerah (Dinas PU Bina Marga & Cipta Karya).
Lakukan asesmen teknis mendalam dan tentukan skor urgensi aduan kerusakan fisik pasca-proyek (FHO/masa pemeliharaan) dari masyarakat berikut:
- Nama Proyek Selesai: {nama_proyek} ({kategori_proyek})
- Kategori Cacat Fisik: {kategori_masalah}
- Deskripsi Temuan Lapangan: {deskripsi}

Panduan Penentuan Skor Urgensi (1 - 5):
- Skor 5 (Kritis/Darurat): Risiko runtuh, jalan/jembatan ambles, retak struktur parah, patah konstruksi beton, longsor, membahayakan keselamatan jiwa secara langsung. Perlu tindakan darurat 1x24 jam.
- Skor 4 (Tinggi/Struktural): Retak lebar pada beton, jalan berlubang dalam, aspal amblas/mengelupas parah, struktur pondasi miring/tergerus erosi. Kontraktor harus dipanggil untuk perbaikan garansi segera.
- Skor 3 (Sedang/Fungsional): Saluran drainase tersumbat sedimen, genangan air berulang saat hujan deras, paving lepas, rambu/penerangan jalan padam.
- Skor 2 (Ringan/Kosmetik): Retak rambut minor, cat terkelupas, sisa agregat bahu jalan belum rapi.
- Skor 1 (Sangat Ringan): Saran estetika atau penataan minor tanpa dampak fisik fungsi.

PENTING:
Jika deskripsi warga sangat singkat atau bernada santai (contoh: "ya begitulah", "rusak ini", "ambles jalannya"), Anda WAJIB memprioritaskan kategori cacat ({kategori_masalah}) dan potensi bahaya nyata pada proyek ({nama_proyek}). Jika kategori adalah retak/ambles atau aspal berlubang, jangan beri skor rendah; berikan skor proporsional (skor 4 atau 5).

Format respons dalam bentuk json object valid tanpa teks lain di luar json:
{{
  "skor_urgensi_ai": 4,
  "ringkasan_analisis_ai": "Analisis teknis komprehensif (2-3 kalimat) mencakup potensi risiko struktur/keselamatan dan instruksi tindakan konkret untuk dinas pengawas/kontraktor."
}}
"""

    # 1. Coba Groq API
    if settings.GROQ_API_KEY and settings.GROQ_API_KEY.strip():
        try:
            content = _call_groq_chat(prompt, system_message="Anda adalah insinyur sipil pengawas mutu infrastruktur. Hasilkan format json valid.")
            clean_text = _clean_json_markdown(content)
            parsed = json.loads(clean_text)

            if isinstance(parsed, dict) and "skor_urgensi_ai" in parsed:
                raw_score = parsed.get("skor_urgensi_ai")
                score = max(1, min(5, int(raw_score)))
                summary = str(parsed.get("ringkasan_analisis_ai", "")).strip()

                invalid_placeholders = ["", "null", "none", "undefined", "n/a", "-", "..."]
                if summary and len(summary) >= 5 and summary.lower() not in invalid_placeholders:
                    parsed["source"] = "groq"
                    return {
                        "skor_urgensi_ai": score,
                        "ringkasan_analisis_ai": summary,
                        "raw_response_ai": parsed
                    }
        except Exception as e:
            logger.warning(f"Gagal memanggil Groq API untuk evaluasi: {e}. Mengalihkan ke cadangan heuristik...")

    # 2. Rule-based fallback deterministik jika AI belum dikonfigurasi atau respons tidak valid
    desc_lower = (deskripsi + " " + kategori_masalah).lower()
    
    # 1. Kritis (Skor 5)
    urgent_critical = [
        "ambles", "amblas", "runtuh", "ambrol", "ambruk", "jebol", "patah", "roboh", 
        "longsor", "lubang dalam", "bahaya", "korban", "kritis", "hancur", "putus", "fatal"
    ]
    # 2. Tinggi (Skor 4)
    urgent_high = [
        "retak", "beton", "struktur", "lubang", "pondasi", "miring", "pecah", 
        "mengelupas", "aspal", "terkelupas", "berlubang", "anjlok", "retak ambles"
    ]
    # 3. Sedang (Skor 3)
    urgent_medium = [
        "genangan", "tersumbat", "saluran", "drainase", "endapan", "sedimen", 
        "paving", "gelombang", "lampu", "rambu", "bahu jalan", "kisi-kisi", "inlet"
    ]

    if any(k in desc_lower for k in urgent_critical):
        skor = 5
        summary = f"Indikasi kerusakan struktural kritis pada {nama_proyek}. Potensi bahaya keselamatan tinggi bagi pengguna. Rekomendasi: Inspeksi darurat tim teknis Dinas PU dalam 1x24 jam dan pemasangan rambu peringatan darurat."
    elif any(k in desc_lower for k in urgent_high):
        skor = 4
        summary = f"Terdeteksi degradasi struktural signifikan pada {kategori_masalah}. Berisiko memperparah kerusakan akibat beban lalu lintas harian. Rekomendasi: Pemanggilan rekanan kontraktor pelaksana untuk perbaikan garansi masa pemeliharaan (FHO)."
    elif any(k in desc_lower for k in urgent_medium):
        skor = 3
        summary = f"Indikasi penurunan fungsi fungsional pasca-proyek ({kategori_masalah}). Rekomendasi: Penjadwalan pembersihan saluran atau perbaikan minor dalam agenda pemeliharaan rutin dinas teknis."
    else:
        skor = 3 if ("cacat" in desc_lower or "rusak" in desc_lower) else 2
        summary = f"Laporan temuan fisik pada {nama_proyek}. Rekomendasi: Verifikasi visual lapangan oleh petugas pengawas dinas teknis untuk evaluasi tindak lanjut."

    fallback_payload = {
        "skor_urgensi_ai": skor,
        "ringkasan_analisis_ai": summary,
        "source": "heuristic_fallback"
    }

    return {
        "skor_urgensi_ai": skor,
        "ringkasan_analisis_ai": summary,
        "raw_response_ai": fallback_payload
    }

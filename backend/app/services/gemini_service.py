import json
import logging
import re
from typing import Dict, Any, List, Optional
from decimal import Decimal
from app.core.config import settings

logger = logging.getLogger(__name__)

def _clean_json_markdown(text: str) -> str:
    """Membersihkan markdown codeblock ```json ... ``` jika Gemini mengembalikannya."""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        return match.group(1).strip()
    return text

def generate_ai_alternative_routes(
    nama_proyek: str,
    kategori: str,
    nama_wilayah: str,
    latitude: float,
    longitude: float,
    catatan_penutupan: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Fitur 11 PRD: Menggunakan Google Gemini API untuk menganalisis dampak penutupan akses jalan
    akibat proyek pembangunan dan menyajikan rute alternatif terstruktur dalam 3 tingkat prioritas:
    1. Utama (Jalur utama dengan kapasitas kendaraan besar/umum)
    2. Kedua (Jalur alternatif sekunder / lingkar luar)
    3. Tambahan (Jalur tikus/lingkungan khusus kendaraan roda dua)
    """
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)
            
            prompt = f"""
Anda adalah sistem navigasi cerdas tata kota untuk proyek infrastruktur publik.
Terdapat proyek pembangunan:
- Nama Proyek: {nama_proyek}
- Kategori: {kategori}
- Wilayah: {nama_wilayah} (Koordinat: {latitude}, {longitude})
- Info Penutupan/Rekayasa: {catatan_penutupan or 'Penutupan jalan utama sebagian/penuh selama konstruksi'}

Buatlah TEPAT 3 rekomendasi rute alternatif untuk mengalihkan lalu lintas masyarakat, terbagi dalam 3 skala prioritas:
1. 'utama': Rute utama berkapasitas besar untuk semua jenis kendaraan
2. 'kedua': Rute lingkar atau jalur sekunder pengurai kepadatan
3. 'tambahan': Rute pintas lingkungan khusus pengendara sepeda motor / jalan alternatif darurat

Keluarkan output HANYA berupa JSON valid dengan format persis seperti ini:
[
  {{
    "nama_rute": "Nama jalan atau urutan simpang jalan",
    "prioritas": "utama",
    "estimasi_jarak_km": 3.5,
    "estimasi_waktu_menit": 10,
    "alasan_rekomendasi": "Penjelasan ringkas mengapa rute ini diprioritaskan"
  }},
  {{
    "nama_rute": "...",
    "prioritas": "kedua",
    "estimasi_jarak_km": 4.8,
    "estimasi_waktu_menit": 15,
    "alasan_rekomendasi": "..."
  }},
  {{
    "nama_rute": "...",
    "prioritas": "tambahan",
    "estimasi_jarak_km": 2.6,
    "estimasi_waktu_menit": 7,
    "alasan_rekomendasi": "..."
  }}
]
"""
            response = model.generate_content(prompt)
            clean_text = _clean_json_markdown(response.text)
            parsed = json.loads(clean_text)
            if isinstance(parsed, list) and len(parsed) >= 3:
                return parsed[:3]
        except Exception as e:
            logger.warning(f"Gagal memanggil Gemini API untuk rute: {e}. Menggunakan fallback cerdas.")

    # Heuristic fallback jika API key kosong atau kuota habis
    return [
        {
            "nama_rute": f"Jalur Arteri Utama Penghubung {nama_wilayah}",
            "prioritas": "utama",
            "estimasi_jarak_km": 3.2,
            "estimasi_waktu_menit": 9,
            "alasan_rekomendasi": "Jalur lebar beraspal baik dengan penerangan memadai, direkomendasikan untuk kendaraan roda empat dan angkutan umum."
        },
        {
            "nama_rute": f"Jalan Lingkar Sekunder Sekitar {nama_wilayah}",
            "prioritas": "kedua",
            "estimasi_jarak_km": 4.6,
            "estimasi_waktu_menit": 13,
            "alasan_rekomendasi": "Menghindari persimpangan padat dan memecah volume kendaraan saat jam sibuk kerja dan sekolah."
        },
        {
            "nama_rute": f"Jalur Pemukiman Warga (Akses Khusus Roda Dua)",
            "prioritas": "tambahan",
            "estimasi_jarak_km": 2.4,
            "estimasi_waktu_menit": 6,
            "alasan_rekomendasi": "Rute pintas melalui gang perumahan berkecepatan rendah khusus bagi pengendara sepeda motor dan sepeda."
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
    Menggunakan Gemini API untuk menganalisis laporan kerusakan fisik proyek berstatus 'Selesai',
    menghasilkan skor urgensi (1-5) dan ringkasan indikasi teknis masalah.
    """
    if settings.GEMINI_API_KEY:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.GEMINI_API_KEY)
            model = genai.GenerativeModel(settings.GEMINI_MODEL)

            prompt = f"""
Anda adalah insinyur sipil dan pengawas mutu infrastruktur publik pemerintah.
Lakukan asesmen teknis awal terhadap aduan kerusakan/cacat pasca-proyek dari masyarakat:
- Nama Proyek Selesai: {nama_proyek} ({kategori_proyek})
- Kategori Cacat: {kategori_masalah}
- Deskripsi Temuan Warga: {deskripsi}

Berikan skor urgensi risiko keselamatan dan kerusakan struktural dari 1 (Sangat Ringan/Kosmetik) hingga 5 (Sangat Kritis/Berbahaya/Risiko Korban Jiwa).
Serta berikan ringkasan analisis teknis rekomendasi penanganan singkat (1-3 kalimat).

Format JSON wajib:
{{
  "skor_urgensi_ai": 4,
  "ringkasan_analisis_ai": "Analisis teknis singkat dan rekomendasi aksi dinas terkait"
}}
"""
            response = model.generate_content(prompt)
            clean_text = _clean_json_markdown(response.text)
            parsed = json.loads(clean_text)
            score = int(parsed.get("skor_urgensi_ai", 3))
            score = max(1, min(5, score))
            return {
                "skor_urgensi_ai": score,
                "ringkasan_analisis_ai": str(parsed.get("ringkasan_analisis_ai", "Analisis awal selesai."))
            }
        except Exception as e:
            logger.warning(f"Gagal memanggil Gemini API untuk evaluasi: {e}. Menggunakan fallback analisis.")

    # Rule-based fallback jika Gemini belum dikonfigurasi
    desc_lower = deskripsi.lower() + " " + kategori_masalah.lower()
    urgent_keywords = ["ambles", "runtuh", "retak besar", "patah", "banjir parah", "bahaya", "korban", "longsor", "lubang dalam"]
    medium_keywords = ["genangan", "retak rambut", "paving lepas", "cat terkelupas", "tersumbat", "gelombang"]
    
    if any(k in desc_lower for k in urgent_keywords):
        skor = 5
        summary = "Indikasi kerusakan struktural kritis yang berpotensi membahayakan keselamatan pengguna. Perlu inspeksi darurat tim teknis dalam 1x24 jam."
    elif any(k in desc_lower for k in medium_keywords):
        skor = 3
        summary = "Indikasi penurunan mutu pekerjaan atau pemeliharaan awal pasca-serah terima. Direkomendasikan pemanggilan kontraktor pelaksana untuk perbaikan garansi."
    else:
        skor = 2
        summary = "Laporan cacat non-struktural minor. Dapat dijadwalkan dalam agenda pemeliharaan rutin dinas terkait."

    return {
        "skor_urgensi_ai": skor,
        "ringkasan_analisis_ai": summary
    }

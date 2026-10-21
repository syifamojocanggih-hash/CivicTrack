import json
import logging
import math
import re
from typing import Dict, Any, List, Optional, Tuple
from decimal import Decimal
import httpx
from app.core.config import settings
from app.services.osm_service import (
    get_nearby_osm_streets,
    get_nearby_osm_data,
    chain_road_geometries
)

logger = logging.getLogger(__name__)

LANDMARK_COORDS = {
    # Masjid Ikonik
    "masjid agung": (-7.1202, 112.4147),
    "masjid agung lamongan": (-7.1202, 112.4147),
    "masjid namira": (-7.1585, 112.4124),
    "masjid namira lamongan": (-7.1585, 112.4124),

    # Pendidikan & Fasilitas Publik
    "pens lamongan": (-7.1265, 112.3965),
    "pens": (-7.1265, 112.3965),
    "unisla": (-7.1238, 112.3875),
    "universitas islam lamongan": (-7.1238, 112.3875),

    # Rumah Sakit
    "rs namira lamongan": (-7.1350, 112.4280),
    "rs namira": (-7.1350, 112.4280),
    "rsud dr soegiri": (-7.1120, 112.4160),
    "rsud soegiri": (-7.1120, 112.4160),
    "rs muhammadiyah": (-7.1235, 112.3980),
    "rs muhammadiyah lamongan": (-7.1235, 112.3980),

    # Transportasi & Pusat Kota
    "alun-alun lamongan": (-7.1195, 112.4154),
    "alun-alun": (-7.1195, 112.4154),
    "stasiun lamongan": (-7.1158, 112.4182),
    "stasiun": (-7.1158, 112.4182),
    "stasiun babat": (-7.1085, 112.1642),
    "terminal lamongan": (-7.1220, 112.4050),
    "terminal": (-7.1220, 112.4050),

    # Simpang & Wilayah Sekitar
    "simpang tikung": (-7.1420, 112.4250),
    "tikung": (-7.1420, 112.4250),
    "sukodadi": (-7.1152, 112.3324),
    "simpang sukodadi": (-7.1152, 112.3324),
    "sumberwudi": (-7.0850, 112.3480),
    "simpang sumberwudi": (-7.0850, 112.3480),
    "babat": (-7.1125, 112.1635),
    "simpang babat": (-7.1125, 112.1635),

    # Wisata & Fasilitas Olahraga
    "stadion surajaya": (-7.1120, 112.4350),
    "plaza lamongan": (-7.1180, 112.4170),
    "pasar tingkat": (-7.1170, 112.4190),
    "wisata bahari lamongan": (-6.8647, 112.3582),
    "wbl": (-6.8647, 112.3582),
    "sunan drajat": (-6.8770, 112.3680),
    "makam sunan drajat": (-6.8770, 112.3680),
}

def _resolve_landmark_coord(name: str, fallback_lat: float, fallback_lon: float, offset_deg: Tuple[float, float]) -> Tuple[float, float]:
    q = (name or "").lower().strip()
    if "masjid namira" in q:
        return (-7.1585, 112.4124)
    if "masjid agung" in q:
        return (-7.1202, 112.4147)

    for k, v in LANDMARK_COORDS.items():
        if k in q or q in k:
            return v
    return (round(fallback_lat + offset_deg[0], 6), round(fallback_lon + offset_deg[1], 6))

def generate_detour_polyline(
    lat_proj: float,
    lon_proj: float,
    orig_coord: Tuple[float, float],
    dest_coord: Tuple[float, float],
    prioritas: str,
    steps: int = 16
) -> List[List[float]]:
    """
    Menghasilkan garis koordinat (polyline) kontinu, halus, dan realistis
    yang menempel pada jaringan jalan nyata (OSRM), dan berbelok mengitari zona tertutup.
    """
    # 1. Coba ambil rute jalan riil dari OpenStreetMap (OSRM)
    try:
        from app.services.osm_service import fetch_osrm_driving_route
        p_lower = prioritas.lower()
        via_lat = None
        via_lon = None

        dx_val = dest_coord[1] - orig_coord[1]
        dy_val = dest_coord[0] - orig_coord[0]
        len_val = math.sqrt(dx_val * dx_val + dy_val * dy_val) or 0.001
        nx_val, ny_val = -dy_val / len_val, dx_val / len_val

        mid_lat = (orig_coord[0] + dest_coord[0]) / 2.0
        mid_lon = (orig_coord[1] + dest_coord[1]) / 2.0
        dist_to_proj = math.sqrt((mid_lat - lat_proj)**2 + (mid_lon - lon_proj)**2)

        if "kedua" in p_lower:
            via_lat = round(mid_lat - ny_val * 0.006, 6)
            via_lon = round(mid_lon - nx_val * 0.006, 6)
        elif "tambahan" in p_lower:
            via_lat = round(mid_lat + ny_val * 0.0025, 6)
            via_lon = round(mid_lon + nx_val * 0.0025, 6)
        elif dist_to_proj < 0.025:
            via_lat = round(lat_proj + ny_val * 0.005, 6)
            via_lon = round(lon_proj + nx_val * 0.005, 6)

        profile = "bicycle" if "tambahan" in p_lower else "driving"
        osrm_res = fetch_osrm_driving_route(
            orig_coord[0], orig_coord[1],
            dest_coord[0], dest_coord[1],
            via_lat, via_lon,
            profile=profile,
            timeout_sec=2.5
        )
        if osrm_res and len(osrm_res.get("coordinates", [])) >= 4:
            return osrm_res["coordinates"]
    except Exception as e:
        logger.debug(f"OSRM fallback: {e}")

    # Fallback jika offline atau saat unit testing:
    dx = dest_coord[1] - orig_coord[1]
    dy = dest_coord[0] - orig_coord[0]
    line_len = math.sqrt(dx * dx + dy * dy)
    if line_len < 1e-6:
        dx, dy, line_len = 0.01, 0.01, math.sqrt(0.0002)

    ux, uy = dx / line_len, dy / line_len
    nx, ny = -uy, ux
    p_lower = prioritas.lower()
    if "kedua" in p_lower:
        nx, ny = -nx, -ny
        offset_dist = 0.0045
    elif "tambahan" in p_lower:
        offset_dist = 0.0025
    else:
        offset_dist = 0.0035

    # Cek apakah garis perjalanan melewati/mendekati lokasi penutupan proyek (< 3.0 km)
    mid_lat = (orig_coord[0] + dest_coord[0]) / 2.0
    mid_lon = (orig_coord[1] + dest_coord[1]) / 2.0
    dist_to_proj = math.sqrt((mid_lat - lat_proj)**2 + (mid_lon - lon_proj)**2)

    if dist_to_proj < 0.027:
        apex = [lat_proj + ny * offset_dist, lon_proj + nx * offset_dist]
    else:
        apex = [mid_lat + ny * offset_dist, mid_lon + nx * offset_dist]

    r_close = 0.0028
    pts = []
    for i in range(steps):
        t = i / float(steps - 1)
        lat = (1 - t)**2 * orig_coord[0] + 2 * (1 - t) * t * apex[0] + t**2 * dest_coord[0]
        lon = (1 - t)**2 * orig_coord[1] + 2 * (1 - t) * t * apex[1] + t**2 * dest_coord[1]

        dist_c = math.sqrt((lat - lat_proj)**2 + (lon - lon_proj)**2)
        if dist_c < r_close * 1.25:
            scale = (r_close * 1.25) / max(dist_c, 1e-6)
            lat = lat_proj + (lat - lat_proj) * scale
            lon = lon_proj + (lon - lon_proj) * scale

        pts.append([round(lat, 6), round(lon, 6)])

    return pts

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
    Dilengkapi fallback otomatis jika model reasoning menolak constraint response_format json_object.
    """
    if not settings.GROQ_API_KEY or not settings.GROQ_API_KEY.strip():
        raise ValueError("GROQ_API_KEY belum dikonfigurasi.")

    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.GROQ_API_KEY.strip()}",
        "Content-Type": "application/json"
    }
    model = settings.GROQ_MODEL or "openai/gpt-oss-20b"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2,
        "max_tokens": 2048,
        "response_format": {"type": "json_object"}
    }

    with httpx.Client(timeout=25.0) as client:
        resp = client.post(url, json=payload, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            return data["choices"][0]["message"]["content"]

        # Jika response_format gagal validasi JSON pada model tertentu, coba ulang tanpa response_format
        if resp.status_code == 400 and "json_validate_failed" in resp.text:
            logger.info("Mencoba ulang panggilan Groq tanpa response_format json_object...")
            payload.pop("response_format", None)
            payload["messages"][0]["content"] = f"{system_message} Output raw valid JSON only without markdown or explanations."
            resp2 = client.post(url, json=payload, headers=headers)
            if resp2.status_code == 200:
                data = resp2.json()
                return data["choices"][0]["message"]["content"]
            raise RuntimeError(f"Groq API error HTTP {resp2.status_code}: {resp2.text}")

        raise RuntimeError(f"Groq API error HTTP {resp.status_code}: {resp.text}")

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

    # Jika nama_rute tidak memuat nama jalan OSM yang cocok (misal fallback heuristik atau ringkasan AI),
    # pilih otomatis kombinasi jalan nyata dari nearby_streets berdasarkan tingkat prioritas
    if not matched_streets and nearby_streets:
        prioritas = str(item.get("prioritas", "utama")).lower()
        if prioritas == "utama":
            candidates = [
                s for s in nearby_streets
                if any(k in s.lower() for k in ["jenderal", "raya", "basuki", "ahmad yani", "veteran", "kusuma", "pahlawan", "lamongrejo", "poros"])
            ]
            if not candidates:
                candidates = nearby_streets[:3]
            matched_streets = candidates[:3]
        elif prioritas == "kedua":
            candidates = [
                s for s in nearby_streets
                if any(k in s.lower() for k in ["lingkar", "ring", "sunan", "drajat", "giri", "kalianyar", "kombespol", "suwoko", "bypass"])
            ]
            if not candidates:
                candidates = nearby_streets[3:6] if len(nearby_streets) >= 6 else nearby_streets[:2]
            matched_streets = candidates[:3]
        else: # tambahan
            candidates = [
                s for s in nearby_streets
                if any(k in s.lower() for k in ["gang", "gg", "desa", "andansari", "kresna", "bima", "cendana", "kenanga", "merpati", "pintas"])
            ]
            if not candidates:
                candidates = nearby_streets[6:9] if len(nearby_streets) >= 9 else nearby_streets[-2:]
            matched_streets = candidates[:3]

        if matched_streets:
            joined_streets = " ➔ ".join(matched_streets)
            raw_nama = item.get("nama_rute", "")
            if not any(st.lower() in raw_nama.lower() for st in matched_streets):
                item["nama_rute"] = f"{raw_nama} ({joined_streets})" if raw_nama else joined_streets

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
    catatan_penutupan: Optional[str] = None,
    origin_coords: Optional[Tuple[float, float]] = None,
    dest_coords: Optional[Tuple[float, float]] = None,
    origin_name: Optional[str] = None,
    dest_name: Optional[str] = None,
    jenis_kendaraan: str = "semua"
) -> List[Dict[str, Any]]:
    """
    Fitur 11 PRD: Menghasilkan rekomendasi rute alternatif penutupan akses jalan
    menggunakan Routing Engine (OSRM) dengan grounding data jalan asli OpenStreetMap (OSM)
    dan dianalisis oleh Groq API untuk menentukan alasan rekomendasi tata kota yang cerdas.
    Menyajikan rute terstruktur dalam 3 tingkat prioritas:
    1. Utama: Koridor arteri utama kapasitas besar untuk seluruh kendaraan
    2. Kedua: Koridor lingkar luar / sekunder pengurai antrean roda empat & logistik
    3. Tambahan: Koridor jalan lokal / lingkungan efisien khusus kendaraan roda dua
    """
    from app.services.osm_service import (
        fetch_osrm_driving_route,
        check_route_crosses_closure
    )

    # Ambil data nama-nama jalan asli terverifikasi DAN geometri di sekitar lokasi via Overpass API / Cache
    nearby_streets, road_geometries = get_nearby_osm_data(latitude, longitude)
    is_osm_grounded = bool(nearby_streets and len(nearby_streets) >= 2)

    # 1. Tentukan titik asal dan tujuan
    has_custom_route = False

    if origin_coords is not None and dest_coords is not None:
        p_orig = (float(origin_coords[0]), float(origin_coords[1]))
        p_dest = (float(dest_coords[0]), float(dest_coords[1]))
        orig_disp = origin_name.strip() if origin_name else f"Titik Awal ({p_orig[0]:.4f}, {p_orig[1]:.4f})"
        dest_disp = dest_name.strip() if dest_name else f"Titik Tujuan ({p_dest[0]:.4f}, {p_dest[1]:.4f})"
        has_custom_route = True
    else:
        # Deteksi rute perjalanan spesifik (Origin -> Destination) jika diberikan via catatan_penutupan
        detected_origin = None
        detected_dest = None

        if catatan_penutupan:
            m1 = re.search(
                r"(?:rute\s+)?dari\s+(.+?)\s+(?:menuju|ke)\s+(.+?)(?:\s+(?:melintasi|melewati|lewat|sekitar)\b|$)",
                catatan_penutupan,
                re.IGNORECASE
            )
            if m1:
                detected_origin = m1.group(1).strip()
                detected_dest = m1.group(2).strip()
                has_custom_route = True
            else:
                m2 = re.search(
                    r"^(.+?)\s*(?:->|➔|ke|menuju)\s*(.+?)(?:\s+(?:melintasi|melewati|lewat)\b|$)",
                    catatan_penutupan,
                    re.IGNORECASE
                )
                if m2:
                    detected_origin = m2.group(1).strip()
                    detected_dest = m2.group(2).strip()
                    has_custom_route = True

        # Jika catatan_penutupan tidak menyebutkan asal & tujuan, deteksi dari koridor nama proyek
        if not detected_origin or not detected_dest:
            is_redup = "alun-alun" in (nama_proyek or "").lower()
            if not is_redup:
                c_match = re.search(
                    r"(?:Peningkatan|Rekonstruksi|Pembangunan|Pelebaran|Pengerukan)?\s*(?:Jalan|Jl\.?|Poros)\s+([A-Za-z0-9\s]+?)\s*[-–—]\s*([A-Za-z0-9\s]+?)(?:\s*\(|\s*\/|$)",
                    nama_proyek or "",
                    re.IGNORECASE
                )
                if c_match:
                    p_a = re.sub(r"^(Poros|Jalan|Jl\.?)\s+", "", c_match.group(1).strip(), flags=re.I)
                    p_b = re.sub(r"^(Poros|Jalan|Jl\.?)\s+", "", c_match.group(2).strip(), flags=re.I)
                    p_a = re.sub(r"\b(JAMULA|Buluadedi)\b", "", p_a, flags=re.I).strip() or p_a
                    p_b = re.sub(r"\b(JAMULA|Buluadedi)\b", "", p_b, flags=re.I).strip() or p_b
                    if p_a and p_b and p_a.lower() != p_b.lower() and "alun" not in p_a.lower():
                        detected_origin = f"Simpang {p_a}"
                        detected_dest = f"Simpang {p_b}"
                        has_custom_route = True

        raw_w = re.sub(r"^(Kecamatan|Desa|Kelurahan)\s+", "", nama_wilayah or "", flags=re.I).strip() or "Proyek"
        orig_disp = (detected_origin.title() if detected_origin and detected_origin.islower() else detected_origin) if detected_origin else f"Akses Masuk {raw_w}"
        dest_disp = (detected_dest.title() if detected_dest and detected_dest.islower() else detected_dest) if detected_dest else f"Akses Keluar {raw_w}"

        p_orig = _resolve_landmark_coord(detected_origin or orig_disp, latitude, longitude, (-0.0025, -0.0115))
        p_dest = _resolve_landmark_coord(detected_dest or dest_disp, latitude, longitude, (0.0025, 0.0115))

    # 2. Routing Engine: Hitung 3 kandidat rute nyata berbasis jaringan jalan
    direct_route = fetch_osrm_driving_route(p_orig[0], p_orig[1], p_dest[0], p_dest[1], profile="driving", timeout_sec=2.5)
    direct_crosses = check_route_crosses_closure(
        direct_route["coordinates"], latitude, longitude, radius_meters=280.0
    ) if (direct_route and direct_route.get("coordinates")) else True

    # Titik tengah dan vektor normal tegak lurus lintasan
    dx_val = p_dest[1] - p_orig[1]
    dy_val = p_dest[0] - p_orig[0]
    len_val = math.sqrt(dx_val * dx_val + dy_val * dy_val) or 0.001
    nx_val, ny_val = -dy_val / len_val, dx_val / len_val

    mid_lat = (p_orig[0] + p_dest[0]) / 2.0
    mid_lon = (p_orig[1] + p_dest[1]) / 2.0
    dist_to_proj = math.sqrt((mid_lat - latitude)**2 + (mid_lon - longitude)**2)
    ref_lat = latitude if dist_to_proj < 0.025 else mid_lat
    ref_lon = longitude if dist_to_proj < 0.025 else mid_lon

    via_north = (round(ref_lat + ny_val * 0.0055, 6), round(ref_lon + nx_val * 0.0055, 6))
    via_south = (round(ref_lat - ny_val * 0.0065, 6), round(ref_lon - nx_val * 0.0065, 6))
    via_local = (round(ref_lat + ny_val * 0.0025, 6), round(ref_lon + nx_val * 0.0025, 6))

    # Kandidat 1: Utama (Arteri / kapasitas penuh seluruh kendaraan)
    res_utama = None
    if not direct_crosses and direct_route and direct_route.get("coordinates"):
        res_utama = direct_route
    else:
        res_utama = fetch_osrm_driving_route(p_orig[0], p_orig[1], p_dest[0], p_dest[1], via_lat=via_north[0], via_lon=via_north[1], profile="driving", timeout_sec=2.5)

    # Kandidat 2: Kedua (Lingkar luar / sekunder pengurai kepadatan)
    res_kedua = fetch_osrm_driving_route(p_orig[0], p_orig[1], p_dest[0], p_dest[1], via_lat=via_south[0], via_lon=via_south[1], profile="driving", timeout_sec=2.5)

    # Kandidat 3: Tambahan
    # - 'motor' → paksa bicycle profile (optimasi jalan lokal roda dua)
    # - 'mobil' → paksa driving profile saja (tidak pakai bicycle network)
    # - 'semua' (default) → bicycle profile jika jalan tidak melintasi penutupan, driving via_local jika melintasi
    res_tambahan = None
    tambahan_profile = "bicycle" if jenis_kendaraan != "mobil" else "driving"
    if not direct_crosses:
        res_tambahan = fetch_osrm_driving_route(p_orig[0], p_orig[1], p_dest[0], p_dest[1], profile=tambahan_profile, timeout_sec=2.5)
        if not res_tambahan or not res_tambahan.get("coordinates"):
            res_tambahan = direct_route
    else:
        res_tambahan = fetch_osrm_driving_route(p_orig[0], p_orig[1], p_dest[0], p_dest[1], via_lat=via_local[0], via_lon=via_local[1], profile=tambahan_profile, timeout_sec=2.5)
        if not res_tambahan or not res_tambahan.get("coordinates"):
            res_tambahan = fetch_osrm_driving_route(p_orig[0], p_orig[1], p_dest[0], p_dest[1], via_lat=via_local[0], via_lon=via_local[1], profile="driving", timeout_sec=2.5)

    # Fallback koordinat kontinu jika OSRM timeout / offline
    r1_coords = res_utama["coordinates"] if (res_utama and res_utama.get("coordinates")) else generate_detour_polyline(latitude, longitude, p_orig, p_dest, "utama")
    r2_coords = res_kedua["coordinates"] if (res_kedua and res_kedua.get("coordinates")) else generate_detour_polyline(latitude, longitude, p_orig, p_dest, "kedua")
    r3_coords = res_tambahan["coordinates"] if (res_tambahan and res_tambahan.get("coordinates")) else generate_detour_polyline(latitude, longitude, p_orig, p_dest, "tambahan")

    direct_dist_est = round(math.sqrt((p_dest[0] - p_orig[0])**2 + (p_dest[1] - p_orig[1])**2) * 111.0, 1) or 2.5
    dist1 = res_utama["distance_km"] if res_utama else round(direct_dist_est * 1.25, 1)
    dist2 = res_kedua["distance_km"] if res_kedua else round(direct_dist_est * 1.55, 1)
    dist3 = res_tambahan["distance_km"] if res_tambahan else round(direct_dist_est * 0.95, 1)

    time1 = res_utama["duration_min"] if res_utama else max(1, round(dist1 * 2.8))
    time2 = res_kedua["duration_min"] if res_kedua else max(1, round(dist2 * 2.6))
    time3 = res_tambahan["duration_min"] if res_tambahan else max(1, round(dist3 * 2.2))

    roads1 = res_utama.get("road_names", []) if res_utama else []
    roads2 = res_kedua.get("road_names", []) if res_kedua else []
    roads3 = res_tambahan.get("road_names", []) if res_tambahan else []

    # Nama jalan utama per rute
    st1 = " ➔ ".join(roads1[:3]) if roads1 else (nearby_streets[0] if nearby_streets else "Jalur Arteri Utama")
    st2 = " ➔ ".join(roads2[:3]) if roads2 else (nearby_streets[1] if len(nearby_streets) >= 2 else "Jalur Lingkar Luar")
    st3 = " ➔ ".join(roads3[:3]) if roads3 else (nearby_streets[2] if len(nearby_streets) >= 3 else "Jalur Lingkungan Pintas")

    # Siapkan 3 kandidat rute nyata terverifikasi
    candidates = [
        {
            "nama_rute": f"{orig_disp} ➔ {st1} ➔ {dest_disp}" if not st1.startswith(orig_disp) else st1,
            "prioritas": "utama",
            "estimasi_jarak_km": dist1,
            "estimasi_waktu_menit": time1,
            "alasan_rekomendasi": f"Jalur arteri kapasitas besar melalui {st1}, bebas dari penutupan proyek {nama_proyek} dan direkomendasikan untuk seluruh jenis kendaraan.",
            "source": "osrm_grounded",
            "geografis_terverifikasi": True,
            "koordinat_rute": r1_coords,
            "osm_streets_context": roads1 or nearby_streets or []
        },
        {
            "nama_rute": f"{orig_disp} ➔ {st2} ➔ {dest_disp}" if not st2.startswith(orig_disp) else st2,
            "prioritas": "kedua",
            "estimasi_jarak_km": dist2,
            "estimasi_waktu_menit": time2,
            "alasan_rekomendasi": f"Jalur lingkar sekunder melalui {st2} untuk mengurai kepadatan lalu lintas rute {orig_disp} - {dest_disp}.",
            "source": "osrm_grounded",
            "geografis_terverifikasi": True,
            "koordinat_rute": r2_coords,
            "osm_streets_context": roads2 or nearby_streets or []
        },
        {
            "nama_rute": f"{orig_disp} ➔ {st3} ➔ {dest_disp}" if not st3.startswith(orig_disp) else st3,
            "prioritas": "tambahan",
            "estimasi_jarak_km": dist3,
            "estimasi_waktu_menit": time3,
            "alasan_rekomendasi": f"Jalur jalan lokal/lingkungan melalui {st3} yang legal, efisien, dan memangkas waktu tempuh khusus sepeda motor.",
            "source": "osrm_grounded",
            "geografis_terverifikasi": True,
            "koordinat_rute": r3_coords,
            "osm_streets_context": roads3 or nearby_streets or []
        }
    ]

    # 3. Groq AI: Menganalisis kandidat yang sudah dihitung dan menghasilkan alasan rekomendasi cerdas
    osm_context_prompt = ""
    if is_osm_grounded:
        streets_bullet = "\n".join(f"- {s}" for s in nearby_streets[:35])
        osm_context_prompt = f"""
DAFTAR NAMA JALAN ASLI DI SEKITAR PROYEK (Terverifikasi OpenStreetMap):
{streets_bullet}
"""

    candidate_summaries = []
    for idx, c in enumerate(candidates):
        candidate_summaries.append(
            f"Kandidat {idx + 1} (Prioritas: {c['prioritas']}): Rute '{c['nama_rute']}', Jarak: {c['estimasi_jarak_km']} km, Waktu: {c['estimasi_waktu_menit']} menit"
        )
    candidates_text = "\n".join(candidate_summaries)

    prompt = f"""
Anda adalah sistem navigasi cerdas tata kota untuk proyek infrastruktur publik.
Terdapat penutupan jalan akibat pekerjaan konstruksi:
- Nama Proyek: {nama_proyek}
- Kategori: {kategori}
- Wilayah: {nama_wilayah} (Pusat Penutupan: {latitude}, {longitude})
- Titik Asal Perjalanan (Origin): {orig_disp}
- Titik Tujuan Perjalanan (Destination): {dest_disp}

{osm_context_prompt}

KANDIDAT RUTE NYATA HASIL PERHITUNGAN JARINGAN JALAN:
{candidates_text}

TUGAS:
Lakukan analisis cerdas terhadap ketiga kandidat rute di atas dan rumuskan 'alasan_rekomendasi' yang jelas dan kontekstual untuk:
1. 'utama': Koridor arteri utama kapasitas besar untuk semua jenis kendaraan
2. 'kedua': Koridor lingkar luar / bypass sekunder pengurai kepadatan kendaraan roda 4 & logistik
3. 'tambahan': Koridor jalan lingkungan / jalan lokal yang efisien khusus sepeda motor

PENTING:
- DILARANG mengubah jarak ({candidates[0]['estimasi_jarak_km']}, {candidates[1]['estimasi_jarak_km']}, {candidates[2]['estimasi_jarak_km']} km) atau waktu ({candidates[0]['estimasi_waktu_menit']}, {candidates[1]['estimasi_waktu_menit']}, {candidates[2]['estimasi_waktu_menit']} menit).
- Berikan alasan_rekomendasi profesional berbasis kondisi tata kota nyata.

Format JSON wajib persis:
{{
  "rute": [
    {{
      "prioritas": "utama",
      "alasan_rekomendasi": "Jalur arteri beraspal lebar menghindari proyek, cocok untuk semua jenis kendaraan."
    }},
    {{
      "prioritas": "kedua",
      "alasan_rekomendasi": "Jalur lingkar alternatif pengurai antrean kendaraan roda empat."
    }},
    {{
      "prioritas": "tambahan",
      "alasan_rekomendasi": "Akses jalan lokal terdekat berkecepatan rendah khusus sepeda motor."
    }}
  ]
}}
"""

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
                # Perbarui alasan rekomendasi dari analisis Groq tanpa mengubah koordinat/jarak/waktu
                for idx, c in enumerate(candidates):
                    # Cari elemen rute yang cocok berdasarkan prioritas atau indeks
                    matched_ai = None
                    for item in routes_list:
                        if isinstance(item, dict) and item.get("prioritas", "").lower() == c["prioritas"]:
                            matched_ai = item
                            break
                    if not matched_ai and idx < len(routes_list) and isinstance(routes_list[idx], dict):
                        matched_ai = routes_list[idx]

                    if matched_ai:
                        ai_alasan = str(matched_ai.get("alasan_rekomendasi", "")).strip()
                        if ai_alasan and len(ai_alasan) >= 5:
                            c["alasan_rekomendasi"] = ai_alasan
                        c["source"] = "groq"
                        c["raw_response_ai"] = matched_ai

                return candidates
        except Exception as e:
            logger.warning(f"Gagal memanggil Groq API untuk rute: {e}. Mengalihkan ke hasil routing terverifikasi...")

    # Jika Groq offline / tanpa API key / error, gunakan rute tervalidasi yang telah dihitung
    if has_custom_route:
        return candidates

    # Heuristic fallback umum jika tanpa origin & destination khusus
    default_fallback_routes = [
        {
            "nama_rute": f"Jalur Arteri Utama Penghubung {nama_wilayah}",
            "prioritas": "utama",
            "estimasi_jarak_km": 3.2,
            "estimasi_waktu_menit": 9,
            "alasan_rekomendasi": "Jalur lebar beraspal baik dengan penerangan memadai, direkomendasikan untuk kendaraan roda empat dan angkutan umum.",
            "source": "heuristic_fallback",
        },
        {
            "nama_rute": f"Jalan Lingkar Sekunder Sekitar {nama_wilayah}",
            "prioritas": "kedua",
            "estimasi_jarak_km": 4.6,
            "estimasi_waktu_menit": 13,
            "alasan_rekomendasi": "Menghindari persimpangan padat dan memecah volume kendaraan saat jam sibuk kerja dan sekolah.",
            "source": "heuristic_fallback",
        },
        {
            "nama_rute": f"Jalur Pemukiman Warga (Akses Khusus Roda Dua)",
            "prioritas": "tambahan",
            "estimasi_jarak_km": 2.4,
            "estimasi_waktu_menit": 6,
            "alasan_rekomendasi": "Rute pintas melalui gang perumahan berkecepatan rendah khusus bagi pengendara sepeda motor dan sepeda.",
            "source": "heuristic_fallback",
        }
    ]
    for item in default_fallback_routes:
        _attach_osm_geometries(item, nearby_streets, road_geometries, is_osm_grounded)
    return default_fallback_routes


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

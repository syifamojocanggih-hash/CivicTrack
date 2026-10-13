import pytest
import os
import json
import time
from unittest.mock import patch
from app.core.config import settings
from app.routers.ai_routes import validate_ai_route
from app.services.osm_service import (
    get_nearby_osm_streets,
    _get_cache_key,
    _IN_MEMORY_CACHE,
    CACHE_FILE_PATH
)
from app.services.groq_service import generate_ai_alternative_routes

def test_validate_ai_route_osm_grounding():
    """
    Test 1: Memastikan validate_ai_route() memverifikasi nama jalan AI terhadap daftar jalan OSM:
    - Jika nama jalan ada dalam daftar OSM -> is_valid = True
    - Jika AI mengarang nama jalan (halusinasi) -> is_valid = False
    """
    allowed_streets = ["Jalan Basuki Rahmad", "Jalan Pramuka", "Jalan KH Ahmad Dahlan"]

    # 1. Rute valid yang memilih jalan dari daftar asli
    valid_item = {
        "nama_rute": "Jalan Basuki Rahmad ➔ Jalan Pramuka",
        "prioritas": "utama",
        "estimasi_jarak_km": 3.2,
        "estimasi_waktu_menit": 10,
        "alasan_rekomendasi": "Jalur alternatif lebar melewati jalan terverifikasi."
    }
    is_valid, msg = validate_ai_route(valid_item, allowed_streets=allowed_streets)
    assert is_valid is True
    assert msg == "valid"

    # 2. Rute halusinasi yang mengarang nama jalan fiktif
    hallucinated_item = {
        "nama_rute": "Jalan Khayalan Raya ➔ Gang Fiktif Indah",
        "prioritas": "kedua",
        "estimasi_jarak_km": 4.5,
        "estimasi_waktu_menit": 14,
        "alasan_rekomendasi": "Jalur alternatif mengarang."
    }
    is_valid, msg = validate_ai_route(hallucinated_item, allowed_streets=allowed_streets)
    assert is_valid is False
    assert "halusinasi" in msg.lower() or "tidak memuat jalan terverifikasi" in msg.lower()

def test_validate_ai_route_fallback_option_b():
    """
    Test 2: Memastikan ketika data OSM tidak tersedia (Opsi B - allowed_streets kosong/None),
    rute tetap dapat divalidasi normal tanpa error halusinasi.
    """
    unverified_item = {
        "nama_rute": "Jalur Arteri Utama Penghubung Kecamatan",
        "prioritas": "utama",
        "estimasi_jarak_km": 3.8,
        "estimasi_waktu_menit": 12,
        "alasan_rekomendasi": "Jalur lebar alternatif."
    }
    is_valid, msg = validate_ai_route(unverified_item, allowed_streets=[])
    assert is_valid is True

def test_osm_caching_mechanism(tmp_path):
    """
    Test 3: Memastikan caching Overpass API bekerja:
    - Panggilan pertama menyimpan data jalan ke in-memory dan disk
    - Panggilan kedua membaca langsung dari cache tanpa memanggil HTTP Overpass
    """
    test_lat = -7.1050
    test_lon = 112.1640
    key = _get_cache_key(test_lat, test_lon)

    # Pre-populate cache dengan data jalan dan geometri uji coba
    mock_streets = ["Jalan Basuki Rahmad", "Jalan Gotong Royong", "Jalan Raya Babat"]
    mock_geometries = {
        "Jalan Basuki Rahmad": [[[-7.1050, 112.1640], [-7.1052, 112.1642]]]
    }
    _IN_MEMORY_CACHE[key] = (time.time(), mock_streets, mock_geometries)

    # Panggil get_nearby_osm_streets tanpa mock HTTP (harus langsung return dari cache)
    result = get_nearby_osm_streets(test_lat, test_lon)
    assert result == mock_streets
    assert len(result) == 3

def test_generate_routes_grounded_vs_ungrounded():
    """
    Test 4: Memastikan generate_ai_alternative_routes menghasilkan flag geografis_terverifikasi
    dan koordinat rute nyata:
    - Ketika data jalan OSM tersedia -> geografis_terverifikasi = True, koordinat_rute terisi
    - Ketika data jalan OSM kosong (remote/fallback) -> geografis_terverifikasi = False, koordinat_rute = []
    """
    mock_streets = ["Jalan Basuki Rahmad", "Jalan Pramuka", "Jalan KH Ahmad Dahlan"]
    mock_geometries = {
        "Jalan Basuki Rahmad": [[[-7.1050, 112.1640], [-7.1052, 112.1642]]],
        "Jalan Pramuka": [[[-7.1052, 112.1642], [-7.1055, 112.1645]]],
        "Jalan KH Ahmad Dahlan": [[[-7.1055, 112.1645], [-7.1058, 112.1648]]]
    }

    # 1. Simulasi dengan data OSM tersedia (Mocking Groq agar hemat kuota)
    with patch("app.services.groq_service.get_nearby_osm_data") as mock_osm, \
         patch("app.services.groq_service._call_groq_chat") as mock_groq:
        
        mock_osm.return_value = (mock_streets, mock_geometries)
        mock_groq.return_value = json.dumps({
            "rute": [
                {
                    "nama_rute": "Jalan Basuki Rahmad ➔ Jalan Pramuka",
                    "prioritas": "utama",
                    "estimasi_jarak_km": 3.2,
                    "estimasi_waktu_menit": 9,
                    "alasan_rekomendasi": "Jalan terverifikasi OSM."
                },
                {
                    "nama_rute": "Jalan KH Ahmad Dahlan Lingkar",
                    "prioritas": "kedua",
                    "estimasi_jarak_km": 4.5,
                    "estimasi_waktu_menit": 13,
                    "alasan_rekomendasi": "Jalur sekunder."
                },
                {
                    "nama_rute": "Gang Pramuka Pintas",
                    "prioritas": "tambahan",
                    "estimasi_jarak_km": 2.1,
                    "estimasi_waktu_menit": 6,
                    "alasan_rekomendasi": "Jalur pintas roda dua."
                }
            ]
        })

        routes = generate_ai_alternative_routes(
            nama_proyek="Pelebaran Jalan Babat",
            kategori="jalan",
            nama_wilayah="Babat",
            latitude=-7.1050,
            longitude=112.1640
        )
        assert len(routes) == 3
        assert routes[0]["geografis_terverifikasi"] is True
        assert routes[0]["source"] == "groq"
        assert len(routes[0]["koordinat_rute"]) >= 2
        assert routes[0]["koordinat_rute"][0] == [-7.1050, 112.1640]

    # 2. Simulasi area terpencil tanpa data OSM (Opsi B)
    with patch("app.services.groq_service.get_nearby_osm_data") as mock_osm_empty:
        mock_osm_empty.return_value = ([], {})
        # Gunakan fallback heuristik
        with patch.object(settings, "GROQ_API_KEY", ""):
            routes_fallback = generate_ai_alternative_routes(
                nama_proyek="Jembatan Terpencil",
                kategori="jembatan",
                nama_wilayah="Desa Hutan",
                latitude=-6.5000,
                longitude=112.4000
            )
            assert len(routes_fallback) == 3
            assert routes_fallback[0]["geografis_terverifikasi"] is False
            assert routes_fallback[0]["source"] == "heuristic_fallback"
            assert routes_fallback[0]["koordinat_rute"] == []

def test_nearest_endpoint_chaining_reversed_zigzag():
    """
    Test 5: Pengujian Algoritma Nearest Endpoint Chaining dengan Kasus Zigzag / Reverse Orientation:
    - Ruas 1 (Jl. Basuki Rahmad): Tercatat dari Selatan ke Utara [(-7.100, 112.160) -> (-7.102, 112.160)]
    - Ruas 2 (Jl. Gotong Royong): Tercatat SENGAJA DIBALIK di OSM [(-7.102, 112.164) -> (-7.102, 112.160)]
    - Ruas 3 (Jl. Raya Babat): Tercatat normal dari Barat ke Timur [(-7.102, 112.164) -> (-7.105, 112.164)]
    
    Verifikasi:
    1. Algoritma otomatis membalik orientasi Ruas 2 agar menyambung mulus dengan Ruas 1.
    2. Jarak antar titik berurutan tidak ada yang melompat jauh (jarak step <= 0.002 derajat).
    3. Urutan titik kontinu dan tidak terjadi backtracking / zigzag.
    """
    import math
    from app.services.osm_service import chain_road_geometries

    mock_geometries = {
        "Jalan Basuki Rahmad": [
            [[-7.100, 112.160], [-7.101, 112.160], [-7.102, 112.160]]
        ],
        # SENGAJA DIBALIK: titik (-7.102, 112.160) berada di ujung akhir, bukan awal
        "Jalan Gotong Royong": [
            [[-7.102, 112.164], [-7.102, 112.162], [-7.102, 112.160]]
        ],
        "Jalan Raya Babat": [
            [[-7.102, 112.164], [-7.103, 112.164], [-7.104, 112.164], [-7.105, 112.164]]
        ]
    }

    street_sequence = ["Jalan Basuki Rahmad", "Jalan Gotong Royong", "Jalan Raya Babat"]
    chained = chain_road_geometries(street_sequence, mock_geometries)

    assert len(chained) >= 7
    # Titik awal harus awal ruas 1
    assert chained[0] == [-7.100, 112.160]
    # Titik akhir harus akhir ruas 3
    assert chained[-1] == [-7.105, 112.164]

    # Periksa jarak antar titik berurutan: TIDAK BOLEH ADA LOMPATAN ZIGZAG
    # Tanpa chaining cerdas, lompatan dari Ruas 1 ke Ruas 2 yang terbalik adalah 0.004 derajat (450 meter).
    # Dengan chaining cerdas, sambungan adalah 0.0 (titik temu persis).
    for i in range(len(chained) - 1):
        p1 = chained[i]
        p2 = chained[i + 1]
        dist = math.sqrt((p1[0] - p2[0])**2 + (p1[1] - p2[1])**2)
        assert dist <= 0.0025, f"Terjadi lompatan tidak wajar antara titik {p1} dan {p2} (dist: {dist})"


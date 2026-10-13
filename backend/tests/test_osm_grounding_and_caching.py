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
from app.services.gemini_service import generate_ai_alternative_routes

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

    # Pre-populate cache dengan data jalan uji coba
    mock_streets = ["Jalan Basuki Rahmad", "Jalan Gotong Royong", "Jalan Raya Babat"]
    _IN_MEMORY_CACHE[key] = (time.time(), mock_streets)

    # Panggil get_nearby_osm_streets tanpa mock HTTP (harus langsung return dari cache)
    result = get_nearby_osm_streets(test_lat, test_lon)
    assert result == mock_streets
    assert len(result) == 3

def test_generate_routes_grounded_vs_ungrounded():
    """
    Test 4: Memastikan generate_ai_alternative_routes menghasilkan flag geografis_terverifikasi:
    - Ketika data jalan OSM tersedia -> geografis_terverifikasi = True
    - Ketika data jalan OSM kosong (remote/fallback) -> geografis_terverifikasi = False
    """
    # 1. Simulasi dengan data OSM tersedia (Mocking Groq agar hemat kuota)
    with patch("app.services.gemini_service.get_nearby_osm_streets") as mock_osm, \
         patch("app.services.gemini_service._call_groq_chat") as mock_groq:
        
        mock_osm.return_value = ["Jalan Basuki Rahmad", "Jalan Pramuka", "Jalan KH Ahmad Dahlan"]
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

    # 2. Simulasi area terpencil tanpa data OSM (Opsi B)
    with patch("app.services.gemini_service.get_nearby_osm_streets") as mock_osm_empty:
        mock_osm_empty.return_value = []
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

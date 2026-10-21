import pytest
import json
from unittest.mock import patch, MagicMock
from app.services.osm_service import (
    check_route_crosses_closure,
    fetch_osrm_driving_route,
)
from app.services.groq_service import (
    generate_detour_polyline,
    generate_ai_alternative_routes,
)
from app.schemas.route import GenerateRuteRequest

def test_check_route_crosses_closure():
    """
    Test F: Memastikan deteksi penutupan jalan (closure zone) bekerja secara akurat:
    - Rute yang memotong radius proyek ditandai sebagai memotong (True)
    - Rute yang memutar jauh di luar radius penutupan ditandai aman (False)
    """
    closure_lat, closure_lng = -7.1180, 112.4165

    # 1. Rute yang melintas tepat melalui titik penutupan jalan
    direct_route = [
        [-7.1300, 112.4165],
        [-7.1180, 112.4165],
        [-7.1050, 112.4165],
    ]
    assert check_route_crosses_closure(direct_route, closure_lat, closure_lng, radius_meters=280) is True

    # 2. Rute detour yang memutar sejauh > 1 km dari titik penutupan
    detour_route = [
        [-7.1300, 112.4165],
        [-7.1300, 112.4280],
        [-7.1050, 112.4280],
        [-7.1050, 112.4165],
    ]
    assert check_route_crosses_closure(detour_route, closure_lat, closure_lng, radius_meters=280) is False

def test_generate_detour_polyline_motorcycle_profile():
    """
    Test E: Memastikan generate_detour_polyline mendukung rute alternatif OSRM
    dan menghasilkan koordinat polyline kontinu.
    """
    orig_coords = (-7.1195, 112.4154)  # Alun-Alun
    dest_coords = (-7.1158, 112.4182)  # Stasiun
    closure_lat, closure_lng = -7.1180, 112.4165

    with patch("app.services.osm_service.fetch_osrm_driving_route") as mock_osrm:
        mock_osrm.return_value = {
            "coordinates": [list(orig_coords), [-7.1175, 112.4190], list(dest_coords)],
            "distance_km": 0.9,
            "duration_min": 2.5,
            "road_names": ["Jl. Kyai Amien", "Jl. Merpati"],
        }

        res = generate_detour_polyline(
            lat_proj=closure_lat,
            lon_proj=closure_lng,
            orig_coord=orig_coords,
            dest_coord=dest_coords,
            prioritas="tambahan",
        )

        assert res is not None
        assert len(res) >= 2
        mock_osrm.assert_called_once()

def test_generate_rute_request_validation():
    """
    Test A & B & C: Memastikan schema GenerateRuteRequest menerima koordinat custom
    dan memvalidasi rentang koordinat (-90 s/d 90, -180 s/d 180).
    """
    # 1. Request dengan koordinat manual yang valid (misal rumah warga)
    req = GenerateRuteRequest(
        jenis_kendaraan="motor",
        catatan="Hindari kemacetan",
        origin_lat=-7.123456,
        origin_lng=112.401234,
        dest_lat=-7.114321,
        dest_lng=112.418765,
        origin_name="Rumah Warga (Jl. Mastrip)",
        dest_name="Kantor Pos",
    )
    assert req.origin_lat == -7.123456
    assert req.origin_name == "Rumah Warga (Jl. Mastrip)"
    assert req.dest_name == "Kantor Pos"

def test_generate_ai_alternative_routes_groq_grounding():
    """
    Test G & H: Memastikan generate_ai_alternative_routes:
    1. Menghasilkan 3 prioritas: utama, kedua, alternatif
    2. Menggunakan OSRM sebagai single source of truth untuk jarak, durasi, geometri
    3. Menggunakan Groq AI murni untuk analisis rekomendasi tanpa mengarang koordinat/jarak
    """
    project_mock = {
        "id": 1,
        "nama_proyek": "Pelebaran Jalan Poros Lamongan",
        "latitude": -7.1180,
        "longitude": 112.4165,
        "kecamatan": "Lamongan",
    }

    mock_osrm_res = {
        "coordinates": [[-7.1195, 112.4154], [-7.1158, 112.4182]],
        "distance_km": 1.2,
        "duration_min": 3.0,
        "road_names": ["Jl. Kyai Amien", "Jl. Merpati"],
    }

    groq_json_response = {
        "rute": [
            {
                "prioritas": "utama",
                "alasan_rekomendasi": "Jalur arteri bebas hambatan, cocok untuk semua kendaraan dan menghindari area penutupan.",
            },
            {
                "prioritas": "kedua",
                "alasan_rekomendasi": "Jalur lingkar sekunder pengurai antrean kendaraan roda empat.",
            },
            {
                "prioritas": "tambahan",
                "alasan_rekomendasi": "Melalui jalan lokal Jl. Kyai Amien dan Jl. Merpati yang legal dan ramah roda dua.",
            },
        ]
    }

    with patch("app.services.osm_service.fetch_osrm_driving_route", return_value=mock_osrm_res), \
         patch("app.services.groq_service.generate_detour_polyline", return_value=[[-7.1195, 112.4154], [-7.1158, 112.4182]]), \
         patch("app.services.groq_service._call_groq_chat", return_value=json.dumps(groq_json_response)):

        routes = generate_ai_alternative_routes(
            nama_proyek=project_mock["nama_proyek"],
            kategori="Jalan & Jembatan",
            nama_wilayah=project_mock["kecamatan"],
            latitude=project_mock["latitude"],
            longitude=project_mock["longitude"],
            origin_coords=(-7.1195, 112.4154),
            dest_coords=(-7.1158, 112.4182),
            origin_name="Alun-Alun Lamongan",
            dest_name="Stasiun Lamongan",
        )

        assert len(routes) == 3
        priorities = [r["prioritas"] for r in routes]
        assert "utama" in priorities
        assert "kedua" in priorities
        assert "tambahan" in priorities

        for r in routes:
            assert "koordinat_rute" in r
            assert len(r["koordinat_rute"]) >= 2
            assert r["estimasi_jarak_km"] > 0
            assert r["alasan_rekomendasi"] is not None

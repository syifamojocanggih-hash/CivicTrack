import pytest
from app.models.user import UserRole

def test_register_and_login_flow(client):
    """Pengujian alur registrasi, login, dan akses profile /auth/me."""
    reg_payload = {
        "nama": "Budi Penguji",
        "email": "budi.test@example.com",
        "password": "password123",
        "role": "warga"
    }
    reg_res = client.post("/api/v1/auth/register", json=reg_payload)
    assert reg_res.status_code == 201, reg_res.text
    token_data = reg_res.json()
    assert "access_token" in token_data
    assert "refresh_token" in token_data
    assert token_data["user"]["email"] == "budi.test@example.com"

    # Login
    login_payload = {
        "email": "budi.test@example.com",
        "password": "password123"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    access_token = login_res.json()["access_token"]
    refresh_tok = login_res.json()["refresh_token"]

    # Akses /auth/me dengan Bearer token
    headers = {"Authorization": f"Bearer {access_token}"}
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == 200
    assert me_res.json()["nama"] == "Budi Penguji"

    # Refresh token
    refresh_res = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_tok})
    assert refresh_res.status_code == 200
    assert "access_token" in refresh_res.json()

def test_rbac_protection(client):
    """Memastikan role warga biasa ditolak (403) saat mencoba akses endpoint administratif admin."""
    # Daftar warga
    warga_payload = {
        "nama": "Warga Biasa",
        "email": "warga.biasa@example.com",
        "password": "password123",
        "role": "warga"
    }
    warga_res = client.post("/api/v1/auth/register", json=warga_payload)
    warga_token = warga_res.json()["access_token"]

    headers = {"Authorization": f"Bearer {warga_token}"}

    # Warga mencoba input proyek baru (harus 403 Forbidden)
    proyek_payload = {
        "nama_proyek": "Jalan Ilegal",
        "kategori": "jalan",
        "latitude": -7.15,
        "longitude": 111.88,
        "wilayah_id": 1,
        "dinas_id": 1,
        "tanggal_mulai": "2025-01-01",
        "estimasi_selesai": "2025-06-01"
    }
    res = client.post("/api/v1/proyek", json=proyek_payload, headers=headers)
    assert res.status_code == 403

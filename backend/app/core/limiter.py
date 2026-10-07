"""
Modul Rate Limiting CivicTrack menggunakan SlowAPI (In-Memory Storage).

CATATAN ARSITEKTUR & KNOWN LIMITATION:
Rate limiting in-memory ini akurat dan optimal untuk arsitektur single-process / single-worker
(seperti konfigurasi docker-compose.yml saat ini yang menjalankan 1 container backend).
Jika backend di masa depan di-scale ke multiple workers (misalnya Gunicorn/Uvicorn multi-workers)
atau multiple replica container (Kubernetes / Docker Swarm), in-memory storage per-proses
tidak lagi sinkron (tiap worker memiliki hitungan terpisah). Pada skala tersebut,
penyimpanan limiter perlu dialihkan ke Redis storage (contoh: storage_uri="redis://redis:6379/1").
"""

from fastapi import Request, Response
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.core.security import decode_token

def get_user_or_ip_key(request: Request) -> str:
    """
    Mengekstrak identitas unik klien untuk keperluan rate limiting:
    1. Menggunakan user_id dari JWT Bearer token yang disediakan di header Authorization.
       Menggunakan fungsi `decode_token` dari `app.core.security` untuk memastikan
       algoritma, secret key, dan validasi keabsahan token identik dengan `get_current_user`.
    2. Fallback ke IP address klien (`request.client.host`) jika request tidak memiliki token
       atau token tidak valid / kedaluwarsa.
    """
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header[7:].strip()
        payload = decode_token(token)
        if payload and payload.get("type") == "access":
            user_id = payload.get("sub")
            if user_id:
                return f"user:{user_id}"

    # Fallback ke IP remote client
    client_ip = get_remote_address(request)
    return f"ip:{client_ip or '127.0.0.1'}"

# Limiter berbasis memory storage
limiter = Limiter(key_func=get_user_or_ip_key)

def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded) -> Response:
    """
    Custom exception handler ketika ambang batas rate limit terlampaui.
    Mengembalikan HTTP 429 Too Many Requests dengan pesan informatif dan header Retry-After.
    """
    detail_message = (
        f"Batas pengiriman laporan tercapai (maksimal {exc.detail}). "
        f"Silakan tunggu beberapa saat sebelum mengirim laporan berikutnya."
    )
    response = JSONResponse(
        status_code=429,
        content={"detail": detail_message}
    )
    if hasattr(request.app.state, "limiter") and hasattr(request.state, "view_rate_limit"):
        response = request.app.state.limiter._inject_headers(
            response, request.state.view_rate_limit
        )
    return response

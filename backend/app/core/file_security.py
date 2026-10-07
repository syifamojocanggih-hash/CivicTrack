import os
import io
import logging
from typing import Tuple
from fastapi import UploadFile, HTTPException, status
from PIL import Image
from app.core.config import settings
from app.models.project import MediaType

logger = logging.getLogger(__name__)

PHOTO_EXTENSIONS = {"jpg", "jpeg", "png", "webp"}
VIDEO_EXTENSIONS = {"mp4", "mov", "avi", "webm"}

# Daftar signature biner berkas berbahaya untuk deteksi spoofing
DANGEROUS_SIGNATURES = [
    (b"MZ", "Windows Executable/DLL (PE)"),
    (b"\x7fELF", "Linux Executable (ELF)"),
    (b"PK\x03\x04", "Arsip ZIP / Java JAR / Office"),
    (b"Rar!\x1a\x07", "Arsip RAR"),
    (b"7z\xbc\xaf\x27\x1c", "Arsip 7-Zip"),
    (b"\x1f\x8b", "Arsip GZIP"),
    (b"#!\x2f", "Shell Script"),
    (b"<?php", "PHP Script"),
    (b"<html", "HTML Document"),
    (b"<!DOCTYPE", "HTML Document"),
    (b"<script", "JavaScript / Web Script"),
]

def check_video_magic_bytes(header: bytes, ext: str) -> bool:
    """Memeriksa magic bytes untuk format video (MP4, MOV, WebM, AVI)."""
    if len(header) < 12:
        return False
    if ext in ["mp4", "mov"]:
        # ISO Base Media File Format: bytes 4..8 biasanya ftyp, moov, wide, atau free
        return header[4:8] in [b"ftyp", b"moov", b"wide", b"free"]
    elif ext == "webm":
        # EBML ID: 0x1A 0x45 0xDF 0xA3
        return header.startswith(b"\x1a\x45\xdf\xa3")
    elif ext == "avi":
        # RIFF ... AVI
        return header.startswith(b"RIFF") and header[8:12] == b"AVI "
    return False

def check_photo_magic_bytes(header: bytes, ext: str) -> bool:
    """Memeriksa magic bytes untuk format gambar (JPEG, PNG, WebP)."""
    if ext in ["jpg", "jpeg"]:
        return header.startswith(b"\xff\xd8\xff")
    elif ext == "png":
        return header.startswith(b"\x89PNG\r\n\x1a\n")
    elif ext == "webp":
        return header.startswith(b"RIFF") and len(header) >= 12 and header[8:12] == b"WEBP"
    return False

def validate_and_process_media_upload(file: UploadFile) -> Tuple[MediaType, bytes, str, int]:
    """
    Validasi keamanan mendalam berkas unggahan foto/video (Opsi A - PRD 10.1):
    1. Cek ekstensi (cepat, murah).
    2. Cek Content-Type header client (defense-in-depth, warning di log jika inkonsisten).
    3. Baca file ke memory stream.
    4. Cek magic bytes biner asli & tolak signature berkas berbahaya (executable, script, archive).
    5. Pillow verify() untuk gambar guna memastikan integritas chunk gambar utuh (bukan corrupt/polyglot).
    6. Cek batas ukuran spesifik (Foto maks 10MB, Video maks 30MB).
    
    Mengembalikan: (tipe_media, file_bytes, ext, size_kb)
    Menolak dengan HTTP 422 jika tidak lolos validasi.
    """
    # 1. Cek Ekstensi
    original_filename = file.filename or ""
    ext = original_filename.rsplit(".", 1)[-1].lower() if "." in original_filename else ""
    if not ext or ext not in settings.allowed_extensions_list:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Format berkas '.{ext}' tidak didukung. Ekstensi yang diizinkan: {settings.ALLOWED_EXTENSIONS}"
        )

    # 2. Cek Content-Type Header Client (Defense-in-depth logging)
    client_content_type = (file.content_type or "").lower().strip()
    if ext in PHOTO_EXTENSIONS and client_content_type and not client_content_type.startswith("image/"):
        logger.warning(
            f"Peringatan Keamanan: Content-Type '{client_content_type}' tidak lazim untuk gambar '.{ext}' "
            f"pada berkas '{original_filename}'."
        )
    elif ext in VIDEO_EXTENSIONS and client_content_type and not client_content_type.startswith("video/"):
        logger.warning(
            f"Peringatan Keamanan: Content-Type '{client_content_type}' tidak lazim untuk video '.{ext}' "
            f"pada berkas '{original_filename}'."
        )

    # 3. Baca Isi Berkas ke Memory
    try:
        content = file.file.read()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Gagal membaca berkas yang diunggah: {str(e)}"
        )

    file_size = len(content)
    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Berkas yang diunggah kosong (0 bytes)."
        )

    # 4. Cek Signature Berbahaya & Magic Bytes Asli
    header = content[:32]

    # Cek signature berbahaya (executable, script, archive)
    for sig, desc in DANGEROUS_SIGNATURES:
        if header.startswith(sig):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Berkas ditolak: isi berkas terdeteksi sebagai {desc}, tidak sesuai dengan klaim ekstensi '.{ext}'."
            )

    # Cek magic bytes spesifik sesuai ekstensi
    if ext in PHOTO_EXTENSIONS:
        tipe_media = MediaType.foto
        # Batas Ukuran Foto (10 MB)
        max_photo_bytes = settings.MAX_IMAGE_SIZE_MB * 1024 * 1024
        if file_size > max_photo_bytes:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Ukuran berkas foto ({file_size / (1024 * 1024):.2f}MB) melebihi batas maksimum {settings.MAX_IMAGE_SIZE_MB}MB."
            )

        if not check_photo_magic_bytes(header, ext):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Signature biner berkas tidak cocok dengan format gambar '.{ext}'."
            )

        # 5. Pillow verify() untuk gambar
        try:
            img = Image.open(io.BytesIO(content))
            img.verify()
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Integritas berkas gambar rusak atau tidak valid (corrupted): {str(e)}"
            )

    elif ext in VIDEO_EXTENSIONS:
        tipe_media = MediaType.video
        # Batas Ukuran Video (30 MB)
        max_video_bytes = settings.MAX_VIDEO_SIZE_MB * 1024 * 1024
        if file_size > max_video_bytes:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Ukuran berkas video ({file_size / (1024 * 1024):.2f}MB) melebihi batas maksimum {settings.MAX_VIDEO_SIZE_MB}MB."
            )

        if not check_video_magic_bytes(header, ext):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Signature biner berkas tidak cocok dengan format video '.{ext}'."
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Tipe berkas '.{ext}' tidak didukung."
        )

    size_kb = max(1, int(file_size / 1024))
    return tipe_media, content, ext, size_kb

@echo off
setlocal

echo ====================================================================
echo        CivicTrack - Menjalankan Layanan Docker Compose
echo ====================================================================
echo.

cd /d "%~dp0\.."

:: Pastikan PATH docker tersedia di sesi ini
set "PATH=%PATH%;%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin;C:\Program Files\Docker\Docker\resources\bin"

echo [*] Memeriksa status Docker engine...
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Docker engine belum aktif atau Docker Desktop belum berjalan.
    echo [*] Pastikan aplikasi Docker Desktop sudah dibuka dan berstatus 'Running'.
    echo [*] Jika baru saja mengaktifkan WSL, silakan restart komputer terlebih dahulu.
    pause
    exit /b 1
)

echo [*] Membangun dan menjalankan kontainer...
docker compose up -d --build

echo.
echo [*] Status kontainer saat ini:
docker compose ps

echo.
echo ====================================================================
echo Platform CivicTrack siap diakses:
echo - Frontend Web: http://localhost:5173
echo - Backend API : http://localhost:8000
echo - Swagger Docs: http://localhost:8000/docs
echo - Database    : localhost:3306 (civictrack_db)
echo ====================================================================
echo.
pause

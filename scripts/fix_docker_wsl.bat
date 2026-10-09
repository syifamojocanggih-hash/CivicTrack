@echo off
setlocal enabledelayedexpansion

echo ====================================================================
echo        CivicTrack - Perbaikan Otomatis Docker Desktop & WSL
echo ====================================================================
echo.

:: 1. Verifikasi hak akses Administrator
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Skrip membutuhkan hak akses Administrator.
    echo [!] Membuka jendela konfirmasi Administrator (UAC)...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd -ArgumentList '/c \"\"%~f0\"\"' -Verb RunAs"
    exit /b
)

echo [*] Hak akses Administrator terkonfirmasi!
echo.

:: 2. Mengaktifkan fitur Windows: VirtualMachinePlatform
echo [1/5] Mengaktifkan fitur Virtual Machine Platform...
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
echo.

:: 3. Mengaktifkan fitur Windows: Microsoft-Windows-Subsystem-Linux
echo [2/5] Mengaktifkan fitur Windows Subsystem for Linux...
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
echo.

:: 4. Memperbarui & menginstal komponen WSL 2
echo [3/5] Menginstal / memperbarui WSL kernel...
wsl.exe --update --web-download
wsl.exe --set-default-version 2
echo.

:: 5. Memastikan PATH Docker Desktop tersimpan
echo [4/5] Memeriksa konfigurasi PATH Docker Desktop...
set "DOCKER_BIN=%LOCALAPPDATA%\Programs\DockerDesktop\resources\bin"
echo %PATH% | findstr /I /C:"%DOCKER_BIN%" >nul
if %errorlevel% neq 0 (
    echo [*] Menambahkan %DOCKER_BIN% ke User PATH...
    setx PATH "%PATH%;%DOCKER_BIN%"
) else (
    echo [*] PATH Docker Desktop sudah terdaftar.
)
echo.

:: 6. Selesai
echo [5/5] Selesai!
echo ====================================================================
echo CATATAN PENTING:
echo 1. Jika fitur Virtual Machine Platform baru saja diaktifkan,
echo    Windows MEMERLUKAN 1 KALI RESTART LAPTOP agar engine WSL aktif.
echo 2. Setelah laptop menyala kembali, buka aplikasi Docker Desktop,
echo    tunggu ikon paus berwarna hijau (Engine running).
echo 3. Lalu jalankan perintah di folder proyek:
echo       docker compose up -d --build
echo ====================================================================
echo.
pause

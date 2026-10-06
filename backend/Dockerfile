FROM python:3.11-slim

# Hindari pembuatan file .pyc dan aktifkan log langsung
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install curl untuk healthcheck / utilitas dasar
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Salin dan install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Salin seluruh kode backend
COPY . .

# Buat direktori penyimpanan media lokal
RUN mkdir -p uploads

EXPOSE 8000

# Jalankan FastAPI dengan Uvicorn dan hot reload
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]

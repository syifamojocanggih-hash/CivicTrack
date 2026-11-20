from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_NAME: str = "CivicTrack API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Basis Data MySQL
    # Contoh: mysql+pymysql://root:@localhost:3306/civictrack_db
    DATABASE_URL: str = "mysql+pymysql://root:@localhost:3306/civictrack_db"
    
    # Keamanan JWT
    SECRET_KEY: str = "civictrack-super-secret-key-development-change-in-production-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Groq AI
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-20b"
    
    # Penyimpanan Berkas Media
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 25
    MAX_IMAGE_SIZE_MB: int = 10
    MAX_VIDEO_SIZE_MB: int = 30
    ALLOWED_EXTENSIONS: str = "jpg,jpeg,png,webp,mp4,mov,avi,webm"

    # Web Push VAPID Keys
    VAPID_PUBLIC_KEY: str = "BHnS8R8umRcj_mwhxhiPuEM7taKcv4PiEElmCQ9qfz5F8iZtzFXsTJV37ni5vncSN-WptksI-AAYxb3qbbLVvzU"
    VAPID_PRIVATE_KEY: str = "-----BEGIN PRIVATE KEY-----\nMIGHAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBG0wawIBAQQg4qFyZc1kuY/zOpOF\nqM9BtkQZ8udOI5hA/VUfFzS5aTqhRANCAAR50vEfLpkXI/5sIcYYj7hDO7WinL+D\n4hBJZgkPan8+RfImbcxV7EyVd+54ub53EjflqbZLCPgAGMW96m2y1b81\n-----END PRIVATE KEY-----\n"
    VAPID_CLAIM_EMAIL: str = "mailto:admin.civictrack@lamongankab.go.id"

    @property
    def allowed_extensions_list(self) -> List[str]:
        return [ext.strip().lower() for ext in self.ALLOWED_EXTENSIONS.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

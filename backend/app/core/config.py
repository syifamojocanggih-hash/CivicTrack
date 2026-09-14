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
    
    # Google Gemini AI
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-2.0-flash"
    
    # Penyimpanan Berkas Media
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE_MB: int = 25
    ALLOWED_EXTENSIONS: str = "jpg,jpeg,png,webp,mp4,mov"

    @property
    def allowed_extensions_list(self) -> List[str]:
        return [ext.strip().lower() for ext in self.ALLOWED_EXTENSIONS.split(",")]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

# Konfigurasi engine database MySQL
# pool_pre_ping=True membantu menangani koneksi terputus ke MySQL server
engine_args = {
    "pool_pre_ping": True,
    "pool_recycle": 3600,
}

if settings.DATABASE_URL.startswith("sqlite"):
    engine_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    echo=False,
    **engine_args
)

from sqlalchemy import BigInteger, Integer

# Helper kolom primary key BigInteger yang kompatibel autoincrement baik di MySQL maupun SQLite
PK_BIGINT = BigInteger().with_variant(Integer, "sqlite")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency generator untuk injeksi sesi database ke FastAPI endpoint."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

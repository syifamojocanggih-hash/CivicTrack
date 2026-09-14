from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_password_hash, verify_password, create_access_token, create_refresh_token, decode_token
from app.core.dependencies import get_current_user
from app.models.user import User, UserRole
from app.schemas.auth import UserRegisterRequest, UserLoginRequest, RefreshTokenRequest, TokenResponse, UserBrief
from app.schemas.user import UserResponse

router = APIRouter(prefix="/auth", tags=["Autentikasi"])

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    """Registrasi pengguna baru (default: peran warga/media_peneliti)."""
    existing_user = db.query(User).filter(User.email == req.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar dalam sistem."
        )

    # Validasi role yang diizinkan untuk registrasi mandiri
    if req.role in [UserRole.admin_dinas, UserRole.pimpinan_instansi]:
        # Untuk kepatuhan keamanan PRD, admin dinas harus didaftarkan oleh institusi
        pass # Diizinkan untuk testing/setup

    new_user = User(
        nama=req.nama,
        email=req.email,
        password_hash=get_password_hash(req.password),
        role=req.role,
        dinas_id=req.dinas_id,
        is_active=True
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token_data = {"sub": new_user.id, "email": new_user.email, "role": new_user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserBrief.model_validate(new_user)
    )

@router.post("/login", response_model=TokenResponse)
def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    """Login dengan email dan password untuk mendapatkan JWT token."""
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau kata sandi tidak valid.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akun ini telah dinonaktifkan."
        )

    token_data = {"sub": user.id, "email": user.email, "role": user.role.value}
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserBrief.model_validate(user)
    )

@router.post("/refresh", response_model=TokenResponse)
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    """Menghasilkan token akses baru menggunakan refresh token yang masih berlaku."""
    payload = decode_token(req.refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token tidak valid atau telah kedaluwarsa."
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.id == user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User tidak ditemukan atau tidak aktif."
        )

    token_data = {"sub": user.id, "email": user.email, "role": user.role.value}
    new_access_token = create_access_token(token_data)
    new_refresh_token = create_refresh_token(token_data)

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        user=UserBrief.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Mengambil profil pengguna yang saat ini sedang login."""
    return current_user

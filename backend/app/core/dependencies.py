from typing import List, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Mengambil user terautentikasi berdasarkan JWT token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Autentikasi gagal atau token kedaluwarsa.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
    
    token_type = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tipe token tidak valid untuk autentikasi permintaan ini.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    user_id_raw = payload.get("sub")
    if user_id_raw is None:
        raise credentials_exception
    try:
        user_id = int(user_id_raw)
    except (ValueError, TypeError):
        raise credentials_exception
        
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Akun pengguna nonaktif.")
        
    return user

def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Mengambil user jika token disediakan, atau None jika tanpa token (untuk endpoint publik)."""
    if not token:
        return None
    try:
        return get_current_user(token, db)
    except HTTPException:
        return None

def require_roles(allowed_roles: List[UserRole]):
    """Role-Based Access Control (RBAC) dependency guard."""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Akses ditolak. Peran Anda ({current_user.role.value}) tidak diizinkan mengakses resource ini."
            )
        return current_user
    return role_checker

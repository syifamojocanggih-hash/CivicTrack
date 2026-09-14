import pytest
from app.core.profanity import contains_profanity, sanitize_profanity
from app.core.security import get_password_hash, verify_password

def test_profanity_detector():
    """Memastikan profanity detector mendeteksi kata-kata kasar."""
    clean_text = "Jalan ini sangat bagus dan pengerjaannya rapi."
    dirty_text = "Proyek ini lambat sekali, dasar mandor bajingan dan pemalas."

    assert not contains_profanity(clean_text)
    assert contains_profanity(dirty_text)

def test_profanity_sanitizer():
    """Memastikan kata kasar disensor menjadi bintang."""
    text = "Proyek anjing ini merugikan warga."
    sanitized = sanitize_profanity(text)
    assert "anjing" not in sanitized.lower()
    assert "a*****" in sanitized or "a****" in sanitized

def test_password_hash_and_verify():
    """Memastikan hashing dan verifikasi kata sandi bcrypt berjalan tepat."""
    pwd = "SecretPassword123!"
    hashed = get_password_hash(pwd)

    assert hashed != pwd
    assert verify_password(pwd, hashed)
    assert not verify_password("WrongPassword", hashed)

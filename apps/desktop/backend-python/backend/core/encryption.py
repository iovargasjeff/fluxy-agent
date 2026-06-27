"""
core/encryption.py
Utilidades de cifrado simétrico (Fernet) para contraseñas de conexiones guardadas.
"""
from pathlib import Path
import base64
import hashlib
from cryptography.fernet import Fernet, InvalidToken
from backend.core.config import settings


def _get_fernet() -> Fernet:
    """Carga o crea una clave local aleatoria fuera de los archivos cifrados."""
    key_path = Path(settings.SECRETS_KEY_PATH)
    key_path.parent.mkdir(parents=True, exist_ok=True)
    if not key_path.exists():
        key_path.write_bytes(Fernet.generate_key())
    return Fernet(key_path.read_bytes())


def encrypt_password(plain: str) -> str:
    """Cifra una contraseña en texto plano y devuelve el token Fernet como string."""
    f = _get_fernet()
    return f.encrypt(plain.encode("utf-8")).decode("utf-8")


def decrypt_password(token: str) -> str:
    """Descifra un token Fernet y devuelve la contraseña original."""
    try:
        return _get_fernet().decrypt(token.encode("utf-8")).decode("utf-8")
    except InvalidToken:
        digest = hashlib.sha256(settings.ENCRYPTION_KEY.encode("utf-8")).digest()
        return Fernet(base64.urlsafe_b64encode(digest)).decrypt(token.encode("utf-8")).decode("utf-8")

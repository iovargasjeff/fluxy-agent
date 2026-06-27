"""
models/models.py
Modelos ORM SQLAlchemy para la base de datos interna SQLite del sistema.
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.sql import func
from backend.core.database import Base


# ─────────────────────────────────────────────────────────────
# CONEXIONES (historial de conexiones a BD externas)
# ─────────────────────────────────────────────────────────────
class Conexion(Base):
    __tablename__ = "conexiones"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    nombre_alias = Column(String(100), nullable=True)       # Nombre amigable para la conexión
    motor_bd = Column(String(50), nullable=False)           # mysql, postgresql, mongodb, etc.
    host = Column(String(255), nullable=False)
    puerto = Column(Integer, nullable=False)
    nombre_bd = Column(String(255), nullable=False)
    usuario_db = Column(String(255), nullable=True)         # Usuario de la BD externa
    password_db = Column(Text, nullable=True)               # Contraseña cifrada con Fernet
    registros_generados = Column(Integer, nullable=False, default=0)
    registros_insertados = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, server_default=func.now())

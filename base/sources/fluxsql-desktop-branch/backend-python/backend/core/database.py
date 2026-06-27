"""
core/database.py
Engine SQLAlchemy y sesiones para la base de datos interna SQLite.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from backend.core.config import settings

# Motor de conexión SQLite
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},  # Necesario para SQLite
    echo=False,
)

# Fábrica de sesiones
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para todos los modelos ORM
Base = declarative_base()


def get_db():
    """
    Dependencia FastAPI para obtener sesión de base de datos.
    Garantiza el cierre de la sesión al finalizar la request.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

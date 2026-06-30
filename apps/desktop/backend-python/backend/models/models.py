"""
models/models.py
Modelos ORM SQLAlchemy para la base de datos interna SQLite del sistema.
"""
from sqlalchemy import Boolean, Column, Integer, String, Text, DateTime
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


class SyncQueueItem(Base):
    __tablename__ = "sync_queue"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    artifact_type = Column(String(50), nullable=False)
    local_id = Column(String(100), nullable=False)
    operation = Column(String(50), nullable=False, default="upsert")
    payload_json = Column(Text, nullable=False)
    status = Column(String(50), nullable=False, default="pending")
    attempts = Column(Integer, nullable=False, default=0)
    last_error = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class CloudAccountSession(Base):
    __tablename__ = "cloud_account_session"

    id = Column(Integer, primary_key=True, index=True, default=1)
    user_email = Column(String(255), nullable=False)
    access_token = Column(Text, nullable=False)
    provider = Column(String(50), nullable=False, default="fluxy_web")
    status = Column(String(50), nullable=False, default="linked")
    linked_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class LocalSkillInstallation(Base):
    __tablename__ = "local_skill_installations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_id = Column(String(100), nullable=False, unique=True, index=True)
    version = Column(String(50), nullable=False, default="1.0.0")
    enabled = Column(Boolean, nullable=False, default=True)
    source = Column(String(255), nullable=False, default="fluxy-catalog")
    installed_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    agent = Column(String(100), nullable=True)
    skill_id = Column(String(100), nullable=True)
    connection_id = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False)
    result = Column(String(50), nullable=False)
    backup_id = Column(String(100), nullable=True)
    sandbox_id = Column(String(100), nullable=True)
    human_approved = Column(Boolean, nullable=False, default=False)
    details_json = Column(Text, nullable=False, default="{}")
    created_at = Column(DateTime, server_default=func.now())


class ReportArtifact(Base):
    __tablename__ = "report_artifacts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    artifact_type = Column(String(50), nullable=False, default="markdown")
    content = Column(Text, nullable=False)
    audit_log_id = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now())


class AgentMemory(Base):
    __tablename__ = "agent_memories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    scope = Column(String(50), nullable=False, default="workspace")
    subject = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    tags_json = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class SkillPermission(Base):
    __tablename__ = "skill_permissions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    skill_id = Column(String(100), nullable=False, index=True)
    can_read_schema = Column(Boolean, nullable=False, default=True)
    can_generate_sql = Column(Boolean, nullable=False, default=True)
    can_execute = Column(Boolean, nullable=False, default=False)
    requires_approval = Column(Boolean, nullable=False, default=True)
    environment = Column(String(50), nullable=False, default="development")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    risk_level = Column(String(50), nullable=False, default="medium")
    status = Column(String(50), nullable=False, default="pending")
    requested_by = Column(String(100), nullable=True)
    details_json = Column(Text, nullable=False, default="{}")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())


class SchemaDecision(Base):
    __tablename__ = "schema_decisions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    project_id = Column(String(100), nullable=True)
    title = Column(String(255), nullable=False)
    decision = Column(Text, nullable=False)
    rationale = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="accepted")
    created_at = Column(DateTime, server_default=func.now())


class EnvironmentGuard(Base):
    __tablename__ = "environment_guards"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    environment = Column(String(50), nullable=False, unique=True)
    require_backup = Column(Boolean, nullable=False, default=False)
    require_sandbox = Column(Boolean, nullable=False, default=False)
    require_approval = Column(Boolean, nullable=False, default=False)
    allow_direct_write = Column(Boolean, nullable=False, default=True)
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

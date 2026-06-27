from sqlalchemy import Boolean, Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.core.database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    is_public = Column(Boolean, default=False, nullable=False)
    share_access = Column(String, default="view", nullable=False)
    
    diagrams = relationship("Diagram", back_populates="project", cascade="all, delete-orphan")


class Diagram(Base):
    __tablename__ = "diagrams"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    name = Column(String)
    schema_json = Column(Text, nullable=True)
    sql_content = Column(Text, default="")
    active_dialect = Column(String, default="postgresql", nullable=False)
    source_database = Column(String, nullable=True)
    selected_tables_json = Column(Text, default="[]", nullable=False)
    last_synced_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    project = relationship("Project", back_populates="diagrams")
    versions = relationship("DiagramVersion", back_populates="diagram", cascade="all, delete-orphan")


class DiagramVersion(Base):
    __tablename__ = "diagram_versions"

    id = Column(Integer, primary_key=True, index=True)
    diagram_id = Column(Integer, ForeignKey("diagrams.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    message = Column(String, nullable=False)
    flow_json = Column(Text, nullable=False)
    sql_content = Column(Text, default="")
    active_dialect = Column(String, default="postgresql", nullable=False)
    snapshots_json = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    diagram = relationship("Diagram", back_populates="versions")

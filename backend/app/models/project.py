"""Project model - Collections of tasks working toward an outcome."""

from uuid import uuid4

from sqlalchemy import TIMESTAMP, Column, String, Text
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text

from app.db.database import Base


class Project(Base):
    """Project model for grouping related tasks."""

    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(200), nullable=False)
    outcome_statement = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, server_default=text("'active'"))
    parent_project_id = Column(String(36), nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    completed_at = Column(TIMESTAMP, nullable=True)
    archived_at = Column(TIMESTAMP, nullable=True)
    last_activity_at = Column(TIMESTAMP, nullable=True)
    deleted_at = Column(TIMESTAMP, nullable=True)

    # PostgreSQL full-text search (deferred for SQLite compatibility)
    # Generated column - exclude from mapper to prevent insert/update errors
    search_vector = Column(TSVECTOR)

    # Mapper configuration - exclude search_vector from INSERT/UPDATE
    __mapper_args__ = {"exclude_properties": ["search_vector"]}

    # Relationships
    tasks = relationship("Task", back_populates="project", foreign_keys="Task.project_id")
    notes = relationship("Note", back_populates="project", cascade="all, delete-orphan")

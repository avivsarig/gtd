"""Project model - Collections of tasks working toward an outcome."""

from sqlalchemy import TIMESTAMP, Column, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text
from uuid import uuid4

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

    # Removed TSVECTOR for SQLite compatibility

    # Relationships
    tasks = relationship("Task", back_populates="project", foreign_keys="Task.project_id")
    notes = relationship("Note", back_populates="project", cascade="all, delete-orphan")

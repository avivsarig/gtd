"""Project model - Collections of tasks working toward an outcome."""

from sqlalchemy import TIMESTAMP, Column, String, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import text

from app.db.database import Base
from app.models.mixins import SearchableMixin, SoftDeletableMixin, UUIDPrimaryKeyMixin


class Project(Base, UUIDPrimaryKeyMixin, SoftDeletableMixin, SearchableMixin):
    """Project model for grouping related tasks."""

    __tablename__ = "projects"

    name = Column(String(200), nullable=False)
    outcome_statement = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, server_default=text("'active'"))
    parent_project_id = Column(String(36), nullable=True)
    completed_at = Column(TIMESTAMP, nullable=True)
    archived_at = Column(TIMESTAMP, nullable=True)
    last_activity_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    tasks = relationship("Task", back_populates="project", foreign_keys="Task.project_id")
    notes = relationship("Note", back_populates="project", cascade="all, delete-orphan")

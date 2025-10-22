"""Note model - Reference material and supporting information."""

from uuid import uuid4

from sqlalchemy import TIMESTAMP, Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.database import Base
from app.models.associations import note_task_links


class Note(Base):
    """Note model for reference material and documentation."""

    __tablename__ = "notes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    # PostgreSQL full-text search (deferred for SQLite compatibility)
    # Generated column - exclude from mapper to prevent insert/update errors
    search_vector = Column(TSVECTOR)

    # Mapper configuration - exclude search_vector from INSERT/UPDATE
    __mapper_args__ = {"exclude_properties": ["search_vector"]}

    # Relationships
    project = relationship("Project", back_populates="notes")
    tasks = relationship("Task", secondary=note_task_links, backref="notes")

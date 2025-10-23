"""Note model - Reference material and supporting information."""

from sqlalchemy import Column, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.db.database import Base
from app.models.associations import note_task_links
from app.models.mixins import SearchableMixin, SoftDeletableMixin, UUIDPrimaryKeyMixin


class Note(Base, UUIDPrimaryKeyMixin, SoftDeletableMixin, SearchableMixin):
    """Note model for reference material and documentation."""

    __tablename__ = "notes"
    __search_fields__ = {
        "title": "A",
        "content": "B",
    }

    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="notes")
    tasks = relationship("Task", secondary=note_task_links, backref="notes")

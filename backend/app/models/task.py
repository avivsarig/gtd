"""Task model - Core GTD actionable items."""

from sqlalchemy import TIMESTAMP, Column, Date, ForeignKey, String, Text, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import text

from app.db.database import Base
from app.models.associations import task_contexts
from app.models.mixins import SearchableMixin, SoftDeletableMixin, UUIDPrimaryKeyMixin


class Task(Base, UUIDPrimaryKeyMixin, SoftDeletableMixin, SearchableMixin):
    """Task model - the primary actionable items in GTD."""

    __tablename__ = "tasks"

    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, server_default=text("'next'"))
    scheduled_date = Column(Date, nullable=True)
    scheduled_time = Column(Time, nullable=True)
    due_date = Column(Date, nullable=True)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    blocked_by_task_id = Column(
        String(36), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True
    )
    completed_at = Column(TIMESTAMP, nullable=True)
    archived_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    project = relationship("Project", back_populates="tasks", foreign_keys=[project_id])
    contexts = relationship("Context", secondary=task_contexts, backref="tasks")

    @classmethod
    def __declare_last__(cls):
        """Configure self-referential relationship after mapper is configured."""
        cls.blocking_task = relationship(
            "Task", remote_side=[cls.id], foreign_keys=[cls.blocked_by_task_id]
        )

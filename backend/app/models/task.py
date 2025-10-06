"""Task model - Core GTD actionable items."""

from sqlalchemy import TIMESTAMP, Column, Date, ForeignKey, String, Text, Time
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text

from app.db.database import Base
from app.models.associations import task_contexts


class Task(Base):
    """Task model - the primary actionable items in GTD."""

    __tablename__ = "tasks"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, server_default=text("'next'"))
    scheduled_date = Column(Date, nullable=True)
    scheduled_time = Column(Time, nullable=True)
    due_date = Column(Date, nullable=True)
    project_id = Column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True
    )
    blocked_by_task_id = Column(
        UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    completed_at = Column(TIMESTAMP, nullable=True)
    archived_at = Column(TIMESTAMP, nullable=True)
    deleted_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    project = relationship("Project", back_populates="tasks", foreign_keys=[project_id])
    contexts = relationship("Context", secondary=task_contexts, backref="tasks")
    blocking_task = relationship("Task", remote_side=[id], foreign_keys=[blocked_by_task_id])

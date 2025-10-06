"""Note model - Reference material and supporting information."""

from sqlalchemy import TIMESTAMP, Column, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func, text

from app.db.database import Base
from app.models.associations import note_task_links


class Note(Base):
    """Note model for reference material and documentation."""

    __tablename__ = "notes"

    id = Column(UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()"))
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=True)
    project_id = Column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="SET NULL"), nullable=True
    )
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    deleted_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    project = relationship("Project", back_populates="notes")
    tasks = relationship("Task", secondary=note_task_links, backref="notes")

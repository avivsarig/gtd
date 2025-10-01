"""Association tables for many-to-many relationships."""
from sqlalchemy import Table, Column, ForeignKey
from sqlalchemy.dialects.postgresql import UUID

from app.db.database import Base

# Task-Context association table
task_contexts = Table(
    "task_contexts",
    Base.metadata,
    Column("task_id", UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
    Column("context_id", UUID(as_uuid=True), ForeignKey("contexts.id", ondelete="CASCADE"), primary_key=True),
)

# Note-Task association table
note_task_links = Table(
    "note_task_links",
    Base.metadata,
    Column("note_id", UUID(as_uuid=True), ForeignKey("notes.id", ondelete="CASCADE"), primary_key=True),
    Column("task_id", UUID(as_uuid=True), ForeignKey("tasks.id", ondelete="CASCADE"), primary_key=True),
)

"""InboxItem model - Universal capture bucket for GTD."""

from uuid import uuid4

from sqlalchemy import TIMESTAMP, Column, String, Text
from sqlalchemy.sql import func

from app.db.database import Base


class InboxItem(Base):
    """InboxItem model - Universal capture for any thought without classification.

    Core GTD principle: Capture everything without deciding what it is.
    Processing happens later during review (inbox zero workflow).
    """

    __tablename__ = "inbox_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    processed_at = Column(TIMESTAMP, nullable=True)
    deleted_at = Column(TIMESTAMP, nullable=True)

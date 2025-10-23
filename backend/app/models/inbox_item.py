"""InboxItem model - Universal capture bucket for GTD."""

from sqlalchemy import TIMESTAMP, Column, Text
from sqlalchemy.sql import func

from app.db.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin


class InboxItem(Base, UUIDPrimaryKeyMixin):
    """InboxItem model - Universal capture for any thought without classification.

    Core GTD principle: Capture everything without deciding what it is.
    Processing happens later during review (inbox zero workflow).

    Note: InboxItem uses domain-specific timestamps:
    - created_at: When captured (inherited from TimestampMixin would add updated_at, which we don't want)
    - processed_at: When converted to task/note/project (domain-specific, not updated_at)
    - deleted_at: For soft delete support
    """

    __tablename__ = "inbox_items"

    content = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())
    processed_at = Column(TIMESTAMP, nullable=True)
    deleted_at = Column(TIMESTAMP, nullable=True)

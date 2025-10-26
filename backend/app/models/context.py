"""Context model - Tags for filtering tasks by location/tool."""

from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.sql import text

from app.db.database import Base
from app.models.mixins import SoftDeletableMixin, UUIDPrimaryKeyMixin


class Context(Base, UUIDPrimaryKeyMixin, SoftDeletableMixin):
    """Context model for task categorization (@home, @computer, etc.).

    Supports soft-delete to maintain data integrity and allow potential restoration.
    Inherits created_at, updated_at, and deleted_at from SoftDeletableMixin.
    """

    __tablename__ = "contexts"

    name = Column(String(50), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    sort_order = Column(Integer, nullable=False, server_default=text("0"))

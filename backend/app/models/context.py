"""Context model - Tags for filtering tasks by location/tool."""

from sqlalchemy import TIMESTAMP, Column, Integer, String, Text
from sqlalchemy.sql import func, text

from app.db.database import Base
from app.models.mixins import UUIDPrimaryKeyMixin


class Context(Base, UUIDPrimaryKeyMixin):
    """Context model for task categorization (@home, @computer, etc.).

    Note: Context only has created_at timestamp (no updated_at).
    Contexts are relatively static and don't need update tracking.
    """

    __tablename__ = "contexts"

    name = Column(String(50), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    sort_order = Column(Integer, nullable=False, server_default=text("0"))
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

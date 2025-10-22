"""Context model - Tags for filtering tasks by location/tool."""

from uuid import uuid4

from sqlalchemy import TIMESTAMP, Column, Integer, String, Text
from sqlalchemy.sql import func, text

from app.db.database import Base


class Context(Base):
    """Context model for task categorization (@home, @computer, etc.)."""

    __tablename__ = "contexts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid4()))
    name = Column(String(50), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    sort_order = Column(Integer, nullable=False, server_default=text("0"))
    created_at = Column(TIMESTAMP, nullable=False, server_default=func.now())

"""Context schemas for API request/response validation."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class ContextBase(BaseModel):
    """Base schema for context data."""

    name: str = Field(
        ..., min_length=1, max_length=50, description="Context name (e.g., @home, @computer)"
    )
    description: str | None = Field(None, description="Description of when to use this context")
    icon: str | None = Field(None, max_length=50, description="Icon identifier for UI display")
    sort_order: int = Field(0, ge=0, description="Sort order for UI display")


class ContextCreate(ContextBase):
    """Schema for creating a new context."""

    pass


class ContextUpdate(BaseModel):
    """Schema for updating a context. All fields optional."""

    name: str | None = Field(None, min_length=1, max_length=50)
    description: str | None = None
    icon: str | None = Field(None, max_length=50)
    sort_order: int | None = Field(None, ge=0)


class ContextResponse(ContextBase):
    """Schema for context responses."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

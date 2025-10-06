"""Note Pydantic schemas for request/response validation."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class NoteCreate(BaseModel):
    """Schema for creating a new note."""

    title: str = Field(..., min_length=1, max_length=200)
    content: str | None = None
    project_id: UUID | None = None


class NoteUpdate(BaseModel):
    """Schema for updating an existing note."""

    title: str | None = Field(None, min_length=1, max_length=200)
    content: str | None = None
    project_id: UUID | None = None


class NoteResponse(BaseModel):
    """Schema for note responses."""

    model_config = {"from_attributes": True}

    id: UUID
    title: str
    content: str | None
    project_id: UUID | None
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime | None = None

"""Note Pydantic schemas for request/response validation."""

from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.base import SoftDeletableResponseBase


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


class NoteResponse(SoftDeletableResponseBase):
    """Schema for note responses."""

    title: str
    content: str | None
    project_id: UUID | None

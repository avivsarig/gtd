"""InboxItem Pydantic schemas for request/response validation."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class InboxItemCreate(BaseModel):
    """Schema for creating a new inbox item (universal capture)."""

    content: str = Field(..., min_length=1)


class InboxItemUpdate(BaseModel):
    """Schema for updating an existing inbox item."""

    content: str = Field(..., min_length=1)


class InboxItemResponse(BaseModel):
    """Schema for inbox item responses.

    Note: InboxItem has custom timestamps (created_at, processed_at, deleted_at)
    and intentionally does NOT have updated_at, so it doesn't inherit ResponseBase.
    """

    model_config = {"from_attributes": True}

    id: UUID
    content: str
    created_at: datetime
    processed_at: datetime | None = None
    deleted_at: datetime | None = None


class InboxItemCount(BaseModel):
    """Schema for unprocessed inbox count."""

    count: int


# Conversion schemas - when processing inbox items
class ConvertToTaskRequest(BaseModel):
    """Schema for converting inbox item to task."""

    title: str | None = None  # If None, use inbox item content
    description: str | None = None
    project_id: UUID | None = None
    scheduled_date: str | None = None  # ISO date string


class ConvertToNoteRequest(BaseModel):
    """Schema for converting inbox item to note."""

    title: str | None = None  # If None, use first line of content
    content: str | None = None  # If None, use inbox item content
    project_id: UUID | None = None


class ConvertToProjectRequest(BaseModel):
    """Schema for converting inbox item to project."""

    name: str | None = None  # If None, use inbox item content
    outcome_statement: str | None = None

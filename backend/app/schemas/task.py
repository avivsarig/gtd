"""Task Pydantic schemas for request/response validation."""
from datetime import datetime, date, time
from enum import Enum
from uuid import UUID
from pydantic import BaseModel, Field, field_validator


class TaskStatus(str, Enum):
    """Valid task statuses following GTD methodology."""
    NEXT = "next"
    WAITING = "waiting"
    SOMEDAY = "someday"


class TaskCreate(BaseModel):
    """Schema for creating a new task."""
    title: str = Field(..., min_length=1, max_length=500)
    description: str | None = None
    status: TaskStatus = TaskStatus.NEXT
    scheduled_date: date | None = None
    scheduled_time: time | None = None
    due_date: date | None = None
    project_id: UUID | None = None
    blocked_by_task_id: UUID | None = None


class TaskUpdate(BaseModel):
    """Schema for updating an existing task."""
    title: str | None = Field(None, min_length=1, max_length=500)
    description: str | None = None
    status: TaskStatus | None = None
    scheduled_date: date | None = None
    scheduled_time: time | None = None
    due_date: date | None = None
    project_id: UUID | None = None
    blocked_by_task_id: UUID | None = None


class TaskResponse(BaseModel):
    """Schema for task responses."""
    model_config = {"from_attributes": True}

    id: UUID
    title: str
    description: str | None
    status: str
    scheduled_date: date | None = None
    scheduled_time: time | None = None
    due_date: date | None = None
    project_id: UUID | None = None
    blocked_by_task_id: UUID | None = None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None
    archived_at: datetime | None = None


class BulkStatusUpdate(BaseModel):
    """Schema for bulk status updates."""
    task_ids: list[UUID] = Field(..., min_length=1)
    status: TaskStatus


class BulkStatusUpdateResponse(BaseModel):
    """Response for bulk status updates."""
    updated_count: int
    task_ids: list[UUID]

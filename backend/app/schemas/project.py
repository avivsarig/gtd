"""Project Pydantic schemas for request/response validation."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class ProjectStatus(str, Enum):
    """Valid project statuses."""

    ACTIVE = "active"
    ON_HOLD = "on_hold"
    COMPLETED = "completed"


class ProjectCreate(BaseModel):
    """Schema for creating a new project."""

    name: str = Field(..., min_length=1, max_length=200)
    outcome_statement: str | None = None
    status: ProjectStatus = ProjectStatus.ACTIVE
    parent_project_id: UUID | None = None


class ProjectUpdate(BaseModel):
    """Schema for updating an existing project."""

    name: str | None = Field(None, min_length=1, max_length=200)
    outcome_statement: str | None = None
    status: ProjectStatus | None = None
    parent_project_id: UUID | None = None


class ProjectResponse(BaseModel):
    """Schema for project responses."""

    model_config = {"from_attributes": True}

    id: UUID
    name: str
    outcome_statement: str | None
    status: str
    parent_project_id: UUID | None
    created_at: datetime
    updated_at: datetime
    completed_at: datetime | None = None
    archived_at: datetime | None = None
    last_activity_at: datetime | None = None


class ProjectWithStats(ProjectResponse):
    """Project response with task statistics."""

    task_count: int = 0
    completed_task_count: int = 0
    next_task_count: int = 0

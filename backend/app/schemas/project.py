"""Project Pydantic schemas for request/response validation."""

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.base import ResponseBase


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


class ProjectResponse(ResponseBase):
    """Schema for project responses."""

    name: str
    outcome_statement: str | None
    status: str
    parent_project_id: UUID | None
    completed_at: datetime | None = None
    archived_at: datetime | None = None
    last_activity_at: datetime | None = None


class ProjectStats(BaseModel):
    """Task statistics for a project."""

    task_count: int = 0
    completed_task_count: int = 0
    next_task_count: int = 0


class ProjectWithStats(ResponseBase):
    """Project response with task statistics (flattened composition)."""

    # Project fields
    name: str
    outcome_statement: str | None
    status: str
    parent_project_id: UUID | None
    completed_at: datetime | None = None
    archived_at: datetime | None = None
    last_activity_at: datetime | None = None

    # Statistics fields
    task_count: int = 0
    completed_task_count: int = 0
    next_task_count: int = 0

    @classmethod
    def from_project_and_stats(cls, project: ProjectResponse, stats: dict) -> "ProjectWithStats":
        """
        Factory method to construct ProjectWithStats from ProjectResponse and stats dict.

        Args:
            project: ProjectResponse instance
            stats: Dictionary with task_count, completed_task_count, next_task_count

        Returns:
            ProjectWithStats instance
        """
        return cls(**project.model_dump(), **stats)

"""Project repository - Data access layer for Project operations."""

from uuid import UUID

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models.project import Project
from app.models.task import Task
from app.repositories.base_repository import BaseRepository
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.schemas.task import TaskStatus


class ProjectRepository(BaseRepository[Project, ProjectCreate, ProjectUpdate]):
    """Repository for Project entity with task statistics."""

    def __init__(self):
        """Initialize ProjectRepository with Project model."""
        super().__init__(Project)

    def get_all(self, db: Session, include_deleted: bool = False) -> list[Project]:
        """Get all projects.

        Args:
            db: Database session
            include_deleted: Whether to include soft-deleted projects

        Returns:
            List of Project objects ordered by created_at descending
        """
        query = db.query(Project)

        if not include_deleted:
            query = query.filter(Project.deleted_at.is_(None))

        return query.order_by(Project.created_at.desc()).all()

    def get_task_stats(self, db: Session, project_id: UUID) -> dict:
        """Get task statistics for a project.

        Args:
            db: Database session
            project_id: UUID of the project

        Returns:
            Dictionary with task_count, completed_task_count, next_task_count
        """
        project_id_str = self._uuid_to_str(project_id)
        total = (
            db.query(func.count(Task.id))
            .filter(Task.project_id == project_id_str, Task.deleted_at.is_(None))
            .scalar()
            or 0
        )

        completed = (
            db.query(func.count(Task.id))
            .filter(
                Task.project_id == project_id_str,
                Task.completed_at.isnot(None),
                Task.deleted_at.is_(None),
            )
            .scalar()
            or 0
        )

        next_tasks = (
            db.query(func.count(Task.id))
            .filter(
                Task.project_id == project_id_str,
                Task.status == TaskStatus.NEXT.value,
                Task.completed_at.is_(None),
                Task.deleted_at.is_(None),
            )
            .scalar()
            or 0
        )

        return {
            "task_count": total,
            "completed_task_count": completed,
            "next_task_count": next_tasks,
        }

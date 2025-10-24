"""Project repository - Data access layer for Project operations."""

from datetime import datetime
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

    def update(self, db: Session, project: Project, project_data: ProjectUpdate) -> Project:
        """Update an existing project.

        Args:
            db: Database session
            project: Existing project object
            project_data: Update data

        Returns:
            Updated Project object
        """
        update_dict = project_data.model_dump(exclude_unset=True)

        for field, value in update_dict.items():
            setattr(project, field, value)

        project.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(project)
        return project

    def soft_delete(self, db: Session, project: Project) -> Project:
        """Soft delete a project by setting deleted_at timestamp.

        Args:
            db: Database session
            project: Project to delete

        Returns:
            Deleted Project object
        """
        project.deleted_at = datetime.utcnow()
        db.commit()
        db.refresh(project)
        return project

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
            .filter(Task.project_id == project_id_str, Task.deleted_at == None)  # noqa: E712
            .scalar()
            or 0
        )

        completed = (
            db.query(func.count(Task.id))
            .filter(
                Task.project_id == project_id_str,
                Task.completed_at != None,  # noqa: E712
                Task.deleted_at == None,  # noqa: E712
            )
            .scalar()
            or 0
        )

        next_tasks = (
            db.query(func.count(Task.id))
            .filter(
                Task.project_id == project_id_str,
                Task.status == TaskStatus.NEXT.value,
                Task.completed_at == None,  # noqa: E712
                Task.deleted_at == None,  # noqa: E712
            )
            .scalar()
            or 0
        )

        return {
            "task_count": total,
            "completed_task_count": completed,
            "next_task_count": next_tasks,
        }


# Singleton instance for backward compatibility with existing code
_repository = ProjectRepository()

# Export functions at module level for backward compatibility
get_all = _repository.get_all
get_by_id = _repository.get_by_id
create = _repository.create
update = _repository.update
soft_delete = _repository.soft_delete
get_task_stats = _repository.get_task_stats

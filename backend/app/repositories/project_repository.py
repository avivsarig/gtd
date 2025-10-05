"""Project repository - Data access layer for Project operations."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.project import Project
from app.models.task import Task
from app.schemas.project import ProjectCreate, ProjectUpdate


def get_all(db: Session, include_deleted: bool = False) -> List[Project]:
    """
    Get all projects.

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


def get_by_id(db: Session, project_id: UUID) -> Optional[Project]:
    """
    Get a single project by ID.

    Args:
        db: Database session
        project_id: UUID of the project

    Returns:
        Project object if found and not deleted, None otherwise
    """
    return (
        db.query(Project)
        .filter(Project.id == project_id, Project.deleted_at.is_(None))
        .first()
    )


def create(db: Session, project_data: ProjectCreate) -> Project:
    """
    Create a new project.

    Args:
        db: Database session
        project_data: Project creation data

    Returns:
        Created Project object
    """
    project = Project(**project_data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update(db: Session, project: Project, project_data: ProjectUpdate) -> Project:
    """
    Update an existing project.

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


def soft_delete(db: Session, project: Project) -> Project:
    """
    Soft delete a project by setting deleted_at timestamp.

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


def get_task_stats(db: Session, project_id: UUID) -> dict:
    """
    Get task statistics for a project.

    Args:
        db: Database session
        project_id: UUID of the project

    Returns:
        Dictionary with task_count, completed_task_count, next_task_count
    """
    total = db.query(func.count(Task.id)).filter(
        Task.project_id == project_id,
        Task.deleted_at.is_(None)
    ).scalar() or 0

    completed = db.query(func.count(Task.id)).filter(
        Task.project_id == project_id,
        Task.completed_at.isnot(None),
        Task.deleted_at.is_(None)
    ).scalar() or 0

    next_tasks = db.query(func.count(Task.id)).filter(
        Task.project_id == project_id,
        Task.status == "next",
        Task.completed_at.is_(None),
        Task.deleted_at.is_(None)
    ).scalar() or 0

    return {
        "task_count": total,
        "completed_task_count": completed,
        "next_task_count": next_tasks
    }

"""Project controller - Business logic layer for Project operations."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.project import Project
from app.repositories import project_repository
from app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectStatus,
    ProjectUpdate,
    ProjectWithStats,
)


def list_projects(db: Session) -> list[Project]:
    """
    Get list of all active (non-deleted) projects.

    Business logic:
    - Only return non-deleted projects
    - Ordered by created_at descending

    Args:
        db: Database session

    Returns:
        List of Project objects
    """
    return project_repository.get_all(db, include_deleted=False)


def list_projects_with_stats(db: Session) -> list[ProjectWithStats]:
    """
    Get list of projects with task statistics.

    Args:
        db: Database session

    Returns:
        List of ProjectWithStats objects
    """
    projects = project_repository.get_all(db, include_deleted=False)
    result = []

    for project in projects:
        stats = project_repository.get_task_stats(db, project.id)
        result.append(
            ProjectWithStats(**ProjectResponse.model_validate(project).model_dump(), **stats)
        )

    return result


def get_project(db: Session, project_id: UUID) -> Project | None:
    """
    Get a single project by ID.

    Args:
        db: Database session
        project_id: UUID of the project to retrieve

    Returns:
        Project object if found and not deleted, None otherwise
    """
    return project_repository.get_by_id(db, project_id)


def get_project_with_stats(db: Session, project_id: UUID) -> ProjectWithStats | None:
    """
    Get a single project with task statistics.

    Args:
        db: Database session
        project_id: UUID of the project

    Returns:
        ProjectWithStats object if found, None otherwise
    """
    project = project_repository.get_by_id(db, project_id)
    if project is None:
        return None

    stats = project_repository.get_task_stats(db, project.id)
    return ProjectWithStats(**ProjectResponse.model_validate(project).model_dump(), **stats)


def create_project(db: Session, project_data: ProjectCreate) -> Project:
    """
    Create a new project.

    Business logic:
    - Sets initial last_activity_at to creation time

    Args:
        db: Database session
        project_data: Project creation data

    Returns:
        Created Project object
    """
    project = project_repository.create(db, project_data)
    project.last_activity_at = project.created_at
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project_id: UUID, project_data: ProjectUpdate) -> Project | None:
    """
    Update an existing project.

    Business logic:
    - Updates last_activity_at timestamp
    - If status changes to 'completed', sets completed_at

    Args:
        db: Database session
        project_id: UUID of project to update
        project_data: Update data

    Returns:
        Updated Project object if found, None if project doesn't exist
    """
    project = project_repository.get_by_id(db, project_id)
    if project is None:
        return None

    # If changing status to completed, set completed_at
    if project_data.status == ProjectStatus.COMPLETED and project.completed_at is None:
        project.completed_at = datetime.now(UTC)

    # Update last_activity_at
    project.last_activity_at = datetime.now(UTC)

    return project_repository.update(db, project, project_data)


def delete_project(db: Session, project_id: UUID) -> Project | None:
    """
    Soft delete a project.

    Sets deleted_at timestamp without removing from database.

    Args:
        db: Database session
        project_id: UUID of project to delete

    Returns:
        Deleted Project object if found, None if project doesn't exist
    """
    project = project_repository.get_by_id(db, project_id)
    if project is None:
        return None

    return project_repository.soft_delete(db, project)


def complete_project(db: Session, project_id: UUID) -> Project | None:
    """
    Mark a project as completed.

    Business logic:
    - Sets completed_at timestamp
    - Changes status to 'completed'
    - Updates last_activity_at

    Args:
        db: Database session
        project_id: UUID of project to complete

    Returns:
        Completed Project object if found, None if project doesn't exist
    """
    project = project_repository.get_by_id(db, project_id)
    if project is None:
        return None

    project.completed_at = datetime.now(UTC)
    project.status = ProjectStatus.COMPLETED.value
    project.last_activity_at = datetime.now(UTC)
    db.commit()
    db.refresh(project)
    return project

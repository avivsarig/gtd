"""Project controller - Business logic layer for Project operations."""
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectStatus, ProjectWithStats
from app.repositories import project_repository


def list_projects(db: Session) -> List[Project]:
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


def list_projects_with_stats(db: Session) -> List[ProjectWithStats]:
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
        project_dict = {
            "id": project.id,
            "name": project.name,
            "outcome_statement": project.outcome_statement,
            "status": project.status,
            "parent_project_id": project.parent_project_id,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "completed_at": project.completed_at,
            "archived_at": project.archived_at,
            "last_activity_at": project.last_activity_at,
            **stats
        }
        result.append(ProjectWithStats(**project_dict))

    return result


def get_project(db: Session, project_id: UUID) -> Optional[Project]:
    """
    Get a single project by ID.

    Args:
        db: Database session
        project_id: UUID of the project to retrieve

    Returns:
        Project object if found and not deleted, None otherwise
    """
    return project_repository.get_by_id(db, project_id)


def get_project_with_stats(db: Session, project_id: UUID) -> Optional[ProjectWithStats]:
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
    project_dict = {
        "id": project.id,
        "name": project.name,
        "outcome_statement": project.outcome_statement,
        "status": project.status,
        "parent_project_id": project.parent_project_id,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
        "completed_at": project.completed_at,
        "archived_at": project.archived_at,
        "last_activity_at": project.last_activity_at,
        **stats
    }
    return ProjectWithStats(**project_dict)


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


def update_project(db: Session, project_id: UUID, project_data: ProjectUpdate) -> Optional[Project]:
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
        project.completed_at = datetime.utcnow()

    # Update last_activity_at
    project.last_activity_at = datetime.utcnow()

    return project_repository.update(db, project, project_data)


def delete_project(db: Session, project_id: UUID) -> Optional[Project]:
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


def complete_project(db: Session, project_id: UUID) -> Optional[Project]:
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

    project.completed_at = datetime.utcnow()
    project.status = ProjectStatus.COMPLETED.value
    project.last_activity_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project

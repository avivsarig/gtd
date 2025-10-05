"""Projects API endpoints."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.project import (
    ProjectCreate,
    ProjectUpdate,
    ProjectResponse,
    ProjectWithStats
)
from app.controllers import project_controller

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/")
def list_projects(
    with_stats: bool = Query(False, description="Include task statistics"),
    db: Session = Depends(get_db)
) -> List[ProjectResponse] | List[ProjectWithStats]:
    """
    Get all active projects.

    Returns list of all non-deleted projects ordered by created_at descending.
    Use ?with_stats=true to include task counts.
    """
    if with_stats:
        return project_controller.list_projects_with_stats(db)
    return project_controller.list_projects(db)


@router.get("/{project_id}")
def get_project(
    project_id: UUID,
    with_stats: bool = Query(False, description="Include task statistics"),
    db: Session = Depends(get_db)
) -> ProjectResponse | ProjectWithStats:
    """
    Get a single project by ID.

    Use ?with_stats=true to include task counts.

    Raises:
        404: Project not found or has been deleted
    """
    if with_stats:
        project = project_controller.get_project_with_stats(db, project_id)
    else:
        project = project_controller.get_project(db, project_id)

    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    return project


@router.post("/", response_model=ProjectResponse, status_code=201)
def create_project(project_data: ProjectCreate, db: Session = Depends(get_db)):
    """
    Create a new project.

    Business rules applied:
    - Sets initial last_activity_at to creation time
    """
    return project_controller.create_project(db, project_data)


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: UUID,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing project.

    Business rules applied:
    - Updates last_activity_at timestamp
    - If status changes to 'completed', sets completed_at

    Raises:
        404: Project not found or has been deleted
    """
    project = project_controller.update_project(db, project_id, project_data)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: UUID, db: Session = Depends(get_db)):
    """
    Delete (soft delete) a project.

    Soft deletes the project by setting deleted_at timestamp.
    The project remains in database but is excluded from normal queries.

    Raises:
        404: Project not found or already deleted
    """
    project = project_controller.delete_project(db, project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    return None  # 204 No Content


@router.post("/{project_id}/complete", response_model=ProjectResponse)
def complete_project(project_id: UUID, db: Session = Depends(get_db)):
    """
    Mark a project as completed.

    Sets completed_at timestamp and changes status to 'completed'.

    Raises:
        404: Project not found or has been deleted
    """
    project = project_controller.complete_project(db, project_id)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Project with id {project_id} not found"
        )
    return project

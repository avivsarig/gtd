"""Tasks API endpoints."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.controllers import task_controller
from app.db.database import get_db
from app.dependencies import get_task_repository
from app.repositories.protocols import TaskRepositoryProtocol
from app.schemas.task import (
    BulkStatusUpdate,
    BulkStatusUpdateResponse,
    TaskCreate,
    TaskResponse,
    TaskStatus,
    TaskUpdate,
)

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=list[TaskResponse])
def list_tasks(
    status: TaskStatus | None = Query(None, description="Filter by task status"),
    project_id: UUID | None = Query(None, description="Filter by project ID"),
    context_id: UUID | None = Query(None, description="Filter by context ID"),
    scheduled_after: date | None = Query(
        None, description="Filter tasks scheduled after this date"
    ),
    scheduled_before: date | None = Query(
        None, description="Filter tasks scheduled before this date"
    ),
    db: Session = Depends(get_db),
    repository: TaskRepositoryProtocol = Depends(get_task_repository),
):
    """
    Get all active tasks with optional filters.

    Returns list of all non-deleted tasks ordered by created_at descending.

    Filters can be combined:
    - ?status=next - Only tasks with 'next' status
    - ?project_id=<uuid> - Only tasks in specific project
    - ?context_id=<uuid> - Only tasks with specific context
    - ?scheduled_after=2025-01-01 - Tasks scheduled on or after date
    - ?scheduled_before=2025-12-31 - Tasks scheduled on or before date

    Examples:
    - /tasks?status=next&context_id=abc123 - Next actions with specific context
    - /tasks?project_id=xyz789&status=waiting - Waiting tasks in project
    """
    return task_controller.list_tasks(
        db,
        repository,
        status=status,
        project_id=project_id,
        context_id=context_id,
        scheduled_after=scheduled_after,
        scheduled_before=scheduled_before,
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    repository: TaskRepositoryProtocol = Depends(get_task_repository),
):
    """
    Get a single task by ID.

    Raises:
        404: Task not found or has been deleted
    """
    task = task_controller.get_task(db, repository, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with id {task_id} not found"
        )
    return task


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    repository: TaskRepositoryProtocol = Depends(get_task_repository),
):
    """
    Create a new task.

    Business rules applied:
    - Tasks with blocked_by_task_id are automatically set to 'waiting' status
    """
    return task_controller.create_task(db, repository, task_data)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    repository: TaskRepositoryProtocol = Depends(get_task_repository),
):
    """
    Update an existing task.

    Business rules applied:
    - If blocked_by_task_id is set, status is automatically changed to 'waiting'

    Raises:
        404: Task not found or has been deleted
    """
    task = task_controller.update_task(db, repository, task_id, task_data)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with id {task_id} not found"
        )
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    repository: TaskRepositoryProtocol = Depends(get_task_repository),
):
    """
    Delete (archive) a task.

    Soft deletes the task by setting deleted_at timestamp.
    The task remains in database but is excluded from normal queries.

    Raises:
        404: Task not found or already deleted
    """
    task = task_controller.delete_task(db, repository, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with id {task_id} not found"
        )
    return None  # 204 No Content


@router.post("/{task_id}/complete", response_model=TaskResponse)
def complete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    repository: TaskRepositoryProtocol = Depends(get_task_repository),
):
    """
    Mark a task as completed.

    Sets completed_at timestamp. Task remains visible until archived.

    Raises:
        404: Task not found or has been deleted
    """
    task = task_controller.complete_task(db, repository, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with id {task_id} not found"
        )
    return task


@router.post("/{task_id}/uncomplete", response_model=TaskResponse)
def uncomplete_task(
    task_id: UUID,
    db: Session = Depends(get_db),
    repository: TaskRepositoryProtocol = Depends(get_task_repository),
):
    """
    Mark a completed task as incomplete.

    Clears completed_at timestamp.

    Raises:
        404: Task not found or has been deleted
    """
    task = task_controller.uncomplete_task(db, repository, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Task with id {task_id} not found"
        )
    return task


@router.post("/bulk/status", response_model=BulkStatusUpdateResponse)
def bulk_update_status(
    bulk_update: BulkStatusUpdate,
    db: Session = Depends(get_db),
    repository: TaskRepositoryProtocol = Depends(get_task_repository),
):
    """
    Update status for multiple tasks at once.

    Only updates tasks that exist and are not deleted.
    Silently ignores task IDs that don't exist.

    Returns count of updated tasks and their IDs.
    """
    updated_tasks = task_controller.bulk_update_status(
        db, repository, bulk_update.task_ids, bulk_update.status
    )
    return BulkStatusUpdateResponse(
        updated_count=len(updated_tasks), task_ids=[task.id for task in updated_tasks]
    )

"""Tasks API endpoints."""
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.task import (
    TaskCreate,
    TaskUpdate,
    TaskResponse,
    BulkStatusUpdate,
    BulkStatusUpdateResponse
)
from app.controllers import task_controller

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/", response_model=List[TaskResponse])
def list_tasks(db: Session = Depends(get_db)):
    """
    Get all active tasks.

    Returns list of all non-deleted tasks ordered by created_at descending.
    """
    return task_controller.list_tasks(db)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: UUID, db: Session = Depends(get_db)):
    """
    Get a single task by ID.

    Raises:
        404: Task not found or has been deleted
    """
    task = task_controller.get_task(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    return task


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """
    Create a new task.

    Business rules applied:
    - Tasks with blocked_by_task_id are automatically set to 'waiting' status
    """
    return task_controller.create_task(db, task_data)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: UUID, task_data: TaskUpdate, db: Session = Depends(get_db)):
    """
    Update an existing task.

    Business rules applied:
    - If blocked_by_task_id is set, status is automatically changed to 'waiting'

    Raises:
        404: Task not found or has been deleted
    """
    task = task_controller.update_task(db, task_id, task_data)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: UUID, db: Session = Depends(get_db)):
    """
    Delete (archive) a task.

    Soft deletes the task by setting deleted_at timestamp.
    The task remains in database but is excluded from normal queries.

    Raises:
        404: Task not found or already deleted
    """
    task = task_controller.delete_task(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    return None  # 204 No Content


@router.post("/{task_id}/complete", response_model=TaskResponse)
def complete_task(task_id: UUID, db: Session = Depends(get_db)):
    """
    Mark a task as completed.

    Sets completed_at timestamp. Task remains visible until archived.

    Raises:
        404: Task not found or has been deleted
    """
    task = task_controller.complete_task(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    return task


@router.post("/{task_id}/uncomplete", response_model=TaskResponse)
def uncomplete_task(task_id: UUID, db: Session = Depends(get_db)):
    """
    Mark a completed task as incomplete.

    Clears completed_at timestamp.

    Raises:
        404: Task not found or has been deleted
    """
    task = task_controller.uncomplete_task(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task with id {task_id} not found"
        )
    return task


@router.post("/bulk/status", response_model=BulkStatusUpdateResponse)
def bulk_update_status(
    bulk_update: BulkStatusUpdate,
    db: Session = Depends(get_db)
):
    """
    Update status for multiple tasks at once.

    Only updates tasks that exist and are not deleted.
    Silently ignores task IDs that don't exist.

    Returns count of updated tasks and their IDs.
    """
    updated_tasks = task_controller.bulk_update_status(
        db,
        bulk_update.task_ids,
        bulk_update.status
    )
    return BulkStatusUpdateResponse(
        updated_count=len(updated_tasks),
        task_ids=[task.id for task in updated_tasks]
    )

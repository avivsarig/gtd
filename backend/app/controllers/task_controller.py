"""Task controller - Business logic layer for Task operations."""
from typing import List
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate
from app.repositories import task_repository


def list_tasks(db: Session) -> List[Task]:
    """
    Get list of all active (non-deleted) tasks.

    Business logic:
    - Only return non-deleted tasks
    - Ordered by created_at descending

    Args:
        db: Database session

    Returns:
        List of Task objects
    """
    return task_repository.get_all(db, include_deleted=False)


def create_task(db: Session, task_data: TaskCreate) -> Task:
    """
    Create a new task with business logic validation.

    Business logic:
    - If task has blocked_by_task_id set, automatically set status to 'waiting'
    - Otherwise use the provided status (defaults to 'next')

    Args:
        db: Database session
        task_data: Task creation data

    Returns:
        Created Task object
    """
    # Apply business rule: blocked tasks should be in 'waiting' status
    if task_data.blocked_by_task_id is not None:
        task_data.status = "waiting"

    return task_repository.create(db, task_data)

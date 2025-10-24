"""Task controller - Business logic layer for Task operations."""

from datetime import date, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.task import Task
from app.repositories import task_repository
from app.schemas.task import TaskCreate, TaskStatus, TaskUpdate


def list_tasks(
    db: Session,
    status: TaskStatus | None = None,
    project_id: UUID | None = None,
    context_id: UUID | None = None,
    scheduled_after: date | None = None,
    scheduled_before: date | None = None,
) -> list[Task]:
    """
    Get list of all active (non-deleted) tasks with optional filters.

    Business logic:
    - Only return non-deleted tasks
    - Ordered by created_at descending
    - Apply filters as specified

    Args:
        db: Database session
        status: Filter by task status (next/waiting/someday)
        project_id: Filter by project ID
        context_id: Filter by context ID
        scheduled_after: Filter tasks scheduled after this date
        scheduled_before: Filter tasks scheduled before this date

    Returns:
        List of Task objects matching filters
    """
    return task_repository.get_all(
        db,
        include_deleted=False,
        status=status,
        project_id=project_id,
        context_id=context_id,
        scheduled_after=scheduled_after,
        scheduled_before=scheduled_before,
    )


def get_task(db: Session, task_id: UUID) -> Task | None:
    """
    Get a single task by ID.

    Args:
        db: Database session
        task_id: UUID of the task to retrieve

    Returns:
        Task object if found and not deleted, None otherwise
    """
    return task_repository.get_by_id(db, task_id)


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
        task_data.status = TaskStatus.WAITING

    return task_repository.create(db, task_data)


def update_task(db: Session, task_id: UUID, task_data: TaskUpdate) -> Task | None:
    """
    Update an existing task with business logic.

    Business logic:
    - If blocked_by_task_id is being set, automatically set status to 'waiting'
    - If blocked_by_task_id is being cleared, don't auto-change status

    Args:
        db: Database session
        task_id: UUID of task to update
        task_data: Update data

    Returns:
        Updated Task object if found, None if task doesn't exist
    """
    # First, get the existing task
    task = task_repository.get_by_id(db, task_id)
    if task is None:
        return None

    # Apply business rule: if setting a blocker, move to waiting
    if task_data.blocked_by_task_id is not None:
        task_data.status = TaskStatus.WAITING

    return task_repository.update(db, task, task_data)


def delete_task(db: Session, task_id: UUID) -> Task | None:
    """
    Soft delete a task (archive).

    Sets deleted_at timestamp without removing from database.
    Deleted tasks are excluded from normal queries but remain searchable.

    Args:
        db: Database session
        task_id: UUID of task to delete

    Returns:
        Deleted Task object if found, None if task doesn't exist
    """
    task = task_repository.get_by_id(db, task_id)
    if task is None:
        return None

    return task_repository.soft_delete(db, task)


def _update_task_field(
    db: Session, task_id: UUID, field_name: str, field_value: datetime | None
) -> Task | None:
    """
    Update a single field on a task.

    Helper function to reduce duplication in simple field updates.

    Args:
        db: Database session
        task_id: UUID of task to update
        field_name: Name of the field to update
        field_value: New value for the field

    Returns:
        Updated Task object if found, None if task doesn't exist
    """
    task = task_repository.get_by_id(db, task_id)
    if task is None:
        return None

    setattr(task, field_name, field_value)
    db.commit()
    db.refresh(task)
    return task


def complete_task(db: Session, task_id: UUID) -> Task | None:
    """
    Mark a task as completed.

    Business logic:
    - Sets completed_at timestamp to current time
    - Task remains visible in lists until archived

    Args:
        db: Database session
        task_id: UUID of task to complete

    Returns:
        Completed Task object if found, None if task doesn't exist
    """
    return _update_task_field(db, task_id, "completed_at", datetime.utcnow())


def uncomplete_task(db: Session, task_id: UUID) -> Task | None:
    """
    Mark a completed task as incomplete.

    Business logic:
    - Clears completed_at timestamp

    Args:
        db: Database session
        task_id: UUID of task to uncomplete

    Returns:
        Task object if found, None if task doesn't exist
    """
    return _update_task_field(db, task_id, "completed_at", None)


def bulk_update_status(db: Session, task_ids: list[UUID], status: TaskStatus) -> list[Task]:
    """
    Update status for multiple tasks at once.

    Business logic:
    - Only updates tasks that exist and are not deleted
    - Ignores task_ids that don't exist (no error)

    Args:
        db: Database session
        task_ids: List of task UUIDs to update
        status: New status to apply

    Returns:
        List of updated Task objects
    """
    updated_tasks = []
    for task_id in task_ids:
        task = task_repository.get_by_id(db, task_id)
        if task is not None:
            task.status = status.value
            task.updated_at = datetime.utcnow()
            updated_tasks.append(task)

    db.commit()
    for task in updated_tasks:
        db.refresh(task)

    return updated_tasks

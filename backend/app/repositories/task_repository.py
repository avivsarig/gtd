"""Task repository - Data access layer for Task operations."""
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate


def get_all(db: Session, include_deleted: bool = False) -> List[Task]:
    """
    Get all tasks from database.

    Args:
        db: Database session
        include_deleted: If True, include soft-deleted tasks (default: False)

    Returns:
        List of Task objects ordered by created_at descending
    """
    query = db.query(Task)

    if not include_deleted:
        query = query.filter(Task.deleted_at == None)

    return query.order_by(Task.created_at.desc()).all()


def get_by_id(db: Session, task_id: UUID) -> Optional[Task]:
    """
    Get a task by its ID.

    Args:
        db: Database session
        task_id: UUID of the task

    Returns:
        Task object if found, None otherwise
    """
    return db.query(Task).filter(Task.id == task_id, Task.deleted_at == None).first()


def create(db: Session, task_data: TaskCreate) -> Task:
    """
    Create a new task in the database.

    Args:
        db: Database session
        task_data: Task creation data

    Returns:
        Created Task object with all fields populated
    """
    db_task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status,
        scheduled_date=task_data.scheduled_date,
        scheduled_time=task_data.scheduled_time,
        due_date=task_data.due_date,
        project_id=task_data.project_id,
        blocked_by_task_id=task_data.blocked_by_task_id,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update(db: Session, task: Task, task_data: TaskUpdate) -> Task:
    """
    Update an existing task in the database.

    Args:
        db: Database session
        task: Existing Task object to update
        task_data: Update data (only non-None fields are updated)

    Returns:
        Updated Task object
    """
    # Update only fields that are not None
    update_dict = task_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)
    return task


def soft_delete(db: Session, task: Task) -> Task:
    """
    Soft delete a task by setting deleted_at timestamp.

    Args:
        db: Database session
        task: Task object to delete

    Returns:
        Task object with deleted_at set
    """
    from datetime import datetime

    task.deleted_at = datetime.now()
    db.commit()
    db.refresh(task)
    return task

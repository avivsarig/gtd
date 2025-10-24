"""Task repository - Data access layer for Task operations."""

from datetime import date, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.associations import task_contexts
from app.models.task import Task
from app.repositories.base_repository import BaseRepository
from app.schemas.task import TaskCreate, TaskStatus, TaskUpdate


class TaskRepository(BaseRepository[Task, TaskCreate, TaskUpdate]):
    """Repository for Task entity with GTD-specific operations."""

    def __init__(self):
        """Initialize TaskRepository with Task model."""
        super().__init__(Task)

    def get_all(
        self,
        db: Session,
        include_deleted: bool = False,
        status: TaskStatus | None = None,
        project_id: UUID | None = None,
        context_id: UUID | None = None,
        scheduled_after: date | None = None,
        scheduled_before: date | None = None,
    ) -> list[Task]:
        """Get all tasks from database with optional filters.

        Args:
            db: Database session
            include_deleted: If True, include soft-deleted tasks (default: False)
            status: Filter by task status (next/waiting/someday)
            project_id: Filter by project ID
            context_id: Filter by context ID (tasks with this context)
            scheduled_after: Filter tasks scheduled after this date (inclusive)
            scheduled_before: Filter tasks scheduled before this date (inclusive)

        Returns:
            List of Task objects ordered by created_at descending
        """
        query = db.query(Task)

        if not include_deleted:
            query = query.filter(Task.deleted_at.is_(None))

        # Apply filters
        if status is not None:
            query = query.filter(Task.status == status.value)

        if project_id is not None:
            query = query.filter(Task.project_id == self._uuid_to_str(project_id))

        if context_id is not None:
            # Join with task_contexts association table
            query = query.join(task_contexts).filter(
                task_contexts.c.context_id == self._uuid_to_str(context_id)
            )

        if scheduled_after is not None:
            query = query.filter(Task.scheduled_date >= scheduled_after)

        if scheduled_before is not None:
            query = query.filter(Task.scheduled_date <= scheduled_before)

        return query.order_by(Task.created_at.desc()).all()

    def create(self, db: Session, task_data: TaskCreate) -> Task:
        """Create a new task in the database.

        Args:
            db: Database session
            task_data: Task creation data

        Returns:
            Created Task object with all fields populated
        """
        db_task = Task(
            title=task_data.title,
            description=task_data.description,
            status=task_data.status.value,
            scheduled_date=task_data.scheduled_date,
            scheduled_time=task_data.scheduled_time,
            due_date=task_data.due_date,
            project_id=self._uuid_to_str(task_data.project_id),
            blocked_by_task_id=self._uuid_to_str(task_data.blocked_by_task_id),
        )
        db.add(db_task)
        db.commit()
        db.refresh(db_task)
        return db_task

    def update(self, db: Session, task: Task, task_data: TaskUpdate) -> Task:
        """Update an existing task in the database.

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
            # Convert UUID fields to strings for SQLite compatibility
            if field in ("project_id", "blocked_by_task_id") and value is not None:
                value = self._uuid_to_str(value)
            # Convert status enum to its string value
            elif field == "status" and value is not None:
                value = value.value
            setattr(task, field, value)

        db.commit()
        db.refresh(task)
        return task

    def soft_delete(self, db: Session, task: Task) -> Task:
        """Soft delete a task by setting deleted_at timestamp.

        Args:
            db: Database session
            task: Task object to delete

        Returns:
            Task object with deleted_at set
        """
        task.deleted_at = datetime.now()
        db.commit()
        db.refresh(task)
        return task


# Singleton instance for backward compatibility with existing code
_repository = TaskRepository()

# Export functions at module level for backward compatibility
get_all = _repository.get_all
get_by_id = _repository.get_by_id
create = _repository.create
update = _repository.update
soft_delete = _repository.soft_delete

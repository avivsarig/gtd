"""InboxItem controller - Business logic layer for InboxItem operations."""

from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.controllers import note_controller, project_controller, task_controller
from app.models.inbox_item import InboxItem
from app.models.note import Note
from app.models.project import Project
from app.models.task import Task
from app.repositories.protocols import (
    InboxRepositoryProtocol,
    NoteRepositoryProtocol,
    ProjectRepositoryProtocol,
    TaskRepositoryProtocol,
)
from app.schemas.inbox import (
    ConvertToNoteRequest,
    ConvertToProjectRequest,
    ConvertToTaskRequest,
    InboxItemCreate,
    InboxItemUpdate,
)
from app.schemas.note import NoteCreate
from app.schemas.project import ProjectCreate
from app.schemas.task import TaskCreate


def list_inbox_items(
    db: Session, repository: InboxRepositoryProtocol, include_processed: bool = False
) -> list[InboxItem]:
    """
    Get list of inbox items.

    Business logic:
    - By default, only return unprocessed items (processed_at IS NULL)
    - Always exclude deleted items
    - Ordered oldest first for processing workflow

    Args:
        db: Database session
        repository: Inbox repository instance
        include_processed: If True, include processed items (default: False)

    Returns:
        List of InboxItem objects
    """
    return repository.get_all(db, include_processed=include_processed, include_deleted=False)


def get_inbox_item(
    db: Session, repository: InboxRepositoryProtocol, item_id: UUID
) -> InboxItem | None:
    """
    Get a single inbox item by ID.

    Args:
        db: Database session
        repository: Inbox repository instance
        item_id: UUID of the inbox item to retrieve

    Returns:
        InboxItem object if found and not deleted, None otherwise
    """
    return repository.get_by_id(db, item_id)


def create_inbox_item(
    db: Session, repository: InboxRepositoryProtocol, item_data: InboxItemCreate
) -> InboxItem:
    """
    Create a new inbox item (universal capture).

    Business logic:
    - No validation beyond content required
    - Auto-timestamp creation
    - Defaults to unprocessed (processed_at = NULL)

    Args:
        db: Database session
        repository: Inbox repository instance
        item_data: Inbox item creation data

    Returns:
        Created InboxItem object
    """
    return repository.create(db, item_data)


def update_inbox_item(
    db: Session, repository: InboxRepositoryProtocol, item_id: UUID, item_data: InboxItemUpdate
) -> InboxItem | None:
    """
    Update an existing inbox item.

    Args:
        db: Database session
        repository: Inbox repository instance
        item_id: UUID of inbox item to update
        item_data: Update data

    Returns:
        Updated InboxItem object if found, None if item doesn't exist
    """
    item = repository.get_by_id(db, item_id)
    if not item:
        return None

    return repository.update(db, item, item_data)


def delete_inbox_item(
    db: Session, repository: InboxRepositoryProtocol, item_id: UUID
) -> InboxItem | None:
    """
    Soft delete an inbox item.

    Business logic:
    - Sets deleted_at timestamp
    - Item remains in database for audit trail

    Args:
        db: Database session
        repository: Inbox repository instance
        item_id: UUID of inbox item to delete

    Returns:
        Deleted InboxItem object if found, None if item doesn't exist
    """
    item = repository.get_by_id(db, item_id)
    if not item:
        return None

    return repository.soft_delete(db, item)


def convert_to_task(
    db: Session,
    inbox_repository: InboxRepositoryProtocol,
    task_repository: TaskRepositoryProtocol,
    item_id: UUID,
    convert_data: ConvertToTaskRequest,
) -> Task | None:
    """
    Convert an inbox item to a task (GTD processing workflow).

    Business logic:
    1. Create new task with content from inbox item
    2. Mark inbox item as processed (sets processed_at timestamp)
    3. Use provided fields or default to inbox content
    4. Task defaults to 'next' status

    Args:
        db: Database session
        inbox_repository: Inbox repository instance
        task_repository: Task repository instance
        item_id: UUID of inbox item to convert
        convert_data: Optional task fields (title, description, project_id, etc.)

    Returns:
        Created Task object if successful, None if inbox item doesn't exist
    """
    item = inbox_repository.get_by_id(db, item_id)
    if not item:
        return None

    # Build task data from inbox item + conversion request
    task_data = TaskCreate(
        title=convert_data.title or item.content,
        description=convert_data.description,
        project_id=convert_data.project_id,
        scheduled_date=(
            date.fromisoformat(convert_data.scheduled_date) if convert_data.scheduled_date else None
        ),
    )

    # Create the task
    task = task_controller.create_task(db, task_repository, task_data)

    # Mark inbox item as processed
    inbox_repository.mark_processed(db, item)

    return task


def convert_to_note(
    db: Session,
    inbox_repository: InboxRepositoryProtocol,
    note_repository: NoteRepositoryProtocol,
    item_id: UUID,
    convert_data: ConvertToNoteRequest,
) -> Note | None:
    """
    Convert an inbox item to a note (GTD processing workflow).

    Business logic:
    1. Create new note with content from inbox item
    2. Mark inbox item as processed (sets processed_at timestamp)
    3. If title not provided, use first line or truncated content

    Args:
        db: Database session
        inbox_repository: Inbox repository instance
        note_repository: Note repository instance
        item_id: UUID of inbox item to convert
        convert_data: Optional note fields (title, content, project_id)

    Returns:
        Created Note object if successful, None if inbox item doesn't exist
    """
    item = inbox_repository.get_by_id(db, item_id)
    if not item:
        return None

    # Generate title from content if not provided
    title = convert_data.title
    if not title:
        # Use first line or first 50 chars
        lines = str(item.content).split("\n", 1)
        title = lines[0][:50]

    # Build note data from inbox item + conversion request
    note_data = NoteCreate(
        title=title,
        content=convert_data.content or item.content,
        project_id=convert_data.project_id,
    )

    # Create the note
    note = note_controller.create_note(db, note_repository, note_data)

    # Mark inbox item as processed
    inbox_repository.mark_processed(db, item)

    return note


def convert_to_project(
    db: Session,
    inbox_repository: InboxRepositoryProtocol,
    project_repository: ProjectRepositoryProtocol,
    item_id: UUID,
    convert_data: ConvertToProjectRequest,
) -> Project | None:
    """
    Convert an inbox item to a project (GTD processing workflow).

    Business logic:
    1. Create new project with name from inbox item
    2. Mark inbox item as processed (sets processed_at timestamp)
    3. Use inbox content as project name if not provided

    Args:
        db: Database session
        inbox_repository: Inbox repository instance
        project_repository: Project repository instance
        item_id: UUID of inbox item to convert
        convert_data: Optional project fields (name, outcome_statement)

    Returns:
        Created Project object if successful, None if inbox item doesn't exist
    """
    item = inbox_repository.get_by_id(db, item_id)
    if not item:
        return None

    # Build project data from inbox item + conversion request
    project_data = ProjectCreate(
        name=convert_data.name or str(item.content)[:200],
        outcome_statement=convert_data.outcome_statement,
    )

    # Create the project
    project = project_controller.create_project(db, project_repository, project_data)

    # Mark inbox item as processed
    inbox_repository.mark_processed(db, item)

    return project


def get_unprocessed_count(db: Session, repository: InboxRepositoryProtocol) -> int:
    """
    Get count of unprocessed inbox items.

    Business logic:
    - Counts items where processed_at IS NULL and deleted_at IS NULL
    - Used for inbox badge/counter in UI

    Args:
        db: Database session
        repository: Inbox repository instance

    Returns:
        Integer count of unprocessed items
    """
    return repository.count_unprocessed(db)

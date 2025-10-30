"""Note controller - Business logic layer for Note operations."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.note import Note
from app.repositories.protocols import NoteRepositoryProtocol
from app.schemas.note import NoteCreate, NoteUpdate


def list_notes(
    db: Session, repository: NoteRepositoryProtocol, project_id: UUID | None = None
) -> list[Note]:
    """
    Get list of all active (non-deleted) notes.

    Business logic:
    - Only return non-deleted notes
    - Optionally filter by project
    - Ordered by updated_at descending

    Args:
        db: Database session
        repository: Note repository instance
        project_id: Optional project UUID to filter by

    Returns:
        List of Note objects
    """
    return repository.get_all(db, include_deleted=False, project_id=project_id)


def get_note(db: Session, repository: NoteRepositoryProtocol, note_id: UUID) -> Note | None:
    """
    Get a single note by ID.

    Args:
        db: Database session
        repository: Note repository instance
        note_id: UUID of the note to retrieve

    Returns:
        Note object if found and not deleted, None otherwise
    """
    return repository.get_by_id(db, note_id)


def create_note(db: Session, repository: NoteRepositoryProtocol, note_data: NoteCreate) -> Note:
    """
    Create a new note.

    Business logic:
    - Validate note data (handled by Pydantic)
    - Set timestamps automatically

    Args:
        db: Database session
        repository: Note repository instance
        note_data: Note creation data

    Returns:
        Created Note object
    """
    return repository.create(db, note_data)


def update_note(
    db: Session, repository: NoteRepositoryProtocol, note_id: UUID, note_data: NoteUpdate
) -> Note | None:
    """
    Update an existing note.

    Business logic:
    - Only update non-deleted notes
    - Update timestamp is automatically set
    - Only update provided fields

    Args:
        db: Database session
        repository: Note repository instance
        note_id: UUID of the note to update
        note_data: Update data

    Returns:
        Updated Note object if found, None otherwise
    """
    note = repository.get_by_id(db, note_id)
    if not note:
        return None

    return repository.update(db, note, note_data)


def delete_note(db: Session, repository: NoteRepositoryProtocol, note_id: UUID) -> Note | None:
    """
    Soft delete a note.

    Business logic:
    - Only delete non-deleted notes
    - Soft delete sets deleted_at timestamp

    Args:
        db: Database session
        repository: Note repository instance
        note_id: UUID of the note to delete

    Returns:
        Deleted Note object if found, None otherwise
    """
    note = repository.get_by_id(db, note_id)
    if not note:
        return None

    return repository.soft_delete(db, note)

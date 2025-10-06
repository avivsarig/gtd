"""Note controller - Business logic layer for Note operations."""
from typing import List, Optional
from datetime import datetime
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate
from app.repositories import note_repository


def list_notes(db: Session, project_id: UUID | None = None) -> List[Note]:
    """
    Get list of all active (non-deleted) notes.

    Business logic:
    - Only return non-deleted notes
    - Optionally filter by project
    - Ordered by updated_at descending

    Args:
        db: Database session
        project_id: Optional project UUID to filter by

    Returns:
        List of Note objects
    """
    return note_repository.get_all(db, include_deleted=False, project_id=project_id)


def get_note(db: Session, note_id: UUID) -> Optional[Note]:
    """
    Get a single note by ID.

    Args:
        db: Database session
        note_id: UUID of the note to retrieve

    Returns:
        Note object if found and not deleted, None otherwise
    """
    return note_repository.get_by_id(db, note_id)


def create_note(db: Session, note_data: NoteCreate) -> Note:
    """
    Create a new note.

    Business logic:
    - Validate note data (handled by Pydantic)
    - Set timestamps automatically

    Args:
        db: Database session
        note_data: Note creation data

    Returns:
        Created Note object
    """
    return note_repository.create(db, note_data)


def update_note(db: Session, note_id: UUID, note_data: NoteUpdate) -> Optional[Note]:
    """
    Update an existing note.

    Business logic:
    - Only update non-deleted notes
    - Update timestamp is automatically set
    - Only update provided fields

    Args:
        db: Database session
        note_id: UUID of the note to update
        note_data: Update data

    Returns:
        Updated Note object if found, None otherwise
    """
    note = note_repository.get_by_id(db, note_id)
    if not note:
        return None

    return note_repository.update(db, note, note_data)


def delete_note(db: Session, note_id: UUID) -> Optional[Note]:
    """
    Soft delete a note.

    Business logic:
    - Only delete non-deleted notes
    - Soft delete sets deleted_at timestamp

    Args:
        db: Database session
        note_id: UUID of the note to delete

    Returns:
        Deleted Note object if found, None otherwise
    """
    note = note_repository.get_by_id(db, note_id)
    if not note:
        return None

    return note_repository.soft_delete(db, note)

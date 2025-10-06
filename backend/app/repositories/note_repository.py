"""Note repository - Data access layer for Note operations."""
from typing import List, Optional
from uuid import UUID
from datetime import datetime, UTC
from sqlalchemy.orm import Session

from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


def get_all(db: Session, include_deleted: bool = False, project_id: UUID | None = None) -> List[Note]:
    """
    Get all notes, optionally filtered by project.

    Args:
        db: Database session
        include_deleted: Whether to include soft-deleted notes
        project_id: Optional project UUID to filter by

    Returns:
        List of Note objects ordered by updated_at descending
    """
    query = db.query(Note)

    if not include_deleted:
        query = query.filter(Note.deleted_at.is_(None))

    if project_id:
        query = query.filter(Note.project_id == project_id)

    return query.order_by(Note.updated_at.desc()).all()


def get_by_id(db: Session, note_id: UUID) -> Optional[Note]:
    """
    Get a single note by ID.

    Args:
        db: Database session
        note_id: UUID of the note

    Returns:
        Note object if found and not deleted, None otherwise
    """
    return (
        db.query(Note)
        .filter(Note.id == note_id, Note.deleted_at.is_(None))
        .first()
    )


def create(db: Session, note_data: NoteCreate) -> Note:
    """
    Create a new note.

    Args:
        db: Database session
        note_data: Note creation data

    Returns:
        Created Note object
    """
    note = Note(**note_data.model_dump())
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


def update(db: Session, note: Note, note_data: NoteUpdate) -> Note:
    """
    Update an existing note.

    Args:
        db: Database session
        note: Existing note object
        note_data: Update data

    Returns:
        Updated Note object
    """
    update_dict = note_data.model_dump(exclude_unset=True)

    for field, value in update_dict.items():
        setattr(note, field, value)

    note.updated_at = datetime.now(UTC)
    db.commit()
    db.refresh(note)
    return note


def soft_delete(db: Session, note: Note) -> Note:
    """
    Soft delete a note by setting deleted_at timestamp.

    Args:
        db: Database session
        note: Note to delete

    Returns:
        Deleted Note object
    """
    note.deleted_at = datetime.now(UTC)
    db.commit()
    db.refresh(note)
    return note

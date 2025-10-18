"""Note repository - Data access layer for Note operations."""

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


def _uuid_to_str(uuid_val: UUID | None) -> str | None:
    """Convert UUID object to string, or return None if input is None."""
    return str(uuid_val) if uuid_val is not None else None


def get_all(
    db: Session, include_deleted: bool = False, project_id: UUID | None = None
) -> list[Note]:
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
        query = query.filter(Note.deleted_at == None)  # noqa: E712

    if project_id:
        query = query.filter(Note.project_id == _uuid_to_str(project_id))

    return query.order_by(Note.updated_at.desc()).all()


def get_by_id(db: Session, note_id: UUID) -> Note | None:
    """
    Get a single note by ID.

    Args:
        db: Database session
        note_id: UUID of the note

    Returns:
        Note object if found and not deleted, None otherwise
    """
    result = db.query(Note).filter(Note.id == _uuid_to_str(note_id)).first()
    if result and result.deleted_at is None:
        return result
    return None


def create(db: Session, note_data: NoteCreate) -> Note:
    """
    Create a new note.

    Args:
        db: Database session
        note_data: Note creation data

    Returns:
        Created Note object
    """
    note_dict = note_data.model_dump()
    # Convert UUID fields to strings for SQLite compatibility
    if note_dict.get("project_id") is not None:
        note_dict["project_id"] = _uuid_to_str(note_dict["project_id"])
    note = Note(**note_dict)
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
        # Convert UUID fields to strings for SQLite compatibility
        if field == "project_id" and value is not None:
            value = _uuid_to_str(value)
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

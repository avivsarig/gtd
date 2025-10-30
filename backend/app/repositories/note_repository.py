"""Note repository - Data access layer for Note operations."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.note import Note
from app.repositories.base_repository import BaseRepository
from app.schemas.note import NoteCreate, NoteUpdate


class NoteRepository(BaseRepository[Note, NoteCreate, NoteUpdate]):
    """Repository for Note entity with project filtering."""

    def __init__(self):
        """Initialize NoteRepository with Note model."""
        super().__init__(Note)

    def get_all(
        self, db: Session, include_deleted: bool = False, project_id: UUID | None = None
    ) -> list[Note]:
        """Get all notes, optionally filtered by project.

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
            query = query.filter(Note.project_id == self._uuid_to_str(project_id))

        return query.order_by(Note.updated_at.desc()).all()

    def create(self, db: Session, note_data: NoteCreate) -> Note:
        """Create a new note.

        Args:
            db: Database session
            note_data: Note creation data

        Returns:
            Created Note object
        """
        note_dict = note_data.model_dump()
        # Convert UUID fields to strings for SQLite compatibility
        if note_dict.get("project_id") is not None:
            note_dict["project_id"] = self._uuid_to_str(note_dict["project_id"])
        note = Note(**note_dict)
        db.add(note)
        db.commit()
        db.refresh(note)
        return note

    def update(self, db: Session, note: Note, note_data: NoteUpdate) -> Note:
        """Update an existing note.

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
                value = self._uuid_to_str(value)
            setattr(note, field, value)

        # Parent class handles updated_at and commit
        from datetime import UTC, datetime

        note.updated_at = datetime.now(UTC)
        db.commit()
        db.refresh(note)
        return note

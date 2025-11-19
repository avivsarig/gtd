"""Note controller - Business logic layer for Note operations."""

from datetime import date
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.base_controller import BaseController
from app.models.note import Note
from app.repositories.protocols import NoteRepositoryProtocol
from app.schemas.note import NoteCreate, NoteUpdate


class NoteController(BaseController[Note, NoteRepositoryProtocol]):
    """Controller for Note entity with business logic."""

    def list_notes(
        self,
        db: Session,
        project_id: UUID | None = None,
        created_after: date | None = None,
        created_before: date | None = None,
    ) -> list[Note]:
        """Get list of all active (non-deleted) notes.

        Business logic:
        - Only return non-deleted notes
        - Optionally filter by project and date range
        - Ordered by updated_at descending

        Args:
            db: Database session
            project_id: Optional project UUID to filter by
            created_after: Filter notes created on or after this date
            created_before: Filter notes created on or before this date

        Returns:
            List of Note objects
        """
        return self.repository.get_all(
            db,
            include_deleted=False,
            project_id=project_id,
            created_after=created_after,
            created_before=created_before,
        )

    def get_note(self, db: Session, note_id: UUID) -> Note | None:
        """Get a single note by ID.

        Args:
            db: Database session
            note_id: UUID of the note to retrieve

        Returns:
            Note object if found and not deleted, None otherwise
        """
        return self.repository.get_by_id(db, note_id)

    def create_note(self, db: Session, note_data: NoteCreate) -> Note:
        """Create a new note.

        Business logic:
        - Validate note data (handled by Pydantic)
        - Set timestamps automatically

        Args:
            db: Database session
            note_data: Note creation data

        Returns:
            Created Note object
        """
        return self.repository.create(db, note_data)

    def update_note(self, db: Session, note_id: UUID, note_data: NoteUpdate) -> Note | None:
        """Update an existing note.

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
        note = self.repository.get_by_id(db, note_id)
        if not note:
            return None

        return self.repository.update(db, note, note_data)

    def delete_note(self, db: Session, note_id: UUID) -> Note | None:
        """Soft delete a note.

        Business logic:
        - Only delete non-deleted notes
        - Soft delete sets deleted_at timestamp

        Args:
            db: Database session
            note_id: UUID of the note to delete

        Returns:
            Deleted Note object if found, None otherwise
        """
        note = self.repository.get_by_id(db, note_id)
        if not note:
            return None

        return self.repository.soft_delete(db, note)

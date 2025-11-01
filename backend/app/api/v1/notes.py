"""Notes API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.controllers.note_controller import NoteController
from app.db.database import get_db
from app.dependencies import get_note_controller
from app.schemas.note import NoteCreate, NoteResponse, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("/")
def list_notes(
    project_id: UUID | None = Query(None, description="Filter by project ID"),
    db: Session = Depends(get_db),
    controller: NoteController = Depends(get_note_controller),
) -> list[NoteResponse]:
    """
    Get all active notes.

    Returns list of all non-deleted notes ordered by updated_at descending.
    Use ?project_id=<uuid> to filter by project.
    """
    return controller.list_notes(db, project_id=project_id)


@router.get("/{note_id}")
def get_note(
    note_id: UUID,
    db: Session = Depends(get_db),
    controller: NoteController = Depends(get_note_controller),
) -> NoteResponse:
    """
    Get a single note by ID.

    Raises:
        404: Note not found or has been deleted
    """
    note = controller.get_note(db, note_id)
    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Note with id {note_id} not found"
        )
    return note


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_note(
    note: NoteCreate,
    db: Session = Depends(get_db),
    controller: NoteController = Depends(get_note_controller),
) -> NoteResponse:
    """
    Create a new note.

    Requires:
        - title (1-200 characters)

    Optional:
        - content (text)
        - project_id (UUID)
    """
    return controller.create_note(db, note)


@router.put("/{note_id}")
def update_note(
    note_id: UUID,
    note: NoteUpdate,
    db: Session = Depends(get_db),
    controller: NoteController = Depends(get_note_controller),
) -> NoteResponse:
    """
    Update an existing note.

    All fields are optional. Only provided fields will be updated.

    Raises:
        404: Note not found or has been deleted
    """
    updated_note = controller.update_note(db, note_id, note)
    if updated_note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Note with id {note_id} not found"
        )
    return updated_note


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(
    note_id: UUID,
    db: Session = Depends(get_db),
    controller: NoteController = Depends(get_note_controller),
):
    """
    Soft delete a note.

    Sets deleted_at timestamp. Note remains in database but won't appear in queries.

    Raises:
        404: Note not found or has been already deleted
    """
    deleted_note = controller.delete_note(db, note_id)
    if deleted_note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail=f"Note with id {note_id} not found"
        )
    return None

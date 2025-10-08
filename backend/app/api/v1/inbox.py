"""Inbox API endpoints - Universal capture and GTD processing."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.controllers import inbox_controller
from app.db.database import get_db
from app.schemas.inbox import (
    ConvertToNoteRequest,
    ConvertToProjectRequest,
    ConvertToTaskRequest,
    InboxItemCount,
    InboxItemCreate,
    InboxItemResponse,
    InboxItemUpdate,
)
from app.schemas.note import NoteResponse
from app.schemas.project import ProjectResponse
from app.schemas.task import TaskResponse

router = APIRouter(prefix="/inbox", tags=["inbox"])


@router.get("/", response_model=list[InboxItemResponse])
def list_inbox_items(
    include_processed: bool = Query(False, description="Include processed items"),
    db: Session = Depends(get_db),
):
    """
    Get all inbox items.

    By default, returns only unprocessed items (processed_at IS NULL).
    Items are ordered oldest first for processing workflow.

    Args:
        include_processed: If True, include items that have been processed

    Returns:
        List of inbox items
    """
    return inbox_controller.list_inbox_items(db, include_processed=include_processed)


@router.get("/count", response_model=InboxItemCount)
def get_unprocessed_count(db: Session = Depends(get_db)):
    """
    Get count of unprocessed inbox items.

    Used for inbox badge/counter in UI to show pending items.

    Returns:
        Count of unprocessed items (processed_at IS NULL, deleted_at IS NULL)
    """
    count = inbox_controller.get_unprocessed_count(db)
    return InboxItemCount(count=count)


@router.get("/{item_id}", response_model=InboxItemResponse)
def get_inbox_item(item_id: UUID, db: Session = Depends(get_db)):
    """
    Get a single inbox item by ID.

    Raises:
        404: Inbox item not found or has been deleted
    """
    item = inbox_controller.get_inbox_item(db, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inbox item with id {item_id} not found",
        )
    return item


@router.post("/", response_model=InboxItemResponse, status_code=status.HTTP_201_CREATED)
def create_inbox_item(item_data: InboxItemCreate, db: Session = Depends(get_db)):
    """
    Create a new inbox item (universal capture).

    This is the primary GTD capture endpoint - minimal friction, content only.
    Processing happens later during review workflow.

    Args:
        item_data: Inbox item content (only field required)

    Returns:
        Created inbox item
    """
    return inbox_controller.create_inbox_item(db, item_data)


@router.put("/{item_id}", response_model=InboxItemResponse)
def update_inbox_item(
    item_id: UUID, item_data: InboxItemUpdate, db: Session = Depends(get_db)
):
    """
    Update an existing inbox item.

    Raises:
        404: Inbox item not found
    """
    item = inbox_controller.update_inbox_item(db, item_id, item_data)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inbox item with id {item_id} not found",
        )
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inbox_item(item_id: UUID, db: Session = Depends(get_db)):
    """
    Delete an inbox item (soft delete).

    Sets deleted_at timestamp. Item remains in database for audit trail.

    Raises:
        404: Inbox item not found
    """
    item = inbox_controller.delete_inbox_item(db, item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inbox item with id {item_id} not found",
        )
    return None


@router.post("/{item_id}/convert-to-task", response_model=TaskResponse)
def convert_inbox_to_task(
    item_id: UUID,
    convert_data: ConvertToTaskRequest = ConvertToTaskRequest(),
    db: Session = Depends(get_db),
):
    """
    Convert an inbox item to a task (GTD processing workflow).

    Business logic:
    - Creates new task with inbox content
    - Marks inbox item as processed (sets processed_at timestamp)
    - If title not provided, uses inbox content as title
    - Task defaults to 'next' status

    Args:
        item_id: UUID of inbox item to convert
        convert_data: Optional task fields (title, description, project_id, scheduled_date)

    Returns:
        Created task

    Raises:
        404: Inbox item not found
    """
    task = inbox_controller.convert_to_task(db, item_id, convert_data)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inbox item with id {item_id} not found",
        )
    return task


@router.post("/{item_id}/convert-to-note", response_model=NoteResponse)
def convert_inbox_to_note(
    item_id: UUID,
    convert_data: ConvertToNoteRequest = ConvertToNoteRequest(),
    db: Session = Depends(get_db),
):
    """
    Convert an inbox item to a note (GTD processing workflow).

    Business logic:
    - Creates new note with inbox content
    - Marks inbox item as processed (sets processed_at timestamp)
    - If title not provided, uses first line or truncated content

    Args:
        item_id: UUID of inbox item to convert
        convert_data: Optional note fields (title, content, project_id)

    Returns:
        Created note

    Raises:
        404: Inbox item not found
    """
    note = inbox_controller.convert_to_note(db, item_id, convert_data)
    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inbox item with id {item_id} not found",
        )
    return note


@router.post("/{item_id}/convert-to-project", response_model=ProjectResponse)
def convert_inbox_to_project(
    item_id: UUID,
    convert_data: ConvertToProjectRequest = ConvertToProjectRequest(),
    db: Session = Depends(get_db),
):
    """
    Convert an inbox item to a project (GTD processing workflow).

    Business logic:
    - Creates new project with inbox content as name
    - Marks inbox item as processed (sets processed_at timestamp)
    - If name not provided, uses inbox content (truncated to 200 chars)

    Args:
        item_id: UUID of inbox item to convert
        convert_data: Optional project fields (name, outcome_statement)

    Returns:
        Created project

    Raises:
        404: Inbox item not found
    """
    project = inbox_controller.convert_to_project(db, item_id, convert_data)
    if project is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Inbox item with id {item_id} not found",
        )
    return project

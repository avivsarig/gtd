"""Contexts API endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.controllers import context_controller
from app.db.database import get_db
from app.schemas.context import ContextCreate, ContextResponse, ContextUpdate

router = APIRouter(prefix="/contexts", tags=["contexts"])


@router.get("/", response_model=list[ContextResponse])
def list_contexts(db: Session = Depends(get_db)):
    """
    Get all contexts.

    Returns list of all contexts ordered by sort_order, then name.
    """
    return context_controller.list_contexts(db)


@router.get("/{context_id}", response_model=ContextResponse)
def get_context(context_id: UUID, db: Session = Depends(get_db)):
    """
    Get a single context by ID.

    Raises:
        404: Context not found
    """
    context = context_controller.get_context(db, context_id)
    if context is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Context with id {context_id} not found",
        )
    return context


@router.post("/", response_model=ContextResponse, status_code=status.HTTP_201_CREATED)
def create_context(context_data: ContextCreate, db: Session = Depends(get_db)):
    """
    Create a new context.

    Business rules:
    - Context names must be unique

    Raises:
        409: Context name already exists
    """
    return context_controller.create_context(db, context_data)


@router.put("/{context_id}", response_model=ContextResponse)
def update_context(context_id: UUID, context_data: ContextUpdate, db: Session = Depends(get_db)):
    """
    Update an existing context.

    All fields are optional. Only provided fields will be updated.

    Raises:
        404: Context not found
        409: New context name conflicts with existing context
    """
    context = context_controller.update_context(db, context_id, context_data)
    if context is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Context with id {context_id} not found",
        )
    return context


@router.delete("/{context_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_context(context_id: UUID, db: Session = Depends(get_db)):
    """
    Delete a context (hard delete).

    Note: Tasks associated with this context will have the association removed.

    Raises:
        404: Context not found
    """
    context = context_controller.delete_context(db, context_id)
    if context is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Context with id {context_id} not found",
        )
    return None

"""Context controller - Business logic for context management."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.protocols import ContextRepositoryProtocol
from app.schemas.context import ContextCreate, ContextUpdate


def list_contexts(db: Session, repository: ContextRepositoryProtocol):
    """
    Get all contexts.

    Returns contexts ordered by sort_order, then name for consistent UI display.

    Args:
        db: Database session
        repository: Context repository instance

    Returns:
        List of all contexts
    """
    return repository.get_all(db)


def get_context(db: Session, repository: ContextRepositoryProtocol, context_id: UUID):
    """
    Get a single context by ID.

    Args:
        db: Database session
        repository: Context repository instance
        context_id: UUID of context to retrieve

    Returns:
        Context if found, None otherwise
    """
    return repository.get_by_id(db, context_id)


def create_context(db: Session, repository: ContextRepositoryProtocol, context_data: ContextCreate):
    """
    Create a new context.

    Business rules:
    - Context names must be unique (enforced by database constraint)

    Args:
        db: Database session
        repository: Context repository instance
        context_data: Context data from request

    Returns:
        Created context

    Raises:
        HTTPException: If context name already exists
    """
    # Check if context name already exists
    existing = repository.get_by_name(db, context_data.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Context with name '{context_data.name}' already exists",
        )

    return repository.create(db, context_data)


def update_context(
    db: Session,
    repository: ContextRepositoryProtocol,
    context_id: UUID,
    context_data: ContextUpdate,
):
    """
    Update an existing context.

    Business rules:
    - If name is being changed, ensure new name doesn't conflict

    Args:
        db: Database session
        repository: Context repository instance
        context_id: UUID of context to update
        context_data: Updated context data

    Returns:
        Updated context if found, None otherwise

    Raises:
        HTTPException: If new name conflicts with existing context
    """
    # If name is being updated, check for conflicts
    if context_data.name is not None:
        existing = repository.get_by_name(db, context_data.name)
        if existing and existing.id != context_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Context with name '{context_data.name}' already exists",
            )

    return repository.update_by_id(db, context_id, context_data)


def delete_context(db: Session, repository: ContextRepositoryProtocol, context_id: UUID):
    """
    Soft-delete a context.

    Sets deleted_at timestamp instead of removing from database.
    Task associations remain in the database for potential restoration.

    Args:
        db: Database session
        repository: Context repository instance
        context_id: UUID of context to delete

    Returns:
        Soft-deleted context if found, None otherwise
    """
    return repository.delete(db, context_id)

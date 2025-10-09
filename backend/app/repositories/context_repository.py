"""Context repository - Database access layer for contexts."""

from uuid import UUID

from sqlalchemy.orm import Session

from app.models.context import Context
from app.schemas.context import ContextCreate, ContextUpdate


def get_all(db: Session) -> list[Context]:
    """
    Get all contexts ordered by sort_order, then name.

    Args:
        db: Database session

    Returns:
        List of all contexts
    """
    return db.query(Context).order_by(Context.sort_order, Context.name).all()


def get_by_id(db: Session, context_id: UUID) -> Context | None:
    """
    Get a single context by ID.

    Args:
        db: Database session
        context_id: UUID of context to retrieve

    Returns:
        Context if found, None otherwise
    """
    return db.query(Context).filter(Context.id == context_id).first()


def get_by_name(db: Session, name: str) -> Context | None:
    """
    Get a context by name (case-sensitive).

    Args:
        db: Database session
        name: Context name to search for

    Returns:
        Context if found, None otherwise
    """
    return db.query(Context).filter(Context.name == name).first()


def create(db: Session, context_data: ContextCreate) -> Context:
    """
    Create a new context.

    Args:
        db: Database session
        context_data: Context data from request

    Returns:
        Created context
    """
    context = Context(**context_data.model_dump())
    db.add(context)
    db.commit()
    db.refresh(context)
    return context


def update(db: Session, context_id: UUID, context_data: ContextUpdate) -> Context | None:
    """
    Update an existing context.

    Args:
        db: Database session
        context_id: UUID of context to update
        context_data: Updated context data

    Returns:
        Updated context if found, None otherwise
    """
    context = get_by_id(db, context_id)
    if context is None:
        return None

    # Update only provided fields
    update_data = context_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(context, field, value)

    db.commit()
    db.refresh(context)
    return context


def delete(db: Session, context_id: UUID) -> Context | None:
    """
    Delete a context.

    Note: This is a hard delete since contexts don't have soft delete in the schema.
    Consider adding deleted_at if contexts should be retained.

    Args:
        db: Database session
        context_id: UUID of context to delete

    Returns:
        Deleted context if found, None otherwise
    """
    context = get_by_id(db, context_id)
    if context is None:
        return None

    db.delete(context)
    db.commit()
    return context

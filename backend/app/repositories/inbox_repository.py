"""InboxItem repository - Data access layer for InboxItem operations."""

from datetime import datetime, UTC
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.inbox_item import InboxItem
from app.schemas.inbox import InboxItemCreate, InboxItemUpdate


def get_all(db: Session, include_processed: bool = False, include_deleted: bool = False) -> list[InboxItem]:
    """
    Get all inbox items from database.

    Args:
        db: Database session
        include_processed: If True, include processed items (default: False)
        include_deleted: If True, include soft-deleted items (default: False)

    Returns:
        List of InboxItem objects ordered by created_at ascending (oldest first)
    """
    query = db.query(InboxItem)

    if not include_processed:
        query = query.filter(InboxItem.processed_at == None)

    if not include_deleted:
        query = query.filter(InboxItem.deleted_at == None)

    return query.order_by(InboxItem.created_at.asc()).all()


def get_by_id(db: Session, item_id: UUID) -> InboxItem | None:
    """
    Get an inbox item by its ID.

    Args:
        db: Database session
        item_id: UUID of the inbox item

    Returns:
        InboxItem object if found and not deleted, None otherwise
    """
    return db.query(InboxItem).filter(InboxItem.id == item_id, InboxItem.deleted_at == None).first()


def create(db: Session, item_data: InboxItemCreate) -> InboxItem:
    """
    Create a new inbox item in the database.

    Args:
        db: Database session
        item_data: Inbox item creation data

    Returns:
        Created InboxItem object
    """
    db_item = InboxItem(content=item_data.content)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item


def update(db: Session, item: InboxItem, item_data: InboxItemUpdate) -> InboxItem:
    """
    Update an existing inbox item.

    Args:
        db: Database session
        item: InboxItem object to update
        item_data: Updated inbox item data

    Returns:
        Updated InboxItem object
    """
    item.content = item_data.content
    db.commit()
    db.refresh(item)
    return item


def mark_processed(db: Session, item: InboxItem) -> InboxItem:
    """
    Mark an inbox item as processed.

    Args:
        db: Database session
        item: InboxItem object to mark as processed

    Returns:
        Updated InboxItem object with processed_at timestamp
    """
    item.processed_at = datetime.now(UTC)
    db.commit()
    db.refresh(item)
    return item


def soft_delete(db: Session, item: InboxItem) -> InboxItem:
    """
    Soft delete an inbox item by setting deleted_at timestamp.

    Args:
        db: Database session
        item: InboxItem object to delete

    Returns:
        Updated InboxItem object with deleted_at timestamp
    """
    item.deleted_at = datetime.now(UTC)
    db.commit()
    db.refresh(item)
    return item


def count_unprocessed(db: Session) -> int:
    """
    Count unprocessed inbox items (processed_at IS NULL and not deleted).

    Args:
        db: Database session

    Returns:
        Integer count of unprocessed items
    """
    return (
        db.query(InboxItem)
        .filter(InboxItem.processed_at == None, InboxItem.deleted_at == None)
        .count()
    )

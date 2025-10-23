"""InboxItem repository - Data access layer for InboxItem operations."""

from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models.inbox_item import InboxItem
from app.repositories.base_repository import BaseRepository
from app.schemas.inbox import InboxItemCreate, InboxItemUpdate


class InboxRepository(BaseRepository[InboxItem, InboxItemCreate, InboxItemUpdate]):
    """Repository for InboxItem entity with GTD inbox processing operations."""

    def __init__(self):
        """Initialize InboxRepository with InboxItem model."""
        super().__init__(InboxItem)

    def get_all(
        self, db: Session, include_processed: bool = False, include_deleted: bool = False
    ) -> list[InboxItem]:
        """Get all inbox items from database.

        Args:
            db: Database session
            include_processed: If True, include processed items (default: False)
            include_deleted: If True, include soft-deleted items (default: False)

        Returns:
            List of InboxItem objects ordered by created_at ascending (oldest first)
        """
        query = db.query(InboxItem)

        if not include_processed:
            query = query.filter(InboxItem.processed_at == None)  # noqa: E712

        if not include_deleted:
            query = query.filter(InboxItem.deleted_at == None)  # noqa: E712

        return query.order_by(InboxItem.created_at.asc()).all()

    def create(self, db: Session, item_data: InboxItemCreate) -> InboxItem:
        """Create a new inbox item in the database.

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

    def update(self, db: Session, item: InboxItem, item_data: InboxItemUpdate) -> InboxItem:
        """Update an existing inbox item.

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

    def mark_processed(self, db: Session, item: InboxItem) -> InboxItem:
        """Mark an inbox item as processed.

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

    def count_unprocessed(self, db: Session) -> int:
        """Count unprocessed inbox items (processed_at IS NULL and not deleted).

        Args:
            db: Database session

        Returns:
            Integer count of unprocessed items
        """
        return (
            db.query(InboxItem)
            .filter(InboxItem.processed_at == None, InboxItem.deleted_at == None)  # noqa: E712
            .count()
        )


# Singleton instance for backward compatibility with existing code
_repository = InboxRepository()

# Export functions at module level for backward compatibility
get_all = _repository.get_all
get_by_id = _repository.get_by_id
create = _repository.create
update = _repository.update
soft_delete = _repository.soft_delete
mark_processed = _repository.mark_processed
count_unprocessed = _repository.count_unprocessed

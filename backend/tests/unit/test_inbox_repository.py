"""Unit tests for InboxItem repository."""

from datetime import datetime, UTC
from unittest.mock import Mock
from uuid import uuid4

from app.models.inbox_item import InboxItem
from app.repositories import inbox_repository
from app.schemas.inbox import InboxItemCreate, InboxItemUpdate


class TestGetAll:
    """Test get_all() repository method."""

    def test_get_all_empty_database(self):
        """Should return empty list when no inbox items exist."""
        # Mock database session
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.filter.return_value.order_by.return_value.all.return_value = (
            []
        )

        items = inbox_repository.get_all(mock_db)

        assert items == []
        mock_db.query.assert_called_once_with(InboxItem)

    def test_get_all_returns_unprocessed_only_by_default(self):
        """Should return only unprocessed items by default (processed_at IS NULL)."""
        # Create mock items
        item1 = Mock(spec=InboxItem, content="Unprocessed item", processed_at=None)

        # Mock database session
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.filter.return_value.order_by.return_value.all.return_value = [
            item1
        ]

        items = inbox_repository.get_all(mock_db)

        assert len(items) == 1
        assert items[0].content == "Unprocessed item"

    def test_get_all_includes_processed_when_requested(self):
        """Should include processed items when include_processed=True."""
        # Mock database session
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        # When include_processed=True, only one filter call (for deleted_at)
        mock_query.filter.return_value.order_by.return_value.all.return_value = []

        inbox_repository.get_all(mock_db, include_processed=True)

        # Should still query InboxItem
        mock_db.query.assert_called_once_with(InboxItem)

    def test_get_all_orders_by_created_asc(self):
        """Should order items oldest first (created_at ASC) for processing."""
        # This is tested by integration tests, but verify mock setup
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.filter.return_value.order_by.return_value.all.return_value = (
            []
        )

        inbox_repository.get_all(mock_db)

        # Verify order_by was called
        mock_query.filter.return_value.filter.return_value.order_by.assert_called_once()


class TestGetById:
    """Test get_by_id() repository method."""

    def test_get_by_id_found(self):
        """Should return inbox item when found and not deleted."""
        item_id = uuid4()
        mock_item = Mock(spec=InboxItem, id=item_id, content="Test item", deleted_at=None)

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = mock_item

        result = inbox_repository.get_by_id(mock_db, item_id)

        assert result == mock_item
        assert result.content == "Test item"

    def test_get_by_id_not_found(self):
        """Should return None when item not found."""
        item_id = uuid4()

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = None

        result = inbox_repository.get_by_id(mock_db, item_id)

        assert result is None


class TestCreate:
    """Test create() repository method."""

    def test_create_inbox_item(self):
        """Should create and return new inbox item."""
        item_data = InboxItemCreate(content="New inbox thought")

        mock_db = Mock()
        # Simulate database adding ID and timestamp
        def mock_refresh(item):
            item.id = uuid4()
            item.created_at = datetime.now(UTC)
            item.processed_at = None
            item.deleted_at = None

        mock_db.refresh.side_effect = mock_refresh

        result = inbox_repository.create(mock_db, item_data)

        # Verify item was created with correct content
        assert result.content == "New inbox thought"
        assert result.id is not None
        assert result.created_at is not None
        assert result.processed_at is None

        # Verify database operations
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()


class TestUpdate:
    """Test update() repository method."""

    def test_update_inbox_item(self):
        """Should update inbox item content."""
        mock_item = Mock(spec=InboxItem, content="Old content")
        update_data = InboxItemUpdate(content="Updated content")

        mock_db = Mock()

        result = inbox_repository.update(mock_db, mock_item, update_data)

        assert result.content == "Updated content"
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()


class TestMarkProcessed:
    """Test mark_processed() repository method."""

    def test_mark_processed_sets_timestamp(self):
        """Should set processed_at timestamp."""
        mock_item = Mock(spec=InboxItem, processed_at=None)

        mock_db = Mock()

        result = inbox_repository.mark_processed(mock_db, mock_item)

        # Verify processed_at was set (to some datetime)
        assert result.processed_at is not None
        assert isinstance(result.processed_at, datetime)

        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()


class TestSoftDelete:
    """Test soft_delete() repository method."""

    def test_soft_delete_sets_timestamp(self):
        """Should set deleted_at timestamp."""
        mock_item = Mock(spec=InboxItem, deleted_at=None)

        mock_db = Mock()

        result = inbox_repository.soft_delete(mock_db, mock_item)

        # Verify deleted_at was set
        assert result.deleted_at is not None
        assert isinstance(result.deleted_at, datetime)

        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()


class TestCountUnprocessed:
    """Test count_unprocessed() repository method."""

    def test_count_unprocessed_returns_count(self):
        """Should return count of unprocessed items."""
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.count.return_value = 5

        count = inbox_repository.count_unprocessed(mock_db)

        assert count == 5
        mock_db.query.assert_called_once_with(InboxItem)

    def test_count_unprocessed_zero(self):
        """Should return 0 when no unprocessed items."""
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.count.return_value = 0

        count = inbox_repository.count_unprocessed(mock_db)

        assert count == 0

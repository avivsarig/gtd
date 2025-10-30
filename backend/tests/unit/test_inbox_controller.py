"""Unit tests for InboxItem controller."""

from unittest.mock import Mock
from uuid import uuid4

from app.controllers import inbox_controller
from app.models.inbox_item import InboxItem
from app.models.note import Note
from app.models.project import Project
from app.models.task import Task
from app.repositories.protocols import (
    InboxRepositoryProtocol,
    NoteRepositoryProtocol,
    ProjectRepositoryProtocol,
    TaskRepositoryProtocol,
)
from app.schemas.inbox import (
    ConvertToNoteRequest,
    ConvertToProjectRequest,
    ConvertToTaskRequest,
    InboxItemCreate,
)


class TestListInboxItems:
    """Test list_inbox_items() controller method."""

    def test_list_inbox_items_default(self):
        """Should return unprocessed items by default."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_inbox_repo.get_all.return_value = []

        result = inbox_controller.list_inbox_items(mock_db, mock_inbox_repo)

        mock_inbox_repo.get_all.assert_called_once_with(
            mock_db, include_processed=False, include_deleted=False
        )
        assert result == []

    def test_list_inbox_items_include_processed(self):
        """Should include processed items when requested."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_inbox_repo.get_all.return_value = []

        inbox_controller.list_inbox_items(mock_db, mock_inbox_repo, include_processed=True)

        mock_inbox_repo.get_all.assert_called_once_with(
            mock_db, include_processed=True, include_deleted=False
        )


class TestCreateInboxItem:
    """Test create_inbox_item() controller method."""

    def test_create_inbox_item(self):
        """Should create inbox item with minimal data."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        item_data = InboxItemCreate(content="Random thought")
        mock_item = Mock(spec=InboxItem, content="Random thought")
        mock_inbox_repo.create.return_value = mock_item

        result = inbox_controller.create_inbox_item(mock_db, mock_inbox_repo, item_data)

        mock_inbox_repo.create.assert_called_once_with(mock_db, item_data)
        assert result == mock_item


class TestConvertToTask:
    """Test convert_to_task() controller method."""

    def test_convert_to_task_with_defaults(self):
        """Should convert inbox item to task using inbox content as title."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_task_repo = Mock(spec=TaskRepositoryProtocol)
        item_id = uuid4()

        # Mock inbox item
        mock_item = Mock(spec=InboxItem, id=item_id, content="Buy milk")
        mock_inbox_repo.get_by_id.return_value = mock_item

        # Mock created task
        mock_task = Mock(spec=Task, title="Buy milk")
        mock_task_repo.create.return_value = mock_task

        # Convert with no custom data
        convert_data = ConvertToTaskRequest()

        result = inbox_controller.convert_to_task(
            mock_db, mock_inbox_repo, mock_task_repo, item_id, convert_data
        )

        # Verify task was created with inbox content as title
        assert result == mock_task
        mock_task_repo.create.assert_called_once()

        # Verify inbox item was marked as processed
        mock_inbox_repo.mark_processed.assert_called_once_with(mock_db, mock_item)

    def test_convert_to_task_with_custom_title(self):
        """Should use custom title when provided."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_task_repo = Mock(spec=TaskRepositoryProtocol)
        item_id = uuid4()

        mock_item = Mock(spec=InboxItem, id=item_id, content="Original content")
        mock_inbox_repo.get_by_id.return_value = mock_item

        mock_task = Mock(spec=Task, title="Custom title")
        mock_task_repo.create.return_value = mock_task

        convert_data = ConvertToTaskRequest(title="Custom title")

        result = inbox_controller.convert_to_task(
            mock_db, mock_inbox_repo, mock_task_repo, item_id, convert_data
        )

        assert result == mock_task
        mock_inbox_repo.mark_processed.assert_called_once()

    def test_convert_to_task_item_not_found(self):
        """Should return None if inbox item not found."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_task_repo = Mock(spec=TaskRepositoryProtocol)
        item_id = uuid4()

        mock_inbox_repo.get_by_id.return_value = None

        convert_data = ConvertToTaskRequest()
        result = inbox_controller.convert_to_task(
            mock_db, mock_inbox_repo, mock_task_repo, item_id, convert_data
        )

        assert result is None


class TestConvertToNote:
    """Test convert_to_note() controller method."""

    def test_convert_to_note_generates_title(self):
        """Should generate title from first line when not provided."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_note_repo = Mock(spec=NoteRepositoryProtocol)
        item_id = uuid4()

        # Mock inbox item with multi-line content
        mock_item = Mock(
            spec=InboxItem,
            id=item_id,
            content="Meeting notes\nAttendees: Alice, Bob\nTopic: Q4 planning",
        )
        mock_inbox_repo.get_by_id.return_value = mock_item

        mock_note = Mock(spec=Note, title="Meeting notes")
        mock_note_repo.create.return_value = mock_note

        convert_data = ConvertToNoteRequest()

        result = inbox_controller.convert_to_note(
            mock_db, mock_inbox_repo, mock_note_repo, item_id, convert_data
        )

        assert result == mock_note
        mock_inbox_repo.mark_processed.assert_called_once_with(mock_db, mock_item)

    def test_convert_to_note_with_custom_title(self):
        """Should use custom title when provided."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_note_repo = Mock(spec=NoteRepositoryProtocol)
        item_id = uuid4()

        mock_item = Mock(spec=InboxItem, id=item_id, content="Original content")
        mock_inbox_repo.get_by_id.return_value = mock_item

        mock_note = Mock(spec=Note, title="Custom Note Title")
        mock_note_repo.create.return_value = mock_note

        convert_data = ConvertToNoteRequest(title="Custom Note Title")

        result = inbox_controller.convert_to_note(
            mock_db, mock_inbox_repo, mock_note_repo, item_id, convert_data
        )

        assert result == mock_note
        mock_inbox_repo.mark_processed.assert_called_once()

    def test_convert_to_note_item_not_found(self):
        """Should return None if inbox item not found."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_note_repo = Mock(spec=NoteRepositoryProtocol)
        item_id = uuid4()

        mock_inbox_repo.get_by_id.return_value = None

        convert_data = ConvertToNoteRequest()
        result = inbox_controller.convert_to_note(
            mock_db, mock_inbox_repo, mock_note_repo, item_id, convert_data
        )

        assert result is None


class TestConvertToProject:
    """Test convert_to_project() controller method."""

    def test_convert_to_project_with_defaults(self):
        """Should convert inbox item to project using content as name."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_project_repo = Mock(spec=ProjectRepositoryProtocol)
        item_id = uuid4()

        mock_item = Mock(spec=InboxItem, id=item_id, content="Website redesign project")
        mock_inbox_repo.get_by_id.return_value = mock_item

        mock_project = Mock(spec=Project, name="Website redesign project")
        mock_project_repo.create.return_value = mock_project

        convert_data = ConvertToProjectRequest()

        result = inbox_controller.convert_to_project(
            mock_db, mock_inbox_repo, mock_project_repo, item_id, convert_data
        )

        assert result == mock_project
        mock_inbox_repo.mark_processed.assert_called_once_with(mock_db, mock_item)

    def test_convert_to_project_truncates_long_content(self):
        """Should truncate very long inbox content to reasonable project name."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_project_repo = Mock(spec=ProjectRepositoryProtocol)
        item_id = uuid4()

        # Create content longer than 200 chars
        long_content = "A" * 300
        mock_item = Mock(spec=InboxItem, id=item_id, content=long_content)
        mock_inbox_repo.get_by_id.return_value = mock_item

        mock_project = Mock(spec=Project, name=long_content[:200])
        mock_project_repo.create.return_value = mock_project

        convert_data = ConvertToProjectRequest()

        result = inbox_controller.convert_to_project(
            mock_db, mock_inbox_repo, mock_project_repo, item_id, convert_data
        )

        assert result == mock_project

    def test_convert_to_project_item_not_found(self):
        """Should return None if inbox item not found."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_project_repo = Mock(spec=ProjectRepositoryProtocol)
        item_id = uuid4()

        mock_inbox_repo.get_by_id.return_value = None

        convert_data = ConvertToProjectRequest()
        result = inbox_controller.convert_to_project(
            mock_db, mock_inbox_repo, mock_project_repo, item_id, convert_data
        )

        assert result is None


class TestGetUnprocessedCount:
    """Test get_unprocessed_count() controller method."""

    def test_get_unprocessed_count(self):
        """Should return count from repository."""
        mock_db = Mock()
        mock_inbox_repo = Mock(spec=InboxRepositoryProtocol)
        mock_inbox_repo.count_unprocessed.return_value = 7

        count = inbox_controller.get_unprocessed_count(mock_db, mock_inbox_repo)

        assert count == 7
        mock_inbox_repo.count_unprocessed.assert_called_once_with(mock_db)

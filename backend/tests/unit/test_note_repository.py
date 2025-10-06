"""Unit tests for Note repository."""

from unittest.mock import Mock
from uuid import uuid4

from app.models.note import Note
from app.repositories import note_repository
from app.schemas.note import NoteCreate, NoteUpdate


class TestGetAll:
    """Test get_all() repository method."""

    def test_get_all_empty_database(self):
        """Should return empty list when no notes exist."""
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.order_by.return_value.all.return_value = []

        notes = note_repository.get_all(mock_db)

        assert notes == []
        mock_db.query.assert_called_once_with(Note)

    def test_get_all_returns_notes(self):
        """Should return all non-deleted notes ordered by updated_at desc."""
        note1 = Mock(spec=Note, title="First note", deleted_at=None)
        note2 = Mock(spec=Note, title="Second note", deleted_at=None)

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.order_by.return_value.all.return_value = [note2, note1]

        notes = note_repository.get_all(mock_db)

        assert len(notes) == 2
        assert notes[0].title == "Second note"
        assert notes[1].title == "First note"

    def test_get_all_filters_deleted_by_default(self):
        """Should filter out deleted notes by default."""
        mock_db = Mock()
        note_repository.get_all(mock_db)
        # Verify filter was called (checking deleted_at.is_(None))
        mock_db.query.return_value.filter.assert_called_once()

    def test_get_all_with_project_filter(self):
        """Should filter notes by project_id when provided."""
        project_id = uuid4()
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_filter = mock_query.filter.return_value
        mock_filter.filter.return_value.order_by.return_value.all.return_value = []

        note_repository.get_all(mock_db, project_id=project_id)

        # First filter for deleted_at, second for project_id
        assert mock_query.filter.call_count == 1
        assert mock_filter.filter.call_count == 1


class TestGetById:
    """Test get_by_id() repository method."""

    def test_get_by_id_found(self):
        """Should return note when found and not deleted."""
        note_id = uuid4()
        mock_note = Mock(spec=Note, id=note_id, deleted_at=None)

        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = mock_note

        result = note_repository.get_by_id(mock_db, note_id)

        assert result == mock_note
        mock_db.query.assert_called_once_with(Note)

    def test_get_by_id_not_found(self):
        """Should return None when note not found."""
        mock_db = Mock()
        mock_query = mock_db.query.return_value
        mock_query.filter.return_value.first.return_value = None

        result = note_repository.get_by_id(mock_db, uuid4())

        assert result is None


class TestCreate:
    """Test create() repository method."""

    def test_create_note(self):
        """Should create and return new note."""
        note_data = NoteCreate(title="Test Note", content="Test content")

        mock_db = Mock()

        result = note_repository.create(mock_db, note_data)

        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()
        assert isinstance(result, Note)


class TestUpdate:
    """Test update() repository method."""

    def test_update_note(self):
        """Should update note fields and timestamp."""
        mock_note = Mock(spec=Note, title="Old Title")
        note_data = NoteUpdate(title="New Title")

        mock_db = Mock()

        result = note_repository.update(mock_db, mock_note, note_data)

        assert mock_note.title == "New Title"
        assert hasattr(mock_note, "updated_at")
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()


class TestSoftDelete:
    """Test soft_delete() repository method."""

    def test_soft_delete_sets_timestamp(self):
        """Should set deleted_at timestamp."""
        mock_note = Mock(spec=Note)
        mock_db = Mock()

        result = note_repository.soft_delete(mock_db, mock_note)

        assert mock_note.deleted_at is not None
        mock_db.commit.assert_called_once()
        mock_db.refresh.assert_called_once()

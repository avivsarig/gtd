"""Unit tests for Note controller."""
from unittest.mock import Mock, patch
from uuid import uuid4

from app.models.note import Note
from app.controllers import note_controller
from app.schemas.note import NoteCreate, NoteUpdate


class TestListNotes:
    """Test list_notes() controller method."""

    @patch('app.controllers.note_controller.note_repository')
    def test_list_notes_calls_repository(self, mock_repo):
        """Should call repository get_all with correct parameters."""
        mock_db = Mock()
        mock_repo.get_all.return_value = []

        result = note_controller.list_notes(mock_db)

        mock_repo.get_all.assert_called_once_with(
            mock_db,
            include_deleted=False,
            project_id=None
        )
        assert result == []

    @patch('app.controllers.note_controller.note_repository')
    def test_list_notes_with_project_filter(self, mock_repo):
        """Should filter by project_id when provided."""
        mock_db = Mock()
        project_id = uuid4()
        mock_repo.get_all.return_value = []

        note_controller.list_notes(mock_db, project_id=project_id)

        mock_repo.get_all.assert_called_once_with(
            mock_db,
            include_deleted=False,
            project_id=project_id
        )


class TestGetNote:
    """Test get_note() controller method."""

    @patch('app.controllers.note_controller.note_repository')
    def test_get_note_found(self, mock_repo):
        """Should return note when found."""
        mock_db = Mock()
        note_id = uuid4()
        mock_note = Mock(spec=Note, id=note_id)
        mock_repo.get_by_id.return_value = mock_note

        result = note_controller.get_note(mock_db, note_id)

        assert result == mock_note
        mock_repo.get_by_id.assert_called_once_with(mock_db, note_id)

    @patch('app.controllers.note_controller.note_repository')
    def test_get_note_not_found(self, mock_repo):
        """Should return None when note not found."""
        mock_db = Mock()
        mock_repo.get_by_id.return_value = None

        result = note_controller.get_note(mock_db, uuid4())

        assert result is None


class TestCreateNote:
    """Test create_note() controller method."""

    @patch('app.controllers.note_controller.note_repository')
    def test_create_note(self, mock_repo):
        """Should create note via repository."""
        mock_db = Mock()
        note_data = NoteCreate(title="Test Note")
        mock_note = Mock(spec=Note)
        mock_repo.create.return_value = mock_note

        result = note_controller.create_note(mock_db, note_data)

        assert result == mock_note
        mock_repo.create.assert_called_once_with(mock_db, note_data)


class TestUpdateNote:
    """Test update_note() controller method."""

    @patch('app.controllers.note_controller.note_repository')
    def test_update_note_success(self, mock_repo):
        """Should update note when found."""
        mock_db = Mock()
        note_id = uuid4()
        note_data = NoteUpdate(title="Updated Title")
        mock_note = Mock(spec=Note)
        mock_updated_note = Mock(spec=Note)

        mock_repo.get_by_id.return_value = mock_note
        mock_repo.update.return_value = mock_updated_note

        result = note_controller.update_note(mock_db, note_id, note_data)

        assert result == mock_updated_note
        mock_repo.get_by_id.assert_called_once_with(mock_db, note_id)
        mock_repo.update.assert_called_once_with(mock_db, mock_note, note_data)

    @patch('app.controllers.note_controller.note_repository')
    def test_update_note_not_found(self, mock_repo):
        """Should return None when note not found."""
        mock_db = Mock()
        mock_repo.get_by_id.return_value = None

        result = note_controller.update_note(mock_db, uuid4(), NoteUpdate())

        assert result is None
        mock_repo.update.assert_not_called()


class TestDeleteNote:
    """Test delete_note() controller method."""

    @patch('app.controllers.note_controller.note_repository')
    def test_delete_note_success(self, mock_repo):
        """Should soft delete note when found."""
        mock_db = Mock()
        note_id = uuid4()
        mock_note = Mock(spec=Note)
        mock_deleted_note = Mock(spec=Note)

        mock_repo.get_by_id.return_value = mock_note
        mock_repo.soft_delete.return_value = mock_deleted_note

        result = note_controller.delete_note(mock_db, note_id)

        assert result == mock_deleted_note
        mock_repo.get_by_id.assert_called_once_with(mock_db, note_id)
        mock_repo.soft_delete.assert_called_once_with(mock_db, mock_note)

    @patch('app.controllers.note_controller.note_repository')
    def test_delete_note_not_found(self, mock_repo):
        """Should return None when note not found."""
        mock_db = Mock()
        mock_repo.get_by_id.return_value = None

        result = note_controller.delete_note(mock_db, uuid4())

        assert result is None
        mock_repo.soft_delete.assert_not_called()

"""Unit tests for Note controller."""

from unittest.mock import Mock
from uuid import uuid4

from app.controllers.note_controller import NoteController
from app.models.note import Note
from app.repositories.protocols import NoteRepositoryProtocol
from app.schemas.note import NoteCreate, NoteUpdate


class TestListNotes:
    """Test list_notes() controller method."""

    def test_list_notes_calls_repository(self):
        """Should call repository get_all with correct parameters."""
        mock_db = Mock()
        mock_repository = Mock(spec=NoteRepositoryProtocol)
        mock_repository.get_all.return_value = []

        controller = NoteController(repository=mock_repository)

        result = controller.list_notes(mock_db)

        mock_repository.get_all.assert_called_once_with(
            mock_db,
            include_deleted=False,
            project_id=None,
            created_after=None,
            created_before=None,
        )
        assert result == []

    def test_list_notes_with_project_filter(self):
        """Should filter by project_id when provided."""
        mock_db = Mock()
        mock_repository = Mock(spec=NoteRepositoryProtocol)
        project_id = uuid4()
        mock_repository.get_all.return_value = []

        controller = NoteController(repository=mock_repository)

        controller.list_notes(mock_db, project_id=project_id)

        mock_repository.get_all.assert_called_once_with(
            mock_db,
            include_deleted=False,
            project_id=project_id,
            created_after=None,
            created_before=None,
        )


class TestGetNote:
    """Test get_note() controller method."""

    def test_get_note_found(self):
        """Should return note when found."""
        mock_db = Mock()
        mock_repository = Mock(spec=NoteRepositoryProtocol)
        note_id = uuid4()
        mock_note = Mock(spec=Note, id=note_id)
        mock_repository.get_by_id.return_value = mock_note

        controller = NoteController(repository=mock_repository)

        result = controller.get_note(mock_db, note_id)

        assert result == mock_note
        mock_repository.get_by_id.assert_called_once_with(mock_db, note_id)

    def test_get_note_not_found(self):
        """Should return None when note not found."""
        mock_db = Mock()
        mock_repository = Mock(spec=NoteRepositoryProtocol)
        mock_repository.get_by_id.return_value = None

        controller = NoteController(repository=mock_repository)

        result = controller.get_note(mock_db, uuid4())

        assert result is None


class TestCreateNote:
    """Test create_note() controller method."""

    def test_create_note(self):
        """Should create note via repository."""
        mock_db = Mock()
        mock_repository = Mock(spec=NoteRepositoryProtocol)
        note_data = NoteCreate(title="Test Note")
        mock_note = Mock(spec=Note)
        mock_repository.create.return_value = mock_note

        controller = NoteController(repository=mock_repository)

        result = controller.create_note(mock_db, note_data)

        assert result == mock_note
        mock_repository.create.assert_called_once_with(mock_db, note_data)


class TestUpdateNote:
    """Test update_note() controller method."""

    def test_update_note_success(self):
        """Should update note when found."""
        mock_db = Mock()
        mock_repository = Mock(spec=NoteRepositoryProtocol)
        note_id = uuid4()
        note_data = NoteUpdate(title="Updated Title")
        mock_note = Mock(spec=Note)
        mock_updated_note = Mock(spec=Note)

        mock_repository.get_by_id.return_value = mock_note
        mock_repository.update.return_value = mock_updated_note

        controller = NoteController(repository=mock_repository)

        result = controller.update_note(mock_db, note_id, note_data)

        assert result == mock_updated_note
        mock_repository.get_by_id.assert_called_once_with(mock_db, note_id)
        mock_repository.update.assert_called_once_with(mock_db, mock_note, note_data)

    def test_update_note_not_found(self):
        """Should return None when note not found."""
        mock_db = Mock()
        mock_repository = Mock(spec=NoteRepositoryProtocol)
        mock_repository.get_by_id.return_value = None

        controller = NoteController(repository=mock_repository)

        result = controller.update_note(mock_db, uuid4(), NoteUpdate())

        assert result is None
        mock_repository.update.assert_not_called()


class TestDeleteNote:
    """Test delete_note() controller method."""

    def test_delete_note_success(self):
        """Should soft delete note when found."""
        mock_db = Mock()
        mock_repository = Mock(spec=NoteRepositoryProtocol)
        note_id = uuid4()
        mock_note = Mock(spec=Note)
        mock_deleted_note = Mock(spec=Note)

        mock_repository.get_by_id.return_value = mock_note
        mock_repository.soft_delete.return_value = mock_deleted_note

        controller = NoteController(repository=mock_repository)

        result = controller.delete_note(mock_db, note_id)

        assert result == mock_deleted_note
        mock_repository.get_by_id.assert_called_once_with(mock_db, note_id)
        mock_repository.soft_delete.assert_called_once_with(mock_db, mock_note)

    def test_delete_note_not_found(self):
        """Should return None when note not found."""
        mock_db = Mock()
        mock_repository = Mock(spec=NoteRepositoryProtocol)
        mock_repository.get_by_id.return_value = None

        controller = NoteController(repository=mock_repository)

        result = controller.delete_note(mock_db, uuid4())

        assert result is None
        mock_repository.soft_delete.assert_not_called()

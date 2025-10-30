"""Unit tests for create_task() controller method."""

from unittest.mock import Mock
from uuid import uuid4

from app.controllers import task_controller
from app.models.task import Task
from app.repositories.protocols import TaskRepositoryProtocol
from app.schemas.task import TaskCreate, TaskStatus


class TestCreateTask:
    """Test create_task() controller method."""

    def test_create_task_calls_repository(self):
        """Should call repository create method."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_data = TaskCreate(title="Test task")
        mock_task = Mock(spec=Task)
        mock_repository.create.return_value = mock_task

        created_task = task_controller.create_task(mock_db, mock_repository, task_data)

        mock_repository.create.assert_called_once_with(mock_db, task_data)
        assert created_task == mock_task

    def test_create_task_with_blocked_by_sets_waiting_status(self):
        """Should automatically set status to 'waiting' if task is blocked."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        blocking_task_id = uuid4()

        # Create task with blocked_by set
        task_data = TaskCreate(
            title="Blocked task",
            status=TaskStatus.NEXT,  # User tries to set to 'next'
            blocked_by_task_id=blocking_task_id,
        )
        mock_task = Mock(spec=Task, status="waiting")
        mock_repository.create.return_value = mock_task

        task_controller.create_task(mock_db, mock_repository, task_data)

        # Verify status was changed to 'waiting'
        assert task_data.status == TaskStatus.WAITING
        mock_repository.create.assert_called_once_with(mock_db, task_data)

    def test_create_task_without_blocked_by_keeps_original_status(self):
        """Should keep original status if task is not blocked."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_data = TaskCreate(title="Normal task", status=TaskStatus.NEXT)
        mock_task = Mock(spec=Task, status="next")
        mock_repository.create.return_value = mock_task

        task_controller.create_task(mock_db, mock_repository, task_data)

        # Verify status was NOT changed
        assert task_data.status == TaskStatus.NEXT
        mock_repository.create.assert_called_once()

    def test_create_task_uses_default_status(self):
        """Should use default 'next' status when none provided."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_data = TaskCreate(title="Task with default status")
        mock_task = Mock(spec=Task)
        mock_repository.create.return_value = mock_task

        task_controller.create_task(mock_db, mock_repository, task_data)

        # Default status from schema should be 'next'
        assert task_data.status == TaskStatus.NEXT
        mock_repository.create.assert_called_once()

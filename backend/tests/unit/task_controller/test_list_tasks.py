"""Unit tests for list_tasks() controller method."""

from unittest.mock import Mock

from app.controllers.task_controller import TaskController
from app.models.task import Task
from app.repositories.protocols import TaskRepositoryProtocol


class TestListTasks:
    """Test list_tasks() controller method."""

    def test_list_tasks_calls_repository(self):
        """Should call repository get_all with include_deleted=False."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        mock_tasks = [
            Mock(spec=Task, title="Task 1"),
            Mock(spec=Task, title="Task 2"),
        ]
        mock_repository.get_all.return_value = mock_tasks

        controller = TaskController(repository=mock_repository)
        created_task = controller.list_tasks(mock_db)

        # Verify repository was called correctly
        mock_repository.get_all.assert_called_once_with(
            mock_db,
            include_deleted=False,
            status=None,
            project_id=None,
            context_id=None,
            scheduled_after=None,
            scheduled_before=None,
            show_completed=True,
        )
        assert created_task == mock_tasks

    def test_list_tasks_returns_repository_result(self):
        """Should return exactly what repository returns."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        expected_tasks = []
        mock_repository.get_all.return_value = expected_tasks

        controller = TaskController(repository=mock_repository)
        created_task = controller.list_tasks(mock_db)

        assert created_task == expected_tasks

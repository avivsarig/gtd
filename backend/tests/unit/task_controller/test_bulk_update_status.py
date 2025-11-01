"""Unit tests for bulk_update_status() controller method."""

from unittest.mock import Mock
from uuid import uuid4

from app.controllers.task_controller import TaskController
from app.models.task import Task
from app.repositories.protocols import TaskRepositoryProtocol
from app.schemas.task import TaskStatus


class TestBulkUpdateStatus:
    """Test bulk_update_status() controller method."""

    def test_bulk_update_status_updates_all_valid_tasks(self):
        """Should update status for all existing tasks."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id1, task_id2, task_id3 = uuid4(), uuid4(), uuid4()
        task_ids = [task_id1, task_id2, task_id3]

        mock_task1 = Mock(spec=Task, id=task_id1, status="next")
        mock_task2 = Mock(spec=Task, id=task_id2, status="next")
        mock_task3 = Mock(spec=Task, id=task_id3, status="next")

        def get_by_id_side_effect(db, task_id):
            if task_id == task_id1:
                return mock_task1
            elif task_id == task_id2:
                return mock_task2
            elif task_id == task_id3:
                return mock_task3
            return None

        mock_repository.get_by_id.side_effect = get_by_id_side_effect

        controller = TaskController(repository=mock_repository)
        updated_tasks = controller.bulk_update_status(mock_db, task_ids, TaskStatus.WAITING)

        assert len(updated_tasks) == 3
        assert mock_task1.status == TaskStatus.WAITING.value
        assert mock_task2.status == TaskStatus.WAITING.value
        assert mock_task3.status == TaskStatus.WAITING.value
        assert mock_task1.updated_at is not None
        mock_db.commit.assert_called_once()

    def test_bulk_update_status_ignores_nonexistent_tasks(self):
        """Should skip tasks that don't exist without error."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)
        task_id1 = uuid4()
        task_id2 = uuid4()  # This one doesn't exist
        task_id3 = uuid4()

        mock_task1 = Mock(spec=Task, id=task_id1, status="next")
        mock_task3 = Mock(spec=Task, id=task_id3, status="next")

        def get_by_id_side_effect(db, task_id):
            if task_id == task_id1:
                return mock_task1
            elif task_id == task_id3:
                return mock_task3
            return None

        mock_repository.get_by_id.side_effect = get_by_id_side_effect

        controller = TaskController(repository=mock_repository)
        updated_tasks = controller.bulk_update_status(
            mock_db, [task_id1, task_id2, task_id3], TaskStatus.SOMEDAY
        )

        # Should only return 2 tasks (1 and 3)
        assert len(updated_tasks) == 2
        assert mock_task1 in updated_tasks
        assert mock_task3 in updated_tasks

    def test_bulk_update_status_handles_empty_list(self):
        """Should handle empty task list gracefully."""
        mock_db = Mock()
        mock_repository = Mock(spec=TaskRepositoryProtocol)

        controller = TaskController(repository=mock_repository)
        updated_tasks = controller.bulk_update_status(mock_db, [], TaskStatus.NEXT)

        assert len(updated_tasks) == 0
        mock_db.commit.assert_called_once()

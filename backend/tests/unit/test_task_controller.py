"""Unit tests for Task controller."""

from datetime import datetime
from unittest.mock import Mock, patch

from app.controllers import task_controller
from app.models.task import Task
from app.schemas.task import TaskStatus


class TestListTasks:
    """Test list_tasks() controller method."""

    def test_list_tasks_calls_repository(self):
        """Should call repository get_all with include_deleted=False."""
        mock_db = Mock()
        mock_tasks = [
            Mock(spec=Task, title="Task 1"),
            Mock(spec=Task, title="Task 2"),
        ]

        with patch(
            "app.controllers.task_controller.task_repository.get_all", return_value=mock_tasks
        ) as mock_get_all:
            created_task = task_controller.list_tasks(mock_db)

            # Verify repository was called correctly
            mock_get_all.assert_called_once_with(
                mock_db,
                include_deleted=False,
                status=None,
                project_id=None,
                context_id=None,
                scheduled_after=None,
                scheduled_before=None,
            )
            assert created_task == mock_tasks

    def test_list_tasks_returns_repository_result(self):
        """Should return exactly what repository returns."""
        mock_db = Mock()
        expected_tasks = []

        with patch(
            "app.controllers.task_controller.task_repository.get_all", return_value=expected_tasks
        ):
            created_task = task_controller.list_tasks(mock_db)

            assert created_task == expected_tasks


class TestCreateTask:
    """Test create_task() controller method."""

    def test_create_task_calls_repository(self):
        """Should call repository create method."""
        from app.schemas.task import TaskCreate

        mock_db = Mock()
        task_data = TaskCreate(title="Test task")
        mock_task = Mock(spec=Task)

        with patch(
            "app.controllers.task_controller.task_repository.create", return_value=mock_task
        ) as mock_create:
            created_task = task_controller.create_task(mock_db, task_data)

            mock_create.assert_called_once_with(mock_db, task_data)
            assert created_task == mock_task

    def test_create_task_with_blocked_by_sets_waiting_status(self):
        """Should automatically set status to 'waiting' if task is blocked."""
        from uuid import uuid4

        from app.schemas.task import TaskCreate

        mock_db = Mock()
        blocking_task_id = uuid4()

        # Create task with blocked_by set
        task_data = TaskCreate(
            title="Blocked task",
            status=TaskStatus.NEXT,  # User tries to set to 'next'
            blocked_by_task_id=blocking_task_id,
        )
        mock_task = Mock(spec=Task, status="waiting")

        with patch(
            "app.controllers.task_controller.task_repository.create", return_value=mock_task
        ) as mock_create:
            created_task = task_controller.create_task(mock_db, task_data)

            # Verify status was changed to 'waiting'
            assert task_data.status == TaskStatus.WAITING
            mock_create.assert_called_once_with(mock_db, task_data)

    def test_create_task_without_blocked_by_keeps_original_status(self):
        """Should keep original status if task is not blocked."""
        from app.schemas.task import TaskCreate

        mock_db = Mock()
        task_data = TaskCreate(title="Normal task", status=TaskStatus.NEXT)
        mock_task = Mock(spec=Task, status="next")

        with patch(
            "app.controllers.task_controller.task_repository.create", return_value=mock_task
        ) as mock_create:
            created_task = task_controller.create_task(mock_db, task_data)

            # Verify status was NOT changed
            assert task_data.status == TaskStatus.NEXT
            mock_create.assert_called_once()

    def test_create_task_uses_default_status(self):
        """Should use default 'next' status when none provided."""
        from app.schemas.task import TaskCreate

        mock_db = Mock()
        task_data = TaskCreate(title="Task with default status")
        mock_task = Mock(spec=Task)

        with patch(
            "app.controllers.task_controller.task_repository.create", return_value=mock_task
        ) as mock_create:
            created_task = task_controller.create_task(mock_db, task_data)

            # Default status from schema should be 'next'
            assert task_data.status == TaskStatus.NEXT
            mock_create.assert_called_once()


class TestGetTask:
    """Test get_task() controller method."""

    def test_get_task_calls_repository(self):
        """Should call repository get_by_id method."""
        from uuid import uuid4

        mock_db = Mock()
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, title="Test task")

        with patch(
            "app.controllers.task_controller.task_repository.get_by_id", return_value=mock_task
        ) as mock_get:
            created_task = task_controller.get_task(mock_db, task_id)

            mock_get.assert_called_once_with(mock_db, task_id)
            assert created_task == mock_task

    def test_get_task_returns_none_when_not_found(self):
        """Should return None when task doesn't exist."""
        from uuid import uuid4

        mock_db = Mock()
        task_id = uuid4()

        with patch(
            "app.controllers.task_controller.task_repository.get_by_id", return_value=None
        ) as mock_get:
            created_task = task_controller.get_task(mock_db, task_id)

            assert created_task is None


class TestUpdateTask:
    """Test update_task() controller method."""

    def test_update_task_calls_repository(self):
        """Should fetch task and call repository update."""
        from uuid import uuid4

        from app.schemas.task import TaskUpdate

        mock_db = Mock()
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, title="Old title")
        update_data = TaskUpdate(title="New title")

        with patch(
            "app.controllers.task_controller.task_repository.get_by_id", return_value=mock_task
        ) as mock_get:
            with patch(
                "app.controllers.task_controller.task_repository.update", return_value=mock_task
            ) as mock_update:
                created_task = task_controller.update_task(mock_db, task_id, update_data)

                mock_get.assert_called_once_with(mock_db, task_id)
                mock_update.assert_called_once_with(mock_db, mock_task, update_data)
                assert created_task == mock_task

    def test_update_task_returns_none_when_not_found(self):
        """Should return None if task doesn't exist."""
        from uuid import uuid4

        from app.schemas.task import TaskUpdate

        mock_db = Mock()
        task_id = uuid4()
        update_data = TaskUpdate(title="New title")

        with patch(
            "app.controllers.task_controller.task_repository.get_by_id", return_value=None
        ) as mock_get:
            created_task = task_controller.update_task(mock_db, task_id, update_data)

            assert created_task is None
            # Should not call update if task not found
            mock_get.assert_called_once()

    def test_update_task_with_blocked_by_sets_waiting_status(self):
        """Should set status to 'waiting' when blocked_by_task_id is set."""
        from uuid import uuid4

        from app.schemas.task import TaskUpdate

        mock_db = Mock()
        task_id = uuid4()
        blocking_task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, status="next")

        update_data = TaskUpdate(title="Blocked task", blocked_by_task_id=blocking_task_id)

        with patch(
            "app.controllers.task_controller.task_repository.get_by_id", return_value=mock_task
        ):
            with patch(
                "app.controllers.task_controller.task_repository.update", return_value=mock_task
            ) as mock_update:
                created_task = task_controller.update_task(mock_db, task_id, update_data)

                # Verify status was auto-set to waiting
                assert update_data.status == TaskStatus.WAITING

    def test_update_task_without_blocked_by_keeps_status(self):
        """Should not change status when blocked_by_task_id is not set."""
        from uuid import uuid4

        from app.schemas.task import TaskUpdate

        mock_db = Mock()
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id)

        update_data = TaskUpdate(title="Updated title")

        with patch(
            "app.controllers.task_controller.task_repository.get_by_id", return_value=mock_task
        ):
            with (
                patch(
                    "app.controllers.task_controller.task_repository.get_by_id",
                    return_value=mock_task,
                ),
                patch(
                    "app.controllers.task_controller.task_repository.update", return_value=mock_task
                ),
            ):
                task_controller.update_task(mock_db, task_id, update_data)

                # Status should not be set
                assert update_data.status is None


class TestDeleteTask:
    """Test delete_task() controller method."""

    def test_delete_task_calls_repository(self):
        """Should fetch task and call repository soft_delete."""
        from uuid import uuid4

        mock_db = Mock()
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id)

        with patch(
            "app.controllers.task_controller.task_repository.get_by_id", return_value=mock_task
        ) as mock_get:
            with patch(
                "app.controllers.task_controller.task_repository.soft_delete",
                return_value=mock_task,
            ) as mock_delete:
                created_task = task_controller.delete_task(mock_db, task_id)

                mock_get.assert_called_once_with(mock_db, task_id)
                mock_delete.assert_called_once_with(mock_db, mock_task)
                assert created_task == mock_task

    def test_delete_task_returns_none_when_not_found(self):
        """Should return None if task doesn't exist."""
        from uuid import uuid4

        mock_db = Mock()
        task_id = uuid4()

        with patch(
            "app.controllers.task_controller.task_repository.get_by_id", return_value=None
        ) as mock_get:
            created_task = task_controller.delete_task(mock_db, task_id)

            assert created_task is None
            # Should not call soft_delete if task not found
            mock_get.assert_called_once()


class TestCompleteTask:
    """Test complete_task() controller method."""

    def test_complete_task_sets_completed_at_timestamp(self):
        """Should set completed_at to current time."""
        from uuid import uuid4

        mock_db = Mock()
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, completed_at=None)

        with (
            patch(
                "app.controllers.task_controller.task_repository.get_by_id", return_value=mock_task
            ),
            patch("app.controllers.task_controller.datetime") as mock_datetime,
        ):
            mock_now = datetime(2025, 10, 5, 12, 0, 0)
            mock_datetime.utcnow.return_value = mock_now

            task_controller.complete_task(mock_db, task_id)

            assert mock_task.completed_at == mock_now
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once_with(mock_task)

    def test_complete_task_returns_none_when_not_found(self):
        """Should return None if task doesn't exist."""
        from uuid import uuid4

        mock_db = Mock()
        task_id = uuid4()

        with patch("app.controllers.task_controller.task_repository.get_by_id", return_value=None):
            created_task = task_controller.complete_task(mock_db, task_id)

            assert created_task is None
            mock_db.commit.assert_not_called()


class TestUncompleteTask:
    """Test uncomplete_task() controller method."""

    def test_uncomplete_task_clears_completed_at(self):
        """Should clear completed_at timestamp."""
        from uuid import uuid4

        mock_db = Mock()
        task_id = uuid4()
        mock_task = Mock(spec=Task, id=task_id, completed_at=datetime.utcnow())

        with patch(
            "app.controllers.task_controller.task_repository.get_by_id", return_value=mock_task
        ):
            created_task = task_controller.uncomplete_task(mock_db, task_id)

            assert mock_task.completed_at is None
            mock_db.commit.assert_called_once()
            mock_db.refresh.assert_called_once_with(mock_task)

    def test_uncomplete_task_returns_none_when_not_found(self):
        """Should return None if task doesn't exist."""
        from uuid import uuid4

        mock_db = Mock()
        task_id = uuid4()

        with patch("app.controllers.task_controller.task_repository.get_by_id", return_value=None):
            created_task = task_controller.uncomplete_task(mock_db, task_id)

            assert created_task is None
            mock_db.commit.assert_not_called()


class TestBulkUpdateStatus:
    """Test bulk_update_status() controller method."""

    def test_bulk_update_status_updates_all_valid_tasks(self):
        """Should update status for all existing tasks."""
        from uuid import uuid4

        mock_db = Mock()
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

        with patch(
            "app.controllers.task_controller.task_repository.get_by_id",
            side_effect=get_by_id_side_effect,
        ):
            with patch("app.controllers.task_controller.datetime") as mock_datetime:
                mock_now = datetime(2025, 10, 5, 12, 0, 0)
                mock_datetime.utcnow.return_value = mock_now

                updated_tasks = task_controller.bulk_update_status(
                    mock_db, task_ids, TaskStatus.WAITING
                )

                assert len(updated_tasks) == 3
                assert mock_task1.status == TaskStatus.WAITING.value
                assert mock_task2.status == TaskStatus.WAITING.value
                assert mock_task3.status == TaskStatus.WAITING.value
                assert mock_task1.updated_at == mock_now
                mock_db.commit.assert_called_once()

    def test_bulk_update_status_ignores_nonexistent_tasks(self):
        """Should skip tasks that don't exist without error."""
        from uuid import uuid4

        mock_db = Mock()
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

        with patch(
            "app.controllers.task_controller.task_repository.get_by_id",
            side_effect=get_by_id_side_effect,
        ):
            with patch("app.controllers.task_controller.datetime") as mock_datetime:
                mock_datetime.utcnow.return_value = datetime.utcnow()

                updated_tasks = task_controller.bulk_update_status(
                    mock_db, [task_id1, task_id2, task_id3], TaskStatus.SOMEDAY
                )

                # Should only return 2 tasks (1 and 3)
                assert len(updated_tasks) == 2
                assert mock_task1 in updated_tasks
                assert mock_task3 in updated_tasks

    def test_bulk_update_status_handles_empty_list(self):
        """Should handle empty task list gracefully."""
        mock_db = Mock()

        updated_tasks = task_controller.bulk_update_status(mock_db, [], TaskStatus.NEXT)

        assert len(updated_tasks) == 0
        mock_db.commit.assert_called_once()

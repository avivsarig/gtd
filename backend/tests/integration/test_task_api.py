"""Integration tests for Task API endpoints."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestTaskStatusManagement:
    """Test status management API endpoints."""

    def test_create_task_with_valid_status(
        self, client_postgres: TestClient, db_session_postgres: Session
    ):
        """Should create task with valid status."""
        response = client_postgres.post(
            "/api/v1/tasks/", json={"title": "Task with waiting status", "status": "waiting"}
        )

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "waiting"
        assert data["title"] == "Task with waiting status"

    def test_create_task_with_invalid_status_returns_422(self, client_postgres: TestClient):
        """Should reject invalid status values."""
        response = client_postgres.post(
            "/api/v1/tasks/", json={"title": "Task with invalid status", "status": "invalid_status"}
        )

        assert response.status_code == 422

    def test_update_task_status(self, client_postgres: TestClient, db_session_postgres: Session):
        """Should update task status."""
        # Create a task
        create_response = client_postgres.post(
            "/api/v1/tasks/", json={"title": "Task to update", "status": "next"}
        )
        task_id = create_response.json()["id"]

        # Update status to waiting
        update_response = client_postgres.put(
            f"/api/v1/tasks/{task_id}", json={"status": "waiting"}
        )

        assert update_response.status_code == 200
        data = update_response.json()
        assert data["status"] == "waiting"

    def test_complete_task_sets_completed_at(
        self, client_postgres: TestClient, db_session_postgres: Session
    ):
        """Should set completed_at timestamp when completing task."""
        # Create a task
        create_response = client_postgres.post("/api/v1/tasks/", json={"title": "Task to complete"})
        task_id = create_response.json()["id"]

        # Complete the task
        complete_response = client_postgres.post(f"/api/v1/tasks/{task_id}/complete")

        assert complete_response.status_code == 200
        data = complete_response.json()
        assert data["completed_at"] is not None

    def test_uncomplete_task_clears_completed_at(
        self, client_postgres: TestClient, db_session_postgres: Session
    ):
        """Should clear completed_at when uncompleting task."""
        # Create and complete a task
        create_response = client_postgres.post(
            "/api/v1/tasks/", json={"title": "Task to uncomplete"}
        )
        task_id = create_response.json()["id"]
        client_postgres.post(f"/api/v1/tasks/{task_id}/complete")

        # Uncomplete the task
        uncomplete_response = client_postgres.post(f"/api/v1/tasks/{task_id}/uncomplete")

        assert uncomplete_response.status_code == 200
        data = uncomplete_response.json()
        assert data["completed_at"] is None

    def test_complete_nonexistent_task_returns_404(self, client_postgres: TestClient):
        """Should return 404 when completing nonexistent task."""
        from uuid import uuid4

        fake_id = str(uuid4())
        response = client_postgres.post(f"/api/v1/tasks/{fake_id}/complete")

        assert response.status_code == 404

    def test_bulk_status_update(self, client_postgres: TestClient, db_session_postgres: Session):
        """Should update status for multiple tasks."""
        # Create 3 tasks
        task_ids = []
        for i in range(3):
            response = client_postgres.post(
                "/api/v1/tasks/", json={"title": f"Task {i}", "status": "next"}
            )
            task_ids.append(response.json()["id"])

        # Bulk update to waiting
        bulk_response = client_postgres.post(
            "/api/v1/tasks/bulk/status", json={"task_ids": task_ids, "status": "waiting"}
        )

        assert bulk_response.status_code == 200
        data = bulk_response.json()
        assert data["updated_count"] == 3
        assert len(data["task_ids"]) == 3

        # Verify all tasks were updated
        for task_id in task_ids:
            get_response = client_postgres.get(f"/api/v1/tasks/{task_id}")
            assert get_response.json()["status"] == "waiting"

    def test_bulk_status_update_with_invalid_status_returns_422(self, client_postgres: TestClient):
        """Should reject bulk update with invalid status."""
        from uuid import uuid4

        response = client_postgres.post(
            "/api/v1/tasks/bulk/status", json={"task_ids": [str(uuid4())], "status": "invalid"}
        )

        assert response.status_code == 422

    def test_bulk_status_update_ignores_nonexistent_tasks(
        self, client_postgres: TestClient, db_session_postgres: Session
    ):
        """Should silently skip nonexistent tasks in bulk update."""
        from uuid import uuid4

        # Create 2 real tasks
        task_ids = []
        for i in range(2):
            response = client_postgres.post("/api/v1/tasks/", json={"title": f"Real task {i}"})
            task_ids.append(response.json()["id"])

        # Add a fake UUID
        fake_id = str(uuid4())
        task_ids.append(fake_id)

        # Bulk update
        bulk_response = client_postgres.post(
            "/api/v1/tasks/bulk/status", json={"task_ids": task_ids, "status": "someday"}
        )

        assert bulk_response.status_code == 200
        data = bulk_response.json()
        # Should only update 2 real tasks
        assert data["updated_count"] == 2
        assert fake_id not in data["task_ids"]

    def test_bulk_status_update_with_empty_list(self, client_postgres: TestClient):
        """Should handle empty task list in bulk update."""
        response = client_postgres.post(
            "/api/v1/tasks/bulk/status", json={"task_ids": [], "status": "next"}
        )

        # Should fail validation due to min_length=1
        assert response.status_code == 422


class TestBlockedTaskStatusRules:
    """Test business rules for blocked tasks."""

    def test_create_blocked_task_auto_sets_waiting_status(
        self, client_postgres: TestClient, db_session_postgres: Session
    ):
        """Should automatically set status to waiting when creating blocked task."""
        # Create blocking task
        blocking_response = client_postgres.post("/api/v1/tasks/", json={"title": "Blocking task"})
        blocking_id = str(blocking_response.json()["id"])

        # Create blocked task with status=next
        blocked_response = client_postgres.post(
            "/api/v1/tasks/",
            json={"title": "Blocked task", "status": "next", "blocked_by_task_id": blocking_id},
        )

        assert blocked_response.status_code == 201
        data = blocked_response.json()
        # Should override to waiting
        assert data["status"] == "waiting"

    def test_update_task_with_blocker_sets_waiting_status(
        self, client_postgres: TestClient, db_session_postgres: Session
    ):
        """Should set status to waiting when adding blocker to existing task."""
        # Create two tasks
        task1_response = client_postgres.post("/api/v1/tasks/", json={"title": "Task 1"})
        task2_response = client_postgres.post(
            "/api/v1/tasks/", json={"title": "Task 2", "status": "next"}
        )

        task1_id = str(task1_response.json()["id"])
        task2_id = str(task2_response.json()["id"])

        # Update task 2 to be blocked by task 1
        update_response = client_postgres.put(
            f"/api/v1/tasks/{task2_id}", json={"blocked_by_task_id": task1_id}
        )

        assert update_response.status_code == 200
        data = update_response.json()
        assert data["status"] == "waiting"
        assert data["blocked_by_task_id"] == task1_id

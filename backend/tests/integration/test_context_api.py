"""Integration tests for Context API endpoints."""

from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestContextCRUD:
    """Test basic CRUD operations for contexts."""

    def test_create_context(self, client_postgres: TestClient, db_session_postgres: Session):
        """Should create a new context."""
        response = client_postgres.post(
            "/api/v1/contexts/",
            json={"name": "@home", "description": "Home tasks", "icon": "home", "sort_order": 0},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "@home"
        assert data["description"] == "Home tasks"
        assert data["icon"] == "home"
        assert data["sort_order"] == 0
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_context_with_duplicate_name_returns_409(self, client_postgres: TestClient):
        """Should reject duplicate context names."""
        client_postgres.post("/api/v1/contexts/", json={"name": "@work"})

        response = client_postgres.post("/api/v1/contexts/", json={"name": "@work"})

        assert response.status_code == 409
        assert "@work" in response.json()["detail"]

    def test_list_contexts(self, client_postgres: TestClient, db_session_postgres: Session):
        """Should list all non-deleted contexts."""
        client_postgres.post("/api/v1/contexts/", json={"name": "@home", "sort_order": 1})
        client_postgres.post("/api/v1/contexts/", json={"name": "@work", "sort_order": 0})
        client_postgres.post("/api/v1/contexts/", json={"name": "@computer", "sort_order": 1})

        response = client_postgres.get("/api/v1/contexts/")

        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 3
        names = [ctx["name"] for ctx in data]
        assert "@home" in names
        assert "@work" in names
        assert "@computer" in names

    def test_get_context_by_id(self, client_postgres: TestClient, db_session_postgres: Session):
        """Should retrieve a specific context by ID."""
        create_response = client_postgres.post(
            "/api/v1/contexts/", json={"name": "@phone", "description": "Phone calls"}
        )
        context_id = create_response.json()["id"]

        response = client_postgres.get(f"/api/v1/contexts/{context_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == context_id
        assert data["name"] == "@phone"
        assert data["description"] == "Phone calls"

    def test_get_nonexistent_context_returns_404(self, client_postgres: TestClient):
        """Should return 404 for nonexistent context."""
        fake_id = str(uuid4())
        response = client_postgres.get(f"/api/v1/contexts/{fake_id}")

        assert response.status_code == 404

    def test_update_context(self, client_postgres: TestClient, db_session_postgres: Session):
        """Should update an existing context."""
        create_response = client_postgres.post(
            "/api/v1/contexts/", json={"name": "@errands", "description": "Original description"}
        )
        context_id = create_response.json()["id"]

        update_response = client_postgres.put(
            f"/api/v1/contexts/{context_id}",
            json={"description": "Updated description", "sort_order": 5},
        )

        assert update_response.status_code == 200
        data = update_response.json()
        assert data["description"] == "Updated description"
        assert data["sort_order"] == 5
        assert data["name"] == "@errands"

    def test_update_context_name_conflict_returns_409(self, client_postgres: TestClient):
        """Should reject name update that conflicts with existing context."""
        client_postgres.post("/api/v1/contexts/", json={"name": "@home"})
        create_response = client_postgres.post("/api/v1/contexts/", json={"name": "@work"})
        context_id = create_response.json()["id"]

        response = client_postgres.put(f"/api/v1/contexts/{context_id}", json={"name": "@home"})

        assert response.status_code == 409

    def test_update_nonexistent_context_returns_404(self, client_postgres: TestClient):
        """Should return 404 when updating nonexistent context."""
        fake_id = str(uuid4())
        response = client_postgres.put(
            f"/api/v1/contexts/{fake_id}", json={"description": "New description"}
        )

        assert response.status_code == 404


class TestContextSoftDelete:
    """Test soft-delete functionality for contexts."""

    def test_delete_context(self, client_postgres: TestClient, db_session_postgres: Session):
        """Should soft-delete a context."""
        create_response = client_postgres.post("/api/v1/contexts/", json={"name": "@todelete"})
        context_id = create_response.json()["id"]

        delete_response = client_postgres.delete(f"/api/v1/contexts/{context_id}")

        assert delete_response.status_code == 204

    def test_deleted_context_not_in_list(
        self, client_postgres: TestClient, db_session_postgres: Session
    ):
        """Should not return soft-deleted contexts in list."""
        create_response = client_postgres.post("/api/v1/contexts/", json={"name": "@hidden"})
        context_id = create_response.json()["id"]

        client_postgres.delete(f"/api/v1/contexts/{context_id}")
        list_response = client_postgres.get("/api/v1/contexts/")

        names = [ctx["name"] for ctx in list_response.json()]
        assert "@hidden" not in names

    def test_deleted_context_not_retrievable_by_id(
        self, client_postgres: TestClient, db_session_postgres: Session
    ):
        """Should return 404 when getting soft-deleted context by ID."""
        create_response = client_postgres.post("/api/v1/contexts/", json={"name": "@deleted"})
        context_id = create_response.json()["id"]

        client_postgres.delete(f"/api/v1/contexts/{context_id}")
        get_response = client_postgres.get(f"/api/v1/contexts/{context_id}")

        assert get_response.status_code == 404

    def test_delete_nonexistent_context_returns_404(self, client_postgres: TestClient):
        """Should return 404 when deleting nonexistent context."""
        fake_id = str(uuid4())
        response = client_postgres.delete(f"/api/v1/contexts/{fake_id}")

        assert response.status_code == 404

    def test_deleted_context_name_can_be_reused(
        self, client_postgres: TestClient, db_session_postgres: Session
    ):
        """Should allow creating new context with same name as soft-deleted one."""
        create_response = client_postgres.post("/api/v1/contexts/", json={"name": "@reusable"})
        context_id = create_response.json()["id"]

        client_postgres.delete(f"/api/v1/contexts/{context_id}")

        recreate_response = client_postgres.post(
            "/api/v1/contexts/", json={"name": "@reusable", "description": "New context"}
        )

        assert recreate_response.status_code == 201
        new_data = recreate_response.json()
        assert new_data["name"] == "@reusable"
        assert new_data["description"] == "New context"
        assert new_data["id"] != context_id


class TestContextTaskAssociations:
    """Test context behavior with task associations."""

    def test_delete_context_preserves_task_associations(
        self, client_postgres: TestClient, db_session_postgres: Session
    ):
        """Should preserve task-context associations when context is soft-deleted."""
        context_response = client_postgres.post(
            "/api/v1/contexts/", json={"name": "@contextfortask"}
        )
        context_id = context_response.json()["id"]

        task_response = client_postgres.post(
            "/api/v1/tasks/",
            json={"title": "Task with context", "context_ids": [context_id]},
        )
        task_id = task_response.json()["id"]

        client_postgres.delete(f"/api/v1/contexts/{context_id}")

        task_get_response = client_postgres.get(f"/api/v1/tasks/{task_id}")
        assert task_get_response.status_code == 200

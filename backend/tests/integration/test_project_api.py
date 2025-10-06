"""Integration tests for Project API endpoints."""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


@pytest.mark.integration
class TestProjectAPI:
    """Test project CRUD API endpoints."""

    def test_create_project(self, client: TestClient, db: Session):
        """Should create a new project."""
        response = client.post(
            "/api/v1/projects/",
            json={"name": "New Project", "outcome_statement": "Complete the project successfully"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "New Project"
        assert data["outcome_statement"] == "Complete the project successfully"
        assert data["status"] == "active"
        assert "id" in data
        assert "created_at" in data

    def test_create_project_minimal(self, client: TestClient):
        """Should create project with only name."""
        response = client.post("/api/v1/projects/", json={"name": "Minimal Project"})

        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Minimal Project"
        assert data["status"] == "active"

    def test_create_project_empty_name_returns_422(self, client: TestClient):
        """Should reject empty project name."""
        response = client.post("/api/v1/projects/", json={"name": ""})

        assert response.status_code == 422

    def test_list_projects_empty(self, client: TestClient):
        """Should return empty list when no projects exist."""
        response = client.get("/api/v1/projects/")

        assert response.status_code == 200
        assert response.json() == []

    def test_list_projects(self, client: TestClient):
        """Should return all projects."""
        # Create multiple projects
        client.post("/api/v1/projects/", json={"name": "Project 1"})
        client.post("/api/v1/projects/", json={"name": "Project 2"})
        client.post("/api/v1/projects/", json={"name": "Project 3"})

        response = client.get("/api/v1/projects/")

        assert response.status_code == 200
        projects = response.json()
        assert len(projects) == 3

    def test_list_projects_with_stats(self, client: TestClient):
        """Should return projects with task statistics."""
        # Create project
        project_response = client.post("/api/v1/projects/", json={"name": "Project with Tasks"})
        project_id = project_response.json()["id"]

        # Create tasks for the project
        client.post(
            "/api/v1/tasks/", json={"title": "Task 1", "project_id": project_id, "status": "next"}
        )
        client.post(
            "/api/v1/tasks/", json={"title": "Task 2", "project_id": project_id, "status": "next"}
        )

        # Complete one task
        task_response = client.post(
            "/api/v1/tasks/", json={"title": "Task 3", "project_id": project_id}
        )
        task_id = task_response.json()["id"]
        client.post(f"/api/v1/tasks/{task_id}/complete")

        # Get projects with stats
        response = client.get("/api/v1/projects/?with_stats=true")

        assert response.status_code == 200
        projects = response.json()
        assert len(projects) == 1
        assert projects[0]["task_count"] == 3
        assert projects[0]["completed_task_count"] == 1
        assert projects[0]["next_task_count"] == 2

    def test_get_project_by_id(self, client: TestClient):
        """Should retrieve specific project by ID."""
        create_response = client.post(
            "/api/v1/projects/",
            json={"name": "Specific Project", "outcome_statement": "Specific outcome"},
        )
        project_id = create_response.json()["id"]

        response = client.get(f"/api/v1/projects/{project_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == project_id
        assert data["name"] == "Specific Project"

    def test_get_project_not_found(self, client: TestClient):
        """Should return 404 when project doesn't exist."""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/projects/{fake_uuid}")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_update_project(self, client: TestClient):
        """Should update project fields."""
        # Create project
        create_response = client.post(
            "/api/v1/projects/",
            json={"name": "Original Name", "outcome_statement": "Original outcome"},
        )
        project_id = create_response.json()["id"]

        # Update project
        update_response = client.put(
            f"/api/v1/projects/{project_id}",
            json={"name": "Updated Name", "outcome_statement": "Updated outcome"},
        )

        assert update_response.status_code == 200
        data = update_response.json()
        assert data["name"] == "Updated Name"
        assert data["outcome_statement"] == "Updated outcome"

    def test_update_project_partial(self, client: TestClient):
        """Should update only provided fields."""
        # Create project
        create_response = client.post(
            "/api/v1/projects/",
            json={"name": "Original Name", "outcome_statement": "Original outcome"},
        )
        project_id = create_response.json()["id"]

        # Update only name
        update_response = client.put(f"/api/v1/projects/{project_id}", json={"name": "New Name"})

        assert update_response.status_code == 200
        data = update_response.json()
        assert data["name"] == "New Name"
        assert data["outcome_statement"] == "Original outcome"

    def test_update_project_status(self, client: TestClient):
        """Should update project status."""
        # Create project
        create_response = client.post("/api/v1/projects/", json={"name": "Project"})
        project_id = create_response.json()["id"]

        # Update to on_hold
        response = client.put(f"/api/v1/projects/{project_id}", json={"status": "on_hold"})

        assert response.status_code == 200
        assert response.json()["status"] == "on_hold"

    def test_complete_project(self, client: TestClient):
        """Should mark project as completed."""
        # Create project
        create_response = client.post("/api/v1/projects/", json={"name": "Project to Complete"})
        project_id = create_response.json()["id"]

        # Complete project
        response = client.post(f"/api/v1/projects/{project_id}/complete")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "completed"
        assert data["completed_at"] is not None

    def test_delete_project(self, client: TestClient):
        """Should soft delete project."""
        # Create project
        create_response = client.post("/api/v1/projects/", json={"name": "Project to Delete"})
        project_id = create_response.json()["id"]

        # Delete project
        delete_response = client.delete(f"/api/v1/projects/{project_id}")

        assert delete_response.status_code == 204

        # Verify project is not in list
        list_response = client.get("/api/v1/projects/")
        projects = list_response.json()
        assert not any(p["id"] == project_id for p in projects)

        # Verify project returns 404
        get_response = client.get(f"/api/v1/projects/{project_id}")
        assert get_response.status_code == 404

    def test_delete_project_not_found(self, client: TestClient):
        """Should return 404 when deleting non-existent project."""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.delete(f"/api/v1/projects/{fake_uuid}")

        assert response.status_code == 404

"""Integration tests for Note API endpoints."""

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestNoteAPI:
    """Test note CRUD API endpoints."""

    def test_create_note(self, client: TestClient, db: Session):
        """Should create a new note."""
        response = client.post(
            "/api/v1/notes/",
            json={"title": "Meeting Notes", "content": "Discussed project requirements"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Meeting Notes"
        assert data["content"] == "Discussed project requirements"
        assert "id" in data
        assert "created_at" in data

    def test_create_note_minimal(self, client: TestClient):
        """Should create note with only title."""
        response = client.post("/api/v1/notes/", json={"title": "Quick Note"})

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Quick Note"
        assert data["content"] is None

    def test_create_note_with_project(self, client: TestClient, db: Session):
        """Should create note associated with a project."""
        # Create a project first
        project_response = client.post("/api/v1/projects/", json={"name": "Test Project"})
        project_id = project_response.json()["id"]

        # Create note with project
        response = client.post(
            "/api/v1/notes/",
            json={
                "title": "Project Notes",
                "content": "Notes for the project",
                "project_id": project_id,
            },
        )

        assert response.status_code == 201
        data = response.json()
        assert data["project_id"] == project_id

    def test_create_note_empty_title_returns_422(self, client: TestClient):
        """Should reject empty title."""
        response = client.post("/api/v1/notes/", json={"title": ""})

        assert response.status_code == 422

    def test_list_notes_empty(self, client: TestClient):
        """Should return empty list when no notes exist."""
        response = client.get("/api/v1/notes/")

        assert response.status_code == 200
        assert response.json() == []

    def test_list_notes(self, client: TestClient):
        """Should return all notes ordered by updated_at desc."""
        # Create multiple notes
        client.post("/api/v1/notes/", json={"title": "First Note"})
        client.post("/api/v1/notes/", json={"title": "Second Note"})
        client.post("/api/v1/notes/", json={"title": "Third Note"})

        response = client.get("/api/v1/notes/")

        assert response.status_code == 200
        notes = response.json()
        assert len(notes) == 3
        # Most recently updated first
        assert notes[0]["title"] == "Third Note"

    def test_list_notes_filter_by_project(self, client: TestClient):
        """Should filter notes by project_id."""
        # Create two projects
        project1_response = client.post("/api/v1/projects/", json={"name": "Project 1"})
        project2_response = client.post("/api/v1/projects/", json={"name": "Project 2"})
        project1_id = project1_response.json()["id"]
        project2_id = project2_response.json()["id"]

        # Create notes for different projects
        client.post("/api/v1/notes/", json={"title": "Note P1-1", "project_id": project1_id})
        client.post("/api/v1/notes/", json={"title": "Note P1-2", "project_id": project1_id})
        client.post("/api/v1/notes/", json={"title": "Note P2", "project_id": project2_id})
        client.post("/api/v1/notes/", json={"title": "Note No Project"})

        # Filter by project1
        response = client.get(f"/api/v1/notes/?project_id={project1_id}")

        assert response.status_code == 200
        notes = response.json()
        assert len(notes) == 2
        assert all(note["project_id"] == project1_id for note in notes)

    def test_get_note_by_id(self, client: TestClient):
        """Should retrieve specific note by ID."""
        create_response = client.post(
            "/api/v1/notes/", json={"title": "Specific Note", "content": "Specific content"}
        )
        note_id = create_response.json()["id"]

        response = client.get(f"/api/v1/notes/{note_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == note_id
        assert data["title"] == "Specific Note"

    def test_get_note_not_found(self, client: TestClient):
        """Should return 404 when note doesn't exist."""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.get(f"/api/v1/notes/{fake_uuid}")

        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

    def test_update_note(self, client: TestClient):
        """Should update note fields."""
        # Create note
        create_response = client.post(
            "/api/v1/notes/", json={"title": "Original Title", "content": "Original content"}
        )
        note_id = create_response.json()["id"]

        # Update note
        update_response = client.put(
            f"/api/v1/notes/{note_id}",
            json={"title": "Updated Title", "content": "Updated content"},
        )

        assert update_response.status_code == 200
        data = update_response.json()
        assert data["title"] == "Updated Title"
        assert data["content"] == "Updated content"

    def test_update_note_partial(self, client: TestClient):
        """Should update only provided fields."""
        # Create note
        create_response = client.post(
            "/api/v1/notes/", json={"title": "Original Title", "content": "Original content"}
        )
        note_id = create_response.json()["id"]

        # Update only title
        update_response = client.put(f"/api/v1/notes/{note_id}", json={"title": "New Title"})

        assert update_response.status_code == 200
        data = update_response.json()
        assert data["title"] == "New Title"
        assert data["content"] == "Original content"

    def test_update_note_not_found(self, client: TestClient):
        """Should return 404 when updating non-existent note."""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.put(f"/api/v1/notes/{fake_uuid}", json={"title": "Updated"})

        assert response.status_code == 404

    def test_delete_note(self, client: TestClient):
        """Should soft delete note."""
        # Create note
        create_response = client.post("/api/v1/notes/", json={"title": "Note to delete"})
        note_id = create_response.json()["id"]

        # Delete note
        delete_response = client.delete(f"/api/v1/notes/{note_id}")

        assert delete_response.status_code == 204

        # Verify note is not in list
        list_response = client.get("/api/v1/notes/")
        notes = list_response.json()
        assert not any(note["id"] == note_id for note in notes)

        # Verify note returns 404
        get_response = client.get(f"/api/v1/notes/{note_id}")
        assert get_response.status_code == 404

    def test_delete_note_not_found(self, client: TestClient):
        """Should return 404 when deleting non-existent note."""
        fake_uuid = "00000000-0000-0000-0000-000000000000"
        response = client.delete(f"/api/v1/notes/{fake_uuid}")

        assert response.status_code == 404

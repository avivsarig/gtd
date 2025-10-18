"""Integration tests for Inbox API endpoints."""

from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


class TestInboxCRUD:
    """Test basic CRUD operations for inbox items."""

    def test_create_inbox_item(self, client: TestClient, db: Session):
        """Should create inbox item with minimal data."""
        response = client.post("/api/v1/inbox/", json={"content": "Random thought"})

        assert response.status_code == 201
        data = response.json()
        assert data["content"] == "Random thought"
        assert data["id"] is not None
        assert data["created_at"] is not None
        assert data["processed_at"] is None
        assert data["deleted_at"] is None

    def test_create_inbox_item_without_content_returns_422(self, client: TestClient):
        """Should reject inbox item creation without content."""
        response = client.post("/api/v1/inbox/", json={})

        assert response.status_code == 422

    def test_list_inbox_items(self, client: TestClient, db: Session):
        """Should list all unprocessed inbox items."""
        # Create some inbox items
        client.post("/api/v1/inbox/", json={"content": "First thought"})
        client.post("/api/v1/inbox/", json={"content": "Second thought"})

        response = client.get("/api/v1/inbox/")

        assert response.status_code == 200
        items = response.json()
        assert len(items) >= 2
        # Verify items are ordered oldest first (created_at ASC)
        assert items[0]["content"] == "First thought"

    def test_list_inbox_items_empty(self, client: TestClient, db: Session):
        """Should return empty list when no inbox items."""
        response = client.get("/api/v1/inbox/")

        assert response.status_code == 200
        items = response.json()
        assert isinstance(items, list)

    def test_get_inbox_item_by_id(self, client: TestClient, db: Session):
        """Should retrieve specific inbox item by ID."""
        # Create inbox item
        create_response = client.post("/api/v1/inbox/", json={"content": "Specific thought"})
        item_id = create_response.json()["id"]

        # Get by ID
        response = client.get(f"/api/v1/inbox/{item_id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == item_id
        assert data["content"] == "Specific thought"

    def test_get_nonexistent_inbox_item_returns_404(self, client: TestClient):
        """Should return 404 for nonexistent inbox item."""
        fake_id = uuid4()
        response = client.get(f"/api/v1/inbox/{fake_id}")

        assert response.status_code == 404

    def test_update_inbox_item(self, client: TestClient, db: Session):
        """Should update inbox item content."""
        # Create inbox item
        create_response = client.post("/api/v1/inbox/", json={"content": "Original thought"})
        item_id = create_response.json()["id"]

        # Update content
        update_response = client.put(
            f"/api/v1/inbox/{item_id}", json={"content": "Updated thought"}
        )

        assert update_response.status_code == 200
        data = update_response.json()
        assert data["content"] == "Updated thought"

    def test_update_nonexistent_inbox_item_returns_404(self, client: TestClient):
        """Should return 404 when updating nonexistent item."""
        fake_id = uuid4()
        response = client.put(f"/api/v1/inbox/{fake_id}", json={"content": "Won't work"})

        assert response.status_code == 404

    def test_delete_inbox_item(self, client: TestClient, db: Session):
        """Should soft delete inbox item."""
        # Create inbox item
        create_response = client.post("/api/v1/inbox/", json={"content": "Delete me"})
        item_id = create_response.json()["id"]

        # Delete
        delete_response = client.delete(f"/api/v1/inbox/{item_id}")

        assert delete_response.status_code == 204

        # Verify item is gone (soft deleted)
        get_response = client.get(f"/api/v1/inbox/{item_id}")
        assert get_response.status_code == 404

    def test_delete_nonexistent_inbox_item_returns_404(self, client: TestClient):
        """Should return 404 when deleting nonexistent item."""
        fake_id = uuid4()
        response = client.delete(f"/api/v1/inbox/{fake_id}")

        assert response.status_code == 404


class TestInboxCount:
    """Test unprocessed count endpoint."""

    def test_get_unprocessed_count_zero(self, client: TestClient, db: Session):
        """Should return zero when no unprocessed items."""
        response = client.get("/api/v1/inbox/count")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] == 0

    def test_get_unprocessed_count(self, client: TestClient, db: Session):
        """Should return count of unprocessed items."""
        # Create some inbox items
        client.post("/api/v1/inbox/", json={"content": "Item 1"})
        client.post("/api/v1/inbox/", json={"content": "Item 2"})
        client.post("/api/v1/inbox/", json={"content": "Item 3"})

        response = client.get("/api/v1/inbox/count")

        assert response.status_code == 200
        data = response.json()
        assert data["count"] >= 3


class TestInboxConversions:
    """Test converting inbox items to tasks, notes, and projects."""

    def test_convert_inbox_to_task_with_defaults(self, client: TestClient, db: Session):
        """Should convert inbox item to task using content as title."""
        # Create inbox item
        create_response = client.post("/api/v1/inbox/", json={"content": "Buy groceries"})
        item_id = create_response.json()["id"]

        # Convert to task (no custom fields)
        convert_response = client.post(f"/api/v1/inbox/{item_id}/convert-to-task", json={})

        assert convert_response.status_code == 200
        task_data = convert_response.json()
        assert task_data["title"] == "Buy groceries"
        assert task_data["status"] == "next"  # Default status

        # Verify inbox item is now processed (not in unprocessed list)
        inbox_response = client.get("/api/v1/inbox/")
        inbox_items = inbox_response.json()
        item_ids = [item["id"] for item in inbox_items]
        assert item_id not in item_ids

    def test_convert_inbox_to_task_with_custom_title(self, client: TestClient, db: Session):
        """Should use custom title when converting to task."""
        # Create inbox item
        create_response = client.post("/api/v1/inbox/", json={"content": "Original content"})
        item_id = create_response.json()["id"]

        # Convert with custom title
        convert_response = client.post(
            f"/api/v1/inbox/{item_id}/convert-to-task",
            json={"title": "Custom task title", "description": "Additional details"},
        )

        assert convert_response.status_code == 200
        task_data = convert_response.json()
        assert task_data["title"] == "Custom task title"
        assert task_data["description"] == "Additional details"

    def test_convert_inbox_to_task_with_project(self, client: TestClient, db: Session):
        """Should associate task with project when converting."""
        # Create a project first
        project_response = client.post(
            "/api/v1/projects/", json={"name": "Home", "outcome_statement": "Maintain home"}
        )
        project_id = project_response.json()["id"]

        # Create inbox item
        create_response = client.post("/api/v1/inbox/", json={"content": "Fix leaky faucet"})
        item_id = create_response.json()["id"]

        # Convert to task with project assignment
        convert_response = client.post(
            f"/api/v1/inbox/{item_id}/convert-to-task", json={"project_id": project_id}
        )

        assert convert_response.status_code == 200
        task_data = convert_response.json()
        assert task_data["project_id"] == project_id

    def test_convert_nonexistent_inbox_to_task_returns_404(self, client: TestClient):
        """Should return 404 when converting nonexistent inbox item."""
        fake_id = uuid4()
        response = client.post(f"/api/v1/inbox/{fake_id}/convert-to-task", json={})

        assert response.status_code == 404

    def test_convert_inbox_to_note_with_defaults(self, client: TestClient, db: Session):
        """Should convert inbox item to note."""
        # Create inbox item
        create_response = client.post(
            "/api/v1/inbox/", json={"content": "Meeting notes\nKey points discussed"}
        )
        item_id = create_response.json()["id"]

        # Convert to note
        convert_response = client.post(f"/api/v1/inbox/{item_id}/convert-to-note", json={})

        assert convert_response.status_code == 200
        note_data = convert_response.json()
        # Title should be generated from first line
        assert "Meeting notes" in note_data["title"]
        assert note_data["content"] == "Meeting notes\nKey points discussed"

    def test_convert_inbox_to_note_with_custom_title(self, client: TestClient, db: Session):
        """Should use custom title when converting to note."""
        # Create inbox item
        create_response = client.post("/api/v1/inbox/", json={"content": "Quick note"})
        item_id = create_response.json()["id"]

        # Convert with custom title
        convert_response = client.post(
            f"/api/v1/inbox/{item_id}/convert-to-note",
            json={"title": "Important Note", "content": "Custom content"},
        )

        assert convert_response.status_code == 200
        note_data = convert_response.json()
        assert note_data["title"] == "Important Note"
        assert note_data["content"] == "Custom content"

    def test_convert_nonexistent_inbox_to_note_returns_404(self, client: TestClient):
        """Should return 404 when converting nonexistent inbox item to note."""
        fake_id = uuid4()
        response = client.post(f"/api/v1/inbox/{fake_id}/convert-to-note", json={})

        assert response.status_code == 404

    def test_convert_inbox_to_project_with_defaults(self, client: TestClient, db: Session):
        """Should convert inbox item to project."""
        # Create inbox item
        create_response = client.post("/api/v1/inbox/", json={"content": "Website redesign"})
        item_id = create_response.json()["id"]

        # Convert to project
        convert_response = client.post(f"/api/v1/inbox/{item_id}/convert-to-project", json={})

        assert convert_response.status_code == 200
        project_data = convert_response.json()
        assert project_data["name"] == "Website redesign"
        assert project_data["status"] == "active"

    def test_convert_inbox_to_project_with_outcome(self, client: TestClient, db: Session):
        """Should create project with outcome statement."""
        # Create inbox item
        create_response = client.post("/api/v1/inbox/", json={"content": "Q4 Marketing"})
        item_id = create_response.json()["id"]

        # Convert with outcome
        convert_response = client.post(
            f"/api/v1/inbox/{item_id}/convert-to-project",
            json={"name": "Q4 Marketing Campaign", "outcome_statement": "Increase brand awareness"},
        )

        assert convert_response.status_code == 200
        project_data = convert_response.json()
        assert project_data["name"] == "Q4 Marketing Campaign"
        assert project_data["outcome_statement"] == "Increase brand awareness"

    def test_convert_nonexistent_inbox_to_project_returns_404(self, client: TestClient):
        """Should return 404 when converting nonexistent inbox item to project."""
        fake_id = uuid4()
        response = client.post(f"/api/v1/inbox/{fake_id}/convert-to-project", json={})

        assert response.status_code == 404


class TestInboxProcessedFilter:
    """Test filtering inbox items by processed status."""

    def test_list_excludes_processed_by_default(self, client: TestClient, db: Session):
        """Should exclude processed items from default listing."""
        # Create inbox item and convert it
        create_response = client.post("/api/v1/inbox/", json={"content": "Process me"})
        item_id = create_response.json()["id"]
        client.post(f"/api/v1/inbox/{item_id}/convert-to-task", json={})

        # List inbox items (should not include processed)
        list_response = client.get("/api/v1/inbox/")
        items = list_response.json()
        item_ids = [item["id"] for item in items]

        assert item_id not in item_ids

    def test_list_includes_processed_when_requested(self, client: TestClient, db: Session):
        """Should include processed items when include_processed=true."""
        # Create inbox item and convert it
        create_response = client.post("/api/v1/inbox/", json={"content": "Process me"})
        item_id = create_response.json()["id"]
        client.post(f"/api/v1/inbox/{item_id}/convert-to-task", json={})

        # List with include_processed=true
        list_response = client.get("/api/v1/inbox/?include_processed=true")
        items = list_response.json()
        item_ids = [item["id"] for item in items]

        assert item_id in item_ids
        # Find the processed item and verify processed_at is set
        processed_item = next(item for item in items if item["id"] == item_id)
        assert processed_item["processed_at"] is not None

    def test_count_excludes_processed_items(self, client: TestClient, db: Session):
        """Should not count processed items in unprocessed count."""
        # Create 3 inbox items
        item1 = client.post("/api/v1/inbox/", json={"content": "Item 1"}).json()
        item2 = client.post("/api/v1/inbox/", json={"content": "Item 2"}).json()
        client.post("/api/v1/inbox/", json={"content": "Item 3"})

        # Process two of them
        client.post(f"/api/v1/inbox/{item1['id']}/convert-to-task", json={})
        client.post(f"/api/v1/inbox/{item2['id']}/convert-to-note", json={})

        # Count should be 1
        count_response = client.get("/api/v1/inbox/count")
        assert count_response.json()["count"] >= 1

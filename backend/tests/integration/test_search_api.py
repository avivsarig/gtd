"""Integration tests for Search API endpoints.

Note: These tests require PostgreSQL with full-text search support.
They are skipped when running with SQLite (in-memory test database).
"""

from datetime import UTC, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.note import Note
from app.models.project import Project
from app.models.task import Task

# Mark all tests in this module to skip if not using PostgreSQL
pytestmark = pytest.mark.skip(
    reason="Search tests require PostgreSQL full-text search (tsvector). SQLite not supported."
)


class TestSearchAPI:
    """Test /api/v1/search/ endpoint."""

    def test_search_with_valid_query_returns_200(self, client: TestClient, db: Session):
        """Should return 200 with valid search query."""
        # Create a task to search for
        task = Task(title="Find me", description="Test task", status="next")
        db.add(task)
        db.commit()

        response = client.get("/api/v1/search/?q=Find")

        assert response.status_code == 200
        data = response.json()
        assert "query" in data
        assert "total_results" in data
        assert "results" in data

    def test_search_query_too_short_returns_400(self, client: TestClient):
        """Should reject queries shorter than 2 characters."""
        response = client.get("/api/v1/search/?q=a")

        assert response.status_code == 400
        assert "at least 2 characters" in response.json()["detail"]

    def test_search_missing_query_parameter_returns_422(self, client: TestClient):
        """Should return 422 when query parameter is missing."""
        response = client.get("/api/v1/search/")

        assert response.status_code == 422

    def test_search_finds_matching_tasks(self, client: TestClient, db: Session):
        """Should find tasks that match the search query."""
        # Create tasks with different content
        task1 = Task(title="Python programming", description="Learn Python", status="next")
        task2 = Task(title="JavaScript coding", description="Learn JS", status="next")
        db.add(task1)
        db.add(task2)
        db.commit()

        response = client.get("/api/v1/search/?q=Python")

        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "Python"
        assert data["total_results"] >= 1

        # Check that Python task is in results
        titles = [result["title"] for result in data["results"]]
        assert "Python programming" in titles
        assert "JavaScript coding" not in titles

    def test_search_finds_matching_notes(self, client: TestClient, db: Session):
        """Should find notes that match the search query."""
        note = Note(title="Meeting notes", content="Discussion about database design")
        db.add(note)
        db.commit()

        response = client.get("/api/v1/search/?q=database")

        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] >= 1

        # Check result type and content
        note_results = [r for r in data["results"] if r["type"] == "note"]
        assert len(note_results) >= 1
        assert note_results[0]["title"] == "Meeting notes"

    def test_search_finds_matching_projects(self, client: TestClient, db: Session):
        """Should find projects that match the search query."""
        project = Project(
            name="Website Redesign",
            outcome_statement="Complete redesign of company website",
            status="active",
        )
        db.add(project)
        db.commit()

        response = client.get("/api/v1/search/?q=website")

        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] >= 1

        # Check result type
        project_results = [r for r in data["results"] if r["type"] == "project"]
        assert len(project_results) >= 1
        assert project_results[0]["title"] == "Website Redesign"

    def test_search_across_all_types_simultaneously(self, client: TestClient, db: Session):
        """Should search tasks, notes, and projects in a single query."""
        task = Task(title="Backend development", status="next")
        note = Note(title="Backend architecture", content="System design notes")
        project = Project(name="Backend API", status="active")

        db.add(task)
        db.add(note)
        db.add(project)
        db.commit()

        response = client.get("/api/v1/search/?q=backend")

        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] >= 3

        # Should have results from all three types
        types = {result["type"] for result in data["results"]}
        assert "task" in types
        assert "note" in types
        assert "project" in types

    def test_search_excludes_deleted_items(self, client: TestClient, db: Session):
        """Should not return soft-deleted items in search results."""
        # Create a task and then soft-delete it
        task = Task(
            title="Deleted task", description="Should not appear", status="next", deleted_at=datetime.now(UTC)
        )
        db.add(task)
        db.commit()

        response = client.get("/api/v1/search/?q=Deleted")

        assert response.status_code == 200
        data = response.json()
        # Should not find the deleted task
        task_results = [r for r in data["results"] if r["type"] == "task"]
        assert len(task_results) == 0

    def test_search_respects_limit_parameter(self, client: TestClient, db: Session):
        """Should limit results to the specified number."""
        # Create multiple tasks
        for i in range(10):
            task = Task(title=f"Task search {i}", status="next")
            db.add(task)
        db.commit()

        response = client.get("/api/v1/search/?q=search&limit=3")

        assert response.status_code == 200
        data = response.json()
        assert len(data["results"]) <= 3

    def test_search_default_limit_is_50(self, client: TestClient, db: Session):
        """Should use default limit of 50 when not specified."""
        # Create many tasks (more than 50)
        for i in range(60):
            task = Task(title=f"Limit test {i}", status="next")
            db.add(task)
        db.commit()

        response = client.get("/api/v1/search/?q=Limit")

        assert response.status_code == 200
        data = response.json()
        # Should be capped at 50
        assert len(data["results"]) <= 50

    def test_search_maximum_limit_is_100(self, client: TestClient, db: Session):
        """Should cap limit at 100 even if higher value requested."""
        # Create many tasks
        for i in range(120):
            task = Task(title=f"Maximum test {i}", status="next")
            db.add(task)
        db.commit()

        # Request 200 results
        response = client.get("/api/v1/search/?q=Maximum&limit=200")

        assert response.status_code == 200
        data = response.json()
        # Should be capped at 100
        assert len(data["results"]) <= 100

    def test_search_invalid_limit_returns_422(self, client: TestClient):
        """Should reject invalid limit values."""
        # Limit must be >= 1
        response = client.get("/api/v1/search/?q=test&limit=0")
        assert response.status_code == 422

        # Limit must be <= 100
        response = client.get("/api/v1/search/?q=test&limit=101")
        assert response.status_code == 422

    def test_search_returns_empty_results_when_no_matches(self, client: TestClient, db: Session):
        """Should return empty results list when nothing matches."""
        response = client.get("/api/v1/search/?q=nonexistentquery12345")

        assert response.status_code == 200
        data = response.json()
        assert data["query"] == "nonexistentquery12345"
        assert data["total_results"] == 0
        assert data["results"] == []

    def test_search_result_includes_all_required_fields(self, client: TestClient, db: Session):
        """Should include all required fields in search results."""
        task = Task(title="Complete task", description="Task description", status="next")
        db.add(task)
        db.commit()

        response = client.get("/api/v1/search/?q=Complete")

        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] >= 1

        result = data["results"][0]
        assert "id" in result
        assert "type" in result
        assert "title" in result
        assert "snippet" in result  # Can be None
        assert "rank" in result
        assert "created_at" in result
        assert "project_id" in result  # Can be None

    def test_search_snippet_is_limited_to_500_chars(self, client: TestClient, db: Session):
        """Should truncate snippets to 500 characters maximum."""
        long_description = "x" * 1000  # 1000 character description
        task = Task(title="Long description", description=long_description, status="next")
        db.add(task)
        db.commit()

        response = client.get("/api/v1/search/?q=Long")

        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] >= 1

        result = data["results"][0]
        if result["snippet"]:
            assert len(result["snippet"]) <= 500

    def test_search_with_special_characters(self, client: TestClient, db: Session):
        """Should handle search queries with special characters."""
        task = Task(title="Email: user@example.com", status="next")
        db.add(task)
        db.commit()

        # Test with special characters that are common in searches
        response = client.get("/api/v1/search/?q=user@example")

        assert response.status_code == 200
        # Should not crash - exact matching behavior depends on PostgreSQL FTS

    def test_search_is_case_insensitive(self, client: TestClient, db: Session):
        """Should perform case-insensitive search."""
        task = Task(title="Important Meeting", status="next")
        db.add(task)
        db.commit()

        # Search with lowercase
        response = client.get("/api/v1/search/?q=important")

        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] >= 1

        # Search with uppercase
        response = client.get("/api/v1/search/?q=IMPORTANT")

        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] >= 1

    def test_search_ranks_title_matches_higher_than_description(self, client: TestClient, db: Session):
        """Should rank items with query in title higher than in description."""
        task1 = Task(title="Review document", description="Some other content", status="next")
        task2 = Task(title="Some task", description="Review the document carefully", status="next")
        db.add(task1)
        db.add(task2)
        db.commit()

        response = client.get("/api/v1/search/?q=Review")

        assert response.status_code == 200
        data = response.json()
        assert data["total_results"] >= 2

        # Task with "Review" in title should have higher rank
        results = data["results"]
        # Find the two tasks in results
        task1_result = next(r for r in results if "document" in r["title"])
        task2_result = next(r for r in results if "Some task" in r["title"])

        # task1 should have higher rank (appears first or has higher rank value)
        assert task1_result["rank"] > task2_result["rank"]

    def test_search_with_project_association(self, client: TestClient, db: Session):
        """Should include project_id in task and note results."""
        project = Project(name="Test Project", status="active")
        db.add(project)
        db.commit()

        task = Task(title="Project task", status="next", project_id=project.id)
        note = Note(title="Project note", content="Content", project_id=project.id)
        db.add(task)
        db.add(note)
        db.commit()

        response = client.get("/api/v1/search/?q=Project")

        assert response.status_code == 200
        data = response.json()

        # Find task and note results
        task_results = [r for r in data["results"] if r["type"] == "task" and "task" in r["title"]]
        note_results = [r for r in data["results"] if r["type"] == "note"]

        if task_results:
            assert task_results[0]["project_id"] == str(project.id)
        if note_results:
            assert note_results[0]["project_id"] == str(project.id)

    def test_search_partial_word_matching(self, client: TestClient, db: Session):
        """Should find results with partial word matches."""
        task = Task(title="Programming tutorial", status="next")
        db.add(task)
        db.commit()

        # Search for part of the word
        response = client.get("/api/v1/search/?q=program")

        assert response.status_code == 200
        data = response.json()
        # PostgreSQL FTS behavior: should find "Programming" when searching "program"
        assert data["total_results"] >= 1

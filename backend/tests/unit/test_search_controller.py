"""Unit tests for Search controller."""

from datetime import UTC, datetime
from unittest.mock import Mock, patch
from uuid import uuid4

from app.controllers import search_controller
from app.schemas.search import SearchResponse


class TestSearch:
    """Test search() controller method."""

    def test_search_calls_repository_with_correct_parameters(self):
        """Should call repository search_all with query and limit."""
        mock_db = Mock()
        query = "test query"
        limit = 50

        mock_results = [
            {
                "id": uuid4(),
                "type": "task",
                "title": "Test Task",
                "snippet": "Test description",
                "rank": 0.8,
                "created_at": datetime.now(UTC),
                "project_id": None,
            }
        ]

        with patch(
            "app.controllers.search_controller.search_repository.search_all",
            return_value=mock_results,
        ) as mock_search_all:
            result = search_controller.search(mock_db, query, limit)

            mock_search_all.assert_called_once_with(mock_db, query, limit)
            assert isinstance(result, SearchResponse)
            assert result.query == query
            assert result.total_results == 1
            assert len(result.results) == 1

    def test_search_enforces_maximum_limit_of_100(self):
        """Should cap limit at 100 even if higher value provided."""
        mock_db = Mock()
        query = "test"
        excessive_limit = 500

        with patch(
            "app.controllers.search_controller.search_repository.search_all",
            return_value=[],
        ) as mock_search_all:
            search_controller.search(mock_db, query, excessive_limit)

            # Should be called with 100, not 500
            mock_search_all.assert_called_once_with(mock_db, query, 100)

    def test_search_returns_empty_results_when_no_matches(self):
        """Should return SearchResponse with empty results list when nothing found."""
        mock_db = Mock()
        query = "nonexistent"

        with patch(
            "app.controllers.search_controller.search_repository.search_all",
            return_value=[],
        ):
            result = search_controller.search(mock_db, query)

            assert isinstance(result, SearchResponse)
            assert result.query == query
            assert result.total_results == 0
            assert result.results == []

    def test_search_converts_repository_results_to_schema_objects(self):
        """Should convert dict results from repository to SearchResultItem objects."""
        mock_db = Mock()
        query = "convert test"
        task_id = uuid4()
        project_id = uuid4()
        created_at = datetime.now(UTC)

        mock_results = [
            {
                "id": task_id,
                "type": "task",
                "title": "Convert Task",
                "snippet": "Description",
                "rank": 0.9,
                "created_at": created_at,
                "project_id": project_id,
            }
        ]

        with patch(
            "app.controllers.search_controller.search_repository.search_all",
            return_value=mock_results,
        ):
            result = search_controller.search(mock_db, query)

            assert result.results[0].id == task_id
            assert result.results[0].type == "task"
            assert result.results[0].title == "Convert Task"
            assert result.results[0].snippet == "Description"
            assert result.results[0].rank == 0.9
            assert result.results[0].project_id == project_id

    def test_search_default_limit_is_50(self):
        """Should use default limit of 50 when not specified."""
        mock_db = Mock()
        query = "default test"

        with patch(
            "app.controllers.search_controller.search_repository.search_all",
            return_value=[],
        ) as mock_search_all:
            search_controller.search(mock_db, query)

            # Should be called with default limit of 50
            mock_search_all.assert_called_once_with(mock_db, query, 50)

    def test_search_handles_multiple_result_types(self):
        """Should handle mixed results from tasks, notes, and projects."""
        mock_db = Mock()
        query = "mixed"

        mock_results = [
            {
                "id": uuid4(),
                "type": "task",
                "title": "Task Result",
                "snippet": "Task snippet",
                "rank": 0.9,
                "created_at": datetime.now(UTC),
                "project_id": None,
            },
            {
                "id": uuid4(),
                "type": "note",
                "title": "Note Result",
                "snippet": "Note content",
                "rank": 0.8,
                "created_at": datetime.now(UTC),
                "project_id": uuid4(),
            },
            {
                "id": uuid4(),
                "type": "project",
                "title": "Project Result",
                "snippet": "Outcome statement",
                "rank": 0.7,
                "created_at": datetime.now(UTC),
                "project_id": None,
            },
        ]

        with patch(
            "app.controllers.search_controller.search_repository.search_all",
            return_value=mock_results,
        ):
            result = search_controller.search(mock_db, query)

            assert result.total_results == 3
            assert result.results[0].type == "task"
            assert result.results[1].type == "note"
            assert result.results[2].type == "project"

    def test_search_total_results_matches_results_length(self):
        """Should set total_results to match the actual number of results."""
        mock_db = Mock()
        query = "count test"

        mock_results = [
            {
                "id": uuid4(),
                "type": "task",
                "title": f"Task {i}",
                "snippet": None,
                "rank": 0.5,
                "created_at": datetime.now(UTC),
                "project_id": None,
            }
            for i in range(5)
        ]

        with patch(
            "app.controllers.search_controller.search_repository.search_all",
            return_value=mock_results,
        ):
            result = search_controller.search(mock_db, query)

            assert result.total_results == 5
            assert len(result.results) == 5

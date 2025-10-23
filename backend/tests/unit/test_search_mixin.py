"""Tests for SearchableMixin."""

import pytest

from app.models.note import Note
from app.models.project import Project
from app.models.task import Task


class TestSearchableMixinConfiguration:
    """Tests for SearchableMixin configuration."""

    def test_task_has_search_fields_configured(self):
        """Task model should have __search_fields__ configured."""
        assert hasattr(Task, "__search_fields__")
        assert Task.__search_fields__ == {"title": "A", "description": "B"}

    def test_note_has_search_fields_configured(self):
        """Note model should have __search_fields__ configured."""
        assert hasattr(Note, "__search_fields__")
        assert Note.__search_fields__ == {"title": "A", "content": "B"}

    def test_project_has_search_fields_configured(self):
        """Project model should have __search_fields__ configured."""
        assert hasattr(Project, "__search_fields__")
        assert Project.__search_fields__ == {"name": "A", "outcome_statement": "B"}

    def test_get_search_config_returns_field_weights(self):
        """get_search_config() should return configured field weights."""
        assert Task.get_search_config() == {"title": "A", "description": "B"}
        assert Note.get_search_config() == {"title": "A", "content": "B"}
        assert Project.get_search_config() == {"name": "A", "outcome_statement": "B"}

    def test_search_fields_reference_actual_model_fields(self):
        """__search_fields__ should only reference fields that exist on the model."""
        # Task
        for field_name in Task.__search_fields__:
            assert hasattr(Task, field_name), f"Task model missing field: {field_name}"

        # Note
        for field_name in Note.__search_fields__:
            assert hasattr(Note, field_name), f"Note model missing field: {field_name}"

        # Project
        for field_name in Project.__search_fields__:
            assert hasattr(Project, field_name), f"Project model missing field: {field_name}"

    def test_search_weights_are_valid(self):
        """All search weights should be valid (A, B, C, or D)."""
        valid_weights = {"A", "B", "C", "D"}

        for weight in Task.__search_fields__.values():
            assert weight in valid_weights, f"Invalid weight: {weight}"

        for weight in Note.__search_fields__.values():
            assert weight in valid_weights, f"Invalid weight: {weight}"

        for weight in Project.__search_fields__.values():
            assert weight in valid_weights, f"Invalid weight: {weight}"

    def test_primary_fields_use_weight_a(self):
        """Primary title/name fields should use highest weight (A)."""
        # Verify title/name fields get highest priority
        assert Task.__search_fields__["title"] == "A"
        assert Note.__search_fields__["title"] == "A"
        assert Project.__search_fields__["name"] == "A"

    def test_models_have_search_vector_column(self):
        """Models using SearchableMixin should have search_vector column."""
        assert hasattr(Task, "search_vector")
        assert hasattr(Note, "search_vector")
        assert hasattr(Project, "search_vector")

    def test_search_vector_excluded_from_mapper(self):
        """search_vector should be excluded from ORM INSERT/UPDATE operations."""
        # This is enforced by __mapper_args__ in SearchableMixin
        assert "exclude_properties" in Task.__mapper_args__
        assert "search_vector" in Task.__mapper_args__["exclude_properties"]

        assert "exclude_properties" in Note.__mapper_args__
        assert "search_vector" in Note.__mapper_args__["exclude_properties"]

        assert "exclude_properties" in Project.__mapper_args__
        assert "search_vector" in Project.__mapper_args__["exclude_properties"]


class TestSearchableMixinValidation:
    """Tests for SearchableMixin validation logic."""

    def test_get_search_config_raises_if_not_configured(self):
        """get_search_config() should raise NotImplementedError if __search_fields__ is empty."""
        from app.models.mixins import SearchableMixin

        # Create a mock class that inherits SearchableMixin but doesn't configure it
        class UnconfiguredModel(SearchableMixin):
            pass

        with pytest.raises(NotImplementedError, match="must define __search_fields__"):
            UnconfiguredModel.get_search_config()

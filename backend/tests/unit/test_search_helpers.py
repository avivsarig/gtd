"""Tests for alembic search helper functions."""

import sys
from pathlib import Path

import pytest

# Add alembic directory to Python path
alembic_path = Path(__file__).parent.parent.parent / "alembic"
sys.path.insert(0, str(alembic_path))

from utils.search_helpers import drop_search_vector_sql, generate_search_vector_sql


class TestGenerateSearchVectorSQL:
    """Tests for generate_search_vector_sql function."""

    def test_generates_valid_alter_table_sql(self):
        """Should generate valid ALTER TABLE statement."""
        add_col, _ = generate_search_vector_sql("tasks", {"title": "A"})

        assert "ALTER TABLE tasks ADD COLUMN search_vector tsvector" in add_col
        assert "GENERATED ALWAYS AS" in add_col
        assert "STORED" in add_col

    def test_generates_valid_create_index_sql(self):
        """Should generate valid CREATE INDEX statement."""
        _, create_idx = generate_search_vector_sql("tasks", {"title": "A"})

        assert "CREATE INDEX idx_tasks_search" in create_idx
        assert "ON tasks USING gin(search_vector)" in create_idx

    def test_includes_all_fields_with_weights(self):
        """Should include all fields with correct weights."""
        add_col, _ = generate_search_vector_sql(
            "tasks", {"title": "A", "description": "B", "notes": "C"}
        )

        assert "setweight(to_tsvector('english', coalesce(title, '')), 'A')" in add_col
        assert "setweight(to_tsvector('english', coalesce(description, '')), 'B')" in add_col
        assert "setweight(to_tsvector('english', coalesce(notes, '')), 'C')" in add_col
        assert "||" in add_col  # Fields should be concatenated

    def test_uses_custom_language(self):
        """Should respect custom language parameter."""
        add_col, _ = generate_search_vector_sql("tasks", {"title": "A"}, language="french")

        assert "to_tsvector('french'" in add_col

    def test_rejects_empty_field_weights(self):
        """Should raise ValueError when field_weights is empty."""
        with pytest.raises(ValueError, match="field_weights cannot be empty"):
            generate_search_vector_sql("tasks", {})

    def test_rejects_invalid_table_name(self):
        """Should raise ValueError for SQL injection attempts in table name."""
        with pytest.raises(ValueError, match="Invalid table name"):
            generate_search_vector_sql("users; DROP TABLE users; --", {"title": "A"})

    def test_rejects_empty_table_name(self):
        """Should raise ValueError for empty table name."""
        with pytest.raises(ValueError, match="table name cannot be empty"):
            generate_search_vector_sql("", {"title": "A"})

    def test_rejects_invalid_field_name(self):
        """Should raise ValueError for SQL injection attempts in field name."""
        with pytest.raises(ValueError, match="Invalid field name"):
            generate_search_vector_sql("tasks", {"title'); DROP TABLE tasks; --": "A"})

    def test_rejects_invalid_weight(self):
        """Should raise ValueError for invalid weight values."""
        with pytest.raises(ValueError, match="Invalid weight"):
            generate_search_vector_sql("tasks", {"title": "Z"})

    def test_accepts_all_valid_weights(self):
        """Should accept all valid weight values (A, B, C, D)."""
        # Should not raise
        add_col, _ = generate_search_vector_sql(
            "tasks", {"field_a": "A", "field_b": "B", "field_c": "C", "field_d": "D"}
        )
        assert "setweight" in add_col

    def test_rejects_invalid_language(self):
        """Should raise ValueError for invalid language parameter."""
        with pytest.raises(ValueError, match="Invalid language"):
            generate_search_vector_sql("tasks", {"title": "A"}, language="eng123")

    def test_accepts_table_names_with_underscores(self):
        """Should accept valid table names containing underscores."""
        add_col, _ = generate_search_vector_sql("inbox_items", {"title": "A"})
        assert "ALTER TABLE inbox_items" in add_col

    def test_accepts_field_names_with_underscores(self):
        """Should accept valid field names containing underscores."""
        add_col, _ = generate_search_vector_sql("tasks", {"created_at": "A"})
        assert "coalesce(created_at, '')" in add_col


class TestDropSearchVectorSQL:
    """Tests for drop_search_vector_sql function."""

    def test_generates_drop_index_sql(self):
        """Should generate valid DROP INDEX statement."""
        drop_idx, _ = drop_search_vector_sql("tasks")

        assert "DROP INDEX IF EXISTS idx_tasks_search" in drop_idx

    def test_generates_drop_column_sql(self):
        """Should generate valid ALTER TABLE DROP COLUMN statement."""
        _, drop_col = drop_search_vector_sql("tasks")

        assert "ALTER TABLE tasks DROP COLUMN IF EXISTS search_vector" in drop_col

    def test_uses_if_exists_for_safety(self):
        """Should use IF EXISTS for idempotent operations."""
        drop_idx, drop_col = drop_search_vector_sql("tasks")

        assert "IF EXISTS" in drop_idx
        assert "IF EXISTS" in drop_col

    def test_rejects_invalid_table_name(self):
        """Should raise ValueError for SQL injection attempts."""
        with pytest.raises(ValueError, match="Invalid table name"):
            drop_search_vector_sql("users; DROP TABLE users; --")

    def test_rejects_empty_table_name(self):
        """Should raise ValueError for empty table name."""
        with pytest.raises(ValueError, match="table name cannot be empty"):
            drop_search_vector_sql("")

    def test_accepts_table_names_with_underscores(self):
        """Should accept valid table names containing underscores."""
        drop_idx, drop_col = drop_search_vector_sql("inbox_items")

        assert "idx_inbox_items_search" in drop_idx
        assert "inbox_items DROP COLUMN" in drop_col

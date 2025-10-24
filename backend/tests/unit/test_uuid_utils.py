"""Tests for UUID utilities module."""

from uuid import UUID

from app.core.uuid_utils import generate_uuid


class TestGenerateUuid:
    """Test cases for generate_uuid function."""

    def test_generate_uuid_returns_string(self):
        """Test that generate_uuid returns a string."""
        result = generate_uuid()
        assert isinstance(result, str)

    def test_generate_uuid_returns_valid_uuid_format(self):
        """Test that generate_uuid returns valid UUID4 format."""
        result = generate_uuid()
        # Should be parseable as UUID
        uuid_obj = UUID(result)
        # Should be version 4
        assert uuid_obj.version == 4

    def test_generate_uuid_returns_36_character_string(self):
        """Test that generate_uuid returns proper length."""
        result = generate_uuid()
        assert len(result) == 36

    def test_generate_uuid_returns_unique_values(self):
        """Test that generate_uuid generates unique values."""
        uuids = [generate_uuid() for _ in range(100)]
        # All UUIDs should be unique
        assert len(set(uuids)) == 100

    def test_generate_uuid_contains_proper_hyphens(self):
        """Test that generate_uuid returns properly formatted UUID."""
        result = generate_uuid()
        parts = result.split("-")
        # UUID format: 8-4-4-4-12
        assert len(parts) == 5
        assert len(parts[0]) == 8
        assert len(parts[1]) == 4
        assert len(parts[2]) == 4
        assert len(parts[3]) == 4
        assert len(parts[4]) == 12

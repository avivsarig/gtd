"""UUID utilities for consistent UUID handling across the application.

This module provides centralized UUID generation and type exports,
following the DRY principle and ensuring consistency.
"""

from uuid import UUID, uuid4


def generate_uuid() -> str:
    """Generate a new UUID4 as a string.

    Returns:
        str: A new UUID4 value as a 36-character string.

    Example:
        >>> user_id = generate_uuid()
        >>> len(user_id)
        36
    """
    return str(uuid4())


# Re-export UUID type for convenience
__all__ = ["UUID", "generate_uuid"]

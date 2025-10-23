"""Helper functions for generating full-text search SQL in migrations.

These utilities eliminate duplication when adding search_vector columns
to multiple tables with consistent patterns.
"""


def _validate_identifier(identifier: str, identifier_type: str) -> None:
    """Validate SQL identifier to prevent injection attacks.

    Args:
        identifier: The identifier to validate (table name, column name, etc.)
        identifier_type: Description of what type of identifier (for error messages)

    Raises:
        ValueError: If identifier contains invalid characters
    """
    if not identifier:
        raise ValueError(f"{identifier_type} cannot be empty")

    # SQL identifiers should only contain alphanumeric chars and underscores
    if not identifier.replace("_", "").isalnum():
        raise ValueError(
            f"Invalid {identifier_type}: '{identifier}'. "
            f"Must contain only alphanumeric characters and underscores."
        )


def generate_search_vector_sql(
    table_name: str,
    field_weights: dict[str, str],
    language: str = "english",
) -> tuple[str, str]:
    """Generate SQL for adding search_vector column and GIN index.

    Creates a GENERATED ALWAYS AS STORED column that automatically maintains
    a tsvector for full-text search, plus a GIN index for query performance.

    Args:
        table_name: Name of the table to add search to
        field_weights: Dict mapping column names to search weights
                      ('A' = highest, 'B' = medium, 'C' = low, 'D' = lowest)
                      Example: {'title': 'A', 'description': 'B'}
        language: PostgreSQL text search configuration (default: 'english')

    Returns:
        Tuple of (add_column_sql, create_index_sql)

    Raises:
        ValueError: If inputs contain invalid characters or are malformed

    Example:
        >>> add_col, add_idx = generate_search_vector_sql(
        ...     'tasks',
        ...     {'title': 'A', 'description': 'B'}
        ... )
        >>> op.execute(add_col)
        >>> op.execute(add_idx)
    """
    # Validate inputs to prevent SQL injection
    _validate_identifier(table_name, "table name")

    if not field_weights:
        raise ValueError(f"field_weights cannot be empty for table {table_name}")

    # Validate field names
    for field in field_weights:
        _validate_identifier(field, "field name")

    # Validate weights are single letters A-D
    valid_weights = {"A", "B", "C", "D"}
    for weight in field_weights.values():
        if weight not in valid_weights:
            raise ValueError(
                f"Invalid weight: '{weight}'. Must be one of: {', '.join(sorted(valid_weights))}"
            )

    # Validate language contains only alphabetic characters
    if not language.isalpha():
        raise ValueError(f"Invalid language: '{language}'. Must contain only letters.")

    # Build weighted tsvector expression for each field
    weighted_fields = [
        f"setweight(to_tsvector('{language}', coalesce({field}, '')), '{weight}')"
        for field, weight in field_weights.items()
    ]

    # Combine all fields with concatenation operator
    vector_expression = " || ".join(weighted_fields)

    # Generate DDL statements
    add_column_sql = f"""
ALTER TABLE {table_name} ADD COLUMN search_vector tsvector
GENERATED ALWAYS AS ({vector_expression}) STORED
    """.strip()

    create_index_sql = f"""
CREATE INDEX idx_{table_name}_search ON {table_name} USING gin(search_vector)
    """.strip()

    return add_column_sql, create_index_sql


def drop_search_vector_sql(table_name: str) -> tuple[str, str]:
    """Generate SQL for removing search_vector column and index.

    Args:
        table_name: Name of the table to remove search from

    Returns:
        Tuple of (drop_index_sql, drop_column_sql)

    Raises:
        ValueError: If table_name contains invalid characters

    Example:
        >>> drop_idx, drop_col = drop_search_vector_sql('tasks')
        >>> op.execute(drop_idx)
        >>> op.execute(drop_col)
    """
    # Validate input to prevent SQL injection
    _validate_identifier(table_name, "table name")

    drop_index_sql = f"DROP INDEX IF EXISTS idx_{table_name}_search"
    drop_column_sql = f"ALTER TABLE {table_name} DROP COLUMN IF EXISTS search_vector"

    return drop_index_sql, drop_column_sql

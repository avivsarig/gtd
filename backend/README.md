# GTD Backend

FastAPI-based REST API for GTD Task Management System.

## Quick Start

```bash
# Install dependencies
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Start PostgreSQL
docker compose up -d postgres

# Configure environment
cat > .env << EOF
DATABASE_URL=postgresql://gtd:gtd_dev@localhost:5432/gtd
DEBUG=True
EOF

# Test database connection
python tests/integration/test_db_connection.py
```

## Architecture Overview

**3-Layer Clean Architecture:**
```
HTTP Request
  → API Layer (app/api/v1/) - Routes, HTTP handling
    → Controller (app/controllers/) - Business logic
      → Repository (app/repositories/) - Database operations
        → Database
```

**Directory Structure:**
```
app/
├── api/v1/          # FastAPI routes (tasks.py, projects.py, notes.py)
├── controllers/     # Business logic layer
├── repositories/    # Data access layer (CRUD only)
├── models/          # SQLAlchemy ORM models
├── schemas/         # Pydantic validation schemas
├── core/            # Configuration
└── db/              # Database setup
```

See [CLAUDE.md](CLAUDE.md) for detailed architecture and development guidelines.

## API Documentation

**Interactive API Docs:** http://localhost:8000/docs

**Implemented Endpoints:**
- `/api/v1/tasks` - Task CRUD, status management, completion tracking
- `/api/v1/projects` - Project CRUD, statistics, task assignment
- `/api/v1/notes` - Note CRUD, project association

See OpenAPI docs at `/docs` for complete endpoint reference.

## Testing

**Current Status:** 62 passing unit tests, 61% coverage (target: 80%)

```bash
pytest                     # All tests
pytest tests/unit -v       # Unit tests only
pytest --cov=app           # With coverage report
```

**Test Infrastructure:**
- pytest with Factory Boy for test data
- In-memory SQLite for unit tests
- FastAPI TestClient for integration tests
- Fixtures: `db_session`, `client`, `sample_task`, `sample_project`, `sample_note`

See [/TESTING.md](../TESTING.md) for comprehensive testing guide.

## Development

See [CLAUDE.md](CLAUDE.md) for:
- Layer responsibilities and patterns
- Data model requirements
- Business logic rules
- Code standards
- Performance requirements

## Current Status

✅ **Completed:**
- 3-layer architecture implemented
- Tasks, Projects, Notes APIs complete
- Status management (Next/Waiting/Someday)
- Comprehensive test framework

🚧 **In Progress:**
- Context tagging
- Search functionality
- Performance optimization

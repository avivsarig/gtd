# GTD Backend

FastAPI-based REST API for GTD Task Management System.

## Directory Structure

```
backend/
├── app/                      # Application code
│   ├── api/                 # API layer (HTTP routes)
│   │   └── v1/             # API version 1
│   │       └── tasks.py    # Task HTTP endpoints
│   ├── controllers/        # Business logic layer
│   ├── repositories/       # Data access layer
│   ├── models/             # SQLAlchemy ORM models
│   ├── schemas/            # Pydantic schemas for validation
│   ├── core/               # Core configuration
│   │   └── config.py       # Settings and environment variables
│   ├── db/                 # Database setup
│   │   └── database.py     # SQLAlchemy engine, session, Base
│   └── main.py             # FastAPI application entry point
├── tests/                # Test suite
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   │   └── test_db_connection.py
│   └── fixtures/        # Test fixtures and utilities
├── alembic/             # Database migrations (to be initialized)
├── .env                 # Environment variables (not in git)
├── .gitignore           # Git ignore rules
├── alembic.ini          # Alembic configuration
├── Dockerfile           # Container image definition
└── requirements.txt     # Python dependencies
```

## Setup

### 1. Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
Create `.env` file:
```
DATABASE_URL=postgresql://gtd:gtd_dev@localhost:5432/gtd
DEBUG=True
```

### 4. Start PostgreSQL
```bash
docker-compose up -d postgres
```

### 5. Test database connection
```bash
python tests/integration/test_db_connection.py
```

## Development

- See `/CLAUDE.md` for detailed development guide

### Architecture (3-layer)
```
Request → API (HTTP routes) → Controller (business logic) → Repository (data access) → Database
```

- **API layer** (`app/api/v1/`): FastAPI routes, HTTP concerns, request/response handling
- **Controllers** (`app/controllers/`): Business logic, orchestration, validation rules
- **Repositories** (`app/repositories/`): Database operations only (CRUD)
- **Models** (`app/models/`): SQLAlchemy ORM models
- **Schemas** (`app/schemas/`): Pydantic request/response validation

## Current Status

✅ Step 1: Dependencies installed
✅ Step 2: Database connection configured and tested
⏳ Next: Initialize FastAPI application

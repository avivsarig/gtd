.PHONY: help build up down restart clean logs logs-be logs-fe db-shell db-migrate db-reset dev fresh status lint lint-fe lint-be format format-fe format-be test test-all test-unit test-int test-cov test-fast test-fe test-fe-watch test-fe-ui test-fe-cov

help:
	@echo "GTD Task Management - Makefile Commands"
	@echo "========================================"
	@echo "make build       - Build all Docker images"
	@echo "make up          - Start all services"
	@echo "make down        - Stop all services"
	@echo "make restart     - Restart all services"
	@echo "make clean       - Remove containers, volumes, and images"
	@echo "make logs        - Show logs from all services"
	@echo "make logs-be     - Show backend logs"
	@echo "make logs-fe     - Show frontend logs"
	@echo "make db-shell    - Open PostgreSQL shell"
	@echo "make db-migrate  - Run database migrations"
	@echo "make db-reset    - Reset database (WARNING: deletes all data)"
	@echo "make lint        - Run all linters (ruff, black, mypy, ESLint, prettier)"
	@echo "make lint-fe     - Run frontend linters (ESLint, prettier, TypeScript)"
	@echo "make lint-be     - Run backend linters (ruff, black, mypy)"
	@echo "make format      - Auto-format all code (black, ruff, prettier)"
	@echo "make format-fe   - Auto-format frontend code"
	@echo "make format-be   - Auto-format backend code"
	@echo "make test        - Run backend unit tests (default)"
	@echo "make test-all    - Run ALL backend tests (including broken integration tests)"
	@echo "make test-unit   - Run unit tests only"
	@echo "make test-int    - Run integration tests (requires PostgreSQL)"
	@echo "make test-cov    - Run tests with coverage report"
	@echo "make test-fast   - Run fast tests (exclude slow tests)"
	@echo "make test-fe     - Run frontend tests"
	@echo "make test-fe-watch - Run frontend tests in watch mode"
	@echo "make test-fe-ui  - Run frontend tests with interactive UI"
	@echo "make test-fe-cov - Run frontend tests with coverage report"
	@echo ""

build:
	docker compose build

up:
	docker compose up -d

down:
	docker compose down

restart: down up

clean:
	@echo "WARNING: This will remove all containers, volumes, and images!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		docker image rm gtd-backend 2>/dev/null || true; \
		docker image rm gtd-frontend 2>/dev/null || true; \
		echo "Cleanup complete!"; \
	else \
		echo "Cancelled."; \
	fi

logs:
	docker compose logs -f

logs-be:
	docker compose logs -f backend

logs-fe:
	docker compose logs -f frontend

db-shell:
	docker compose exec postgres psql -U gtd -d gtd

db-migrate:
	docker compose exec backend alembic upgrade head

db-reset:
	@echo "WARNING: This will delete all data in the database!"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker compose down -v; \
		docker compose up -d; \
		echo "Database reset complete!"; \
	else \
		echo "Cancelled."; \
	fi

# Development shortcuts
dev: up logs

fresh: clean build up
	@echo "Fresh environment ready!"

status:
	@docker compose ps
	@echo ""
	@echo "Backend API: http://localhost:8000"
	@echo "API Docs: http://localhost:8000/docs"
	@echo "Frontend: http://localhost:5173"

# Code quality
lint: lint-fe lint-be
	@echo "All linting checks passed!"

lint-fe:
	@echo "Running frontend linters..."
	docker compose exec frontend npm run lint
	docker compose exec frontend npm run format:check
	docker compose exec frontend npm run tc

lint-be:
	@echo "Running backend linters..."
	docker compose exec backend ruff check .
	docker compose exec backend black --check .
	docker compose exec backend mypy app

format:
	@echo "Formatting code..."
	docker compose exec frontend npm run format
	docker compose exec backend black .
	docker compose exec backend ruff check --fix .

format-fe:
	@echo "Formatting frontend code..."
	docker compose exec frontend npm run format

format-be:
	@echo "Formatting backend code..."
	docker compose exec backend black .
	docker compose exec backend ruff check --fix .

test:
	@echo "Running backend tests (unit tests only - integration tests require PostgreSQL)..."
	docker compose exec backend pytest tests/unit

test-all:
	@echo "Running ALL backend tests (including integration tests that may fail with SQLite)..."
	docker compose exec backend pytest

test-unit:
	@echo "Running unit tests..."
	docker compose exec backend pytest tests/unit -v

test-int:
	@echo "Running integration tests (NOTE: requires PostgreSQL features, will fail with SQLite)..."
	docker compose exec backend pytest tests/integration -v -m integration

test-cov:
	@echo "Running tests with coverage..."
	docker compose exec backend pytest tests/unit --cov=app --cov-report=term-missing --cov-report=html --cov-report=xml --cov-fail-under=60

test-watch:
	@echo "Running tests in watch mode..."
	docker compose exec backend pytest-watch

test-fast:
	@echo "Running fast tests (excluding slow tests)..."
	docker compose exec backend pytest -m "not slow" -x

# Frontend tests
test-fe:
	@echo "Running frontend tests..."
	docker compose exec frontend npm test

test-fe-watch:
	@echo "Running frontend tests in watch mode..."
	docker compose exec frontend npm run test:watch

test-fe-ui:
	@echo "Running frontend tests with interactive UI..."
	docker compose exec frontend npm run test:ui

test-fe-cov:
	@echo "Running frontend tests with coverage..."
	docker compose exec frontend npm run test:coverage

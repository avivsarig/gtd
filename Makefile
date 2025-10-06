.PHONY: help build up down restart clean logs db-shell db-migrate db-reset test-seed lint lint-fe lint-be test

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
	@echo "make lint        - Run linters on frontend and backend"
	@echo "make lint-fe     - Run ESLint on frontend"
	@echo "make lint-be     - Run linters on backend"
	@echo "make test        - Run all backend tests"
	@echo "make test-unit   - Run unit tests only"
	@echo "make test-int    - Run integration tests only"
	@echo "make test-cov    - Run tests with coverage report"
	@echo "make test-watch  - Run tests in watch mode"
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
	docker compose exec frontend npm run tc

lint-be:
	@echo "Running backend linters..."
	docker compose exec backend python -m pytest tests/unit -v

test:
	@echo "Running all backend tests..."
	docker compose exec backend pytest

test-unit:
	@echo "Running unit tests..."
	docker compose exec backend pytest tests/unit -v

test-int:
	@echo "Running integration tests..."
	docker compose exec backend pytest tests/integration -v -m integration

test-cov:
	@echo "Running tests with coverage..."
	docker compose exec backend pytest --cov=app --cov-report=term-missing --cov-report=html

test-watch:
	@echo "Running tests in watch mode..."
	docker compose exec backend pytest-watch

test-fast:
	@echo "Running fast tests (excluding slow tests)..."
	docker compose exec backend pytest -m "not slow" -x

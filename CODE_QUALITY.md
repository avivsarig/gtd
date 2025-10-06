# Code Quality Tools

Comprehensive code quality toolkit with automated linting, formatting, and type checking.

## Overview

**Backend (Python):**
- **ruff** - Fast, modern Python linter (replaces flake8, isort, pyupgrade)
- **black** - Uncompromising code formatter
- **mypy** - Static type checker

**Frontend (TypeScript/React):**
- **ESLint** - JavaScript/TypeScript linter
- **Prettier** - Opinionated code formatter
- **TypeScript** - Static type checking

## Quick Commands

```bash
# Check code quality (fails on issues)
make lint          # All linters
make lint-be       # Backend only (ruff, black, mypy)
make lint-fe       # Frontend only (ESLint, prettier, TypeScript)

# Auto-fix issues
make format        # Format all code
make format-be     # Format backend (black + ruff --fix)
make format-fe     # Format frontend (prettier)
```

## Backend Tools

### Ruff

Fast Python linter that combines functionality of flake8, isort, pyupgrade, and more.

**Features:**
- Import sorting (replaces isort)
- Code modernization (replaces pyupgrade)
- Error detection (replaces flake8)
- 10-100x faster than alternatives

**Configuration:** `backend/pyproject.toml`

```bash
# Check for issues
docker compose exec backend ruff check .

# Auto-fix issues
docker compose exec backend ruff check --fix .

# Show all available rules
docker compose exec backend ruff help
```

**Selected Rules:**
- `E/W` - pycodestyle (PEP 8 style)
- `F` - pyflakes (logic errors)
- `I` - isort (import sorting)
- `B` - flake8-bugbear (bug detection)
- `C4` - flake8-comprehensions (better comprehensions)
- `UP` - pyupgrade (modernize syntax)
- `ARG` - unused arguments
- `SIM` - simplify code

### Black

Deterministic code formatter - "The Uncompromising Code Formatter"

**Features:**
- Line length: 100 characters
- PEP 8 compliant
- No configuration needed

```bash
# Check formatting
docker compose exec backend black --check .

# Format code
docker compose exec backend black .

# Show diff without changing files
docker compose exec backend black --diff .
```

### Mypy

Static type checker for Python.

**Configuration:** `backend/pyproject.toml`

```bash
# Type check
docker compose exec backend mypy app

# Type check tests (more lenient)
docker compose exec backend mypy tests
```

**Current Settings:**
- Lenient mode (allows untyped functions)
- Ignores missing type stubs
- Gradually increase strictness as codebase matures

## Frontend Tools

### ESLint

JavaScript/TypeScript linter with React-specific rules.

**Configuration:** `frontend/eslint.config.js`

```bash
# Check for issues
docker compose exec frontend npm run lint

# Auto-fix issues
docker compose exec frontend npm run lint:fix
```

**Enabled Plugins:**
- `@eslint/js` - Core JavaScript rules
- `typescript-eslint` - TypeScript-specific rules
- `eslint-plugin-react-hooks` - React Hooks rules
- `eslint-plugin-react-refresh` - Fast Refresh compatibility

### Prettier

Opinionated code formatter for JavaScript, TypeScript, CSS, JSON, Markdown.

**Configuration:** `frontend/package.json` (prettier field)

```bash
# Check formatting
docker compose exec frontend npm run format:check

# Format code
docker compose exec frontend npm run format

# Format specific files
docker compose exec frontend npx prettier --write src/components/*.tsx
```

**Settings:**
- No semicolons
- Double quotes
- Trailing commas (all)
- Tailwind CSS class sorting (via plugin)

### TypeScript

Static type checking for TypeScript/JavaScript.

**Configuration:** `frontend/tsconfig.json`

```bash
# Type check
docker compose exec frontend npm run tc

# Type check with watch mode
docker compose exec frontend npx tsc -b --watch
```

## Pre-commit Hooks (Optional)

Automatically run formatters and linters before each git commit.

### Setup

```bash
# Install pre-commit (local machine)
pip install pre-commit

# Install git hooks
pre-commit install

# Test hooks on all files
pre-commit run --all-files
```

### Configured Hooks

1. **ruff** - Lint and fix Python code
2. **ruff-format** - Format Python code
3. **mypy** - Type check Python code
4. **prettier** - Format frontend code
5. **trailing-whitespace** - Remove trailing whitespace
6. **end-of-file-fixer** - Ensure files end with newline
7. **check-yaml** - Validate YAML syntax
8. **check-merge-conflict** - Detect merge conflict markers
9. **detect-secrets** - Prevent committing secrets

### Skipping Hooks

```bash
# Skip all hooks for a commit
git commit --no-verify

# Skip specific hooks
SKIP=mypy git commit -m "message"
```

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/quality.yml`:

```yaml
name: Code Quality

on: [push, pull_request]

jobs:
  backend-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.12'
      - run: pip install -r backend/requirements.txt
      - run: ruff check backend/
      - run: black --check backend/
      - run: mypy backend/app

  frontend-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: cd frontend && npm ci
      - run: cd frontend && npm run lint
      - run: cd frontend && npm run format:check
      - run: cd frontend && npm run tc
```

## Best Practices

### When to Run Linters

1. **Before Committing**: Run `make lint` or use pre-commit hooks
2. **During Development**: Use `make format` to auto-fix issues
3. **In CI/CD**: Run `make lint` as part of automated tests
4. **Before Pull Requests**: Ensure all checks pass

### Fixing Issues

**Auto-fixable:**
```bash
make format        # Fix most formatting and simple issues
```

**Manual fixes required:**
- Complex logic issues (ruff checks that can't auto-fix)
- Type errors (mypy)
- React Hooks dependencies (ESLint)

### Ignoring Specific Rules

**Backend (ruff):**
```python
# ruff: noqa: E501
long_line_that_needs_to_stay_long = "..."

# noqa: ARG001 - unused argument
def callback(event, context):  # context unused but required by API
    pass
```

**Frontend (ESLint):**
```typescript
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _unusedButDocumented = value
```

**TypeScript:**
```typescript
// @ts-expect-error - vite version mismatch
const config = defineConfig({ ... })
```

## Troubleshooting

### "Command not found: ruff/black/mypy"

Rebuild backend container:
```bash
docker compose build backend
docker compose up -d backend
```

### "Module not found" in mypy

Add to `pyproject.toml`:
```toml
[[tool.mypy.overrides]]
module = "module_name.*"
ignore_missing_imports = true
```

### Prettier conflicts with ESLint

Prettier should always win for formatting. Disable conflicting ESLint rules:
```javascript
// eslint.config.js
export default {
  rules: {
    'max-len': 'off',  // Let prettier handle line length
  }
}
```

### Pre-commit hooks are slow

Skip type checking in pre-commit, run separately:
```yaml
# .pre-commit-config.yaml
- id: mypy
  stages: [manual]  # Only run with: pre-commit run mypy --all-files
```

## Resources

- [Ruff Documentation](https://docs.astral.sh/ruff/)
- [Black Documentation](https://black.readthedocs.io/)
- [Mypy Documentation](https://mypy.readthedocs.io/)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Pre-commit Documentation](https://pre-commit.com/)

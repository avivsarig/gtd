# GTD Frontend

React frontend for GTD task management system.

## Quick Start

```bash
npm install
npm run dev         # Development server at http://localhost:5173
```

## Tech Stack

React 19 + Vite + TypeScript + Tailwind v4 + shadcn/ui + React Router v7

See [CLAUDE.md](CLAUDE.md) for detailed tech stack info and conventions.

## Commands

```bash
npm run dev           # Development server
npm run build         # Production build
npm run preview       # Preview build

# Testing
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage

# Code Quality
npm run lint          # ESLint
npm run tc            # Type checking
npm run validate      # Lint + type check
```

## Implemented Features

✅ **Current:**
- Universal capture (Cmd+K modal + Quick Capture form) → Inbox
- Inbox processing (convert to tasks/notes, delete) with keyboard shortcuts (J/K, T/N/D)
- Task management (complete/uncomplete, status changes, project assignment, delete)
- Notes CRUD (create, edit, delete, project assignment)
- Unified ItemCard component with consistent Edit/Delete buttons
- Dashboard layout (Capture | Inbox | Tasks | Notes)
- Full inbox processing page (`/inbox`)

🚧 **Planned:**
- Task/Note edit functionality (UI ready, forms needed)
- Context filtering (@home, @computer, @phone)
- Full-text search
- Weekly review workflow
- Projects management UI

## Development

See [CLAUDE.md](CLAUDE.md) for:
- Architecture patterns & conventions
- Keyboard-first design requirements
- GTD methodology compliance
- Component guidelines
- Testing requirements

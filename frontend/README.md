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

## Project Structure

```
src/
├── components/       # UI components (QuickCapture, TaskList, NotesList)
│   └── ui/          # shadcn/ui primitives
├── routes/          # Pages (Home.tsx)
├── lib/api.ts       # Backend client
└── styles/          # Tailwind config
```

## Implemented Features

✅ **Current:**
- Task capture & status management (Next/Waiting/Someday)
- Task completion tracking
- Status filtering with badges
- Project assignment
- Notes CRUD
- Dark mode

🚧 **In Progress:**
- Inbox UI (Cmd+K universal capture modal)
- Keyboard shortcuts (see CLAUDE.md)
- Context filtering
- Full-text search

## Development

See [CLAUDE.md](CLAUDE.md) for:
- Architecture patterns & conventions
- Keyboard-first design requirements
- GTD methodology compliance
- Component guidelines
- Testing requirements

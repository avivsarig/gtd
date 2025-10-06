# GTD Frontend

React-based frontend for the GTD task management system.

## Tech Stack

- **React 19** + **Vite** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI primitives)
- **React Router v7** + **Lucide React** icons

## Quick Start

```bash
npm install
npm run dev       # Development server
npm run build     # Production build
npm run preview   # Preview production build
```

## Development Commands

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:ui       # Interactive UI
npm run test:coverage # With coverage

npm run lint          # Run ESLint
npm run tc            # Type checking
npm run validate      # Lint + type check
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── QuickCapture.tsx  # Task creation form
│   ├── TaskList.tsx      # Task list with controls
│   ├── NotesList.tsx     # Notes management
│   └── ui/               # shadcn/ui components
├── routes/          # Page components (Home.tsx)
├── lib/
│   └── api.ts       # Backend API client
└── styles/          # Global styles + Tailwind config
```

See [CLAUDE.md](CLAUDE.md) for detailed architecture and component guidelines.

## Testing

**Framework:** Vitest + React Testing Library

```bash
npm test              # All tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

**Test Infrastructure:**
- Vitest for fast Vite-native testing
- React Testing Library for component tests
- @testing-library/user-event for interactions
- jsdom for DOM environment

See [/TESTING.md](../TESTING.md) for testing patterns and examples.

## Implemented Features

✅ **Current:**
- Task capture, status management (Next/Waiting/Someday)
- Task completion tracking
- Status filtering with count badges
- Project assignment dropdown
- Notes CRUD with project association
- Dark mode UI

🚧 **In Progress:**
- Keyboard shortcuts (Cmd+K quick capture)
- Context filtering
- Full-text search
- Calendar integration

## Development

See [CLAUDE.md](CLAUDE.md) for:
- Component architecture patterns
- Keyboard-first design requirements
- GTD methodology compliance
- Testing requirements
- Code quality standards

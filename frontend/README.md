# GTD Frontend

React-based frontend for the GTD (Getting Things Done) task management system.

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first styling
- **shadcn/ui** - Radix UI component primitives
- **React Router v7** - Client-side routing
- **Lucide React** - Icon library

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── QuickCapture.tsx  # Task creation form
│   ├── TaskList.tsx      # Task list with status/project controls
│   ├── NotesList.tsx     # Notes list with expand/collapse
│   ├── NoteForm.tsx      # Note creation/editing form
│   └── ui/               # shadcn/ui components
├── routes/          # Page components
│   └── Home.tsx     # Main page (tasks + notes)
├── lib/             # Utility functions
│   └── api.ts       # API client for backend
└── styles/          # Global styles and Tailwind config
```

## Code Quality

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run tc
```

### Validate All
```bash
npm run validate
```

## Implemented Features

✅ **Current**
- **Task Management** - Quick capture, status updates (Next/Waiting/Someday)
- **Task Completion** - Checkbox toggle with visual feedback
- **Status Filtering** - Filter tasks by status with count badges
- **Project Assignment** - Assign tasks to projects via dropdown
- **Notes Management** - Create, edit, delete notes with project association
  - Expandable note cards
  - Rich content support
  - Project filtering
- **Dark Mode UI** - Default dark theme with consistent styling

🚧 **In Progress**
- **Keyboard shortcuts** - Cmd+K quick capture
- **Context filtering** - Filter tasks by context tags
- **Search functionality** - Full-text task search
- **Calendar integration** - Scheduled date/time support

## Development Guidelines

Refer to `/frontend/CLAUDE.md` for detailed development instructions and architecture guidelines.

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
│   └── ui/          # shadcn/ui components
├── routes/          # Page components
├── lib/             # Utility functions
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

## Key Features

- **Keyboard-first navigation** - All actions accessible via keyboard shortcuts
- **Fast task capture** - Optimized for rapid input
- **GTD methodology** - Next/Waiting/Someday/Maybe lists
- **Context-based filtering** - Filter tasks by context tags
- **Dark mode support** - Built-in theme switching

## Development Guidelines

Refer to `/frontend/CLAUDE.md` for detailed development instructions and architecture guidelines.

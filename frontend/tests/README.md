# Frontend Testing Guide

## Overview

The frontend uses **Vitest** with **React Testing Library** for component and integration testing. Tests follow the same principles as the backend: test behavior, not implementation.

## Test Stack

- **Vitest** - Fast test runner built for Vite
- **React Testing Library** - Component testing with user-centric queries
- **@testing-library/user-event** - Realistic user interactions
- **@testing-library/jest-dom** - Custom matchers for assertions
- **jsdom** - DOM environment for tests

## Directory Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── QuickCapture.tsx
│   │   └── QuickCapture.test.tsx     # Co-located component tests
│   ├── routes/
│   │   ├── Home.tsx
│   │   └── Home.test.tsx              # Route-level integration tests
│   ├── lib/
│   │   ├── api.ts
│   │   └── api.test.ts                # API client tests
│   └── test/                          # Shared test utilities
│       ├── setup.ts                   # Global test setup
│       ├── factories.ts               # Test data generators
│       ├── utils.tsx                  # Custom render helpers
│       └── mocks/
│           └── api.ts                 # API mocks
└── vitest.config.ts
```

## Running Tests

```bash
# Run all tests
make test-fe
npm test

# Watch mode (re-run on file changes)
make test-fe-watch
npm run test:watch

# Interactive UI
make test-fe-ui
npm run test:ui

# Coverage report
make test-fe-cov
npm run test:coverage
```

## Writing Tests

### Component Tests

Test user-facing behavior, not implementation details.

**Example: Testing a button**
```typescript
import { describe, it, expect, vi } from "vitest"
import { render, screen } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { MyButton } from "./MyButton"

describe("MyButton", () => {
  it("calls onClick when clicked", async () => {
    const user = userEvent.setup()
    const handleClick = vi.fn()

    render(<MyButton onClick={handleClick}>Click me</MyButton>)

    await user.click(screen.getByRole("button", { name: /click me/i }))

    expect(handleClick).toHaveBeenCalledOnce()
  })
})
```

### Using Test Factories

Generate realistic test data with factories:

```typescript
import {
  createMockTask,
  createCompletedTask,
  createMultipleTasks,
} from "@/test/factories"

// Single task
const task = createMockTask({ title: "My custom title" })

// Completed task
const done = createCompletedTask()

// Multiple tasks
const tasks = createMultipleTasks(5)
```

**Available factories:**
- `createMockTask(overrides?)` - Generate task
- `createCompletedTask(overrides?)` - Completed task
- `createTaskWithStatus(status, overrides?)` - Task with specific status
- `createMockProject(overrides?)` - Generate project
- `createProjectWithStats(stats, overrides?)` - Project with task counts
- `createMockNote(overrides?)` - Generate note
- `createMockInboxItem(overrides?)` - Generate inbox item
- `createMockContext(overrides?)` - Generate context
- `createMultiple*()` - Generate arrays

### Mocking API Calls

Use the centralized API mocks:

```typescript
import { vi } from "vitest"
import * as api from "@/lib/api"
import { createMockTask } from "@/test/factories"

// Mock the entire API module
vi.mock("@/lib/api")

describe("TaskList", () => {
  it("fetches and displays tasks", async () => {
    // Setup mock response
    const mockTasks = [createMockTask(), createMockTask()]
    vi.mocked(api.getTasks).mockResolvedValue(mockTasks)

    render(<TaskList />)

    // Wait for tasks to appear
    await screen.findByText("Test Task 1")
    expect(screen.getByText("Test Task 2")).toBeInTheDocument()
  })
})
```

### Testing User Interactions

Use `@testing-library/user-event` for realistic interactions:

```typescript
import userEvent from "@testing-library/user-event"

it("submits form on Enter key", async () => {
  const user = userEvent.setup()
  render(<MyForm />)

  const input = screen.getByRole("textbox")
  await user.type(input, "Hello world")
  await user.keyboard("{Enter}")

  expect(mockSubmit).toHaveBeenCalledWith({ text: "Hello world" })
})
```

### Testing Async Behavior

Use `waitFor` or `find*` queries:

```typescript
import { waitFor } from "@/test/utils"

it("shows error message on API failure", async () => {
  vi.mocked(api.createTask).mockRejectedValue(new Error("API Error"))

  const user = userEvent.setup()
  render(<TaskForm />)

  await user.type(screen.getByRole("textbox"), "New task")
  await user.click(screen.getByRole("button", { name: /save/i }))

  // Wait for error to appear
  await waitFor(() => {
    expect(screen.getByText(/api error/i)).toBeInTheDocument()
  })
})
```

### Testing Loading States

```typescript
it("shows loading spinner while fetching", async () => {
  // Create a promise we control
  let resolvePromise: (value: Task[]) => void
  const promise = new Promise<Task[]>((resolve) => {
    resolvePromise = resolve
  })

  vi.mocked(api.getTasks).mockReturnValue(promise)
  render(<TaskList />)

  // Loading state visible
  expect(screen.getByText(/loading/i)).toBeInTheDocument()

  // Resolve the promise
  resolvePromise!([createMockTask()])

  // Loading state gone
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
})
```

## Test Patterns

### Arrange-Act-Assert

```typescript
it("marks task as completed", async () => {
  // Arrange
  const task = createMockTask()
  const user = userEvent.setup()
  render(<TaskItem task={task} />)

  // Act
  await user.click(screen.getByRole("checkbox"))

  // Assert
  expect(mockCompleteTask).toHaveBeenCalledWith(task.id)
})
```

### Testing Error States

```typescript
it("displays error when creation fails", async () => {
  vi.mocked(api.createTask).mockRejectedValue(
    new Error("Network error")
  )

  // ... trigger action ...

  expect(screen.getByText(/network error/i)).toBeInTheDocument()
})
```

### Testing Conditional Rendering

```typescript
it("hides button when task is completed", () => {
  const task = createCompletedTask()
  render(<TaskItem task={task} />)

  expect(
    screen.queryByRole("button", { name: /edit/i })
  ).not.toBeInTheDocument()
})
```

### Testing Forms

```typescript
it("validates required fields", async () => {
  const user = userEvent.setup()
  render(<TaskForm />)

  // Try to submit empty form
  await user.click(screen.getByRole("button", { name: /save/i }))

  // Should show validation error
  expect(screen.getByText(/title is required/i)).toBeInTheDocument()

  // Should not call API
  expect(mockCreateTask).not.toHaveBeenCalled()
})
```

## Best Practices

### ✅ DO

- **Test user behavior** - What users see and do
- **Use accessible queries** - `getByRole`, `getByLabelText`
- **Reset mocks** - Clear mocks between tests
- **Test error states** - Don't just test the happy path
- **Use factories** - Generate consistent test data
- **Name tests clearly** - `test_<what>_<condition>_<expected>`

### ❌ DON'T

- **Test implementation** - Avoid testing internal state
- **Query by class/id** - Use semantic queries instead
- **Test third-party libraries** - Trust they work
- **Duplicate coverage** - One good test > multiple weak tests
- **Share state** - Tests should be independent

## Queries Priority

1. **getByRole** - Most accessible (buttons, inputs, headings)
2. **getByLabelText** - Form inputs with labels
3. **getByPlaceholderText** - Inputs with placeholders
4. **getByText** - Text content
5. **getByTestId** - Last resort (add data-testid attribute)

## Common Matchers

```typescript
// Presence
expect(element).toBeInTheDocument()
expect(element).not.toBeInTheDocument()

// Visibility
expect(element).toBeVisible()
expect(element).not.toBeVisible()

// Attributes
expect(element).toBeDisabled()
expect(element).toBeEnabled()
expect(element).toHaveAttribute("aria-label", "Close")
expect(element).toHaveClass("active")

// Text content
expect(element).toHaveTextContent("Hello")
expect(element).toHaveValue("John")

// Forms
expect(checkbox).toBeChecked()
expect(select).toHaveValue("option1")

// Mock functions
expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledWith(arg1, arg2)
expect(mockFn).toHaveBeenCalledOnce()
```

## Debugging Tests

### Print rendered output
```typescript
import { screen } from "@/test/utils"

screen.debug() // Prints entire DOM
screen.debug(element) // Prints specific element
```

### Check what queries are available
```typescript
screen.logTestingPlaygroundURL()
// Opens browser with testing playground
```

### Run single test
```bash
npm test -- QuickCapture.test.tsx
```

### Run tests matching pattern
```bash
npm test -- --grep="validates form"
```

## Coverage Targets

- **70%+** overall coverage
- Focus on critical user paths
- Don't chase 100% - diminishing returns

View coverage report:
```bash
make test-fe-cov
open coverage/index.html
```

## Troubleshooting

### Tests timing out
Increase timeout in test:
```typescript
it("slow operation", async () => {
  // ...
}, 10000) // 10 second timeout
```

### "Not wrapped in act()" warning
Usually means async operation wasn't awaited. Use `waitFor`:
```typescript
await waitFor(() => {
  expect(screen.getByText("Done")).toBeInTheDocument()
})
```

### Mock not working
Ensure mock is called before import:
```typescript
vi.mock("@/lib/api") // Must be at top of file
import { MyComponent } from "./MyComponent"
```

## Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Vitest Docs](https://vitest.dev)
- [Common Testing Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Which Query Should I Use?](https://testing-library.com/docs/queries/about/#priority)

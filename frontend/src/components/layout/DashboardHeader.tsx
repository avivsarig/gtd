/**
 * DashboardHeader - GTD Dashboard header section
 *
 * Displays the main dashboard title and keyboard shortcut hint.
 * Simple presentational component with no state or logic.
 */

export function DashboardHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold">GTD Dashboard</h1>
      <p className="text-muted-foreground mt-2">
        Press Cmd+K for quick capture
      </p>
    </div>
  )
}

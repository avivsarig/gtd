/**
 * TasksSection - Tasks display section
 *
 * Displays tasks list with operations (status, completion, project, context).
 * Presentational component that receives data and handlers as props.
 * Includes filter controls for status, project, context, and completion state.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskList } from "@/components/TaskList"
import { FilterBar } from "@/components/FilterBar"
import {
  StatusFilter,
  ProjectFilter,
  ContextFilter,
  CheckboxFilter,
} from "@/components/filters"
import { useFilters } from "@/hooks/useFilters"
import {
  type Task,
  type Project,
  type Context,
  type TaskStatus,
  type TaskFilters,
} from "@/lib/api"
import { useEffect } from "react"

export interface TasksSectionProps {
  tasks: Task[]
  projects: Project[]
  contexts: Context[]
  onUpdateStatus: (taskId: string, status: TaskStatus) => void
  onToggleComplete: (task: Task) => void
  onUpdateProject: (taskId: string, projectId: string | null) => void
  onUpdateContext: (taskId: string, contextId: string | null) => void
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  onFiltersChange?: (filters: TaskFilters) => void
}

export function TasksSection({
  tasks,
  projects,
  contexts,
  onUpdateStatus,
  onToggleComplete,
  onUpdateProject,
  onUpdateContext,
  onEdit,
  onDelete,
  onFiltersChange,
}: TasksSectionProps) {
  const { filters, setFilter, resetFilters, hasActiveFilters } = useFilters({
    defaultFilters: {
      show_completed: "true",
    },
  })

  // Notify parent of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      const taskFilters: TaskFilters = {
        status: filters.status as TaskStatus | undefined,
        project_id: filters.project_id as string | undefined,
        context_id: filters.context_id as string | undefined,
        show_completed: filters.show_completed === "true",
      }
      onFiltersChange(taskFilters)
    }
  }, [filters, onFiltersChange])

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Tasks
          {tasks.length > 0 && (
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              ({tasks.filter((t) => !t.completed_at).length} active)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <FilterBar onReset={resetFilters} hasActiveFilters={hasActiveFilters}>
          <StatusFilter
            value={filters.status as TaskStatus | undefined}
            onChange={(value) => setFilter("status", value)}
          />
          <ProjectFilter
            value={filters.project_id as string | undefined}
            projects={projects}
            onChange={(value) => setFilter("project_id", value)}
          />
          <ContextFilter
            value={filters.context_id as string | undefined}
            contexts={contexts}
            onChange={(value) => setFilter("context_id", value)}
          />
          <CheckboxFilter
            id="show-completed-tasks"
            label="Show completed"
            checked={filters.show_completed === "true"}
            onChange={(checked) => setFilter("show_completed", String(checked))}
          />
        </FilterBar>
        <div className="max-h-[400px] overflow-y-auto">
          <TaskList
            tasks={tasks}
            projects={projects}
            contexts={contexts}
            onUpdateStatus={onUpdateStatus}
            onToggleComplete={onToggleComplete}
            onUpdateProject={onUpdateProject}
            onUpdateContext={onUpdateContext}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      </CardContent>
    </Card>
  )
}

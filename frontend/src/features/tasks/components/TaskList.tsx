import {
  type Task,
  type TaskStatus,
  type Project,
  type Context,
} from "@/lib/api"
import { ItemCard } from "@/components/shared/ItemCard"
import { StatusSelect } from "@/features/tasks/components/StatusSelect"
import { ProjectSelect } from "@/features/projects/components/ProjectSelect"
import { ContextSelect } from "@/features/contexts/components/ContextSelect"
import { EmptyState } from "@/components/shared/EmptyState"
import { Button } from "@/components/ui/button"
import { Check, Circle } from "lucide-react"
import { cn } from "@/lib/utils"

interface TaskListProps {
  tasks: Task[]
  projects: Project[]
  contexts: Context[]
  onUpdateStatus: (taskId: string, status: TaskStatus) => void
  onToggleComplete: (task: Task) => void
  onUpdateProject: (taskId: string, projectId: string | null) => void
  onUpdateContext: (taskId: string, contextId: string | null) => void
  onEdit?: (task: Task) => void
  onDelete?: (taskId: string) => void
}

export function TaskList({
  tasks,
  projects,
  contexts,
  onUpdateStatus,
  onToggleComplete,
  onUpdateProject,
  onUpdateContext,
  onEdit,
  onDelete,
}: TaskListProps) {
  if (tasks.length === 0) {
    return <EmptyState message="No tasks yet. Create one to get started!" />
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <ItemCard
          key={task.id}
          onEdit={onEdit ? () => onEdit(task) : undefined}
          onDelete={onDelete ? () => onDelete(task.id) : undefined}
          deleteConfirmMessage="Delete this task?"
          className={cn(task.completed_at && "opacity-60")}
          actions={
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onToggleComplete(task)}
              className={cn(
                "h-8 w-8",
                task.completed_at
                  ? "text-green-500 hover:text-green-600"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={
                task.completed_at ? "Mark as incomplete" : "Mark as complete"
              }
              aria-label={
                task.completed_at ? "Mark as incomplete" : "Mark as complete"
              }
            >
              {task.completed_at ? (
                <Check className="h-5 w-5" />
              ) : (
                <Circle className="h-5 w-5" />
              )}
            </Button>
          }
        >
          <h3
            className={cn(
              "font-medium",
              task.completed_at && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="text-muted-foreground mt-1 text-sm">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Status Selector */}
            <StatusSelect
              value={task.status}
              onChange={(status) => onUpdateStatus(task.id, status)}
              disabled={!!task.completed_at}
            />

            {/* Project Selector */}
            <ProjectSelect
              value={task.project_id}
              projects={projects}
              onChange={(projectId) => onUpdateProject(task.id, projectId)}
              disabled={!!task.completed_at}
            />

            {/* Context Selector */}
            <ContextSelect
              value={task.context_id}
              contexts={contexts}
              onChange={(contextId) => onUpdateContext(task.id, contextId)}
              disabled={!!task.completed_at}
            />

            {/* Metadata */}
            <span className="text-muted-foreground text-xs">
              {new Date(task.created_at).toLocaleDateString()}
            </span>

            {task.completed_at && (
              <span className="text-xs text-green-400">
                ✓ Completed {new Date(task.completed_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </ItemCard>
      ))}
    </div>
  )
}

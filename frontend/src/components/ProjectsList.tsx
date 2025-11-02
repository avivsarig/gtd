/**
 * ProjectsList - Display list of projects with statistics
 *
 * Shows project cards with progress bars, status, and actions.
 */

import { type Project } from "@/lib/api"
import { ItemCard } from "@/components/ItemCard"
import { EmptyState } from "@/components/EmptyState"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProjectsListProps {
  projects: Project[]
  onEdit?: (project: Project) => void
  onDelete?: (projectId: string) => void
  onComplete?: (projectId: string) => void
}

function getStatusColor(status: string) {
  switch (status) {
    case "active":
      return "text-green-400 border-green-500/30 bg-green-500/10"
    case "on_hold":
      return "text-yellow-400 border-yellow-500/30 bg-yellow-500/10"
    case "completed":
      return "text-gray-400 border-gray-500/30 bg-gray-500/10"
    default:
      return "text-blue-400 border-blue-500/30 bg-blue-500/10"
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "active":
      return "Active"
    case "on_hold":
      return "On Hold"
    case "completed":
      return "Completed"
    default:
      return status
  }
}

export function ProjectsList({
  projects,
  onEdit,
  onDelete,
  onComplete,
}: ProjectsListProps) {
  if (projects.length === 0) {
    return <EmptyState message="No projects yet. Create one to get started!" />
  }

  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const isCompleted = project.status === "completed"
        const taskCount = project.task_count || 0
        const completedCount = project.completed_task_count || 0
        const nextCount = project.next_task_count || 0

        return (
          <ItemCard
            key={project.id}
            onEdit={onEdit ? () => onEdit(project) : undefined}
            onDelete={onDelete ? () => onDelete(project.id) : undefined}
            deleteConfirmMessage="Delete this project?"
            className={cn(isCompleted && "opacity-60")}
            actions={
              onComplete && !isCompleted ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onComplete(project.id)}
                  className="text-muted-foreground hover:text-foreground h-8 w-8"
                  title="Mark project as complete"
                >
                  <CheckCircle2 className="h-5 w-5" />
                </Button>
              ) : null
            }
          >
            <div className="space-y-2">
              {/* Project Name and Status */}
              <div className="flex items-start justify-between gap-2">
                <h3
                  className={cn(
                    "font-medium",
                    isCompleted && "text-muted-foreground line-through",
                  )}
                >
                  {project.name}
                </h3>
                <span
                  className={cn(
                    "shrink-0 rounded-md border px-2 py-0.5 text-xs",
                    getStatusColor(project.status),
                  )}
                >
                  {getStatusLabel(project.status)}
                </span>
              </div>

              {/* Outcome Statement */}
              {project.outcome_statement && (
                <p className="text-muted-foreground text-sm">
                  {project.outcome_statement}
                </p>
              )}

              {/* Task Statistics and Progress */}
              {taskCount > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {completedCount}/{taskCount} tasks completed
                    </span>
                    {nextCount > 0 && (
                      <span className="text-blue-400">{nextCount} next</span>
                    )}
                  </div>
                  <Progress
                    current={completedCount}
                    total={taskCount}
                    size="sm"
                  />
                </div>
              )}

              {/* Metadata */}
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <span>
                  Created {new Date(project.created_at).toLocaleDateString()}
                </span>
                {project.completed_at && (
                  <span className="text-green-400">
                    • Completed{" "}
                    {new Date(project.completed_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </ItemCard>
        )
      })}
    </div>
  )
}

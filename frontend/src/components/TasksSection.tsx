/**
 * TasksSection - Tasks display section
 *
 * Displays tasks list with operations (status, completion, project, context).
 * Presentational component that receives data and handlers as props.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TaskList } from "@/components/TaskList"
import { MESSAGES } from "@/lib/messages"
import {
  type Task,
  type Project,
  type Context,
  type TaskStatus,
} from "@/lib/api"

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
}: TasksSectionProps) {
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
      <CardContent className="max-h-[400px] overflow-y-auto">
        <TaskList
          tasks={tasks}
          projects={projects}
          contexts={contexts}
          onUpdateStatus={onUpdateStatus}
          onToggleComplete={onToggleComplete}
          onUpdateProject={onUpdateProject}
          onUpdateContext={onUpdateContext}
          onEdit={(task) => {
            onEdit(task)
            alert(MESSAGES.info.COMING_SOON)
          }}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  )
}

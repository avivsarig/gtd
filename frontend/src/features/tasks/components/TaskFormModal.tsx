/**
 * TaskFormModal - Modal wrapper for task creation/editing
 *
 * Uses EntityModal with task configuration for consistent UX
 */

import { EntityModal } from "./EntityModal"
import { createTaskConfig } from "@/features/tasks/config"
import { type Task, type Project, type Context } from "@/lib/api"

interface TaskFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  projects: Project[]
  contexts: Context[]
  onSubmit: (data: {
    title: string
    description?: string
    status: "next" | "waiting" | "someday"
    project_id?: string | null
    context_id?: string | null
  }) => Promise<void>
  onSuccess?: () => void
}

export function TaskFormModal({
  open,
  onOpenChange,
  task,
  projects,
  contexts,
  onSubmit,
  onSuccess,
}: TaskFormModalProps) {
  const taskConfig = createTaskConfig(projects, contexts)

  // Convert Task to TaskFormData
  const editData = task
    ? {
        title: task.title,
        description: task.description || "",
        status: task.status,
        project_id: task.project_id || null,
        context_id: task.context_id || null,
      }
    : undefined

  return (
    <EntityModal
      config={taskConfig}
      mode={task ? "edit" : "create"}
      open={open}
      onOpenChange={onOpenChange}
      editData={editData}
      onSubmit={onSubmit}
      onSuccess={onSuccess}
    />
  )
}

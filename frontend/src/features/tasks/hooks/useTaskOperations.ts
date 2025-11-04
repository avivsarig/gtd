/**
 * useTaskOperations Hook
 *
 * Encapsulates all task-related business logic and operations.
 * Now uses useEntityOperations base hook for common CRUD patterns,
 * plus task-specific operations (status, completion, project, context).
 *
 * Single Responsibility: Task domain operations only
 */

import { useCallback } from "react"
import {
  createTask,
  updateTask,
  completeTask,
  uncompleteTask,
  deleteTask,
  type Task,
  type TaskStatus,
  type CreateTaskInput,
} from "@/lib/api"
import { MESSAGES } from "@/lib/messages"
import { useEntityOperations, type EntityAPI } from "./useEntityOperations"

export interface UseTaskOperationsOptions {
  /** Callback to reload tasks after operations */
  onReload: () => Promise<void>
  /** Callback for optimistic updates */
  onUpdate?: (updater: (tasks: Task[]) => Task[]) => void
}

export interface UseTaskOperationsResult {
  showTaskForm: boolean
  editingTask: Task | null
  handleCreate: (data: CreateTaskInput) => Promise<void>
  handleUpdate: (data: CreateTaskInput) => Promise<void>
  handleEdit: (task: Task) => void
  handleUpdateStatus: (taskId: string, status: TaskStatus) => Promise<void>
  handleToggleComplete: (task: Task) => Promise<void>
  handleUpdateProject: (
    taskId: string,
    projectId: string | null,
  ) => Promise<void>
  handleUpdateContext: (
    taskId: string,
    contextId: string | null,
  ) => Promise<void>
  handleDelete: (taskId: string) => Promise<void>
  handleCancelForm: () => void
}

/**
 * Hook for task operations with reload capability
 *
 * @param options - Configuration options
 * @returns Task operation handlers
 *
 * @example
 * const taskOps = useTaskOperations({
 *   onReload: loadTasks,
 *   onUpdate: setTasks
 * })
 *
 * <TaskList
 *   tasks={tasks}
 *   onUpdateStatus={taskOps.handleUpdateStatus}
 *   onToggleComplete={taskOps.handleToggleComplete}
 *   onDelete={taskOps.handleDelete}
 * />
 */
export function useTaskOperations(
  options: UseTaskOperationsOptions,
): UseTaskOperationsResult {
  const { onReload, onUpdate } = options

  const api: EntityAPI<Task, CreateTaskInput> = {
    create: createTask,
    update: updateTask,
    delete: deleteTask,
  }

  const base = useEntityOperations(api, {
    onReload,
    onUpdate,
    entityName: "task",
  })

  const handleUpdateStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      try {
        const updatedTask = await updateTask(taskId, { status })

        if (onUpdate) {
          onUpdate((prev) =>
            prev.map((task) => (task.id === taskId ? updatedTask : task)),
          )
        } else {
          await onReload()
        }
      } catch (err) {
        console.error(MESSAGES.errors.console.UPDATE_TASK_STATUS_FAILED, err)
        await onReload()
      }
    },
    [onReload, onUpdate],
  )

  const handleToggleComplete = useCallback(
    async (task: Task) => {
      try {
        const updatedTask = task.completed_at
          ? await uncompleteTask(task.id)
          : await completeTask(task.id)

        if (onUpdate) {
          onUpdate((prev) =>
            prev.map((t) => (t.id === task.id ? updatedTask : t)),
          )
        } else {
          await onReload()
        }
      } catch (err) {
        console.error(
          MESSAGES.errors.console.TOGGLE_TASK_COMPLETION_FAILED,
          err,
        )
        await onReload()
      }
    },
    [onReload, onUpdate],
  )

  const handleUpdateProject = useCallback(
    async (taskId: string, projectId: string | null) => {
      try {
        const updatedTask = await updateTask(taskId, { project_id: projectId })

        if (onUpdate) {
          onUpdate((prev) =>
            prev.map((task) => (task.id === taskId ? updatedTask : task)),
          )
        } else {
          await onReload()
        }
      } catch (err) {
        console.error(MESSAGES.errors.console.UPDATE_TASK_PROJECT_FAILED, err)
        await onReload()
      }
    },
    [onReload, onUpdate],
  )

  const handleUpdateContext = useCallback(
    async (taskId: string, contextId: string | null) => {
      try {
        const updatedTask = await updateTask(taskId, { context_id: contextId })

        if (onUpdate) {
          onUpdate((prev) =>
            prev.map((task) => (task.id === taskId ? updatedTask : task)),
          )
        } else {
          await onReload()
        }
      } catch (err) {
        console.error(MESSAGES.errors.console.UPDATE_TASK_CONTEXT_FAILED, err)
        await onReload()
      }
    },
    [onReload, onUpdate],
  )

  return {
    showTaskForm: base.showForm,
    editingTask: base.editingEntity,
    handleCreate: base.handleCreate,
    handleUpdate: base.handleUpdate,
    handleEdit: base.handleEdit,
    handleUpdateStatus,
    handleToggleComplete,
    handleUpdateProject,
    handleUpdateContext,
    handleDelete: base.handleDelete,
    handleCancelForm: base.handleCancelForm,
  }
}

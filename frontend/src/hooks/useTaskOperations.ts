/**
 * useTaskOperations Hook
 *
 * Encapsulates all task-related business logic and operations.
 * Handles task CRUD operations, status updates, completion toggles,
 * and project/context assignments.
 *
 * Single Responsibility: Task domain operations only
 */

import { useCallback } from "react"
import {
  updateTask,
  completeTask,
  uncompleteTask,
  deleteTask,
  type Task,
  type TaskStatus,
} from "@/lib/api"
import { MESSAGES } from "@/lib/messages"
import { notifyError } from "@/lib/errorHandling"

export interface UseTaskOperationsOptions {
  /** Callback to reload tasks after operations */
  onReload: () => Promise<void>
  /** Callback for optimistic updates */
  onUpdate?: (updater: (tasks: Task[]) => Task[]) => void
}

export interface UseTaskOperationsResult {
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

  const handleUpdateStatus = useCallback(
    async (taskId: string, status: TaskStatus) => {
      try {
        const updatedTask = await updateTask(taskId, { status })

        // Optimistic update if callback provided
        if (onUpdate) {
          onUpdate((prev) =>
            prev.map((task) => (task.id === taskId ? updatedTask : task)),
          )
        } else {
          await onReload()
        }
      } catch (err) {
        console.error(MESSAGES.errors.console.UPDATE_TASK_STATUS_FAILED, err)
        // Reload on error to ensure UI is in sync
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

        // Optimistic update if callback provided
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

  const handleDelete = useCallback(
    async (taskId: string) => {
      try {
        await deleteTask(taskId)

        if (onUpdate) {
          onUpdate((prev) => prev.filter((task) => task.id !== taskId))
        } else {
          await onReload()
        }
      } catch (err) {
        console.error(MESSAGES.errors.console.DELETE_TASK_FAILED, err)
        notifyError(MESSAGES.errors.DELETE_TASK_FAILED)
      }
    },
    [onReload, onUpdate],
  )

  return {
    handleUpdateStatus,
    handleToggleComplete,
    handleUpdateProject,
    handleUpdateContext,
    handleDelete,
  }
}

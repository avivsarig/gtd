/**
 * useTaskOperations Hook
 *
 * Encapsulates all task-related business logic and operations.
 * Handles task CRUD operations, status updates, completion toggles,
 * and project/context assignments.
 *
 * Single Responsibility: Task domain operations only
 */

import { useState, useCallback } from "react"
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
import { notifyError } from "@/lib/errorHandling"

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

  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const handleCreate = useCallback(
    async (data: CreateTaskInput) => {
      try {
        const newTask = await createTask(data)
        if (onUpdate) {
          onUpdate((prev) => [newTask, ...prev])
        } else {
          await onReload()
        }
        setShowTaskForm(false)
      } catch (err) {
        console.error(MESSAGES.errors.console.CREATE_TASK_FAILED, err)
      }
    },
    [onReload, onUpdate],
  )

  const handleUpdate = useCallback(
    async (data: CreateTaskInput) => {
      if (!editingTask) return

      try {
        const updatedTask = await updateTask(editingTask.id, data)
        if (onUpdate) {
          onUpdate((prev) =>
            prev.map((task) =>
              task.id === editingTask.id ? updatedTask : task,
            ),
          )
        } else {
          await onReload()
        }
        setEditingTask(null)
        setShowTaskForm(false)
      } catch (err) {
        console.error(MESSAGES.errors.console.UPDATE_TASK_FAILED, err)
      }
    },
    [editingTask, onReload, onUpdate],
  )

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task)
    setShowTaskForm(true)
  }, [])

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

  const handleCancelForm = useCallback(() => {
    setEditingTask(null)
    setShowTaskForm(false)
  }, [])

  return {
    showTaskForm,
    editingTask,
    handleCreate,
    handleUpdate,
    handleEdit,
    handleUpdateStatus,
    handleToggleComplete,
    handleUpdateProject,
    handleUpdateContext,
    handleDelete,
    handleCancelForm,
  }
}

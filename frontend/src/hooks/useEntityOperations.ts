/**
 * useEntityOperations - Generic base hook for entity CRUD operations
 *
 * Provides common CRUD operations pattern for all entity types.
 * Eliminates code duplication across Task/Note/Project/Context operations hooks.
 *
 * Single Responsibility: Generic entity operations orchestration
 * Open/Closed: Extensible for entity-specific operations
 * DRY: Single source of truth for CRUD patterns
 */

import { useState, useCallback } from "react"
import { logError, notifyError } from "@/lib/errorHandling"
import { MESSAGES } from "@/lib/messages"

/**
 * API interface that entity operations must implement
 */
export interface EntityAPI<T, CreateInput, UpdateInput = CreateInput> {
  create: (data: CreateInput) => Promise<T>
  update: (id: string, data: UpdateInput) => Promise<T>
  delete: (id: string) => Promise<void>
}

/**
 * Options for entity operations hook
 */
export interface UseEntityOperationsOptions<T> {
  /** Callback to reload data after operations */
  onReload: () => Promise<void>
  /** Callback for optimistic updates */
  onUpdate?: (updater: (items: T[]) => T[]) => void
  /** Entity name for error messages */
  entityName: string
}

/**
 * Result interface for entity operations hook
 */
export interface UseEntityOperationsResult<T, CreateInput, UpdateInput> {
  showForm: boolean
  editingEntity: T | null
  handleCreate: (data: CreateInput) => Promise<void>
  handleUpdate: (data: UpdateInput) => Promise<void>
  handleEdit: (entity: T) => void
  handleDelete: (entityId: string) => Promise<void>
  handleCancelForm: () => void
  openForm: () => void
}

/**
 * Generic hook for entity CRUD operations
 *
 * @param api - API functions for create, update, delete
 * @param options - Configuration options
 * @returns Entity operation handlers and form state
 *
 * @example
 * // Usage in useTaskOperations
 * const api = {
 *   create: createTask,
 *   update: updateTask,
 *   delete: deleteTask
 * }
 * const base = useEntityOperations(api, {
 *   onReload,
 *   onUpdate,
 *   entityName: 'task'
 * })
 *
 * // Add task-specific operations
 * const handleComplete = useCallback(async (taskId: string) => {
 *   const updated = await completeTask(taskId)
 *   // ... update logic
 * }, [onReload, onUpdate])
 *
 * return { ...base, handleComplete }
 */
export function useEntityOperations<
  T extends { id: string },
  CreateInput = unknown,
  UpdateInput = CreateInput,
>(
  api: EntityAPI<T, CreateInput, UpdateInput>,
  options: UseEntityOperationsOptions<T>,
): UseEntityOperationsResult<T, CreateInput, UpdateInput> {
  const { onReload, onUpdate, entityName } = options

  const [showForm, setShowForm] = useState(false)
  const [editingEntity, setEditingEntity] = useState<T | null>(null)

  const handleCreate = useCallback(
    async (data: CreateInput) => {
      try {
        const newEntity = await api.create(data)

        if (onUpdate) {
          onUpdate((prev) => [newEntity, ...prev])
        } else {
          await onReload()
        }

        setShowForm(false)
      } catch (err) {
        logError(`Failed to create ${entityName}:`, err)
        throw err
      }
    },
    [api, onReload, onUpdate, entityName],
  )

  const handleUpdate = useCallback(
    async (data: UpdateInput) => {
      if (!editingEntity) return

      try {
        const updatedEntity = await api.update(editingEntity.id, data)

        if (onUpdate) {
          onUpdate((prev) =>
            prev.map((entity) =>
              entity.id === editingEntity.id ? updatedEntity : entity,
            ),
          )
        } else {
          await onReload()
        }

        setEditingEntity(null)
        setShowForm(false)
      } catch (err) {
        logError(`Failed to update ${entityName}:`, err)
        throw err
      }
    },
    [api, editingEntity, onReload, onUpdate, entityName],
  )

  const handleEdit = useCallback((entity: T) => {
    setEditingEntity(entity)
    setShowForm(true)
  }, [])

  const handleDelete = useCallback(
    async (entityId: string) => {
      try {
        await api.delete(entityId)

        if (onUpdate) {
          onUpdate((prev) => prev.filter((entity) => entity.id !== entityId))
        } else {
          await onReload()
        }
      } catch (err) {
        logError(`Failed to delete ${entityName}:`, err)
        const errorKey =
          `DELETE_${entityName.toUpperCase()}_FAILED` as keyof typeof MESSAGES.errors
        const errorMessage = MESSAGES.errors[errorKey]
        notifyError(
          typeof errorMessage === "string"
            ? errorMessage
            : `Failed to delete ${entityName}`,
        )
      }
    },
    [api, onReload, onUpdate, entityName],
  )

  const handleCancelForm = useCallback(() => {
    setEditingEntity(null)
    setShowForm(false)
  }, [])

  const openForm = useCallback(() => {
    setShowForm(true)
  }, [])

  return {
    showForm,
    editingEntity,
    handleCreate,
    handleUpdate,
    handleEdit,
    handleDelete,
    handleCancelForm,
    openForm,
  }
}

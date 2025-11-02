/**
 * useContextOperations Hook
 *
 * Encapsulates all context-related business logic and operations.
 * Handles context CRUD operations.
 *
 * Single Responsibility: Context domain operations only
 */

import { useState, useCallback } from "react"
import {
  createContext,
  updateContext,
  deleteContext,
  type Context,
  type CreateContextInput,
} from "@/lib/api"
import { MESSAGES } from "@/lib/messages"
import { notifyError } from "@/lib/errorHandling"

export interface UseContextOperationsOptions {
  /** Callback to reload contexts after operations */
  onReload: () => Promise<void>
}

export interface UseContextOperationsResult {
  showContextForm: boolean
  editingContext: Context | null
  handleCreate: (data: CreateContextInput) => Promise<void>
  handleUpdate: (data: CreateContextInput) => Promise<void>
  handleEdit: (context: Context) => void
  handleDelete: (contextId: string) => Promise<void>
  handleCancelForm: () => void
}

/**
 * Hook for context operations with reload capability
 *
 * @param options - Configuration options
 * @returns Context operation handlers
 *
 * @example
 * const contextOps = useContextOperations({
 *   onReload: loadContexts
 * })
 *
 * <ContextManager
 *   contexts={contexts}
 *   onCreate={contextOps.handleCreate}
 *   onDelete={contextOps.handleDelete}
 * />
 */
export function useContextOperations(
  options: UseContextOperationsOptions,
): UseContextOperationsResult {
  const { onReload } = options

  const [showContextForm, setShowContextForm] = useState(false)
  const [editingContext, setEditingContext] = useState<Context | null>(null)

  const handleCreate = useCallback(
    async (data: CreateContextInput) => {
      try {
        await createContext(data)
        await onReload()
        setShowContextForm(false)
      } catch (err) {
        throw err
      }
    },
    [onReload],
  )

  const handleUpdate = useCallback(
    async (data: CreateContextInput) => {
      if (!editingContext) return

      try {
        await updateContext(editingContext.id, data)
        await onReload()
        setEditingContext(null)
        setShowContextForm(false)
      } catch (err) {
        console.error(MESSAGES.errors.console.UPDATE_CONTEXT_FAILED, err)
        notifyError(MESSAGES.errors.UPDATE_CONTEXT_FAILED)
      }
    },
    [editingContext, onReload],
  )

  const handleEdit = useCallback((context: Context) => {
    setEditingContext(context)
    setShowContextForm(true)
  }, [])

  const handleDelete = useCallback(
    async (contextId: string) => {
      try {
        await deleteContext(contextId)
        await onReload()
      } catch (err) {
        console.error(MESSAGES.errors.console.DELETE_CONTEXT_FAILED, err)
        notifyError(MESSAGES.errors.DELETE_CONTEXT_FAILED)
      }
    },
    [onReload],
  )

  const handleCancelForm = useCallback(() => {
    setEditingContext(null)
    setShowContextForm(false)
  }, [])

  return {
    showContextForm,
    editingContext,
    handleCreate,
    handleUpdate,
    handleEdit,
    handleDelete,
    handleCancelForm,
  }
}

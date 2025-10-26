/**
 * useContextOperations Hook
 *
 * Encapsulates all context-related business logic and operations.
 * Handles context CRUD operations.
 *
 * Single Responsibility: Context domain operations only
 */

import { useCallback } from "react"
import {
  createContext,
  deleteContext,
  type CreateContextInput,
} from "@/lib/api"
import { MESSAGES } from "@/lib/messages"

export interface UseContextOperationsOptions {
  /** Callback to reload contexts after operations */
  onReload: () => Promise<void>
}

export interface UseContextOperationsResult {
  handleCreate: (data: CreateContextInput) => Promise<void>
  handleDelete: (contextId: string) => Promise<void>
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

  const handleCreate = useCallback(
    async (data: CreateContextInput) => {
      try {
        await createContext(data)
        await onReload()
      } catch (err) {
        throw err
      }
    },
    [onReload],
  )

  const handleDelete = useCallback(
    async (contextId: string) => {
      try {
        await deleteContext(contextId)
        await onReload()
      } catch (err) {
        console.error(MESSAGES.errors.console.DELETE_CONTEXT_FAILED, err)
        alert(MESSAGES.errors.DELETE_CONTEXT_FAILED)
      }
    },
    [onReload],
  )

  return {
    handleCreate,
    handleDelete,
  }
}

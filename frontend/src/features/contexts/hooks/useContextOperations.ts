/**
 * useContextOperations Hook
 *
 * Encapsulates all context-related business logic and operations.
 * Now uses useEntityOperations base hook for common CRUD patterns.
 *
 * Single Responsibility: Context domain operations only
 */

import {
  createContext,
  updateContext,
  deleteContext,
  type Context,
  type CreateContextInput,
} from "@/lib/api"
import { useEntityOperations, type EntityAPI } from "./useEntityOperations"

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
  const api: EntityAPI<Context, CreateContextInput> = {
    create: createContext,
    update: updateContext,
    delete: deleteContext,
  }

  const base = useEntityOperations(api, {
    onReload: options.onReload,
    entityName: "context",
  })

  return {
    showContextForm: base.showForm,
    editingContext: base.editingEntity,
    handleCreate: base.handleCreate,
    handleUpdate: base.handleUpdate,
    handleEdit: base.handleEdit,
    handleDelete: base.handleDelete,
    handleCancelForm: base.handleCancelForm,
  }
}

/**
 * useInboxOperations Hook
 *
 * Encapsulates all inbox-related business logic and operations.
 * Handles inbox item deletion and conversion to tasks/notes.
 *
 * Single Responsibility: Inbox domain operations only
 */

import { useState, useCallback } from "react"
import {
  createInboxItem,
  updateInboxItem,
  deleteInboxItem,
  convertInboxToTask,
  convertInboxToNote,
  type InboxItem,
  type CreateInboxItemInput,
} from "@/lib/api"
import { MESSAGES } from "@/lib/messages"
import { notifyError } from "@/lib/errorHandling"

export interface UseInboxOperationsOptions {
  /** Callback to reload inbox after operations */
  onReloadInbox: () => Promise<void>
  /** Callback to reload tasks after conversion */
  onReloadTasks: () => Promise<void>
  /** Callback to reload notes after conversion */
  onReloadNotes: () => Promise<void>
}

export interface UseInboxOperationsResult {
  showInboxForm: boolean
  editingInboxItem: InboxItem | null
  processingId: string | null
  handleCreate: (data: CreateInboxItemInput) => Promise<void>
  handleUpdate: (data: CreateInboxItemInput) => Promise<void>
  handleEdit: (item: InboxItem) => void
  handleDelete: (id: string) => Promise<void>
  handleConvertToTask: (item: InboxItem) => Promise<void>
  handleConvertToNote: (item: InboxItem) => Promise<void>
  handleCancelForm: () => void
}

/**
 * Hook for inbox operations with processing state management
 *
 * @param options - Configuration options
 * @returns Inbox operation handlers and processing state
 *
 * @example
 * const inboxOps = useInboxOperations({
 *   onReloadInbox: loadInbox,
 *   onReloadTasks: loadTasks,
 *   onReloadNotes: loadNotes
 * })
 *
 * <InboxItem
 *   item={item}
 *   onConvertToTask={inboxOps.handleConvertToTask}
 *   onConvertToNote={inboxOps.handleConvertToNote}
 *   onDelete={inboxOps.handleDelete}
 *   isProcessing={inboxOps.processingId === item.id}
 * />
 */
export function useInboxOperations(
  options: UseInboxOperationsOptions,
): UseInboxOperationsResult {
  const { onReloadInbox, onReloadTasks, onReloadNotes } = options

  const [showInboxForm, setShowInboxForm] = useState(false)
  const [editingInboxItem, setEditingInboxItem] = useState<InboxItem | null>(
    null,
  )
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleCreate = useCallback(
    async (data: CreateInboxItemInput) => {
      try {
        await createInboxItem(data)
        await onReloadInbox()
        setShowInboxForm(false)
      } catch (err) {
        console.error(MESSAGES.errors.console.CREATE_INBOX_FAILED, err)
      }
    },
    [onReloadInbox],
  )

  const handleUpdate = useCallback(
    async (data: CreateInboxItemInput) => {
      if (!editingInboxItem) return

      try {
        await updateInboxItem(editingInboxItem.id, data)
        await onReloadInbox()
        setEditingInboxItem(null)
        setShowInboxForm(false)
      } catch (err) {
        console.error(MESSAGES.errors.console.UPDATE_INBOX_FAILED, err)
      }
    },
    [editingInboxItem, onReloadInbox],
  )

  const handleEdit = useCallback((item: InboxItem) => {
    setEditingInboxItem(item)
    setShowInboxForm(true)
  }, [])

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setProcessingId(id)
        await deleteInboxItem(id)
        await onReloadInbox()
      } catch (err) {
        notifyError(
          err instanceof Error ? err.message : MESSAGES.errors.DELETE_FAILED,
        )
      } finally {
        setProcessingId(null)
      }
    },
    [onReloadInbox],
  )

  const handleConvertToTask = useCallback(
    async (item: InboxItem) => {
      try {
        setProcessingId(item.id)
        await convertInboxToTask(item.id, { title: item.content })
        await onReloadInbox()
        await onReloadTasks()
      } catch (err) {
        notifyError(
          err instanceof Error ? err.message : MESSAGES.errors.CONVERT_FAILED,
        )
      } finally {
        setProcessingId(null)
      }
    },
    [onReloadInbox, onReloadTasks],
  )

  const handleConvertToNote = useCallback(
    async (item: InboxItem) => {
      try {
        setProcessingId(item.id)
        await convertInboxToNote(item.id, { content: item.content })
        await onReloadInbox()
        await onReloadNotes()
      } catch (err) {
        notifyError(
          err instanceof Error ? err.message : MESSAGES.errors.CONVERT_FAILED,
        )
      } finally {
        setProcessingId(null)
      }
    },
    [onReloadInbox, onReloadNotes],
  )

  const handleCancelForm = useCallback(() => {
    setEditingInboxItem(null)
    setShowInboxForm(false)
  }, [])

  return {
    showInboxForm,
    editingInboxItem,
    processingId,
    handleCreate,
    handleUpdate,
    handleEdit,
    handleDelete,
    handleConvertToTask,
    handleConvertToNote,
    handleCancelForm,
  }
}

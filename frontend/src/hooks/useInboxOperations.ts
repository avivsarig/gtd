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
  deleteInboxItem,
  convertInboxToTask,
  convertInboxToNote,
  type InboxItem,
} from "@/lib/api"
import { MESSAGES } from "@/lib/messages"

export interface UseInboxOperationsOptions {
  /** Callback to reload inbox after operations */
  onReloadInbox: () => Promise<void>
  /** Callback to reload tasks after conversion */
  onReloadTasks: () => Promise<void>
  /** Callback to reload notes after conversion */
  onReloadNotes: () => Promise<void>
}

export interface UseInboxOperationsResult {
  processingId: string | null
  handleDelete: (id: string) => Promise<void>
  handleConvertToTask: (item: InboxItem) => Promise<void>
  handleConvertToNote: (item: InboxItem) => Promise<void>
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

  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setProcessingId(id)
        await deleteInboxItem(id)
        await onReloadInbox()
      } catch (err) {
        alert(
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
        alert(
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
        alert(
          err instanceof Error ? err.message : MESSAGES.errors.CONVERT_FAILED,
        )
      } finally {
        setProcessingId(null)
      }
    },
    [onReloadInbox, onReloadNotes],
  )

  return {
    processingId,
    handleDelete,
    handleConvertToTask,
    handleConvertToNote,
  }
}

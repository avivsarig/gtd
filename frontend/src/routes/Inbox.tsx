/**
 * Inbox - GTD Inbox processing page
 *
 * Orchestrates inbox processing by composing specialized components and hooks.
 * Business logic delegated to hooks for separation of concerns.
 *
 * Layout:
 * - Header with item count and keyboard shortcuts legend
 * - List of inbox items with conversion actions
 * - Keyboard navigation support
 */

import { useState } from "react"
import {
  getInboxItems,
  deleteInboxItem,
  convertInboxToTask,
  convertInboxToNote,
  convertInboxToProject,
  type InboxItem,
} from "@/lib/api"
import { MESSAGES } from "@/lib/messages"
import { useResourceLoader } from "@/hooks/useResourceLoader"
import { useInboxKeyboardNavigation } from "@/hooks/useInboxKeyboardNavigation"
import { InboxEmptyState } from "@/components/InboxEmptyState"
import { InboxErrorState } from "@/components/InboxErrorState"
import { InboxItemDisplay } from "@/components/InboxItemDisplay"
import { notifyError, notifySuccess } from "@/lib/errorHandling"

export function Inbox() {
  // Data layer - using useResourceLoader to eliminate duplicated load functions
  const {
    data: items,
    loading,
    error,
    reload: loadInboxItems,
    setData: setItems,
  } = useResourceLoader(getInboxItems, {
    errorContext: MESSAGES.errors.LOAD_INBOX_FAILED,
  })

  const [processingId, setProcessingId] = useState<string | null>(null)

  // Operation handlers with immediate UI updates
  const handleDelete = async (id: string) => {
    try {
      setProcessingId(id)
      await deleteInboxItem(id)
      setItems((prev) => (prev ? prev.filter((item) => item.id !== id) : null))
    } catch (err) {
      notifyError(
        err instanceof Error ? err.message : MESSAGES.errors.DELETE_FAILED,
      )
    } finally {
      setProcessingId(null)
    }
  }

  const handleConvertToTask = async (item: InboxItem) => {
    try {
      setProcessingId(item.id)
      await convertInboxToTask(item.id, { title: item.content })
      setItems((prev) => (prev ? prev.filter((i) => i.id !== item.id) : null))
      notifySuccess(MESSAGES.success.CONVERTED_TO_TASK)
    } catch (err) {
      notifyError(
        err instanceof Error ? err.message : MESSAGES.errors.CONVERT_FAILED,
      )
    } finally {
      setProcessingId(null)
    }
  }

  const handleConvertToNote = async (item: InboxItem) => {
    try {
      setProcessingId(item.id)
      await convertInboxToNote(item.id, { content: item.content })
      setItems((prev) => (prev ? prev.filter((i) => i.id !== item.id) : null))
      notifySuccess(MESSAGES.success.CONVERTED_TO_NOTE)
    } catch (err) {
      notifyError(
        err instanceof Error ? err.message : MESSAGES.errors.CONVERT_FAILED,
      )
    } finally {
      setProcessingId(null)
    }
  }

  const handleConvertToProject = async (item: InboxItem) => {
    try {
      setProcessingId(item.id)
      await convertInboxToProject(item.id, { name: item.content })
      setItems((prev) => (prev ? prev.filter((i) => i.id !== item.id) : null))
      notifySuccess(MESSAGES.success.CONVERTED_TO_PROJECT)
    } catch (err) {
      notifyError(
        err instanceof Error ? err.message : MESSAGES.errors.CONVERT_FAILED,
      )
    } finally {
      setProcessingId(null)
    }
  }

  // Keyboard navigation - handles focus and shortcuts
  const navigation = useInboxKeyboardNavigation({
    items: items ?? [],
    onConvertToTask: handleConvertToTask,
    onConvertToNote: handleConvertToNote,
    onConvertToProject: handleConvertToProject,
    onDelete: handleDelete,
    isProcessing: !!processingId,
  })

  // Loading state
  if (loading) {
    return <div className="p-8 text-center">{MESSAGES.info.LOADING_INBOX}</div>
  }

  // Error state
  if (error) {
    return <InboxErrorState error={error} onRetry={loadInboxItems} />
  }

  // Empty state
  if (!items || items.length === 0) {
    return <InboxEmptyState />
  }

  // Main list view
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Inbox</h1>
        <p className="text-muted-foreground">
          {items.length} {items.length === 1 ? "item" : "items"} to process
        </p>
        <p className="text-muted-foreground mt-2 text-xs">
          Navigate: J/K or ↑/↓ • Convert: T (task), N (note), P (project) • D
          (delete)
        </p>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <InboxItemDisplay
            key={item.id}
            item={item}
            isFocused={index === navigation.focusedIndex}
            isProcessing={processingId === item.id}
            onConvertToTask={handleConvertToTask}
            onConvertToNote={handleConvertToNote}
            onConvertToProject={handleConvertToProject}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}

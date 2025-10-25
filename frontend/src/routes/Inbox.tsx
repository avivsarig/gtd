/**
 * Inbox - GTD Inbox processing page
 *
 * Shows unprocessed inbox items, allows conversion to task/note/project
 */

import { useEffect, useState, useCallback } from "react"
import {
  getInboxItems,
  deleteInboxItem,
  convertInboxToTask,
  convertInboxToNote,
  convertInboxToProject,
  type InboxItem,
} from "@/lib/api"
import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/ItemCard"
import { FileText, CheckSquare } from "lucide-react"
import { MESSAGES } from "@/lib/messages"

export function Inbox() {
  const [items, setItems] = useState<InboxItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(0)

  const loadInboxItems = async () => {
    try {
      setLoading(true)
      const data = await getInboxItems()
      setItems(data)
      setError(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : MESSAGES.errors.LOAD_INBOX_FAILED,
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadInboxItems()
  }, [])

  // Reset focused index when items change
  useEffect(() => {
    if (focusedIndex >= items.length) {
      setFocusedIndex(Math.max(0, items.length - 1))
    }
  }, [items.length, focusedIndex])

  // Keyboard shortcuts for inbox processing
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      const focusedItem = items[focusedIndex]
      if (!focusedItem || processingId) return

      switch (e.key.toLowerCase()) {
        case "t":
          e.preventDefault()
          void handleConvertToTask(focusedItem)
          break
        case "n":
          e.preventDefault()
          void handleConvertToNote(focusedItem)
          break
        case "p":
          e.preventDefault()
          void handleConvertToProject(focusedItem)
          break
        case "d":
          e.preventDefault()
          void handleDelete(focusedItem.id)
          break
        case "j":
        case "arrowdown":
          e.preventDefault()
          setFocusedIndex((prev) => Math.min(prev + 1, items.length - 1))
          break
        case "k":
        case "arrowup":
          e.preventDefault()
          setFocusedIndex((prev) => Math.max(prev - 1, 0))
          break
      }
    },
    [items, focusedIndex, processingId],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  const handleDelete = async (id: string) => {
    try {
      setProcessingId(id)
      await deleteInboxItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : MESSAGES.errors.DELETE_FAILED)
    } finally {
      setProcessingId(null)
    }
  }

  const handleConvertToTask = async (item: InboxItem) => {
    try {
      setProcessingId(item.id)
      await convertInboxToTask(item.id, { title: item.content })
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      alert(MESSAGES.success.CONVERTED_TO_TASK)
    } catch (err) {
      alert(err instanceof Error ? err.message : MESSAGES.errors.CONVERT_FAILED)
    } finally {
      setProcessingId(null)
    }
  }

  const handleConvertToNote = async (item: InboxItem) => {
    try {
      setProcessingId(item.id)
      await convertInboxToNote(item.id, { content: item.content })
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      alert(MESSAGES.success.CONVERTED_TO_NOTE)
    } catch (err) {
      alert(err instanceof Error ? err.message : MESSAGES.errors.CONVERT_FAILED)
    } finally {
      setProcessingId(null)
    }
  }

  const handleConvertToProject = async (item: InboxItem) => {
    try {
      setProcessingId(item.id)
      await convertInboxToProject(item.id, { name: item.content })
      setItems((prev) => prev.filter((i) => i.id !== item.id))
      alert(MESSAGES.success.CONVERTED_TO_PROJECT)
    } catch (err) {
      alert(err instanceof Error ? err.message : MESSAGES.errors.CONVERT_FAILED)
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return <div className="p-8 text-center">{MESSAGES.info.LOADING_INBOX}</div>
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>{error}</p>
        <Button onClick={loadInboxItems} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="p-8 text-center">
        <h2 className="mb-2 text-2xl font-bold">{MESSAGES.info.INBOX_ZERO}</h2>
        <p className="text-muted-foreground">
          All items processed. Press Cmd+K to capture new thoughts.
        </p>
      </div>
    )
  }

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
        {items.map((item, index) => {
          const isFocused = index === focusedIndex
          return (
            <ItemCard
              key={item.id}
              onEdit={() => {
                // TODO: Implement edit functionality for inbox items
                alert(MESSAGES.info.COMING_SOON)
              }}
              onDelete={() => handleDelete(item.id)}
              deleteConfirmMessage={MESSAGES.confirmations.DELETE_INBOX_ITEM}
              className={isFocused ? "ring-primary ring-2" : ""}
              actions={
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConvertToTask(item)}
                    disabled={processingId === item.id}
                  >
                    <CheckSquare className="mr-2 h-4 w-4" />
                    Task (T)
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleConvertToNote(item)}
                    disabled={processingId === item.id}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Note (N)
                  </Button>
                </>
              }
            >
              <p className="text-base whitespace-pre-wrap">{item.content}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {new Date(item.created_at).toLocaleString()}
              </p>
              {processingId === item.id && (
                <p className="text-muted-foreground mt-2 text-xs">
                  {MESSAGES.info.PROCESSING}
                </p>
              )}
            </ItemCard>
          )
        })}
      </div>
    </div>
  )
}

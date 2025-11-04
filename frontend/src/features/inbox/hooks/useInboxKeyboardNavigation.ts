/**
 * useInboxKeyboardNavigation Hook
 *
 * Manages keyboard navigation and shortcuts for inbox processing.
 * Handles focus state, navigation (J/K/↑/↓), and action shortcuts (T/N/P/D).
 *
 * Single Responsibility: Inbox keyboard interaction only
 */

import { useState, useEffect, useCallback } from "react"
import { type InboxItem } from "@/lib/api"

export interface UseInboxKeyboardNavigationOptions {
  /** Array of inbox items for navigation */
  items: InboxItem[]
  /** Handler for converting to task (T key) */
  onConvertToTask: (item: InboxItem) => void
  /** Handler for converting to note (N key) */
  onConvertToNote: (item: InboxItem) => void
  /** Handler for converting to project (P key) */
  onConvertToProject: (item: InboxItem) => void
  /** Handler for deleting item (D key) */
  onDelete: (id: string) => void
  /** Whether an operation is currently processing */
  isProcessing: boolean
}

export interface UseInboxKeyboardNavigationResult {
  /** Currently focused item index */
  focusedIndex: number
}

/**
 * Hook for inbox keyboard navigation and shortcuts
 *
 * @param options - Navigation options and handlers
 * @returns Current focus state
 *
 * @example
 * const navigation = useInboxKeyboardNavigation({
 *   items,
 *   onConvertToTask: handleConvertToTask,
 *   onConvertToNote: handleConvertToNote,
 *   onConvertToProject: handleConvertToProject,
 *   onDelete: handleDelete,
 *   isProcessing: !!processingId
 * })
 *
 * <InboxItem isFocused={index === navigation.focusedIndex} />
 */
export function useInboxKeyboardNavigation(
  options: UseInboxKeyboardNavigationOptions,
): UseInboxKeyboardNavigationResult {
  const {
    items,
    onConvertToTask,
    onConvertToNote,
    onConvertToProject,
    onDelete,
    isProcessing,
  } = options

  const [focusedIndex, setFocusedIndex] = useState(0)

  // Reset focused index when items change
  useEffect(() => {
    if (focusedIndex >= items.length) {
      setFocusedIndex(Math.max(0, items.length - 1))
    }
  }, [items.length, focusedIndex])

  // Keyboard shortcuts handler
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
      if (!focusedItem || isProcessing) return

      switch (e.key.toLowerCase()) {
        case "t":
          e.preventDefault()
          onConvertToTask(focusedItem)
          break
        case "n":
          e.preventDefault()
          onConvertToNote(focusedItem)
          break
        case "p":
          e.preventDefault()
          onConvertToProject(focusedItem)
          break
        case "d":
          e.preventDefault()
          onDelete(focusedItem.id)
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
    [
      items,
      focusedIndex,
      isProcessing,
      onConvertToTask,
      onConvertToNote,
      onConvertToProject,
      onDelete,
    ],
  )

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return {
    focusedIndex,
  }
}

/**
 * useKeyboardShortcuts Hook
 *
 * Manages global keyboard shortcuts for the application.
 * Handles Cmd+K (Universal Capture) and Cmd+/ (Search).
 *
 * Single Responsibility: Keyboard event handling only
 */

import { useEffect } from "react"

export interface UseKeyboardShortcutsOptions {
  /** Handler for Cmd+K / Ctrl+K - Universal capture */
  onOpenCapture: () => void
  /** Handler for Cmd+/ / Ctrl+/ - Search */
  onOpenSearch: () => void
}

/**
 * Hook for global keyboard shortcuts
 *
 * @param options - Shortcut handlers
 *
 * @example
 * const modals = useModalState()
 *
 * useKeyboardShortcuts({
 *   onOpenCapture: modals.openUniversalCapture,
 *   onOpenSearch: modals.openSearchBar
 * })
 */
export function useKeyboardShortcuts(
  options: UseKeyboardShortcutsOptions,
): void {
  const { onOpenCapture, onOpenSearch } = options

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in input/textarea
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      // Cmd+K / Ctrl+K - Universal capture
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenCapture()
      }

      // Cmd+/ / Ctrl+/ - Search
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault()
        onOpenSearch()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [onOpenCapture, onOpenSearch])
}

/**
 * useModalState Hook
 *
 * Manages modal state for Universal Capture and Search modals.
 * Consolidates modal state management into a single hook.
 *
 * Single Responsibility: Modal visibility state only
 */

import { useState, useCallback } from "react"

export interface UseModalStateResult {
  showUniversalCapture: boolean
  showSearchBar: boolean
  openUniversalCapture: () => void
  closeUniversalCapture: () => void
  setShowUniversalCapture: (show: boolean) => void
  openSearchBar: () => void
  closeSearchBar: () => void
  setShowSearchBar: (show: boolean) => void
}

/**
 * Hook for managing modal state
 *
 * @returns Modal state and control functions
 *
 * @example
 * const modals = useModalState()
 *
 * // Open modals
 * modals.openUniversalCapture()
 * modals.openSearchBar()
 *
 * // Use in components
 * <UniversalCapture
 *   open={modals.showUniversalCapture}
 *   onOpenChange={modals.setShowUniversalCapture}
 * />
 * <SearchBar
 *   open={modals.showSearchBar}
 *   onOpenChange={modals.setShowSearchBar}
 * />
 */
export function useModalState(): UseModalStateResult {
  const [showUniversalCapture, setShowUniversalCapture] = useState(false)
  const [showSearchBar, setShowSearchBar] = useState(false)

  const openUniversalCapture = useCallback(() => {
    setShowUniversalCapture(true)
  }, [])

  const closeUniversalCapture = useCallback(() => {
    setShowUniversalCapture(false)
  }, [])

  const openSearchBar = useCallback(() => {
    setShowSearchBar(true)
  }, [])

  const closeSearchBar = useCallback(() => {
    setShowSearchBar(false)
  }, [])

  return {
    showUniversalCapture,
    showSearchBar,
    openUniversalCapture,
    closeUniversalCapture,
    setShowUniversalCapture,
    openSearchBar,
    closeSearchBar,
    setShowSearchBar,
  }
}

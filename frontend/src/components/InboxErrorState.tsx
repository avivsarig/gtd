/**
 * InboxErrorState - Error state for inbox
 *
 * Displays error message with retry button when inbox loading fails.
 * Presentational component that receives error and retry handler.
 */

import { Button } from "@/components/ui/button"

export interface InboxErrorStateProps {
  /** Error message to display */
  error: string
  /** Handler for retry button click */
  onRetry: () => void
}

export function InboxErrorState({ error, onRetry }: InboxErrorStateProps) {
  return (
    <div className="p-8 text-center text-red-500">
      <p>{error}</p>
      <Button onClick={onRetry} className="mt-4">
        Retry
      </Button>
    </div>
  )
}

/**
 * InboxEmptyState - Empty state for inbox
 *
 * Displays "Inbox Zero" message when no items need processing.
 * Presentational component with no business logic.
 */

import { MESSAGES } from "@/lib/messages"

export function InboxEmptyState() {
  return (
    <div className="p-8 text-center">
      <h2 className="mb-2 text-2xl font-bold">{MESSAGES.info.INBOX_ZERO}</h2>
      <p className="text-muted-foreground">
        All items processed. Press Cmd+K to capture new thoughts.
      </p>
    </div>
  )
}

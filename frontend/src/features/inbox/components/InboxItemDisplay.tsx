/**
 * InboxItemDisplay - Single inbox item display
 *
 * Renders an inbox item with conversion actions (Task/Note/Project).
 * Presentational component that receives item data and action handlers.
 */

import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/shared/ItemCard"
import { FileText, CheckSquare, FolderKanban } from "lucide-react"
import { MESSAGES } from "@/lib/messages"
import { notifyInfo } from "@/lib/errorHandling"
import { type InboxItem } from "@/lib/api"

export interface InboxItemDisplayProps {
  /** The inbox item to display */
  item: InboxItem
  /** Whether this item is currently focused */
  isFocused: boolean
  /** Whether this item is being processed */
  isProcessing: boolean
  /** Handler for converting to task */
  onConvertToTask: (item: InboxItem) => void
  /** Handler for converting to note */
  onConvertToNote: (item: InboxItem) => void
  /** Handler for converting to project */
  onConvertToProject: (item: InboxItem) => void
  /** Handler for deleting item */
  onDelete: (id: string) => void
}

export function InboxItemDisplay({
  item,
  isFocused,
  isProcessing,
  onConvertToTask,
  onConvertToNote,
  onConvertToProject,
  onDelete,
}: InboxItemDisplayProps) {
  return (
    <ItemCard
      key={item.id}
      onEdit={() => {
        notifyInfo(MESSAGES.info.COMING_SOON)
      }}
      onDelete={() => onDelete(item.id)}
      deleteConfirmMessage={MESSAGES.confirmations.DELETE_INBOX_ITEM}
      className={isFocused ? "ring-primary ring-2" : ""}
      actions={
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onConvertToTask(item)}
            disabled={isProcessing}
          >
            <CheckSquare className="mr-2 h-4 w-4" />
            Task (T)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onConvertToNote(item)}
            disabled={isProcessing}
          >
            <FileText className="mr-2 h-4 w-4" />
            Note (N)
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onConvertToProject(item)}
            disabled={isProcessing}
          >
            <FolderKanban className="mr-2 h-4 w-4" />
            Project (P)
          </Button>
        </>
      }
    >
      <p className="text-base whitespace-pre-wrap">{item.content}</p>
      <p className="text-muted-foreground mt-1 text-xs">
        {new Date(item.created_at).toLocaleString()}
      </p>
      {isProcessing && (
        <p className="text-muted-foreground mt-2 text-xs">
          {MESSAGES.info.PROCESSING}
        </p>
      )}
    </ItemCard>
  )
}

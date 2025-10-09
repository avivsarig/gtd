/**
 * ItemCard - Unified item display component
 *
 * Consistent template for all single items (inbox, tasks, notes, projects, contexts)
 * Standard: Title/Content + Edit + Delete buttons, then custom content
 */

import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2 } from "lucide-react"

interface ItemCardProps {
  /** Main content area */
  children: ReactNode
  /** Optional edit handler - shows edit button if provided */
  onEdit?: () => void
  /** Optional delete handler - shows delete button if provided */
  onDelete?: () => void
  /** Optional delete confirmation message */
  deleteConfirmMessage?: string
  /** Additional content to render after standard buttons */
  actions?: ReactNode
  /** Optional className for the card */
  className?: string
}

export function ItemCard({
  children,
  onEdit,
  onDelete,
  deleteConfirmMessage,
  actions,
  className = "",
}: ItemCardProps) {
  const handleDelete = () => {
    if (deleteConfirmMessage) {
      if (!confirm(deleteConfirmMessage)) return
    }
    onDelete?.()
  }

  return (
    <div
      className={`border rounded-lg p-4 hover:bg-accent/50 transition-colors ${className}`}
    >
      <div className="flex items-start gap-3">
        {/* Main Content */}
        <div className="flex-1 min-w-0">{children}</div>

        {/* Standard Actions: Custom Actions + Edit + Delete (rightmost) */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Additional custom actions */}
          {actions}
          {onEdit && (
            <Button
              size="icon"
              variant="ghost"
              onClick={onEdit}
              className="h-8 w-8"
              title="Edit"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleDelete}
              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

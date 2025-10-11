/**
 * DeleteButton - Unified delete button component
 *
 * Consistent delete action across the entire UI
 */

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DeleteButtonProps {
  onDelete: () => void
  disabled?: boolean
  label?: string
  iconOnly?: boolean
  confirmMessage?: string
}

export function DeleteButton({
  onDelete,
  disabled = false,
  label = "Delete",
  iconOnly = false,
  confirmMessage,
}: DeleteButtonProps) {
  const handleClick = () => {
    if (confirmMessage) {
      if (!confirm(confirmMessage)) return
    }
    onDelete()
  }

  return (
    <Button
      size={iconOnly ? "icon" : "sm"}
      variant="ghost"
      onClick={handleClick}
      disabled={disabled}
      className="text-destructive hover:text-destructive hover:bg-destructive/10"
      title={iconOnly ? label : undefined}
    >
      <Trash2 className={iconOnly ? "h-4 w-4" : "mr-1 h-4 w-4"} />
      {!iconOnly && label}
    </Button>
  )
}

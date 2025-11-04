/**
 * ContextFormModal - Modal wrapper for context creation/editing
 *
 * Uses EntityModal with context configuration for consistent UX
 */

import { EntityModal } from "./EntityModal"
import { contextConfig } from "@/features/contexts/config"
import { type Context, type CreateContextInput } from "@/lib/api"

interface ContextFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  context?: Context | null
  onSubmit: (data: CreateContextInput) => Promise<void>
  onSuccess?: () => void
}

export function ContextFormModal({
  open,
  onOpenChange,
  context,
  onSubmit,
  onSuccess,
}: ContextFormModalProps) {
  // Convert Context to ContextFormData
  const editData = context
    ? {
        name: context.name,
        description: context.description || "",
        icon: context.icon || "",
        sort_order: context.sort_order || 0,
      }
    : undefined

  return (
    <EntityModal
      config={contextConfig}
      mode={context ? "edit" : "create"}
      open={open}
      onOpenChange={onOpenChange}
      editData={editData}
      onSubmit={onSubmit}
      onSuccess={onSuccess}
    />
  )
}

/**
 * InboxFormModal - Modal wrapper for inbox item editing
 *
 * Uses EntityModal with inbox configuration for consistent UX
 */

import { EntityModal } from "./EntityModal"
import { inboxConfig } from "@/config/entities/inboxConfig"
import { type InboxItem } from "@/lib/api"

interface InboxFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inboxItem?: InboxItem | null
  onSubmit: (data: { content: string }) => Promise<void>
  onSuccess?: () => void
}

export function InboxFormModal({
  open,
  onOpenChange,
  inboxItem,
  onSubmit,
  onSuccess,
}: InboxFormModalProps) {
  // Convert InboxItem to InboxFormData
  const editData = inboxItem
    ? {
        content: inboxItem.content,
      }
    : undefined

  return (
    <EntityModal
      config={inboxConfig}
      mode={inboxItem ? "edit" : "create"}
      open={open}
      onOpenChange={onOpenChange}
      editData={editData}
      onSubmit={onSubmit}
      onSuccess={onSuccess}
    />
  )
}

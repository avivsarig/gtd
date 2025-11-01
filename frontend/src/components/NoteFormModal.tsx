/**
 * NoteFormModal - Modal wrapper for note creation/editing
 *
 * Uses EntityModal with note configuration for consistent UX
 */

import { EntityModal } from "./EntityModal"
import { createNoteConfig } from "@/config/entities/noteConfig"
import { type Note, type Project } from "@/lib/api"

interface NoteFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  note?: Note | null
  projects: Project[]
  onSubmit: (data: {
    title: string
    content?: string
    project_id?: string | null
  }) => Promise<void>
  onSuccess?: () => void
}

export function NoteFormModal({
  open,
  onOpenChange,
  note,
  projects,
  onSubmit,
  onSuccess,
}: NoteFormModalProps) {
  const noteConfig = createNoteConfig(projects)

  // Convert Note to NoteFormData
  const editData = note
    ? {
        title: note.title,
        content: note.content || "",
        project_id: note.project_id || null,
      }
    : undefined

  return (
    <EntityModal
      config={noteConfig}
      mode={note ? "edit" : "create"}
      open={open}
      onOpenChange={onOpenChange}
      editData={editData}
      onSubmit={onSubmit}
      onSuccess={onSuccess}
    />
  )
}

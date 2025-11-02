/**
 * useNoteOperations Hook
 *
 * Encapsulates all note-related business logic and operations.
 * Now uses useEntityOperations base hook for common CRUD patterns.
 *
 * Single Responsibility: Note domain operations only
 */

import { createNote, updateNote, deleteNote, type Note } from "@/lib/api"
import { useEntityOperations, type EntityAPI } from "./useEntityOperations"

export interface UseNoteOperationsOptions {
  /** Callback to reload notes after operations */
  onReload: () => Promise<void>
  /** Callback for optimistic updates */
  onUpdate?: (updater: (notes: Note[]) => Note[]) => void
}

interface NoteInput {
  title: string
  content?: string
  project_id?: string | null
}

export interface UseNoteOperationsResult {
  showNoteForm: boolean
  editingNote: Note | null
  handleCreate: (data: NoteInput) => Promise<void>
  handleUpdate: (data: NoteInput) => Promise<void>
  handleEdit: (note: Note) => void
  handleDelete: (noteId: string) => Promise<void>
  handleCancelForm: () => void
  openNoteForm: () => void
}

/**
 * Hook for note operations with form state management
 *
 * @param options - Configuration options
 * @returns Note operation handlers and form state
 *
 * @example
 * const noteOps = useNoteOperations({
 *   onReload: loadNotes,
 *   onUpdate: setNotes
 * })
 *
 * <Button onClick={noteOps.openNoteForm}>+ New Note</Button>
 * {noteOps.showNoteForm && (
 *   <NoteForm
 *     note={noteOps.editingNote}
 *     onSubmit={noteOps.editingNote ? noteOps.handleUpdate : noteOps.handleCreate}
 *     onCancel={noteOps.handleCancelForm}
 *   />
 * )}
 */
export function useNoteOperations(
  options: UseNoteOperationsOptions,
): UseNoteOperationsResult {
  const api: EntityAPI<Note, NoteInput> = {
    create: createNote,
    update: updateNote,
    delete: deleteNote,
  }

  const base = useEntityOperations(api, {
    onReload: options.onReload,
    onUpdate: options.onUpdate,
    entityName: "note",
  })

  return {
    showNoteForm: base.showForm,
    editingNote: base.editingEntity,
    handleCreate: base.handleCreate,
    handleUpdate: base.handleUpdate,
    handleEdit: base.handleEdit,
    handleDelete: base.handleDelete,
    handleCancelForm: base.handleCancelForm,
    openNoteForm: base.openForm,
  }
}

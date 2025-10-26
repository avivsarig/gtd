/**
 * useNoteOperations Hook
 *
 * Encapsulates all note-related business logic and operations.
 * Handles note CRUD operations and modal state management.
 *
 * Single Responsibility: Note domain operations only
 */

import { useState, useCallback } from "react"
import { createNote, updateNote, deleteNote, type Note } from "@/lib/api"
import { MESSAGES } from "@/lib/messages"

export interface UseNoteOperationsOptions {
  /** Callback to reload notes after operations */
  onReload: () => Promise<void>
  /** Callback for optimistic updates */
  onUpdate?: (updater: (notes: Note[]) => Note[]) => void
}

export interface UseNoteOperationsResult {
  showNoteForm: boolean
  editingNote: Note | null
  handleCreate: (data: {
    title: string
    content?: string
    project_id?: string | null
  }) => Promise<void>
  handleUpdate: (data: {
    title: string
    content?: string
    project_id?: string | null
  }) => Promise<void>
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
  const { onReload, onUpdate } = options

  const [showNoteForm, setShowNoteForm] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)

  const handleCreate = useCallback(
    async (data: {
      title: string
      content?: string
      project_id?: string | null
    }) => {
      try {
        const newNote = await createNote(data)

        if (onUpdate) {
          onUpdate((prev) => [newNote, ...prev])
        } else {
          await onReload()
        }

        setShowNoteForm(false)
      } catch (err) {
        console.error(MESSAGES.errors.console.CREATE_NOTE_FAILED, err)
      }
    },
    [onReload, onUpdate],
  )

  const handleUpdate = useCallback(
    async (data: {
      title: string
      content?: string
      project_id?: string | null
    }) => {
      if (!editingNote) return

      try {
        const updatedNote = await updateNote(editingNote.id, data)

        if (onUpdate) {
          onUpdate((prev) =>
            prev.map((note) =>
              note.id === editingNote.id ? updatedNote : note,
            ),
          )
        } else {
          await onReload()
        }

        setEditingNote(null)
        setShowNoteForm(false)
      } catch (err) {
        console.error(MESSAGES.errors.console.UPDATE_NOTE_FAILED, err)
      }
    },
    [editingNote, onReload, onUpdate],
  )

  const handleEdit = useCallback((note: Note) => {
    setEditingNote(note)
    setShowNoteForm(true)
  }, [])

  const handleDelete = useCallback(
    async (noteId: string) => {
      try {
        await deleteNote(noteId)

        if (onUpdate) {
          onUpdate((prev) => prev.filter((note) => note.id !== noteId))
        } else {
          await onReload()
        }
      } catch (err) {
        console.error(MESSAGES.errors.console.DELETE_NOTE_FAILED, err)
      }
    },
    [onReload, onUpdate],
  )

  const handleCancelForm = useCallback(() => {
    setEditingNote(null)
    setShowNoteForm(false)
  }, [])

  const openNoteForm = useCallback(() => {
    setShowNoteForm(true)
  }, [])

  return {
    showNoteForm,
    editingNote,
    handleCreate,
    handleUpdate,
    handleEdit,
    handleDelete,
    handleCancelForm,
    openNoteForm,
  }
}

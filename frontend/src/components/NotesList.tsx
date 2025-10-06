import { useState } from "react"
import { type Note, type Project } from "@/lib/api"

interface NotesListProps {
  notes: Note[]
  projects: Project[]
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
}

export function NotesList({
  notes,
  projects,
  onEdit,
  onDelete,
}: NotesListProps) {
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null)

  const getProjectName = (projectId: string | null | undefined) => {
    if (!projectId) return null
    const project = projects.find((p) => p.id === projectId)
    return project?.name
  }

  const toggleExpand = (noteId: string) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId)
  }

  if (notes.length === 0) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        No notes yet. Create one to get started!
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notes.map((note) => {
        const isExpanded = expandedNoteId === note.id
        const projectName = getProjectName(note.project_id)

        return (
          <div
            key={note.id}
            className="bg-card border-border hover:border-primary/50 rounded-lg border p-4 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <button
                  onClick={() => toggleExpand(note.id)}
                  className="group w-full text-left"
                >
                  <h3 className="text-foreground group-hover:text-primary font-medium transition-colors">
                    {note.title}
                  </h3>
                  {projectName && (
                    <div className="mt-1 flex items-center gap-2">
                      <span className="rounded border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
                        {projectName}
                      </span>
                    </div>
                  )}
                </button>

                {isExpanded && note.content && (
                  <div className="text-muted-foreground mt-3 text-sm whitespace-pre-wrap">
                    {note.content}
                  </div>
                )}

                {isExpanded && (
                  <div className="text-muted-foreground mt-2 text-xs">
                    Updated: {new Date(note.updated_at).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(note)}
                  className="bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded px-3 py-1 text-sm transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete note "${note.title}"?`)) {
                      onDelete(note.id)
                    }
                  }}
                  className="bg-destructive/20 hover:bg-destructive/30 text-destructive rounded px-3 py-1 text-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

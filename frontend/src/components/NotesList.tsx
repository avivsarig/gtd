import { useState } from "react"
import  { type Note, type Project } from "@/lib/api"

interface NotesListProps {
  notes: Note[]
  projects: Project[]
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
}

export function NotesList({ notes, projects, onEdit, onDelete }: NotesListProps) {
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
      <div className="text-center py-8 text-muted-foreground">
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
            className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <button
                  onClick={() => toggleExpand(note.id)}
                  className="text-left w-full group"
                >
                  <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                    {note.title}
                  </h3>
                  {projectName && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {projectName}
                      </span>
                    </div>
                  )}
                </button>

                {isExpanded && note.content && (
                  <div className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
                    {note.content}
                  </div>
                )}

                {isExpanded && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    Updated: {new Date(note.updated_at).toLocaleString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onEdit(note)}
                  className="text-sm px-3 py-1 rounded bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete note "${note.title}"?`)) {
                      onDelete(note.id)
                    }
                  }}
                  className="text-sm px-3 py-1 rounded bg-destructive/20 hover:bg-destructive/30 text-destructive transition-colors"
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

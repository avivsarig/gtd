import { useState } from "react"
import { type Note, type Project } from "@/lib/api"
import { ItemCard } from "@/components/ItemCard"
import { EmptyState } from "@/components/EmptyState"

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
    return <EmptyState message="No notes yet. Create one to get started!" />
  }

  return (
    <div className="space-y-2">
      {notes.map((note) => {
        const isExpanded = expandedNoteId === note.id
        const projectName = getProjectName(note.project_id)

        return (
          <ItemCard
            key={note.id}
            onEdit={() => onEdit(note)}
            onDelete={() => onDelete(note.id)}
            deleteConfirmMessage={`Delete note "${note.title}"?`}
          >
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
          </ItemCard>
        )
      })}
    </div>
  )
}

/**
 * NotesSection - Notes display section
 *
 * Displays notes list with create button and operations (edit, delete).
 * Presentational component that receives data and handlers as props.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { NotesList } from "@/components/NotesList"
import { type Note, type Project } from "@/lib/api"

export interface NotesSectionProps {
  notes: Note[]
  projects: Project[]
  onEdit: (note: Note) => void
  onDelete: (noteId: string) => void
  onNewNote: () => void
}

export function NotesSection({
  notes,
  projects,
  onEdit,
  onDelete,
  onNewNote,
}: NotesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Notes
          {notes.length > 0 && (
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              ({notes.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        <div className="mb-3">
          <Button onClick={onNewNote} size="sm">
            + New Note
          </Button>
        </div>
        <NotesList
          notes={notes}
          projects={projects}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  )
}

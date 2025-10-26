/**
 * InboxSection - Inbox items display and processing section
 *
 * Displays inbox items with conversion actions (Task/Note) and delete functionality.
 * Presentational component that receives data and handlers as props.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ItemCard } from "@/components/ItemCard"
import { FileText, CheckSquare } from "lucide-react"
import { MESSAGES } from "@/lib/messages"
import { type InboxItem } from "@/lib/api"
import { notifyInfo } from "@/lib/errorHandling"

export interface InboxSectionProps {
  inboxItems: InboxItem[]
  processingId: string | null
  onConvertToTask: (item: InboxItem) => void
  onConvertToNote: (item: InboxItem) => void
  onDelete: (id: string) => void
}

export function InboxSection({
  inboxItems,
  processingId,
  onConvertToTask,
  onConvertToNote,
  onDelete,
}: InboxSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Inbox
          {inboxItems.length > 0 && (
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              ({inboxItems.length} {inboxItems.length === 1 ? "item" : "items"})
            </span>
          )}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Process into tasks, notes, or projects
        </p>
      </CardHeader>
      <CardContent>
        {inboxItems.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center">
            {MESSAGES.info.INBOX_ZERO}
          </p>
        ) : (
          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {inboxItems.map((item) => (
              <ItemCard
                key={item.id}
                onEdit={() => {
                  notifyInfo(MESSAGES.info.COMING_SOON)
                }}
                onDelete={() => onDelete(item.id)}
                deleteConfirmMessage={MESSAGES.confirmations.DELETE_INBOX_ITEM}
                actions={
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onConvertToTask(item)}
                      disabled={processingId === item.id}
                    >
                      <CheckSquare className="mr-1 h-3 w-3" />
                      Task
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onConvertToNote(item)}
                      disabled={processingId === item.id}
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      Note
                    </Button>
                  </>
                }
              >
                <p className="text-sm whitespace-pre-wrap">{item.content}</p>
                <p className="text-muted-foreground mt-1 text-xs">
                  {new Date(item.created_at).toLocaleString()}
                </p>
              </ItemCard>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

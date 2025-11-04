/**
 * ContextsSection - Contexts management section
 *
 * Displays context manager for creating and deleting contexts.
 * Presentational component that receives data and handlers as props.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ContextManager } from "@/features/contexts/components/ContextManager"
import { type Context, type CreateContextInput } from "@/lib/api"

export interface ContextsSectionProps {
  contexts: Context[]
  onEdit: (context: Context) => void
  onCreate: (data: CreateContextInput) => Promise<void>
  onDelete: (contextId: string) => void
}

export function ContextsSection({
  contexts,
  onEdit,
  onCreate,
  onDelete,
}: ContextsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Contexts
          {contexts.length > 0 && (
            <span className="text-muted-foreground ml-2 text-sm font-normal">
              ({contexts.length})
            </span>
          )}
        </CardTitle>
        <p className="text-muted-foreground text-sm">
          Manage contexts for task filtering
        </p>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        <ContextManager
          contexts={contexts}
          onEdit={onEdit}
          onCreate={onCreate}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  )
}

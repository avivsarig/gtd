interface EmptyStateProps {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return <div className="text-muted-foreground py-8 text-center">{message}</div>
}

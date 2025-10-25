/**
 * QuickCapture - Simple inbox capture component
 *
 * Default GTD behavior: capture to inbox, process later
 */

import { useState } from "react"
import { createInboxItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MESSAGES } from "@/lib/messages"

interface QuickCaptureProps {
  onSuccess?: () => void
}

export function QuickCapture({ onSuccess }: QuickCaptureProps) {
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError(MESSAGES.validation.REQUIRED_FIELD)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await createInboxItem({ content: content.trim() })
      setContent("")
      onSuccess?.()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : MESSAGES.errors.CAPTURE_FAILED,
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        placeholder="What's on your mind? (Press Enter to capture)"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="min-h-[80px] resize-none"
        disabled={isSubmitting}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            void handleSubmit(e)
          }
        }}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="w-full"
      >
        {isSubmitting
          ? MESSAGES.buttons.CAPTURING
          : MESSAGES.buttons.CAPTURE_TO_INBOX}
      </Button>
    </form>
  )
}

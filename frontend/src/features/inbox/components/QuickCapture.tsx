/**
 * QuickCapture - Simple inbox capture component
 *
 * Default GTD behavior: capture to inbox, process later
 *
 * Refactored to use:
 * - useFormSubmission hook (eliminates manual state management)
 * - validateRequired + sanitizeInput utilities
 */

import { createInboxItem } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { MESSAGES } from "@/lib/messages"
import { useFormSubmission } from "@/hooks/useFormSubmission"
import { validateRequired, sanitizeInput } from "@/lib/validation"

interface QuickCaptureProps {
  onSuccess?: () => void
}

export function QuickCapture({ onSuccess }: QuickCaptureProps) {
  const { data, updateField, handleSubmit, isSubmitting, error } =
    useFormSubmission(
      { content: "" },
      {
        validate: (formData) => validateRequired(formData.content),
        onSuccess,
        defaultErrorMessage: MESSAGES.errors.CAPTURE_FAILED,
        resetOnSuccess: true,
      },
    )

  return (
    <form
      onSubmit={handleSubmit(async (formData) => {
        await createInboxItem({ content: sanitizeInput(formData.content)! })
      })}
      className="space-y-3"
    >
      <Textarea
        placeholder="What's on your mind? (Press Enter to capture)"
        value={data.content}
        onChange={(e) => updateField("content", e.target.value)}
        className="min-h-[80px] resize-none"
        disabled={isSubmitting}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            const form = e.currentTarget.form
            if (form) {
              form.requestSubmit()
            }
          }
        }}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        disabled={isSubmitting || !data.content.trim()}
        className="w-full"
      >
        {isSubmitting
          ? MESSAGES.buttons.CAPTURING
          : MESSAGES.buttons.CAPTURE_TO_INBOX}
      </Button>
    </form>
  )
}

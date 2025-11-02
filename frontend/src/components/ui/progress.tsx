/**
 * Progress - Reusable progress bar component
 *
 * Displays visual progress with percentage and optional label.
 * Used for project task completion, statistics, and other metrics.
 */

import { cn } from "@/lib/utils"

export interface ProgressProps {
  /** Current progress value */
  current: number
  /** Total/maximum value */
  total: number
  /** Visual variant */
  variant?: "default" | "success" | "warning" | "danger"
  /** Show label with numbers */
  showLabel?: boolean
  /** Size variant */
  size?: "sm" | "md" | "lg"
  /** Optional className */
  className?: string
}

const variantStyles = {
  default: "bg-blue-500",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
}

const sizeStyles = {
  sm: "h-1",
  md: "h-2",
  lg: "h-3",
}

/**
 * Calculates progress percentage
 */
function getPercentage(current: number, total: number): number {
  if (total === 0) return 0
  return Math.min(100, Math.max(0, (current / total) * 100))
}

/**
 * Determines variant based on percentage
 */
export function getProgressVariant(
  percentage: number,
): "default" | "success" | "warning" | "danger" {
  if (percentage >= 100) return "success"
  if (percentage >= 75) return "default"
  if (percentage >= 25) return "warning"
  return "danger"
}

export function Progress({
  current,
  total,
  variant = "default",
  showLabel = false,
  size = "md",
  className,
}: ProgressProps) {
  const percentage = getPercentage(current, total)
  const autoVariant =
    variant === "default" ? getProgressVariant(percentage) : variant

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "bg-muted relative w-full overflow-hidden rounded-full",
          sizeStyles[size],
        )}
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Progress: ${current} of ${total}`}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out",
            variantStyles[autoVariant],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-muted-foreground shrink-0 text-xs">
          {current}/{total}
        </span>
      )}
    </div>
  )
}

/**
 * Tests for useAsyncAction hook
 */

import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { useAsyncAction } from "./useAsyncAction"

describe("useAsyncAction", () => {
  describe("successful execution", () => {
    it("should execute action successfully", async () => {
      const mockAction = vi.fn().mockResolvedValue("success")
      const { result } = renderHook(() => useAsyncAction(mockAction))

      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()

      await result.current.execute()

      // Should complete successfully
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      expect(result.current.error).toBeNull()
      expect(mockAction).toHaveBeenCalledOnce()
    })

    it("should call onSuccess callback", async () => {
      const mockAction = vi.fn().mockResolvedValue("result")
      const onSuccess = vi.fn()

      const { result } = renderHook(() =>
        useAsyncAction(mockAction, { onSuccess }),
      )

      await result.current.execute()

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith("result")
      })
    })

    it("should pass arguments to action", async () => {
      const mockAction = vi.fn().mockResolvedValue(undefined)
      const { result } = renderHook(() =>
        useAsyncAction<void, [string, number]>(mockAction),
      )

      await result.current.execute("test", 42)

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith("test", 42)
      })
    })
  })

  describe("error handling", () => {
    it("should handle errors and set error state", async () => {
      const mockError = new Error("Test error")
      const mockAction = vi.fn().mockRejectedValue(mockError)

      const { result } = renderHook(() => useAsyncAction(mockAction))

      await result.current.execute()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      expect(result.current.error).toBe("Test error")
    })

    it("should use default error message for non-Error objects", async () => {
      const mockAction = vi.fn().mockRejectedValue({ code: 500 })

      const { result } = renderHook(() =>
        useAsyncAction(mockAction, {
          defaultErrorMessage: "Custom default error",
        }),
      )

      await result.current.execute()

      await waitFor(() => {
        expect(result.current.error).toBe("Custom default error")
      })
    })

    it("should call onError callback", async () => {
      const mockError = new Error("Test error")
      const mockAction = vi.fn().mockRejectedValue(mockError)
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useAsyncAction(mockAction, { onError }),
      )

      await result.current.execute()

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(mockError)
      })
    })

    it("should not call onSuccess when error occurs", async () => {
      const mockAction = vi.fn().mockRejectedValue(new Error("Failed"))
      const onSuccess = vi.fn()

      const { result } = renderHook(() =>
        useAsyncAction(mockAction, { onSuccess }),
      )

      await result.current.execute()

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })
      expect(onSuccess).not.toHaveBeenCalled()
    })
  })

  describe("state management", () => {
    it("should clear error with clearError", async () => {
      const mockAction = vi.fn().mockRejectedValue(new Error("Test error"))
      const { result } = renderHook(() => useAsyncAction(mockAction))

      await result.current.execute()

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      result.current.clearError()

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })

    it("should reset all state with reset", async () => {
      const mockAction = vi.fn().mockRejectedValue(new Error("Test error"))
      const { result } = renderHook(() => useAsyncAction(mockAction))

      await result.current.execute()

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      result.current.reset()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
      })
    })

    it("should clear previous error on new execution", async () => {
      let shouldFail = true
      const mockAction = vi.fn().mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(new Error("First error"))
        }
        return Promise.resolve("success")
      })

      const { result } = renderHook(() => useAsyncAction(mockAction))

      // First execution fails
      await result.current.execute()

      await waitFor(() => {
        expect(result.current.error).toBe("First error")
      })

      // Second execution succeeds
      shouldFail = false
      await result.current.execute()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
      expect(result.current.error).toBeNull()
    })
  })

  describe("concurrent executions", () => {
    it("should handle multiple sequential executions", async () => {
      let counter = 0
      const mockAction = vi.fn().mockImplementation(async () => {
        counter++
        return counter
      })
      const onSuccess = vi.fn()

      const { result } = renderHook(() =>
        useAsyncAction(mockAction, { onSuccess }),
      )

      await result.current.execute()
      await result.current.execute()
      await result.current.execute()

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledTimes(3)
      })
      expect(onSuccess).toHaveBeenCalledTimes(3)
    })
  })

  describe("cleanup and stability", () => {
    it("should not update state after unmount", async () => {
      const mockAction = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100)),
        )

      const { result, unmount } = renderHook(() => useAsyncAction(mockAction))

      void result.current.execute()

      unmount()

      // Should not throw error when state updates after unmount
      await new Promise((resolve) => setTimeout(resolve, 150))
    })

    it("should maintain stable function references", () => {
      const mockAction = vi.fn().mockResolvedValue(undefined)
      const { result, rerender } = renderHook(() => useAsyncAction(mockAction))

      const firstExecute = result.current.execute
      const firstClearError = result.current.clearError
      const firstReset = result.current.reset

      rerender()

      expect(result.current.execute).toBe(firstExecute)
      expect(result.current.clearError).toBe(firstClearError)
      expect(result.current.reset).toBe(firstReset)
    })
  })

  describe("type safety", () => {
    it("should work with typed arguments", async () => {
      interface TaskInput {
        title: string
        status: string
      }

      const mockAction = vi
        .fn()
        .mockImplementation(async (id: string, input: TaskInput) => {
          return { id, ...input }
        })

      const { result } = renderHook(() =>
        useAsyncAction<{ id: string; title: string; status: string }, [string, TaskInput]>(
          mockAction,
        ),
      )

      await result.current.execute("task-1", {
        title: "Test",
        status: "next",
      })

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith("task-1", {
          title: "Test",
          status: "next",
        })
      })
    })

    it("should work with void return type", async () => {
      const mockAction = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() => useAsyncAction<void>(mockAction))

      await result.current.execute()

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalled()
      })
    })
  })

  describe("real-world scenarios", () => {
    it("should handle delete operation", async () => {
      const deleteTask = vi.fn().mockResolvedValue(undefined)
      const onSuccess = vi.fn()

      const { result } = renderHook(() =>
        useAsyncAction<void, [string]>(deleteTask, {
          onSuccess,
          defaultErrorMessage: "Failed to delete task",
        }),
      )

      await result.current.execute("task-123")

      await waitFor(() => {
        expect(deleteTask).toHaveBeenCalledWith("task-123")
        expect(onSuccess).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeNull()
      })
    })

    it("should handle update operation with error", async () => {
      const updateTask = vi.fn().mockRejectedValue(new Error("Network error"))
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useAsyncAction(updateTask, {
          onError,
          defaultErrorMessage: "Failed to update task",
        }),
      )

      await result.current.execute("task-123", { status: "completed" })

      await waitFor(() => {
        expect(result.current.error).toBe("Network error")
        expect(onError).toHaveBeenCalled()
        expect(result.current.loading).toBe(false)
      })
    })
  })
})

/**
 * Tests for useResourceLoader hook
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, waitFor } from "@testing-library/react"
import { type DependencyList } from "react"
import { useResourceLoader } from "./useResourceLoader"

describe("useResourceLoader", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("immediate loading", () => {
    it("should load data immediately by default", async () => {
      const mockLoader = vi.fn().mockResolvedValue([1, 2, 3])
      const { result } = renderHook(() => useResourceLoader(mockLoader))

      expect(result.current.loading).toBe(true)
      expect(result.current.data).toBeNull()

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toEqual([1, 2, 3])
      expect(result.current.error).toBeNull()
      expect(mockLoader).toHaveBeenCalledOnce()
    })

    it("should not load immediately when immediate=false", () => {
      const mockLoader = vi.fn().mockResolvedValue([1, 2, 3])
      const { result } = renderHook(() =>
        useResourceLoader(mockLoader, { immediate: false }),
      )

      expect(result.current.loading).toBe(false)
      expect(result.current.data).toBeNull()
      expect(mockLoader).not.toHaveBeenCalled()
    })
  })

  describe("data loading", () => {
    it("should set data after successful load", async () => {
      const mockData = { id: 1, name: "Test" }
      const mockLoader = vi.fn().mockResolvedValue(mockData)

      const { result } = renderHook(() => useResourceLoader(mockLoader))

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData)
      })
    })

    it("should handle array data", async () => {
      const mockData = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ]
      const mockLoader = vi.fn().mockResolvedValue(mockData)

      const { result } = renderHook(() => useResourceLoader(mockLoader))

      await waitFor(() => {
        expect(result.current.data).toEqual(mockData)
        expect(result.current.data).toHaveLength(2)
      })
    })

    it("should handle null/undefined loader results", async () => {
      const mockLoader = vi.fn().mockResolvedValue(null)

      const { result } = renderHook(() => useResourceLoader(mockLoader))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.data).toBeNull()
    })
  })

  describe("error handling", () => {
    it("should handle loader errors", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})
      const mockError = new Error("Load failed")
      const mockLoader = vi.fn().mockRejectedValue(mockError)

      const { result } = renderHook(() =>
        useResourceLoader(mockLoader, {
          errorContext: "Failed to load data",
        }),
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBe("Failed to load data")
      expect(result.current.data).toBeNull()
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it("should use custom error context", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})
      const mockLoader = vi.fn().mockRejectedValue(new Error("Failed"))

      const { result } = renderHook(() =>
        useResourceLoader(mockLoader, {
          errorContext: "Custom error message",
        }),
      )

      await waitFor(() => {
        expect(result.current.error).toBe("Custom error message")
      })

      consoleErrorSpy.mockRestore()
    })

    it("should clear error with clearError", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})
      const mockLoader = vi.fn().mockRejectedValue(new Error("Failed"))

      const { result } = renderHook(() => useResourceLoader(mockLoader))

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      result.current.clearError()

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe("reload functionality", () => {
    it("should reload data when reload is called", async () => {
      const mockLoader = vi
        .fn()
        .mockResolvedValueOnce([1, 2])
        .mockResolvedValueOnce([3, 4, 5])

      const { result } = renderHook(() => useResourceLoader(mockLoader))

      await waitFor(() => {
        expect(result.current.data).toEqual([1, 2])
      })

      await result.current.reload()

      await waitFor(() => {
        expect(result.current.data).toEqual([3, 4, 5])
      })

      expect(mockLoader).toHaveBeenCalledTimes(2)
    })

    it("should clear error on successful reload", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})
      const mockLoader = vi
        .fn()
        .mockRejectedValueOnce(new Error("First error"))
        .mockResolvedValueOnce([1, 2, 3])

      const { result } = renderHook(() => useResourceLoader(mockLoader))

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      await result.current.reload()

      await waitFor(() => {
        expect(result.current.error).toBeNull()
        expect(result.current.data).toEqual([1, 2, 3])
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe("manual data management", () => {
    it("should allow setting data manually", async () => {
      const mockLoader = vi.fn().mockResolvedValue([1, 2, 3])
      const { result } = renderHook(() => useResourceLoader(mockLoader))

      await waitFor(() => {
        expect(result.current.data).toEqual([1, 2, 3])
      })

      result.current.setData([4, 5, 6])

      await waitFor(() => {
        expect(result.current.data).toEqual([4, 5, 6])
      })
    })

    it("should support optimistic updates", async () => {
      const mockLoader = vi.fn().mockResolvedValue([{ id: 1, name: "Item 1" }])
      const { result } = renderHook(() => useResourceLoader(mockLoader))

      await waitFor(() => {
        expect(result.current.data).toHaveLength(1)
      })

      // Optimistic update
      result.current.setData((prev: { id: number; name: string }[] | null) => [
        ...(prev || []),
        { id: 2, name: "Item 2" },
      ])

      await waitFor(() => {
        expect(result.current.data).toHaveLength(2)
      })
    })
  })

  describe("dependencies", () => {
    it("should reload when dependencies change", async () => {
      const mockLoader = vi.fn().mockResolvedValue("data")
      const { rerender } = renderHook(
        ({ deps }) => useResourceLoader(() => mockLoader(), { deps }),
        { initialProps: { deps: [1] as DependencyList } },
      )

      await waitFor(() => {
        expect(mockLoader).toHaveBeenCalledTimes(1)
      })

      rerender({ deps: [2] as DependencyList })

      await waitFor(() => {
        expect(mockLoader).toHaveBeenCalledTimes(2)
      })
    })

    it("should not reload when dependencies remain the same", async () => {
      const mockLoader = vi.fn().mockResolvedValue("data")
      const { rerender } = renderHook(
        ({ deps }) => useResourceLoader(() => mockLoader(), { deps }),
        { initialProps: { deps: [1] as DependencyList } },
      )

      await waitFor(() => {
        expect(mockLoader).toHaveBeenCalledTimes(1)
      })

      rerender({ deps: [1] as DependencyList })

      // Should still be 1 call, not 2
      expect(mockLoader).toHaveBeenCalledTimes(1)
    })
  })

  describe("loading states", () => {
    it("should set loading to true during fetch", async () => {
      let resolveLoader: (value: unknown) => void
      const mockLoader = vi.fn(
        () =>
          new Promise((resolve) => {
            resolveLoader = resolve
          }),
      )

      const { result } = renderHook(() => useResourceLoader(mockLoader))

      expect(result.current.loading).toBe(true)

      resolveLoader!("data")

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it("should set loading to false after error", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {})
      const mockLoader = vi.fn().mockRejectedValue(new Error("Failed"))

      const { result } = renderHook(() => useResourceLoader(mockLoader))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.error).toBeTruthy()
      })

      consoleErrorSpy.mockRestore()
    })
  })

  describe("real-world scenarios", () => {
    it("should handle task loading scenario", async () => {
      interface Task {
        id: string
        title: string
        status: string
      }

      const mockTasks: Task[] = [
        { id: "1", title: "Task 1", status: "next" },
        { id: "2", title: "Task 2", status: "waiting" },
      ]

      const mockLoader = vi.fn().mockResolvedValue(mockTasks)

      const { result } = renderHook(() =>
        useResourceLoader<Task[]>(mockLoader, {
          errorContext: "Failed to load tasks",
        }),
      )

      await waitFor(() => {
        expect(result.current.data).toEqual(mockTasks)
        expect(result.current.loading).toBe(false)
      })
    })

    it("should handle filtered resource loading", async () => {
      const getFilteredData = (status: string) =>
        Promise.resolve([{ id: "1", status }])

      const { result, rerender } = renderHook(
        ({ status }) =>
          useResourceLoader(() => getFilteredData(status), { deps: [status] }),
        { initialProps: { status: "next" } },
      )

      await waitFor(() => {
        expect(result.current.data).toEqual([{ id: "1", status: "next" }])
      })

      rerender({ status: "waiting" })

      await waitFor(() => {
        expect(result.current.data).toEqual([{ id: "1", status: "waiting" }])
      })
    })

    it("should handle manual refresh button click", async () => {
      const mockLoader = vi
        .fn()
        .mockResolvedValueOnce(["initial"])
        .mockResolvedValueOnce(["refreshed"])

      const { result } = renderHook(() => useResourceLoader(mockLoader))

      await waitFor(() => {
        expect(result.current.data).toEqual(["initial"])
      })

      // Simulate clicking a refresh button
      await result.current.reload()

      await waitFor(() => {
        expect(result.current.data).toEqual(["refreshed"])
      })
    })
  })

  describe("type safety", () => {
    it("should maintain type safety for different data types", async () => {
      interface User {
        id: number
        name: string
      }

      const mockUser: User = { id: 1, name: "John" }
      const mockLoader = vi.fn().mockResolvedValue(mockUser)

      const { result } = renderHook(() => useResourceLoader<User>(mockLoader))

      await waitFor(() => {
        expect(result.current.data?.id).toBe(1)
        expect(result.current.data?.name).toBe("John")
      })
    })
  })
})

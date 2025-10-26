/**
 * Tests for useFormSubmission hook
 */

import { describe, it, expect, vi } from "vitest"
import { renderHook, waitFor, act } from "@testing-library/react"
import { useFormSubmission } from "./useFormSubmission"

describe("useFormSubmission", () => {
  describe("form state management", () => {
    it("should initialize with provided data", () => {
      const initialData = { name: "John", email: "john@example.com" }
      const { result } = renderHook(() => useFormSubmission(initialData))

      expect(result.current.data).toEqual(initialData)
      expect(result.current.isSubmitting).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should update form data with setData", () => {
      const { result } = renderHook(() =>
        useFormSubmission({ name: "", email: "" }),
      )

      act(() => {
        result.current.setData({ name: "Jane", email: "jane@test.com" })
      })

      expect(result.current.data).toEqual({
        name: "Jane",
        email: "jane@test.com",
      })
    })

    it("should update single field with updateField", () => {
      const { result } = renderHook(() =>
        useFormSubmission({ name: "John", email: "john@test.com" }),
      )

      act(() => {
        result.current.updateField("name", "Jane")
      })

      expect(result.current.data).toEqual({
        name: "Jane",
        email: "john@test.com",
      })
    })

    it("should reset form to initial state", () => {
      const initialData = { name: "", email: "" }
      const { result } = renderHook(() => useFormSubmission(initialData))

      act(() => {
        result.current.setData({ name: "Test", email: "test@test.com" })
        result.current.setError("Some error")
      })

      act(() => {
        result.current.reset()
      })

      expect(result.current.data).toEqual(initialData)
      expect(result.current.error).toBeNull()
      expect(result.current.isSubmitting).toBe(false)
    })
  })

  describe("validation", () => {
    it("should run validation before submission", async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined)
      const validate = vi.fn().mockReturnValue("Name is required")

      const { result } = renderHook(() =>
        useFormSubmission({ name: "" }, { validate }),
      )

      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      expect(validate).toHaveBeenCalledWith({ name: "" })
      expect(result.current.error).toBe("Name is required")
      expect(submitFn).not.toHaveBeenCalled()
    })

    it("should proceed with submission when validation passes", async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined)
      const validate = vi.fn().mockReturnValue(null)

      const { result } = renderHook(() =>
        useFormSubmission({ name: "John" }, { validate }),
      )

      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(validate).toHaveBeenCalledWith({ name: "John" })
        expect(submitFn).toHaveBeenCalledWith({ name: "John" })
        expect(result.current.error).toBeNull()
      })
    })

    it("should not validate if no validator provided", async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() => useFormSubmission({ name: "" }))

      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(submitFn).toHaveBeenCalled()
      })
    })
  })

  describe("submission", () => {
    it("should call submit function with form data", async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined)
      const formData = { name: "John", email: "john@test.com" }

      const { result } = renderHook(() => useFormSubmission(formData))

      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(submitFn).toHaveBeenCalledWith(formData)
      })
    })

    it("should set isSubmitting during submission", async () => {
      let resolveSubmit: () => void
      const submitFn = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveSubmit = resolve
          }),
      )

      const { result } = renderHook(() => useFormSubmission({ name: "Test" }))

      const handler = result.current.handleSubmit(submitFn)
      void handler({ preventDefault: () => {} } as React.FormEvent)

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(true)
      })

      resolveSubmit!()
      await new Promise((r) => setTimeout(r, 0))

      await waitFor(() => {
        expect(result.current.isSubmitting).toBe(false)
      })
    })

    it("should call onSuccess after successful submission", async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined)
      const onSuccess = vi.fn()

      const { result } = renderHook(() =>
        useFormSubmission({ name: "Test" }, { onSuccess }),
      )

      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled()
      })
    })

    it("should reset form after successful submission when resetOnSuccess=true", async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined)
      const initialData = { name: "", email: "" }

      const { result } = renderHook(() =>
        useFormSubmission(initialData, { resetOnSuccess: true }),
      )

      act(() => {
        result.current.setData({ name: "Test", email: "test@test.com" })
      })

      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(result.current.data).toEqual(initialData)
      })
    })

    it("should not reset form when resetOnSuccess=false", async () => {
      const submitFn = vi.fn().mockResolvedValue(undefined)
      const formData = { name: "Test", email: "test@test.com" }

      const { result } = renderHook(() =>
        useFormSubmission(formData, { resetOnSuccess: false }),
      )

      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(result.current.data).toEqual(formData)
      })
    })
  })

  describe("error handling", () => {
    it("should handle submission errors", async () => {
      const error = new Error("Submission failed")
      const submitFn = vi.fn().mockRejectedValue(error)

      const { result } = renderHook(() => useFormSubmission({ name: "Test" }))

      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(result.current.error).toBe("Submission failed")
        expect(result.current.isSubmitting).toBe(false)
      })
    })

    it("should use default error message", async () => {
      const submitFn = vi.fn().mockRejectedValue({ code: 500 })

      const { result } = renderHook(() =>
        useFormSubmission(
          { name: "Test" },
          { defaultErrorMessage: "Custom error" },
        ),
      )

      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(result.current.error).toBe("Custom error")
      })
    })

    it("should call onError callback", async () => {
      const error = new Error("Test error")
      const submitFn = vi.fn().mockRejectedValue(error)
      const onError = vi.fn()

      const { result } = renderHook(() =>
        useFormSubmission({ name: "Test" }, { onError }),
      )

      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(error)
      })
    })

    it("should clear error with clearError", () => {
      const { result } = renderHook(() => useFormSubmission({ name: "" }))

      act(() => {
        result.current.setError("Some error")
      })

      expect(result.current.error).toBe("Some error")

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })

    it("should clear previous error on new submission", async () => {
      let shouldFail = true
      const submitFn = vi.fn().mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(new Error("First error"))
        }
        return Promise.resolve()
      })

      const { result } = renderHook(() => useFormSubmission({ name: "Test" }))

      const handler = result.current.handleSubmit(submitFn)

      // First submission fails
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(result.current.error).toBe("First error")
      })

      // Second submission succeeds
      shouldFail = false
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(result.current.error).toBeNull()
      })
    })
  })

  describe("real-world scenarios", () => {
    it("should handle contact form submission", async () => {
      interface ContactForm {
        name: string
        email: string
        message: string
      }

      const submitFn = vi.fn().mockResolvedValue(undefined)
      const onSuccess = vi.fn()

      const { result } = renderHook(() =>
        useFormSubmission<ContactForm>(
          { name: "", email: "", message: "" },
          {
            validate: (data) => {
              if (!data.name.trim()) return "Name is required"
              if (!data.email.trim()) return "Email is required"
              if (!data.message.trim()) return "Message is required"
              return null
            },
            onSuccess,
            resetOnSuccess: true,
          },
        ),
      )

      // Fill form
      act(() => {
        result.current.updateField("name", "John")
        result.current.updateField("email", "john@test.com")
        result.current.updateField("message", "Hello!")
      })

      // Submit
      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      await waitFor(() => {
        expect(submitFn).toHaveBeenCalledWith({
          name: "John",
          email: "john@test.com",
          message: "Hello!",
        })
        expect(onSuccess).toHaveBeenCalled()
        expect(result.current.data).toEqual({
          name: "",
          email: "",
          message: "",
        })
      })
    })

    it("should handle validation failure gracefully", async () => {
      const submitFn = vi.fn()

      const { result } = renderHook(() =>
        useFormSubmission(
          { email: "" },
          {
            validate: (data) =>
              data.email.includes("@") ? null : "Invalid email",
          },
        ),
      )

      const handler = result.current.handleSubmit(submitFn)
      await act(async () => {
        await handler({ preventDefault: () => {} } as React.FormEvent)
      })

      expect(result.current.error).toBe("Invalid email")
      expect(submitFn).not.toHaveBeenCalled()
    })
  })

  describe("type safety", () => {
    it("should maintain type safety for form data", () => {
      interface UserForm {
        username: string
        age: number
        active: boolean
      }

      const { result } = renderHook(() =>
        useFormSubmission<UserForm>({
          username: "test",
          age: 25,
          active: true,
        }),
      )

      act(() => {
        result.current.updateField("username", "newname")
        result.current.updateField("age", 30)
        result.current.updateField("active", false)
      })

      expect(result.current.data.username).toBe("newname")
      expect(result.current.data.age).toBe(30)
      expect(result.current.data.active).toBe(false)
    })
  })
})

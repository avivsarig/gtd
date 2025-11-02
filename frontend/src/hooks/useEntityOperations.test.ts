/**
 * Tests for useEntityOperations hook
 *
 * Validates generic CRUD operations pattern for all entity types.
 */

import { describe, it, expect, vi, beforeEach } from "vitest"
import { renderHook, act } from "@testing-library/react"
import { useEntityOperations, type EntityAPI } from "./useEntityOperations"

interface TestEntity {
  id: string
  name: string
}

interface TestCreateInput {
  name: string
}

describe("useEntityOperations", () => {
  let mockAPI: EntityAPI<TestEntity, TestCreateInput>
  let mockOnReload: ReturnType<typeof vi.fn>
  let mockOnUpdate: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockAPI = {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
    mockOnReload = vi.fn().mockResolvedValue(undefined)
    mockOnUpdate = vi.fn()
  })

  describe("test_initialState_noData_allStateEmpty", () => {
    it("should initialize with empty state", () => {
      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          entityName: "test",
        }),
      )

      expect(result.current.showForm).toBe(false)
      expect(result.current.editingEntity).toBeNull()
    })
  })

  describe("test_handleCreate_validData_createsEntityAndReloads", () => {
    it("should create entity and reload when no onUpdate provided", async () => {
      const newEntity: TestEntity = { id: "1", name: "Test" }
      mockAPI.create = vi.fn().mockResolvedValue(newEntity)

      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          entityName: "test",
        }),
      )

      act(() => {
        result.current.openForm()
      })

      await act(async () => {
        await result.current.handleCreate({ name: "Test" })
      })

      expect(mockAPI.create).toHaveBeenCalledWith({ name: "Test" })
      expect(mockOnReload).toHaveBeenCalled()
      expect(result.current.showForm).toBe(false)
    })

    it("should create entity and update optimistically when onUpdate provided", async () => {
      const newEntity: TestEntity = { id: "1", name: "Test" }
      mockAPI.create = vi.fn().mockResolvedValue(newEntity)

      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          onUpdate: mockOnUpdate,
          entityName: "test",
        }),
      )

      await act(async () => {
        await result.current.handleCreate({ name: "Test" })
      })

      expect(mockAPI.create).toHaveBeenCalledWith({ name: "Test" })
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnReload).not.toHaveBeenCalled()

      const updater = mockOnUpdate.mock.calls[0][0]
      const updatedList = updater([])
      expect(updatedList).toEqual([newEntity])
    })

    it("should throw error when create fails", async () => {
      mockAPI.create = vi.fn().mockRejectedValue(new Error("Create failed"))

      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          entityName: "test",
        }),
      )

      await expect(
        act(async () => {
          await result.current.handleCreate({ name: "Test" })
        }),
      ).rejects.toThrow("Create failed")
    })
  })

  describe("test_handleUpdate_editingEntity_updatesEntityAndReloads", () => {
    it("should update entity and reload when no onUpdate provided", async () => {
      const entity: TestEntity = { id: "1", name: "Original" }
      const updatedEntity: TestEntity = { id: "1", name: "Updated" }
      mockAPI.update = vi.fn().mockResolvedValue(updatedEntity)

      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          entityName: "test",
        }),
      )

      act(() => {
        result.current.handleEdit(entity)
      })

      expect(result.current.editingEntity).toEqual(entity)

      await act(async () => {
        await result.current.handleUpdate({ name: "Updated" })
      })

      expect(mockAPI.update).toHaveBeenCalledWith("1", { name: "Updated" })
      expect(mockOnReload).toHaveBeenCalled()
      expect(result.current.showForm).toBe(false)
      expect(result.current.editingEntity).toBeNull()
    })

    it("should update entity optimistically when onUpdate provided", async () => {
      const entity: TestEntity = { id: "1", name: "Original" }
      const updatedEntity: TestEntity = { id: "1", name: "Updated" }
      mockAPI.update = vi.fn().mockResolvedValue(updatedEntity)

      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          onUpdate: mockOnUpdate,
          entityName: "test",
        }),
      )

      act(() => {
        result.current.handleEdit(entity)
      })

      await act(async () => {
        await result.current.handleUpdate({ name: "Updated" })
      })

      expect(mockAPI.update).toHaveBeenCalledWith("1", { name: "Updated" })
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnReload).not.toHaveBeenCalled()

      const updater = mockOnUpdate.mock.calls[0][0]
      const updatedList = updater([entity, { id: "2", name: "Other" }])
      expect(updatedList).toEqual([updatedEntity, { id: "2", name: "Other" }])
    })

    it("should do nothing when no entity is being edited", async () => {
      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          entityName: "test",
        }),
      )

      await act(async () => {
        await result.current.handleUpdate({ name: "Updated" })
      })

      expect(mockAPI.update).not.toHaveBeenCalled()
    })

    it("should throw error when update fails", async () => {
      const entity: TestEntity = { id: "1", name: "Original" }
      mockAPI.update = vi.fn().mockRejectedValue(new Error("Update failed"))

      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          entityName: "test",
        }),
      )

      act(() => {
        result.current.handleEdit(entity)
      })

      await expect(
        act(async () => {
          await result.current.handleUpdate({ name: "Updated" })
        }),
      ).rejects.toThrow("Update failed")
    })
  })

  describe("test_handleDelete_entityId_deletesEntityAndReloads", () => {
    it("should delete entity and reload when no onUpdate provided", async () => {
      mockAPI.delete = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          entityName: "test",
        }),
      )

      await act(async () => {
        await result.current.handleDelete("1")
      })

      expect(mockAPI.delete).toHaveBeenCalledWith("1")
      expect(mockOnReload).toHaveBeenCalled()
    })

    it("should delete entity optimistically when onUpdate provided", async () => {
      mockAPI.delete = vi.fn().mockResolvedValue(undefined)

      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          onUpdate: mockOnUpdate,
          entityName: "test",
        }),
      )

      await act(async () => {
        await result.current.handleDelete("1")
      })

      expect(mockAPI.delete).toHaveBeenCalledWith("1")
      expect(mockOnUpdate).toHaveBeenCalled()
      expect(mockOnReload).not.toHaveBeenCalled()

      const updater = mockOnUpdate.mock.calls[0][0]
      const updatedList = updater([
        { id: "1", name: "Delete me" },
        { id: "2", name: "Keep me" },
      ])
      expect(updatedList).toEqual([{ id: "2", name: "Keep me" }])
    })

    it("should handle delete failure gracefully", async () => {
      mockAPI.delete = vi.fn().mockRejectedValue(new Error("Delete failed"))

      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          entityName: "test",
        }),
      )

      await act(async () => {
        await result.current.handleDelete("1")
      })

      expect(mockAPI.delete).toHaveBeenCalledWith("1")
    })
  })

  describe("test_handleEdit_entity_setsEditingStateAndOpensForm", () => {
    it("should set editing entity and open form", () => {
      const entity: TestEntity = { id: "1", name: "Test" }

      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          entityName: "test",
        }),
      )

      act(() => {
        result.current.handleEdit(entity)
      })

      expect(result.current.editingEntity).toEqual(entity)
      expect(result.current.showForm).toBe(true)
    })
  })

  describe("test_openForm_noArgs_opensForm", () => {
    it("should open form", () => {
      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          entityName: "test",
        }),
      )

      act(() => {
        result.current.openForm()
      })

      expect(result.current.showForm).toBe(true)
      expect(result.current.editingEntity).toBeNull()
    })
  })

  describe("test_handleCancelForm_anyState_closesFormAndClearsEditing", () => {
    it("should close form and clear editing state", () => {
      const entity: TestEntity = { id: "1", name: "Test" }

      const { result } = renderHook(() =>
        useEntityOperations(mockAPI, {
          onReload: mockOnReload,
          entityName: "test",
        }),
      )

      act(() => {
        result.current.handleEdit(entity)
      })

      expect(result.current.showForm).toBe(true)
      expect(result.current.editingEntity).toEqual(entity)

      act(() => {
        result.current.handleCancelForm()
      })

      expect(result.current.showForm).toBe(false)
      expect(result.current.editingEntity).toBeNull()
    })
  })
})

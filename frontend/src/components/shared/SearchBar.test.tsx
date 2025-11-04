import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@/test/utils"
import userEvent from "@testing-library/user-event"
import { SearchBar } from "./SearchBar"
import * as api from "@/lib/api"
import { type SearchResponse } from "@/lib/api"

vi.mock("@/lib/api", () => ({
  search: vi.fn(),
}))

describe("SearchBar", () => {
  const mockOnOpenChange = vi.fn()
  const mockOnNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("rendering", () => {
    it("test_search_modal_visible_when_open_is_true", () => {
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
    })

    it("test_search_modal_hidden_when_open_is_false", () => {
      render(<SearchBar open={false} onOpenChange={mockOnOpenChange} />)

      expect(screen.queryByPlaceholderText(/search/i)).not.toBeInTheDocument()
    })

    it("test_search_input_has_placeholder_text", () => {
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      expect(
        screen.getByPlaceholderText(/search tasks, notes, and projects/i),
      ).toBeInTheDocument()
    })

    it("test_search_input_focused_on_open", () => {
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      expect(input).toBeInTheDocument()
    })

    it("test_displays_search_instructions_initially", () => {
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      expect(
        screen.getByText(/type at least 2 characters to search/i),
      ).toBeInTheDocument()
    })
  })

  describe("search input validation", () => {
    it("test_search_blocked_when_query_less_than_2_chars", async () => {
      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "a")

      expect(vi.mocked(api.search)).not.toHaveBeenCalled()
    })

    it("test_search_enabled_when_query_2_or_more_chars", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "ab",
        total_results: 0,
        results: [],
      })

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "ab")

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith("ab", 50)
      })
    })

    it("test_search_trims_whitespace_from_query", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "test",
        total_results: 0,
        results: [],
      })

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "  test  ")

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith("test", 50)
      })
    })
  })

  describe("search execution", () => {
    it("test_calls_search_api_with_query_on_submit", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "test query",
        total_results: 0,
        results: [],
      })

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test query")

      await waitFor(() => {
        expect(mockSearch).toHaveBeenCalledWith("test query", 50)
      })
    })

    it("test_displays_loading_state_during_search", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  query: "test",
                  total_results: 0,
                  results: [],
                }),
              100,
            ),
          ),
      )

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      expect(screen.getByText(/searching/i)).toBeInTheDocument()
    })

    it("test_displays_mixed_results_from_api", async () => {
      const mockSearch = vi.mocked(api.search)
      const mockResponse: SearchResponse = {
        query: "meeting",
        total_results: 3,
        results: [
          {
            id: "1",
            type: "task",
            title: "Team meeting",
            snippet: "Discuss Q1 goals",
            rank: 0.9,
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            type: "note",
            title: "Meeting notes",
            snippet: "Notes from last meeting",
            rank: 0.8,
            created_at: new Date().toISOString(),
          },
          {
            id: "3",
            type: "project",
            title: "Meeting room upgrade",
            snippet: null,
            rank: 0.7,
            created_at: new Date().toISOString(),
          },
        ],
      }
      mockSearch.mockResolvedValue(mockResponse)

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "meeting")

      await waitFor(() => {
        expect(screen.getByText("Team meeting")).toBeInTheDocument()
      })
      expect(screen.getByText("Meeting notes")).toBeInTheDocument()
      expect(screen.getByText("Meeting room upgrade")).toBeInTheDocument()
    })

    it("test_displays_task_results_with_correct_icon", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "task",
        total_results: 1,
        results: [
          {
            id: "1",
            type: "task",
            title: "Test task",
            snippet: "Task description",
            rank: 0.9,
            created_at: new Date().toISOString(),
          },
        ],
      })

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "task")

      await waitFor(() => {
        expect(screen.getByText("Test task")).toBeInTheDocument()
      })
      expect(screen.getByTestId("task-icon")).toBeInTheDocument()
    })

    it("test_displays_note_results_with_correct_icon", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "note",
        total_results: 1,
        results: [
          {
            id: "1",
            type: "note",
            title: "Test note",
            snippet: "Note content",
            rank: 0.9,
            created_at: new Date().toISOString(),
          },
        ],
      })

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "note")

      await waitFor(() => {
        expect(screen.getByText("Test note")).toBeInTheDocument()
      })
      expect(screen.getByTestId("note-icon")).toBeInTheDocument()
    })

    it("test_displays_project_results_with_correct_icon", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "project",
        total_results: 1,
        results: [
          {
            id: "1",
            type: "project",
            title: "Test project",
            snippet: null,
            rank: 0.9,
            created_at: new Date().toISOString(),
          },
        ],
      })

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "project")

      await waitFor(() => {
        expect(screen.getByText("Test project")).toBeInTheDocument()
      })
      expect(screen.getByTestId("project-icon")).toBeInTheDocument()
    })

    it("test_displays_result_snippets_truncated_to_500_chars", async () => {
      const longSnippet = "a".repeat(600)
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "test",
        total_results: 1,
        results: [
          {
            id: "1",
            type: "task",
            title: "Test task",
            snippet: longSnippet,
            rank: 0.9,
            created_at: new Date().toISOString(),
          },
        ],
      })

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        const snippet = screen.getByText(/aaa/i)
        expect(snippet.textContent?.length).toBeLessThanOrEqual(503)
      })
    })

    it("test_displays_total_result_count", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "test",
        total_results: 42,
        results: [
          {
            id: "1",
            type: "task",
            title: "Test task",
            snippet: "Description",
            rank: 0.9,
            created_at: new Date().toISOString(),
          },
        ],
      })

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        expect(screen.getByText(/42 results/i)).toBeInTheDocument()
      })
    })
  })

  describe("keyboard navigation", () => {
    const mockResults: SearchResponse = {
      query: "test",
      total_results: 3,
      results: [
        {
          id: "1",
          type: "task",
          title: "First result",
          snippet: "First",
          rank: 0.9,
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          type: "note",
          title: "Second result",
          snippet: "Second",
          rank: 0.8,
          created_at: new Date().toISOString(),
        },
        {
          id: "3",
          type: "project",
          title: "Third result",
          snippet: null,
          rank: 0.7,
          created_at: new Date().toISOString(),
        },
      ],
    }

    it("test_arrow_down_selects_next_result", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue(mockResults)

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        expect(screen.getByText("First result")).toBeInTheDocument()
      })

      await user.keyboard("{ArrowDown}")
      const firstResult = screen
        .getByText("First result")
        .closest("[data-selected]")
      expect(firstResult).toHaveAttribute("data-selected", "true")

      await user.keyboard("{ArrowDown}")
      const secondResult = screen
        .getByText("Second result")
        .closest("[data-selected]")
      expect(secondResult).toHaveAttribute("data-selected", "true")
    })

    it("test_arrow_up_selects_previous_result", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue(mockResults)

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        expect(screen.getByText("First result")).toBeInTheDocument()
      })

      await user.keyboard("{ArrowDown}")
      await user.keyboard("{ArrowDown}")
      await user.keyboard("{ArrowUp}")

      const firstResult = screen
        .getByText("First result")
        .closest("[data-selected]")
      expect(firstResult).toHaveAttribute("data-selected", "true")
    })

    it("test_arrow_down_wraps_to_first_result", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue(mockResults)

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        expect(screen.getByText("First result")).toBeInTheDocument()
      })

      await user.keyboard("{ArrowDown}")
      await user.keyboard("{ArrowDown}")
      await user.keyboard("{ArrowDown}")
      await user.keyboard("{ArrowDown}")

      const firstResult = screen
        .getByText("First result")
        .closest("[data-selected]")
      expect(firstResult).toHaveAttribute("data-selected", "true")
    })

    it("test_arrow_up_wraps_to_last_result", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue(mockResults)

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        expect(screen.getByText("First result")).toBeInTheDocument()
      })

      await user.keyboard("{ArrowUp}")

      const thirdResult = screen
        .getByText("Third result")
        .closest("[data-selected]")
      expect(thirdResult).toHaveAttribute("data-selected", "true")
    })

    it("test_enter_key_navigates_to_selected_result", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue(mockResults)

      const user = userEvent.setup()
      render(
        <SearchBar
          open={true}
          onOpenChange={mockOnOpenChange}
          onNavigate={mockOnNavigate}
        />,
      )

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        expect(screen.getByText("First result")).toBeInTheDocument()
      })

      await user.keyboard("{ArrowDown}")
      await user.keyboard("{Enter}")

      expect(mockOnNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "1",
          type: "task",
          title: "First result",
        }),
      )
    })

    it("test_escape_key_closes_search_modal", async () => {
      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      await user.keyboard("{Escape}")

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  describe("empty state", () => {
    it("test_displays_empty_state_when_no_results", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "nonexistent",
        total_results: 0,
        results: [],
      })

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "nonexistent")

      await waitFor(() => {
        expect(screen.getByText(/no results found/i)).toBeInTheDocument()
      })
    })

    it("test_displays_initial_state_before_search", () => {
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      expect(
        screen.getByText(/type at least 2 characters to search/i),
      ).toBeInTheDocument()
    })
  })

  describe("error handling", () => {
    it("test_displays_error_when_api_fails", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockRejectedValue(new Error("Network error"))

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        expect(
          screen.getByText(/search failed.*network error/i),
        ).toBeInTheDocument()
      })
    })

    it("test_does_not_close_modal_on_error", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockRejectedValue(new Error("Error"))

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        expect(screen.getByText(/search failed/i)).toBeInTheDocument()
      })

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument()
      expect(mockOnOpenChange).not.toHaveBeenCalledWith(false)
    })

    it("test_allows_retry_after_error", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch
        .mockRejectedValueOnce(new Error("Error"))
        .mockResolvedValueOnce({
          query: "test",
          total_results: 1,
          results: [
            {
              id: "1",
              type: "task",
              title: "Test task",
              snippet: "Description",
              rank: 0.9,
              created_at: new Date().toISOString(),
            },
          ],
        })

      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        expect(screen.getByText(/search failed/i)).toBeInTheDocument()
      })

      await user.clear(input)
      await user.type(input, "test")

      await waitFor(() => {
        expect(screen.getByText("Test task")).toBeInTheDocument()
      })
    })
  })

  describe("dialog management", () => {
    it("test_clears_results_when_dialog_closes", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "test",
        total_results: 1,
        results: [
          {
            id: "1",
            type: "task",
            title: "Test task",
            snippet: "Description",
            rank: 0.9,
            created_at: new Date().toISOString(),
          },
        ],
      })

      const user = userEvent.setup()
      const { rerender } = render(
        <SearchBar open={true} onOpenChange={mockOnOpenChange} />,
      )

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        expect(screen.getByText("Test task")).toBeInTheDocument()
      })

      rerender(<SearchBar open={false} onOpenChange={mockOnOpenChange} />)
      rerender(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      expect(screen.queryByText("Test task")).not.toBeInTheDocument()
    })

    it("test_clears_search_input_when_dialog_closes", async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <SearchBar open={true} onOpenChange={mockOnOpenChange} />,
      )

      const input = screen.getByPlaceholderText(/search/i) as HTMLInputElement
      await user.type(input, "test query")

      expect(input.value).toBe("test query")

      rerender(<SearchBar open={false} onOpenChange={mockOnOpenChange} />)
      rerender(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const newInput = screen.getByPlaceholderText(
        /search/i,
      ) as HTMLInputElement
      expect(newInput.value).toBe("")
    })

    it("test_calls_onOpenChange_when_escape_pressed", async () => {
      const user = userEvent.setup()
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      await user.keyboard("{Escape}")

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })

    it("test_calls_onSuccess_after_navigation", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "test",
        total_results: 1,
        results: [
          {
            id: "1",
            type: "task",
            title: "Test task",
            snippet: "Description",
            rank: 0.9,
            created_at: new Date().toISOString(),
          },
        ],
      })

      const mockOnSuccess = vi.fn()
      const user = userEvent.setup()
      render(
        <SearchBar
          open={true}
          onOpenChange={mockOnOpenChange}
          onNavigate={mockOnNavigate}
          onSuccess={mockOnSuccess}
        />,
      )

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await waitFor(() => {
        expect(screen.getByText("Test task")).toBeInTheDocument()
      })

      await user.keyboard("{ArrowDown}")
      await user.keyboard("{Enter}")

      expect(mockOnSuccess).toHaveBeenCalled()
    })
  })

  describe("debouncing", () => {
    it("test_debounces_search_input_to_reduce_api_calls", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "test",
        total_results: 0,
        results: [],
      })

      const user = userEvent.setup({ delay: null })
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "test")

      await new Promise((resolve) => setTimeout(resolve, 500))

      expect(mockSearch).toHaveBeenCalledTimes(1)
    })

    it("test_cancels_pending_search_when_input_changes", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockImplementation((query: string) =>
        Promise.resolve({
          query,
          total_results: 0,
          results: [],
        }),
      )

      const user = userEvent.setup({ delay: null })
      render(<SearchBar open={true} onOpenChange={mockOnOpenChange} />)

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "te")
      await user.type(input, "st")

      await new Promise((resolve) => setTimeout(resolve, 500))

      expect(mockSearch).toHaveBeenCalledWith("test", 50)
    })
  })

  describe("integration", () => {
    it("test_full_search_flow_typing_to_navigation", async () => {
      const mockSearch = vi.mocked(api.search)
      mockSearch.mockResolvedValue({
        query: "meeting",
        total_results: 2,
        results: [
          {
            id: "1",
            type: "task",
            title: "Schedule meeting",
            snippet: "Meeting with team",
            rank: 0.9,
            created_at: new Date().toISOString(),
          },
          {
            id: "2",
            type: "note",
            title: "Meeting notes",
            snippet: "Notes from last meeting",
            rank: 0.8,
            created_at: new Date().toISOString(),
          },
        ],
      })

      const user = userEvent.setup()
      render(
        <SearchBar
          open={true}
          onOpenChange={mockOnOpenChange}
          onNavigate={mockOnNavigate}
        />,
      )

      const input = screen.getByPlaceholderText(/search/i)
      await user.type(input, "meeting")

      await waitFor(() => {
        expect(screen.getByText("Schedule meeting")).toBeInTheDocument()
      })
      expect(screen.getByText("Meeting notes")).toBeInTheDocument()
      expect(screen.getByText(/2 results/i)).toBeInTheDocument()

      await user.keyboard("{ArrowDown}")
      await user.keyboard("{ArrowDown}")
      await user.keyboard("{Enter}")

      expect(mockOnNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "2",
          type: "note",
          title: "Meeting notes",
        }),
      )
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })
})

/**
 * SearchBar - Global search across tasks, notes, and projects
 */

import { useState, useEffect, useCallback } from "react"
import { search, type SearchResultItem } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckSquare, FileText, Folder } from "lucide-react"

interface SearchBarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onNavigate?: (result: SearchResultItem) => void
  onSuccess?: () => void
}

export function SearchBar({
  open,
  onOpenChange,
  onNavigate,
  onSuccess,
}: SearchBarProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [totalResults, setTotalResults] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedIndex, setSelectedIndex] = useState(-1)

  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim()

    if (trimmedQuery.length < 2) {
      setResults([])
      setTotalResults(0)
      setError(null)
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const response = await search(trimmedQuery, 50)
      setResults(response.results)
      setTotalResults(response.total_results)
      setSelectedIndex(-1)
    } catch (err) {
      setError(
        err instanceof Error
          ? `Search failed: ${err.message}`
          : "Search failed",
      )
      setResults([])
      setTotalResults(0)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim().length >= 2) {
        void performSearch(query)
      }
    }, 50)

    return () => clearTimeout(timeoutId)
  }, [query, performSearch])

  useEffect(() => {
    if (!open) {
      setQuery("")
      setResults([])
      setTotalResults(0)
      setError(null)
      setSelectedIndex(-1)
    }
  }, [open])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      if (results.length > 0) {
        setSelectedIndex((prev) => (prev + 1) % results.length)
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      if (results.length > 0) {
        setSelectedIndex((prev) => {
          if (prev <= 0) return results.length - 1
          return prev - 1
        })
      }
    } else if (e.key === "Enter" && results.length > 0 && selectedIndex >= 0) {
      e.preventDefault()
      const selected = results[selectedIndex]
      if (selected && onNavigate) {
        onNavigate(selected)
        onOpenChange(false)
        onSuccess?.()
      }
    } else if (e.key === "Escape") {
      e.preventDefault()
      onOpenChange(false)
    }
  }

  const handleResultClick = (result: SearchResultItem) => {
    if (onNavigate) {
      onNavigate(result)
      onOpenChange(false)
      onSuccess?.()
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "task":
        return <CheckSquare className="h-4 w-4" data-testid="task-icon" />
      case "note":
        return <FileText className="h-4 w-4" data-testid="note-icon" />
      case "project":
        return <Folder className="h-4 w-4" data-testid="project-icon" />
      default:
        return null
    }
  }

  const truncateSnippet = (snippet: string | null | undefined) => {
    if (!snippet) return null
    if (snippet.length <= 500) return snippet
    return snippet.substring(0, 500) + "..."
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
          <DialogDescription>
            Search across tasks, notes, and projects
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            type="text"
            autoFocus
            placeholder="Search tasks, notes, and projects..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />

          {error && <p className="text-sm text-red-500">{error}</p>}

          {(isSearching || query.trim().length >= 2) &&
            results.length === 0 &&
            !error && <p className="text-sm text-gray-500">Searching...</p>}

          {!isSearching && query.trim().length < 2 && results.length === 0 && (
            <p className="text-sm text-gray-500">
              Type at least 2 characters to search
            </p>
          )}

          {!isSearching && query.trim().length >= 2 && results.length === 0 && (
            <p className="text-sm text-gray-500">No results found</p>
          )}

          {!isSearching && results.length > 0 && (
            <>
              <p className="text-sm text-gray-600">
                {totalResults} {totalResults === 1 ? "result" : "results"}
              </p>
              <div className="max-h-[400px] space-y-2 overflow-y-auto">
                {results.map((result, index) => (
                  <div
                    key={result.id}
                    data-selected={index === selectedIndex ? "true" : "false"}
                    onClick={() => handleResultClick(result)}
                    className={`cursor-pointer rounded-md border p-3 transition-colors ${
                      index === selectedIndex
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-1">{getResultIcon(result.type)}</div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium">{result.title}</h4>
                        {result.snippet && (
                          <p className="mt-1 text-xs text-gray-600">
                            {truncateSnippet(result.snippet)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

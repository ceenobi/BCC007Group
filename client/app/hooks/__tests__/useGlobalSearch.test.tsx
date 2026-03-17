import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useGlobalSearch, useSearchHistory } from "../useGlobalSearch";

// Mock SearchService module - define functions inside factory to avoid hoisting issues
vi.mock("../../lib/queries/searchAggregate", () => {
  const mockSearchFn = vi.fn(() => Promise.resolve([]));
  const mockSearchByTypeFn = vi.fn(() => Promise.resolve([]));
  return {
    SearchService: {
      search: mockSearchFn,
      searchByType: mockSearchByTypeFn,
    },
  };
});

// Import after mocking
import { SearchService } from "../../lib/queries/searchAggregate";

// Get mock functions for test setup - they are attached to the SearchService
const getMockSearch = () => (SearchService.search as any);
const getMockSearchByType = () => (SearchService.searchByType as any);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe("useGlobalSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations to default
    getMockSearch().mockResolvedValue([]);
    getMockSearchByType().mockResolvedValue([]);
  });

  it("should initialize with empty state", () => {
    const { result } = renderHook(() => useGlobalSearch(), { wrapper: createWrapper() });

    expect(result.current.query).toBe("");
    expect(result.current.debouncedQuery).toBe("");
    expect(result.current.results).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isError).toBe(false);
  });

  it("should update query state", async () => {
    const { result } = renderHook(() => useGlobalSearch(), { wrapper: createWrapper() });

    await act(async () => {
      result.current.setQuery("test query");
    });
    expect(result.current.query).toBe("test query");
  });

  it("should debounce search queries", async () => {
    vi.useFakeTimers();
    getMockSearch().mockResolvedValue([]);

    const { result } = renderHook(() => useGlobalSearch({ debounceMs: 300 }), {
      wrapper: createWrapper(),
    });

    result.current.setQuery("test");
    expect(getMockSearch()).not.toHaveBeenCalled();

    vi.advanceTimersByTime(300);
    await waitFor(() => expect(getMockSearch()).toHaveBeenCalledWith("test"));

    vi.useRealTimers();
  });

  it("should not search for queries below minimum length", async () => {
    vi.useFakeTimers();
    getMockSearch().mockResolvedValue([]);

    const { result } = renderHook(() => useGlobalSearch({ minQueryLength: 3 }), {
      wrapper: createWrapper(),
    });

    result.current.setQuery("ab");
    vi.advanceTimersByTime(300);

    await waitFor(() => expect(getMockSearch()).not.toHaveBeenCalled());
    vi.useRealTimers();
  });

  it("should handle search results", async () => {
    vi.useFakeTimers();
    const mockResults = [
      {
        id: "1",
        title: "Test Result",
        description: "A test result",
        type: "member" as const,
        data: {},
        relevance: 80,
        route: "/test",
      },
    ];
    getMockSearch().mockResolvedValue(mockResults);

    const { result } = renderHook(() => useGlobalSearch(), { wrapper: createWrapper() });

    result.current.setQuery("test");
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.results).toEqual(mockResults);
      expect(result.current.isLoading).toBe(false);
    });

    vi.useRealTimers();
  });

  it("should handle search errors", async () => {
    vi.useFakeTimers();
    getMockSearch().mockRejectedValue(new Error("Search failed"));

    const { result } = renderHook(() => useGlobalSearch(), { wrapper: createWrapper() });

    result.current.setQuery("test");
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
      expect(result.current.error).toBeDefined();
    });

    vi.useRealTimers();
  });

  it("should clear search state", () => {
    const { result } = renderHook(() => useGlobalSearch(), { wrapper: createWrapper() });

    result.current.setQuery("test query");
    result.current.clearSearch();

    expect(result.current.query).toBe("");
    expect(result.current.debouncedQuery).toBe("");
  });

  it("should apply filters", async () => {
    vi.useFakeTimers();
    const mockResults = [
      {
        id: "1",
        title: "Member 1",
        description: "A member",
        type: "member" as const,
        data: {},
        relevance: 80,
        route: "/member",
      },
      {
        id: "2",
        title: "Event 1",
        description: "An event",
        type: "event" as const,
        data: {},
        relevance: 70,
        route: "/event",
      },
    ];
    getMockSearch().mockResolvedValue(mockResults);

    const { result } = renderHook(
      () => useGlobalSearch({ defaultFilters: { types: ["member"] } }),
      { wrapper: createWrapper() }
    );

    result.current.setQuery("test");
    vi.advanceTimersByTime(300);

    await waitFor(() => {
      expect(result.current.results).toHaveLength(1);
      expect(result.current.results[0].type).toBe("member");
    });

    vi.useRealTimers();
  });
});

describe("useSearchHistory", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should load empty history initially", () => {
    const { result } = renderHook(() => useSearchHistory());

    expect(result.current.history).toEqual([]);
  });

  it("should add queries to history", async () => {
    const { result } = renderHook(() => useSearchHistory());

    await act(async () => {
      result.current.addToHistory("test query");
    });
    expect(result.current.history).toContain("test query");
  });

  it("should not add empty queries to history", async () => {
    const { result } = renderHook(() => useSearchHistory());

    await act(async () => {
      result.current.addToHistory("");
      result.current.addToHistory("   ");
    });
    expect(result.current.history).toEqual([]);
  });

  it("should limit history to 10 items", async () => {
    const { result } = renderHook(() => useSearchHistory());

    // Add 11 queries
    for (let i = 0; i < 11; i++) {
      await act(async () => {
        result.current.addToHistory(`query ${i}`);
      });
    }

    expect(result.current.history).toHaveLength(10);
    expect(result.current.history[0]).toBe("query 10"); // Most recent first
  });

  it("should remove duplicates and move to front", async () => {
    const { result } = renderHook(() => useSearchHistory());

    await act(async () => {
      result.current.addToHistory("query 1");
      result.current.addToHistory("query 2");
      result.current.addToHistory("query 1"); // Duplicate
    });

    expect(result.current.history).toEqual(["query 1", "query 2"]);
  });

  it("should clear history", async () => {
    const { result } = renderHook(() => useSearchHistory());

    await act(async () => {
      result.current.addToHistory("test query");
      result.current.clearHistory();
    });

    expect(result.current.history).toEqual([]);
  });
});

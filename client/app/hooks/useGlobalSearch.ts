import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { SearchService } from "../lib/queries/searchAggregate";
import type { SearchResult } from "../lib/queries/searchAggregate";

export interface SearchFilter {
  types?: SearchResult["type"][];
  minRelevance?: number;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface UseGlobalSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  maxResults?: number;
  enableAnalytics?: boolean;
  defaultFilters?: SearchFilter;
}

export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
  const { 
    debounceMs = 300, 
    minQueryLength = 2, 
    maxResults = 20,
    enableAnalytics = true,
    defaultFilters = {}
  } = options;
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilter>(defaultFilters);

  // Debounce the query
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= minQueryLength) {
        setDebouncedQuery(query);
      } else {
        setDebouncedQuery("");
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, minQueryLength]);

  // Search query with caching
  const searchQuery = useQuery({
    queryKey: ["global-search", debouncedQuery, filters],
    queryFn: async () => {
      const results = await SearchService.search(debouncedQuery);
      
      // Apply filters
      let filteredResults = results;
      
      if (filters.types && filters.types.length > 0) {
        filteredResults = filteredResults.filter(result => 
          filters.types!.includes(result.type)
        );
      }
      
      if (filters.minRelevance) {
        filteredResults = filteredResults.filter(result => 
          result.relevance >= filters.minRelevance!
        );
      }
      
      if (filters.dateRange) {
        // Apply date filtering if results have timestamp data
        filteredResults = filteredResults.filter(result => {
          const resultDate = (result.data as any)?.date || (result.data as any)?.createdAt;
          if (!resultDate) return true;
          const date = new Date(resultDate);
          return date >= filters.dateRange!.start && date <= filters.dateRange!.end;
        });
      }
      
      return filteredResults;
    },
    enabled: debouncedQuery.length >= minQueryLength,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Use ref to avoid recreating callbacks that depend on query object
  const searchQueryRef = useRef(searchQuery);
  searchQueryRef.current = searchQuery;

  const updateFilters = useCallback((newFilters: Partial<SearchFilter>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Use ref to store defaultFilters to avoid dependency issues
  const defaultFiltersRef = useRef(defaultFilters);
  defaultFiltersRef.current = defaultFilters;

  const resetFilters = useCallback(() => {
    setFilters(defaultFiltersRef.current);
  }, []);

  const clearSearch = useCallback(() => {
    setQuery("");
    setDebouncedQuery("");
    resetFilters();
    // Use ref to avoid circular dependency - refetch triggers re-render which recreates searchQuery
    // Only refetch if there's an active query to avoid unnecessary calls
    if (searchQueryRef.current.fetchStatus !== 'idle') {
      searchQueryRef.current.refetch();
    }
  }, [resetFilters]);

  return {
    query,
    setQuery,
    debouncedQuery,
    results: (searchQuery.data || []).slice(0, maxResults),
    isLoading: searchQuery.isLoading,
    isError: searchQuery.isError,
    error: searchQuery.error,
    filters,
    updateFilters,
    resetFilters,
    clearSearch,
    refetch: searchQuery.refetch,
  };
}

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("search-history");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed.slice(0, 10)); // Keep only last 10
        }
      }
    } catch (error) {
      console.warn("Failed to load search history:", error);
    }
  }, []);

  const addToHistory = useCallback(
    (query: string) => {
      if (!query.trim()) return;

      setHistory((prev) => {
        const filtered = prev.filter((item) => item !== query);
        const updated = [query, ...filtered].slice(0, 10);
        
        try {
          localStorage.setItem("search-history", JSON.stringify(updated));
        } catch (error) {
          console.warn("Failed to save search history:", error);
        }
        
        return updated;
      });
    },
    []
  );

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem("search-history");
    } catch (error) {
      console.warn("Failed to clear search history:", error);
    }
  }, []);

  return {
    history,
    addToHistory,
    clearHistory,
  };
}

import {
  Command,
  Search,
  Loader2,
  AlertCircle,
  X,
  Clock,
  BarChart3,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useGlobalSearch, useSearchHistory } from "../hooks/useGlobalSearch";
import { useSearchAnalytics } from "../hooks/useSearchAnalytics";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import Modal from "./modal";
import type { SearchResult as SearchResultType } from "../lib/queries/searchAggregate";

type SearchResult = {
  id: string;
  title: string;
  description: string;
  type: "member" | "announcement" | "payment" | "event" | "feed" | "quick-link";
  data: unknown;
  relevance: number;
  route: string;
  searchParams?: Record<string, string>;
  score?: number;
  matchReason?: string;
};

const typeLabels = {
  member: "Member",
  announcement: "Announcement",
  payment: "Payment",
  event: "Event",
  feed: "Feed Item",
  "quick-link": "Quick Link",
};

const typeIcons = {
  member: "👤",
  announcement: "📢",
  payment: "💸",
  event: "📅",
  feed: "📰",
  "quick-link": "🔗",
};

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const isMounted = useRef(false);

  const { query, setQuery, results, isLoading, isError, clearSearch } =
    useGlobalSearch({
      debounceMs: 300,
      minQueryLength: 2,
      maxResults: 20,
    });

  const { history, addToHistory, clearHistory } = useSearchHistory();
  const { recordSearch, insights, analytics } = useSearchAnalytics();

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleResultClick = useCallback(
    (result: SearchResultType) => {
      // Record search analytics when user clicks a result
      recordSearch(query, results);
      addToHistory(query);

      const searchParams = new URLSearchParams();
      if (result.searchParams) {
        Object.entries(result.searchParams).forEach(([key, value]) => {
          searchParams.set(key, value);
        });
      }

      const routeWithParams = result.searchParams
        ? `${result.route}?${searchParams.toString()}`
        : `${result.route}`;

      navigate(routeWithParams);
      setIsOpen(false);
      clearSearch();
    },
    [navigate, query, addToHistory, clearSearch, recordSearch, results],
  );

  const handleQuickAction = useCallback(
    (type: string) => {
      switch (type) {
        case "members":
          navigate("/members");
          break;
        // case "announcements":
        //   navigate("/for-you");
        //   break;
        case "events":
          navigate("/events");
          break;
        case "payments":
          navigate("/payments");
          break;
      }
      setIsOpen(false);
    },
    [navigate],
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex] && query.trim()) {
            handleResultClick(results[selectedIndex]);
          }
          break;
        case "Escape":
          e.preventDefault();
          setIsOpen(false);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, handleResultClick, query]);

  useEffect(() => {
    // Skip on initial mount to avoid infinite loop
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    if (!isOpen) {
      clearSearch();
      setSelectedIndex(0);
    }
  }, [isOpen, clearSearch]);

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (query.trim() && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      }
    },
    [query, results, selectedIndex, handleResultClick],
  );

  return (
    <>
      <>
        <Button
          variant="outline"
          onClick={() => setIsOpen(true)}
          className="hidden md:flex h-9 w-52 justify-between text-muted-foreground hover:text-foreground rounded-sm"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            <span className="text-sm">Search...</span>
          </div>
          <div className="flex items-center gap-1 text-xs bg-muted px-1.5 py-0.5 rounded">
            <Command className="h-3 w-3" />
            <span>K</span>
          </div>
        </Button>
      </>
      <Modal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        classname="sm:max-w-xl p-4 overflow-hidden"
      >
        <div className="flex flex-col">
          <form onSubmit={handleSubmit} className="py-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search members, events, payments, and more..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 rounded-sm py-5"
                autoFocus
              />
            </div>
          </form>
          <div className="max-h-96 overflow-y-auto border-t">
            {isLoading ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span className="text-sm text-muted-foreground">
                  Searching...
                </span>
              </div>
            ) : isError ? (
              <div className="flex items-center justify-center p-8">
                <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
                <span className="text-sm text-red-500">
                  Search failed. Please try again.
                </span>
              </div>
            ) : query.trim() === "" ? (
              <>
                {/* Search History Section */}
                {history && history.length > 0 && (
                  <div className="p-4 border-b">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Recent Searches
                      </h4>
                      <button
                        onClick={clearHistory}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      >
                        <X className="h-3 w-3" />
                        Clear
                      </button>
                    </div>
                    <div className="space-y-1">
                      {history.slice(0, 5).map((searchQuery, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-2 rounded-sm hover:bg-accent cursor-pointer"
                          onClick={() => setQuery(searchQuery)}
                        >
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{searchQuery}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Quick Actions</h4>
                    <div className="space-y-1">
                      <div
                        className="flex items-center gap-3 p-2 rounded-sm hover:bg-lightBlue/10 cursor-pointer"
                        onClick={() => handleQuickAction("members")}
                      >
                        <span className="text-lg">👤</span>
                        <span className="text-sm">Search members</span>
                      </div>
                      {/* <div
                        className="flex items-center gap-3 p-2 rounded-sm hover:bg-lightBlue/10 cursor-pointer"
                        onClick={() => handleQuickAction("announcements")}
                      >
                        <span className="text-lg">📢</span>
                        <span className="text-sm">Search announcements</span>
                      </div> */}
                      <div
                        className="flex items-center gap-3 p-2 rounded-sm hover:bg-lightBlue/10 cursor-pointer"
                        onClick={() => handleQuickAction("events")}
                      >
                        <span className="text-lg">📅</span>
                        <span className="text-sm">Search calendar events</span>
                      </div>
                      <div
                        className="flex items-center gap-3 p-2 rounded-sm hover:bg-lightBlue/10 cursor-pointer"
                        onClick={() => handleQuickAction("payments")}
                      >
                        <span className="text-lg">💸</span>
                        <span className="text-sm">Search payments</span>
                      </div>
                    </div>
                  </div>

                  {/* Search Insights Section */}
                  {analytics && analytics.totalSearches > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Search Insights
                      </h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-muted/50 p-2 rounded">
                          <p className="text-muted-foreground">
                            Total Searches
                          </p>
                          <p className="font-medium">
                            {analytics.totalSearches}
                          </p>
                        </div>
                        <div className="bg-muted/50 p-2 rounded">
                          <p className="text-muted-foreground">Success Rate</p>
                          <p className="font-medium">
                            {insights.searchSuccessRate.toFixed(1)}%
                          </p>
                        </div>
                        <div className="bg-muted/50 p-2 rounded">
                          <p className="text-muted-foreground">Most Popular</p>
                          <p className="font-medium capitalize">
                            {insights.mostPopularType || "N/A"}
                          </p>
                        </div>
                        <div className="bg-muted/50 p-2 rounded">
                          <p className="text-muted-foreground">
                            Avg Query Length
                          </p>
                          <p className="font-medium">
                            {insights.averageQueryLength.toFixed(1)} chars
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {results?.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <Search className="h-8 w-8 mx-auto mb-3 opacity-50" />
                    <p>No results found for "{query}"</p>
                    <p className="text-xs mt-1">
                      Try searching for members, events, or payments
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="py-2">
                      {results.map((result: SearchResult, index: number) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          className={`flex items-start px-6 py-3 cursor-pointer hover:bg-accent ${
                            index === selectedIndex ? "bg-accent" : ""
                          }`}
                          onClick={() => handleResultClick(result)}
                        >
                          <div className="mr-3 mt-0.5 text-lg">
                            {typeIcons[result.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium truncate">
                                {result.title}
                              </span>
                              <span className="text-xs px-2 py-0.5 bg-muted rounded-full text-muted-foreground shrink-0">
                                {typeLabels[result.type]}
                              </span>
                            </div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {result.description}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    {(query.trim() || results?.length > 0) && (
                      <div className="border-t px-6 py-3 text-xs text-muted-foreground bg-muted/30 flex justify-between">
                        <span>
                          {results.length > 0
                            ? "Use ↑↓ to navigate • Enter to select"
                            : "Type to search"}
                        </span>
                        <span>Esc to close</span>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}

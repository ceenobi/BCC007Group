import { useState, useCallback } from "react";
import { SearchAnalyticsService, type SearchAnalytics } from "../lib/searchAnalytics";

export function useSearchAnalytics() {
  const [analytics, setAnalytics] = useState<SearchAnalytics>(() => 
    SearchAnalyticsService.getAnalytics()
  );

  const recordSearch = useCallback((query: string, results: any[]) => {
    SearchAnalyticsService.recordSearch(query, results);
    setAnalytics(SearchAnalyticsService.getAnalytics());
  }, []);

  const clearAnalytics = useCallback(() => {
    SearchAnalyticsService.clearAnalytics();
    setAnalytics(SearchAnalyticsService.getAnalytics());
  }, []);

  const insights = SearchAnalyticsService.getSearchInsights();

  return {
    analytics,
    recordSearch,
    clearAnalytics,
    insights,
  };
}

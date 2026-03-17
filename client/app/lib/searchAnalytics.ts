import type { SearchResult } from "../lib/queries/searchAggregate";
import { safeGetItem, safeSetItem, safeRemoveItem } from "./storage";

export interface SearchAnalytics {
  totalSearches: number;
  averageResultsCount: number;
  topQueries: Array<{ query: string; count: number }>;
  typeDistribution: Record<string, number>;
  noResultQueries: string[];
  recentSearches: Array<{ query: string; timestamp: number; resultCount: number }>;
}

export class SearchAnalyticsService {
  private static readonly STORAGE_KEY = "search-analytics";
  private static readonly MAX_RECENT_SEARCHES = 100;
  private static readonly MAX_TOP_QUERIES = 20;

  static recordSearch(query: string, results: SearchResult[]): void {
    try {
      const analytics = this.getAnalytics();
      
      // Update total searches
      analytics.totalSearches++;
      
      // Update recent searches
      analytics.recentSearches.unshift({
        query,
        timestamp: Date.now(),
        resultCount: results.length,
      });
      analytics.recentSearches = analytics.recentSearches.slice(0, this.MAX_RECENT_SEARCHES);
      
      // Update top queries
      const existingQuery = analytics.topQueries.find(q => q.query === query);
      if (existingQuery) {
        existingQuery.count++;
      } else {
        analytics.topQueries.push({ query, count: 1 });
      }
      analytics.topQueries.sort((a, b) => b.count - a.count);
      analytics.topQueries = analytics.topQueries.slice(0, this.MAX_TOP_QUERIES);
      
      // Update type distribution
      results.forEach(result => {
        analytics.typeDistribution[result.type] = (analytics.typeDistribution[result.type] || 0) + 1;
      });
      
      // Update no result queries
      if (results.length === 0) {
        if (!analytics.noResultQueries.includes(query)) {
          analytics.noResultQueries.push(query);
        }
      }
      
      // Calculate average results count
      const totalResults = analytics.recentSearches.reduce((sum, search) => sum + search.resultCount, 0);
      analytics.averageResultsCount = totalResults / analytics.recentSearches.length;
      
      this.saveAnalytics(analytics);
    } catch (error) {
      console.warn("Failed to record search analytics:", error);
    }
  }

  static getAnalytics(): SearchAnalytics {
    try {
      const stored = safeGetItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load search analytics:", error);
    }
    
    return {
      totalSearches: 0,
      averageResultsCount: 0,
      topQueries: [],
      typeDistribution: {},
      noResultQueries: [],
      recentSearches: [],
    };
  }

  static clearAnalytics(): void {
    safeRemoveItem(this.STORAGE_KEY);
  }

  private static saveAnalytics(analytics: SearchAnalytics): void {
    safeSetItem(this.STORAGE_KEY, JSON.stringify(analytics));
  }

  static getSearchInsights(): {
    mostPopularType: string;
    searchSuccessRate: number;
    averageQueryLength: number;
  } {
    const analytics = this.getAnalytics();
    
    // Find most popular type
    let mostPopularType = "";
    let maxCount = 0;
    for (const [type, count] of Object.entries(analytics.typeDistribution)) {
      if (count > maxCount) {
        mostPopularType = type;
        maxCount = count;
      }
    }
    
    // Calculate success rate (searches with results)
    const successfulSearches = analytics.recentSearches.filter(s => s.resultCount > 0).length;
    const searchSuccessRate = analytics.totalSearches > 0 
      ? (successfulSearches / analytics.totalSearches) * 100 
      : 0;
    
    // Calculate average query length
    const totalQueryLength = analytics.topQueries.reduce((sum, q) => sum + q.query.length, 0);
    const averageQueryLength = analytics.topQueries.length > 0 
      ? totalQueryLength / analytics.topQueries.length 
      : 0;
    
    return {
      mostPopularType,
      searchSuccessRate,
      averageQueryLength,
    };
  }
}

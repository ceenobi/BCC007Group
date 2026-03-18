import { formatDate } from "../utils";
import Fuse from "fuse.js";
import type { IFuseOptions } from "fuse.js";
import { QueryClient } from "@tanstack/react-query";
import type { UserData, EventData, PaymentData } from "../dataSchema";

export interface SearchResult {
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
}

export class SearchService {
  private static queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
      },
    },
  });

  private static fuseOptions: IFuseOptions<any> = {
    keys: [
      { name: "title", weight: 0.7 },
      { name: "description", weight: 0.3 },
      { name: "name", weight: 0.8 },
      { name: "fullname", weight: 0.8 },
      { name: "role", weight: 0.4 },
      { name: "email", weight: 0.3 },
      { name: "eventType", weight: 0.4 },
      { name: "paymentType", weight: 0.4 },
    ],
    threshold: 0.3,
    includeScore: true,
    includeMatches: true,
    minMatchCharLength: 2,
    ignoreLocation: true,
  };
  private static normalizeText(text: string): string {
    return text.toLowerCase().trim();
  }

  private static calculateRelevance(
    query: string,
    text: string,
    fuzzyScore?: number,
  ): number {
    const normalizedQuery = this.normalizeText(query);
    const normalizedText = this.normalizeText(text);

    let baseScore = 0;

    // Exact match gets highest score
    if (normalizedText === normalizedQuery) {
      baseScore = 100;
    } else if (normalizedText.includes(normalizedQuery)) {
      // Match at beginning gets higher score
      if (normalizedText.startsWith(normalizedQuery)) {
        baseScore = 80;
      } else {
        // Partial match
        baseScore = 60;
      }
    } else {
      // Check for partial word matches
      const queryWords = normalizedQuery.split(" ");
      const textWords = normalizedText.split(" ");
      let matchCount = 0;

      queryWords.forEach((queryWord) => {
        textWords.forEach((textWord) => {
          if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
            matchCount++;
          }
        });
      });

      baseScore = matchCount > 0 ? (matchCount / queryWords.length) * 40 : 0;
    }

    // Boost with fuzzy search score if available
    if (fuzzyScore && fuzzyScore < 1) {
      baseScore = baseScore * (1 - fuzzyScore) + 20; // Add bonus for fuzzy matches
    }

    return Math.round(baseScore);
  }

  private static async searchMembers(query: string): Promise<SearchResult[]> {
    try {
      const cacheKey = ["search-members", query];
      const cached = this.queryClient.getQueryData<SearchResult[]>(cacheKey);
      if (cached) return cached;

      const response = await fetch("/api/v1/members/get?page=1&limit=100");
      if (!response.ok) throw new Error("Failed to fetch members");
      const json = await response.json();
      const members: UserData[] = json.data.members;

      // Create Fuse instance for fuzzy search
      const fuse = new Fuse(members, {
        ...this.fuseOptions,
        keys: [
          { name: "name", weight: 0.8 },
          { name: "role", weight: 0.4 },
          { name: "email", weight: 0.3 },
          { name: "phone", weight: 0.3 },
          { name: "occupation", weight: 0.2 },
          { name: "location", weight: 0.2 },
          { name: "memberId", weight: 0.5 },
        ],
      });

      const fuzzyResults = fuse.search(query);
      const fuzzyMap = new Map(
        fuzzyResults.map((r) => [(r.item as any).id || (r.item as any)._id, r]),
      );

      const results = members
        .map((member: any) => {
          const memberId = member.id || member._id;
          const searchText = `${member.name} ${member.role} ${member.email || ""} ${member.phone || ""} ${member.occupation || ""} ${member.location || ""}`;
          const fuzzyResult = fuzzyMap.get(memberId);
          const fuzzyScore = fuzzyResult?.score;
          const relevance = this.calculateRelevance(
            query,
            searchText,
            fuzzyScore,
          );

          return {
            id: memberId,
            title: member.name,
            description: `${member.role}${member.memberId ? ` • ID: ${member.memberId}` : ""}`,
            type: "member" as const,
            data: member,
            relevance,
            score: fuzzyScore,
            matchReason: fuzzyResult?.matches?.map((m) => m.key).join(", "),
            route: "/members",
            searchParams: { query: member.memberId },
          };
        })
        .filter((result) => result.relevance > 0);

      this.queryClient.setQueryData(cacheKey, results);
      return results;
    } catch (error) {
      console.error("Error searching members:", error);
      return [];
    }
  }

  private static async searchEvents(query: string): Promise<SearchResult[]> {
    try {
      const cacheKey = ["search-events", query];
      const cached = this.queryClient.getQueryData<SearchResult[]>(cacheKey);
      if (cached) return cached;

      const response = await fetch("/api/v1/events/get?page=1&limit=100");
      if (!response.ok) throw new Error("Failed to fetch events");
      const json = await response.json();
      const events: EventData[] = json.data.events;

      // Create Fuse instance for fuzzy search
      const fuse = new Fuse(events, {
        ...this.fuseOptions,
        keys: [
          { name: "title", weight: 0.7 },
          { name: "description", weight: 0.3 },
          { name: "eventType", weight: 0.4 },
          { name: "location", weight: 0.3 },
          { name: "status", weight: 0.2 },
        ],
      });

      const fuzzyResults = fuse.search(query);
      const fuzzyMap = new Map(fuzzyResults.map((r) => [r.item._id, r]));

      const results = events
        .map((event: any) => {
          const searchText = `${event.title} ${event.description || ""} ${event.eventType}`;
          const fuzzyResult = fuzzyMap.get(event._id);
          const fuzzyScore = fuzzyResult?.score;
          const relevance = this.calculateRelevance(
            query,
            searchText,
            fuzzyScore,
          );

          return {
            id: event._id,
            title: event.title,
            description: `${event.eventType.charAt(0).toUpperCase() + event.eventType.slice(1)} • ${formatDate(event.date as string)}`,
            type: "event" as const,
            data: event,
            relevance,
            score: fuzzyScore,
            matchReason: fuzzyResult?.matches?.map((m) => m.key).join(", "),
            route: "/events",
            searchParams: { query: event.title },
          };
        })
        .filter((result) => result.relevance > 0);

      this.queryClient.setQueryData(cacheKey, results);
      return results;
    } catch (error) {
      console.error("Error searching events:", error);
      return [];
    }
  }

  private static async searchPayments(query: string): Promise<SearchResult[]> {
    try {
      const cacheKey = ["search-payments", query];
      const cached = this.queryClient.getQueryData<SearchResult[]>(cacheKey);
      if (cached) return cached;

      const response = await fetch("/api/v1/payments/user?page=1&limit=100");
      if (!response.ok) throw new Error("Failed to fetch payments");
      const json = await response.json();
      const payments: PaymentData[] = json.data.payments;

      // Create Fuse instance for fuzzy search
      const fuse = new Fuse(payments, {
        ...this.fuseOptions,
        keys: [
          { name: "note", weight: 0.5 },
          { name: "paymentType", weight: 0.4 },
          { name: "paymentStatus", weight: 0.3 },
          { name: "reference", weight: 0.3 },
        ],
      });

      const fuzzyResults = fuse.search(query);
      const fuzzyMap = new Map(fuzzyResults.map((r) => [r.item._id, r]));

      const results = payments
        .map((payment: any) => {
          const searchText = `${payment.note || ""} ${payment.paymentType} ${payment.reference || ""}`;
          const fuzzyResult = fuzzyMap.get(payment._id);
          const fuzzyScore = fuzzyResult?.score;
          const relevance = this.calculateRelevance(
            query,
            searchText,
            fuzzyScore,
          );

          const paymentDate = payment.createdAt || payment.lastPaymentDate;
          const amountFormatted = payment.amount
            ? `₦${payment.amount.toLocaleString()}`
            : "";

          return {
            id: payment._id,
            title: payment.note || `${payment.paymentType} Payment`,
            description: `${payment.paymentType.charAt(0).toUpperCase() + payment.paymentType.slice(1).replace("_", " ")} • ${amountFormatted} • ${payment.paymentStatus || "N/A"}${paymentDate ? ` • ${formatDate(paymentDate as string)}` : ""}`,
            type: "payment" as const,
            data: payment,
            relevance,
            score: fuzzyScore,
            matchReason: fuzzyResult?.matches?.map((m) => m.key).join(", "),
            route: "/payments",
            searchParams: { id: payment._id },
          };
        })
        .filter((result) => result.relevance > 0);

      this.queryClient.setQueryData(cacheKey, results);
      return results;
    } catch (error) {
      console.error("Error searching payments:", error);
      return [];
    }
  }

  public static async search(query: string): Promise<SearchResult[]> {
    if (!query.trim()) return [];

    try {
      // Execute all searches in parallel
      const [membersResults, eventsResults, paymentsResults] =
        await Promise.allSettled([
          this.searchMembers(query),
          this.searchEvents(query),
          this.searchPayments(query),
        ]);

      const allResults = [
        ...(membersResults.status === "fulfilled" ? membersResults.value : []),
        ...(eventsResults.status === "fulfilled" ? eventsResults.value : []),
        ...(paymentsResults.status === "fulfilled"
          ? paymentsResults.value
          : []),
      ];

      // Sort by relevance (highest first) and limit results
      return allResults.sort((a, b) => b.relevance - a.relevance).slice(0, 20);
    } catch (error) {
      console.error("Search error:", error);
      return [];
    }
  }

  public static async searchByType(
    query: string,
    type: SearchResult["type"],
  ): Promise<SearchResult[]> {
    const allResults = await this.search(query);
    return allResults.filter((result) => result.type === type);
  }

  public static getQuickActions(): Array<{
    label: string;
    action: () => void;
    icon: string;
  }> {
    return [
      {
        label: "Search members",
        action: () => {},
        icon: "users",
      },
      //   {
      //     label: "Search announcements",
      //     action: () => {},
      //     icon: "megaphone",
      //   },
      {
        label: "Search calendar events",
        action: () => {},
        icon: "calendar",
      },
      {
        label: "Search payments",
        action: () => {},
        icon: "dollar",
      },
    ];
  }
}

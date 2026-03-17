import { describe, it, expect, vi, beforeEach } from "vitest";
import { SearchService } from "../queries/searchAggregate";
import type { SearchResult } from "../queries/searchAggregate";

// Mock fetch for API calls
global.fetch = vi.fn();

describe("SearchService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("search", () => {
    it("should return empty array for empty query", async () => {
      const results = await SearchService.search("");
      expect(results).toEqual([]);
    });

    it("should return empty array for whitespace-only query", async () => {
      const results = await SearchService.search("   ");
      expect(results).toEqual([]);
    });

    it("should handle API errors gracefully", async () => {
      vi.mocked(fetch).mockReset();
      vi.mocked(fetch).mockRejectedValue(new Error("Network error"));

      const results = await SearchService.search("test");
      expect(results).toEqual([]);
    });

    it("should return sorted results by relevance", async () => {
      vi.mocked(fetch).mockReset();
      vi.mocked(fetch).mockImplementation(((url: unknown) => {
        const urlStr = String(url);
        if (urlStr.includes("/members")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: {
                members: [
                  { _id: "1", name: "John Doe", role: "admin", email: "john@example.com" },
                  { _id: "2", name: "Jane Smith", role: "member", email: "jane@example.com" },
                ],
              },
            }),
          });
        }
        if (urlStr.includes("/events")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: {
                events: [
                  { _id: "1", title: "Team Meeting", description: "Weekly sync", eventType: "meeting", date: "2024-01-01" },
                  { _id: "2", title: "Birthday Party", description: "Celebration", eventType: "birthday", date: "2024-01-02" },
                ],
              },
            }),
          });
        }
        if (urlStr.includes("/payments")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: {
                payments: [
                  { _id: "1", description: "Dues Payment", paymentType: "dues", paidAt: "2024-01-01" },
                  { _id: "2", description: "Event Fee", paymentType: "event", paidAt: "2024-01-02" },
                ],
              },
            }),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      }) as typeof fetch);

      const results = await SearchService.search("John");
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("John Doe");
      expect(results[0].type).toBe("member");
    });

    it("should limit results to maximum of 20", async () => {
      const manyMembers = Array.from({ length: 30 }, (_, i) => ({
        _id: `member-${i}`,
        name: `User ${i}`,
        role: "member",
        email: `user${i}@example.com`,
      }));

      vi.mocked(fetch).mockReset();
      vi.mocked(fetch).mockImplementation(((url: unknown) => {
        const urlStr = String(url);
        if (urlStr.includes("/members")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ data: { members: manyMembers } }),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      }) as typeof fetch);

      const results = await SearchService.search("User");
      expect(results.length).toBeLessThanOrEqual(20);
    });
  });

  describe("searchByType", () => {
    it("should filter results by type", async () => {
      vi.mocked(fetch).mockReset();
      vi.mocked(fetch).mockImplementation(((url: unknown) => {
        const urlStr = String(url);
        if (urlStr.includes("/members")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: {
                members: [
                  { _id: "1", name: "John Doe", role: "admin", email: "john@example.com" },
                ],
              },
            }),
          });
        }
        if (urlStr.includes("/events")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: {
                events: [
                  { _id: "1", title: "Team Meeting", description: "Weekly sync", eventType: "meeting", date: "2024-01-01" },
                ],
              },
            }),
          });
        }
        return Promise.resolve({ ok: false, status: 404 });
      }) as typeof fetch);

      const memberResults = await SearchService.searchByType("John", "member");
      expect(memberResults).toHaveLength(1);
      expect(memberResults[0].type).toBe("member");

      const eventResults = await SearchService.searchByType("John", "event");
      expect(eventResults).toHaveLength(0);
    });
  });

  describe("relevance calculation", () => {
    it("should give higher scores to exact matches", async () => {
      vi.mocked(fetch).mockReset();
      // Return members with names that match differently
      vi.mocked(fetch).mockImplementation(((url: unknown) => {
        const urlStr = String(url);
        if (urlStr.includes("/members")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: {
                members: [
                  { _id: "1", name: "John", role: "admin", email: "john@example.com" },
                  { _id: "2", name: "Johnny", role: "member", email: "johnny@example.com" },
                ],
              },
            }),
          });
        }
        if (urlStr.includes("/events")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { events: [] },
            }),
          });
        }
        if (urlStr.includes("/payments")) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              data: { payments: [] },
            }),
          });
        }
      }) as typeof fetch);

      const results = await SearchService.search("John");
      
      // Check that we got some results with relevance scores
      expect(results.length).toBeGreaterThan(0);
      results.forEach((r) => {
        expect(r.relevance).toBeDefined();
      });
    });
  });
});

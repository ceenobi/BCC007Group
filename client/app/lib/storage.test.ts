import { describe, it, expect, beforeEach, vi } from "vitest";
import { safeGetItem, safeSetItem } from "./storage";

describe("Storage Utilities", () => {
  beforeEach(() => {
    // Clear localStorage before each test
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it("should set and get an item correctly in the browser", () => {
    safeSetItem("test-key", "test-value");
    const value = safeGetItem("test-key");
    expect(value).toBe("test-value");
  });

  it("should return null for non-existent keys", () => {
    const value = safeGetItem("non-existent");
    expect(value).toBeNull();
  });

  it("should handle JSON objects correctly", () => {
    const data = { id: 1, name: "Test" };
    safeSetItem("user", JSON.stringify(data));
    const value = safeGetItem("user");
    expect(JSON.parse(value!)).toEqual(data);
  });

  it("should not throw error if localStorage is not available (SSR mock)", () => {
    // Simulate non-browser environment by temporarily shadowing window.localStorage
    const originalLocalStorage = window.localStorage;
    // @ts-ignore
    delete window.localStorage;

    expect(() => safeSetItem("key", "value")).not.toThrow();
    expect(safeGetItem("key")).toBeNull();

    // Restore
    // @ts-ignore
    window.localStorage = originalLocalStorage;
  });
});

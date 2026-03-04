import { describe, it, expect, vi, beforeEach } from "vitest";
import tryCatchFn from "./tryCatchFn";
import * as tsRestResponse from "./tsRestResponse";
import { APIError } from "better-auth/api";

// Mock dependencies
vi.mock("~/config/logger", () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("./tsRestResponse", () => ({
  createTsRestError: vi.fn((status, message) => ({
    status,
    body: { success: false, message, details: [] },
  })),
}));

describe("tryCatchFn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return the result of the function if it succeeds", async () => {
    const mockFn = vi.fn().mockResolvedValue("success");
    const wrappedFn = tryCatchFn(mockFn);

    const result = await wrappedFn();

    expect(result).toBe("success");
    expect(mockFn).toHaveBeenCalled();
  });

  it("should handle generic errors and return a 400 error response", async () => {
    const error = new Error("Something went wrong");
    const mockFn = vi.fn().mockRejectedValue(error);
    const wrappedFn = tryCatchFn(mockFn);

    const result = await wrappedFn();

    expect(tsRestResponse.createTsRestError).toHaveBeenCalledWith(
      400,
      "Something went wrong",
      [],
    );
    expect(result.status).toBe(400);
  });

  it("should handle APIError from better-auth", async () => {
    // @ts-ignore
    const apiError = new APIError(401, { message: "Unauthorized" });
    const mockFn = vi.fn().mockRejectedValue(apiError);
    const wrappedFn = tryCatchFn(mockFn);

    const result = await wrappedFn();

    expect(tsRestResponse.createTsRestError).toHaveBeenCalledWith(
      401,
      "Unauthorized",
      [],
    );
    expect(result.status).toBe(401);
  });

  it("should handle 429 Rate Limit errors", async () => {
    const rateLimitError = { response: { status: 429 } };
    const mockFn = vi.fn().mockRejectedValue(rateLimitError);
    const wrappedFn = tryCatchFn(mockFn);

    const result = await wrappedFn();

    expect(tsRestResponse.createTsRestError).toHaveBeenCalledWith(
      429,
      "Rate limit reached. Please try again in a few minutes.",
      [],
    );
    expect(result.status).toBe(429);
  });
});

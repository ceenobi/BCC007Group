import { APIError } from "better-auth/api";
import logger from "../config/logger.js";
import { createTsRestError } from "./tsRestResponse.js";

const tryCatchFn = <T extends (...args: any[]) => any>(fn: T): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error: any) {
      logger.error("tryCatchFn caught error:", error);
      if (error instanceof APIError) {
        return createTsRestError(
          Number(error?.status) || 400,
          error?.body?.message || error?.message || "Request failed",
          []
        );
      }
      if (error.response?.status === 429) {
        logger.warn("Rate limit hit (429)");
        return createTsRestError(
          429,
          "Rate limit reached. Please try again in a few minutes.",
          []
        );
      }
      const errorMessage =
        error?.body?.message || error?.message || "Request failed";
      logger.error("Error response with message:", errorMessage);
      return createTsRestError(Number(error?.status) || 400, errorMessage, []);
    }
  }) as T;
};

export default tryCatchFn;

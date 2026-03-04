import { Request, Response, NextFunction } from "express";
import getRedisClient from "~/config/redis.config";
import logger from "~/config/logger";

/**
 * Cache middleware options
 */
interface CacheOptions {
  /** Time to live in seconds (default: 300 = 5 minutes) */
  ttl?: number;
  /** Custom cache key generator function */
  keyGenerator?: (req: Request<any, any, any, any>) => string;
  /** Whether to cache only successful responses (2xx status codes) */
  onlySuccess?: boolean;
}

/**
 * Default cache key generator
 * Generates a unique key based on the request URL and query parameters
 */
const defaultKeyGenerator = (req: Request<any, any, any, any>): string => {
  const baseUrl = req.originalUrl || req.url;
  return `cache:${baseUrl}`;
};

/**
 * Cache middleware factory
 * Creates a middleware that caches responses in Redis
 *
 * @param options - Cache configuration options
 * @returns Express middleware function
 *
 * @example
 * // Cache for 5 minutes (default)
 * app.get('/api/users', cacheMiddleware(), getUsersHandler);
 *
 * @example
 * // Cache for 1 hour
 * app.get('/api/products', cacheMiddleware({ ttl: 3600 }), getProductsHandler);
 *
 * @example
 * // Custom cache key
 * app.get('/api/user/:id', cacheMiddleware({
 *   keyGenerator: (req) => `user:${req.params.id}`
 * }), getUserHandler);
 */
export const cacheMiddleware = (options: CacheOptions = {}) => {
  const {
    ttl = 300, // Default: 5 minutes
    keyGenerator = defaultKeyGenerator,
    onlySuccess = true,
  } = options;

  return async (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction,
  ) => {
    // Get Redis client
    const redis = getRedisClient();

    // If Redis is not available, skip caching
    if (!redis) {
      return next();
    }

    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    try {
      // Generate cache key
      const cacheKey = keyGenerator(req);

      // Try to get cached response
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        logger.debug(`✅ Cache HIT: ${cacheKey}`);

        // Parse cached data - Upstash client might return an object already
        const cached =
          typeof cachedData === "string" ? JSON.parse(cachedData) : cachedData;

        // Set cached headers
        res.set("X-Cache", "HIT");
        res.set("X-Cache-Key", cacheKey);

        // Send cached response
        return res.status(cached.status).json(cached.body);
      }

      logger.debug(`❌ Cache MISS: ${cacheKey}`);

      // Set cache miss header
      res.set("X-Cache", "MISS");
      res.set("X-Cache-Key", cacheKey);

      // Store original json method
      const originalJson = res.json.bind(res);

      // Override json method to cache the response
      res.json = function (body: any) {
        // Only cache if status code is 2xx (or if onlySuccess is false)
        const shouldCache =
          !onlySuccess || (res.statusCode >= 200 && res.statusCode < 300);

        if (shouldCache) {
          // Cache the response asynchronously (don't wait for it)
          const cacheData = JSON.stringify({
            status: res.statusCode,
            body,
          });

          redis
            .setex(cacheKey, ttl, cacheData)
            .then(() => {
              logger.debug(`💾 Cached response: ${cacheKey} (TTL: ${ttl}s)`);
            })
            .catch((error) => {
              logger.error(
                `Failed to cache response for ${cacheKey}:`,
                error instanceof Error ? error.message : String(error),
              );
            });
        }

        // Call original json method
        return originalJson(body);
      };

      next();
    } catch (error) {
      // Log error but don't break the request
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Cache middleware error: ${message}`, { error });
      next();
    }
  };
};

/**
 * Invalidate cache by key pattern
 * Deletes all keys matching the given pattern
 *
 * @param pattern - Redis key pattern (e.g., "cache:user:*")
 * @returns Number of keys deleted
 *
 * @example
 * // Invalidate all user caches
 * await invalidateCache("cache:/api/users*");
 *
 * @example
 * // Invalidate specific user cache
 * await invalidateCache("cache:/api/user/123");
 */
export const invalidateCache = async (pattern: string): Promise<number> => {
  const redis = getRedisClient();

  if (!redis) {
    logger.warn("Redis not available, cannot invalidate cache");
    return 0;
  }

  try {
    // If pattern is an exact key, delete it directly
    if (!pattern.includes("*")) {
      await redis.del(pattern);
      logger.info(`🗑️  Invalidated cache: ${pattern}`);
      return 1;
    }

    let cursor: string | number = 0;
    let deletedCount = 0;

    do {
      const response = (await redis.scan(cursor, {
        match: pattern,
        count: 100,
      })) as [number | string, string[]];

      const newCursor = response[0];
      const keys = response[1];

      if (keys && keys.length > 0) {
        // Delete batch of keys
        await redis.del(...keys);
        deletedCount += keys.length;
      }

      // Update cursor for next iteration
      cursor = newCursor;
    } while (cursor !== 0 && cursor !== "0");

    if (deletedCount === 0) {
      logger.debug(`No cache keys found matching pattern: ${pattern}`);
      return 0;
    }

    logger.info(
      `🗑️  Invalidated ${deletedCount} cache keys matching: ${pattern}`,
    );

    return deletedCount;
  } catch (error) {
    logger.error(
      "Failed to invalidate cache:",
      error instanceof Error ? error.message : String(error),
    );
    return 0;
  }
};

/**
 * Clear all cache entries
 * WARNING: This will delete ALL keys in the Redis database
 *
 * @returns True if successful, false otherwise
 */
export const clearAllCache = async (): Promise<boolean> => {
  const redis = getRedisClient();

  if (!redis) {
    logger.warn("Redis not available, cannot clear cache");
    return false;
  }

  try {
    await redis.flushdb();
    logger.info("🗑️  Cleared all cache entries");
    return true;
  } catch (error) {
    logger.error(
      "Failed to clear cache:",
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
};

import { rateLimit, ipKeyGenerator } from "express-rate-limit";

// General API rate limiter
export const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later",
  keyGenerator: (req) => {
    return `${ipKeyGenerator(req.ip as string)}-${
      req.headers["user-agent"] || "unknown-user-agent"
    }`;
  },
});

// Stricter limiter for sensitive routes (Auth, Payments)
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs for sensitive actions
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many attempts from this IP, please try again after 15 minutes",
  keyGenerator: (req) => {
    return `${ipKeyGenerator(req.ip as string)}-${
      req.headers["user-agent"] || "unknown-user-agent"
    }`;
  },
});

export const customRateLimiter = (max: number, windowMinutes: number = 3) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: max,
    message: "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
      return `${ipKeyGenerator(req.ip as string)}-${
        req.headers["user-agent"] || "unknown-user-agent"
      }`;
    },
  });

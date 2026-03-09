import { CompressionOptions } from "compression";
import { env } from "../config/keys.js";

export const compressionOptions: CompressionOptions = {
  // Level of compression (0-9, where 9 is maximum compression)
  level: 9, // High compression level for text-based responses

  // Filter function to decide which responses to compress
  filter: (req, res) => {
    // Don't compress responses with this header
    if (req.headers["x-no-compression"]) {
      return false;
    }

    // Only compress responses with these content types
    const type = res.getHeader("Content-Type") as string;
    const shouldCompress = ![
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/octet-stream",
      "application/pdf",
      "application/zip",
      "application/x-gzip",
      "text/event-stream",
    ].some((t) => type?.startsWith(t));

    return shouldCompress;
  },

  // Chunk size for compression (default: 16KB)
  chunkSize: 16384,

  // Threshold (in bytes) for response body size before compression is considered
  // Responses smaller than this will not be compressed
  threshold: 1024, // 1KB
};

export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // Removed 'unsafe-inline' and 'unsafe-eval' for security
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "https://res.cloudinary.com"], // Specific to Cloudinary
      connectSrc: [
        "'self'",
        "https:",
        env.serverUrl || "http://localhost:4600",
        "https://api.paystack.co",
        "https://res.cloudinary.com",
      ],
      fontSrc: ["'self'", "https:", "data:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: env.nodeEnv === "production" ? [] : null,
    },
  },
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: env.nodeEnv === "production",
  },
  frameguard: {
    action: "deny" as const,
  },
  xssFilter: true,
  noSniff: true,
  dnsPrefetchControl: {
    allow: false,
  },
  referrerPolicy: {
    policy: "strict-origin-when-cross-origin" as const,
  },
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: { policy: "same-origin" as const },
  crossOriginResourcePolicy: { policy: "same-site" as const },
  hidePoweredBy: true,
  ieNoOpen: true,
};

export const generateRandomNumber = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "M";
  const timePart = Date.now().toString(36).slice(-2).toUpperCase();
  result += timePart;
  for (let i = 0; i < 3; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
export const generateMemberId = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "BCC";
  const timePart = Date.now().toString(36).slice(-2).toUpperCase();
  result += timePart;
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateTicketId = () => {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString()
    .slice(-3);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(3, "0");
  return `TK-${timestamp}-${random}`;
};

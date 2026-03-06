import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createExpressEndpoints } from "@ts-rest/express";
import { env } from "./config/keys";
import { errorHandler, notFound } from "./middleware/error.middleware";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./config/better-auth";
import { gracefulShutdown } from "./config/db.server";
import logger from "./config/logger";
import { limiter } from "./middleware/rateLimit.middleware";
import { compressionOptions, helmetOptions } from "./lib/options";
//routes and contracts
import { authRouter } from "./routes/auth.routes";
import { uploadRouter } from "./routes/upload.routes";
import { authContract } from "./contract/auth.contract";
import { uploadContract } from "./contract/upload.contract";
import { paystackRouter } from "./routes/paystack.routes";
import { paystackContract } from "./contract/paystack.contract";
import { bankDetailRouter } from "./routes/bankDetail.routes";
import { bankDetailContract } from "./contract/bankDetail.contract";
import { memberContract } from "./contract/member.contract";
import { memberRouter } from "./routes/member.routes";
import { eventRouter } from "./routes/event.routes";
import { eventContract } from "./contract/event.contract";
import { ticketRouter } from "./routes/ticket.routes";
import { ticketContract } from "./contract/ticket.contract";
import { paymentRouter } from "./routes/payment.routes";
import { paymentContract } from "./contract/payment.contract";
import { dashboardRouter } from "./routes/dashboard.routes";
import { dashboardContract } from "./contract/dashboard.contract";

//workflows
import workflowRouter from "./routes/workflow.routes";
import sseRouter from "./routes/sse.routes";

declare global {
  namespace Express {
    interface Request {
      requestTime?: string;
      rawBody?: Buffer;
    }
  }
}

const app = express();
// Trust first proxy (for production/ngrok)
app.set("trust proxy", 1);

const allowedOrigins = [env.clientUrl, env.serverUrl].filter(
  Boolean,
) as string[];

// // Add production URL if not already included
if (env.nodeEnv === "production") {
  if (!env.clientUrl || !env.serverUrl) {
    logger.warn("CORS: clientUrl or serverUrl not defined in production!");
  }
}

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // In development, allow all for easier testing, but still prefer defined origins
    if (env.nodeEnv === "development") return callback(null, true);

    // Strict origin matching for production
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Reject requests from other origins
    logger.error(`Blocked by CORS: ${origin}`);
    callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

// Middlewares
app.use(cors(corsOptions));
app.use(limiter);
app.use(compression(compressionOptions));
app.use(cookieParser());
app.use(helmet(helmetOptions));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(express.static("public"));
app.disable("x-powered-by");

import { strictLimiter } from "./middleware/rateLimit.middleware";
app.all("/api/auth/*splat", strictLimiter, toNodeHandler(auth));
app.use(
  express.json({
    limit: "25mb",
    verify: (req: any, res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use((req, res, next) => {
  // Allow credentials
  res.header("Access-Control-Allow-Credentials", "true");
  // Handle preflight
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PATCH, DELETE, OPTIONS",
    );
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.status(204).end();
  }
  next();
});
// Logging middleware in development
if (env.nodeEnv === "development") {
  app.use(morgan("dev"));
}

// Request time middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  req.requestTime = new Date().toISOString();
  next();
});

createExpressEndpoints(authContract, authRouter, app, {
  jsonQuery: true,
  responseValidation: true,
});

// Upstash Workflow
app.use("/api/v1/workflows", workflowRouter);

// SSE
app.use("/api/v1/sse", sseRouter);

// Apply strict limiter to sensitive v1 routes
app.use("/api/v1/auth", strictLimiter);
app.use("/api/v1/payments", strictLimiter);
app.use("/api/v1/paystack", strictLimiter);
app.use("/api/v1/bank-details", strictLimiter);

createExpressEndpoints(uploadContract, uploadRouter, app, {
  jsonQuery: true,
  responseValidation: true,
});
createExpressEndpoints(paystackContract, paystackRouter, app, {
  jsonQuery: true,
  responseValidation: true,
});
createExpressEndpoints(bankDetailContract, bankDetailRouter, app, {
  jsonQuery: true,
  responseValidation: true,
});
createExpressEndpoints(memberContract, memberRouter, app, {
  jsonQuery: true,
  responseValidation: true,
});
createExpressEndpoints(eventContract, eventRouter, app, {
  jsonQuery: true,
  responseValidation: true,
});
createExpressEndpoints(ticketContract, ticketRouter, app, {
  jsonQuery: true,
  responseValidation: true,
});
createExpressEndpoints(paymentContract, paymentRouter, app, {
  jsonQuery: true,
  responseValidation: true,
});
createExpressEndpoints(dashboardContract, dashboardRouter, app, {
  jsonQuery: true,
  responseValidation: true,
});

// Handle 404
app.use(notFound);
// Global error handler (adapted for ts-rest)
app.use(errorHandler);

// Server configuration
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4600;

// Start the server
const startServer = async (): Promise<void> => {
  try {
    const server = app.listen(PORT, "0.0.0.0", () => {
      logger.info(`\n✅ Server running in ${env.nodeEnv} mode on port ${PORT}`);
      logger.info(`🌐 http://localhost:${PORT}\n`);
    });
    // Handle unhandled promise rejections
    process.on("unhandledRejection", (reason: unknown) => {
      console.error("\n❌ UNHANDLED REJECTION! Shutting down...");

      const error =
        reason instanceof Error
          ? `${reason.name}: ${reason.message}`
          : String(reason);

      logger.error("Reason:", error);

      // Close server gracefully
      server.close(() => {
        logger.info("💥 Process terminated due to unhandled rejection");
        process.exit(1);
      });
    });

    // Handle termination signals
    process.on("SIGTERM", gracefulShutdown);
    process.on("SIGINT", gracefulShutdown);

    // Handle any other errors
    server.on("error", (error: NodeJS.ErrnoException) => {
      if (error.syscall !== "listen") throw error;

      switch (error.code) {
        case "EACCES":
          logger.error(`Port ${PORT} requires elevated privileges`);
          process.exit(1);
        case "EADDRINUSE":
          logger.error(`Port ${PORT} is already in use`);
          process.exit(1);
        default:
          throw error;
      }
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error(`\n❌ Failed to start server: ${errorMessage}`);
    process.exit(1);
  }
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;

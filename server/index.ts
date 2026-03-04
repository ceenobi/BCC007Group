import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { createExpressEndpoints } from "@ts-rest/express";
import { env } from "./src/config/keys";
import { errorHandler, notFound } from "./src/middleware/error.middleware";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./src/config/better-auth";
import { gracefulShutdown } from "./src/config/db.server";
import logger from "./src/config/logger";
import { limiter } from "./src/middleware/rateLimit.middleware";
import { compressionOptions, helmetOptions } from "./src/lib/options";
//routes and contracts
import { authRouter } from "./src/routes/auth.routes";
import { uploadRouter } from "./src/routes/upload.routes";
import { authContract } from "./src/contract/auth.contract";
import { uploadContract } from "./src/contract/upload.contract";
import { paystackRouter } from "./src/routes/paystack.routes";
import { paystackContract } from "./src/contract/paystack.contract";
import { bankDetailRouter } from "./src/routes/bankDetail.routes";
import { bankDetailContract } from "./src/contract/bankDetail.contract";
import { memberContract } from "./src/contract/member.contract";
import { memberRouter } from "./src/routes/member.routes";
import { eventRouter } from "./src/routes/event.routes";
import { eventContract } from "./src/contract/event.contract";
import { ticketRouter } from "./src/routes/ticket.routes";
import { ticketContract } from "./src/contract/ticket.contract";
import { paymentRouter } from "./src/routes/payment.routes";
import { paymentContract } from "./src/contract/payment.contract";
import { dashboardRouter } from "./src/routes/dashboard.routes";
import { dashboardContract } from "./src/contract/dashboard.contract";

//workflows
import workflowRouter from "./src/routes/workflow.routes";
import sseRouter from "./src/routes/sse.routes";

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

import { strictLimiter } from "./src/middleware/rateLimit.middleware";
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
startServer();

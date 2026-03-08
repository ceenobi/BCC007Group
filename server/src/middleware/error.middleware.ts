import { Request, Response, NextFunction } from "express";
import logger from "../config/logger.js";
import { createTsRestError } from "../lib/tsRestResponse.js";
import { env } from "../config/keys.js";

class ErrorResponse extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;

    // Maintain proper stack trace (only available in V8)
    Error.captureStackTrace(this, this.constructor);
  }
}


// Error handler middleware for non-ts-rest routes
export const errorHandler = (
  err: Error | ErrorResponse,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err } as ErrorResponse;
  error.message = err.message;

  // Log to console/winston for all errors
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = new ErrorResponse(message, 404);
  }

  // Mongoose duplicate key
  if ((err as any).code === 11000) {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values((err as any).errors).map(
      (val: any) => val.message
    );
    error = new ErrorResponse(message.join(", "), 400);
  }

  // Set default status code if not set
  const statusCode = (error as ErrorResponse).statusCode || 500;

  // Unified error response
  const response = {
    success: false,
    message: error.message || "Server Error",
    ...(env.nodeEnv === "development" && { stack: err.stack }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  };

  res.status(statusCode).json(response);
};

// 404 Not Found handler
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const tsRestError = createTsRestError(
    404,
    `Cannot find route - ${req.originalUrl} on this server. Please check the URL and try again.`,
    []
  );
  res.status(404).json(tsRestError.body);
};

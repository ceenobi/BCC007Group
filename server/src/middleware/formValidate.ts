import { ZodError } from "zod";
import { NextFunction, Request, Response } from "express";
import logger from "@/config/logger.js";

export const validateFormData =
  (schema: any) =>
  (req: Request<any, any, any, any>, res: Response, next: NextFunction) => {
    try {
      const parsedData = schema.parse(req.body);
      req.body = parsedData;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        logger.error("Validation failed:", errorMessages);
        return res.status(400).json({
          error: "Validation failed",
          details: errorMessages,
        });
      }
      next(error);
    }
  };

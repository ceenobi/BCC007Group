import { Request, Response, NextFunction } from "express";
import { createTsRestError } from "@/lib/tsRestResponse.js";
import { auth, User } from "@/config/better-auth.js";
import { fromNodeHeaders } from "better-auth/node";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        name: string;
        email: string;
        emailVerified?: boolean;
        image?: string | null;
        imageId?: string | null;
        isOnboarded?: boolean;
      };
    }
  }
}

export interface SessionPayload {
  id: string;
  role: string;
  name: string;
  email: string;
  emailVerified?: boolean;
  image?: string | null;
  imageId?: string | null;
  isOnboarded?: boolean;
}

export interface AuthMiddlewareRequest extends Request<any, any, any, any> {
  user: User;
}
// Protect routes
export const verifyUser = async (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session?.user) {
    const error = createTsRestError(401, "Access denied, not authenticated");
    return res.status(401).json(error.body);
  }
  (req as AuthMiddlewareRequest).user = session.user as User;
  res.locals.user = session.user as User;
  next();
};

export const verifyVerifiedUser = async (
  req: Request<any, any, any, any>,
  res: Response,
  next: NextFunction,
) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });
  if (!session?.user) {
    const error = createTsRestError(401, "Access denied, not authenticated");
    return res.status(401).json(error.body);
  }
  if (!session.user.emailVerified) {
    const error = createTsRestError(403, "Access denied. Email not verified.");
    return res.status(403).json(error.body);
  }
  (req as AuthMiddlewareRequest).user = session.user as User;
  res.locals.user = session.user as User;
  next();
};

export const authorizedRoles = (...roles: string[]) => {
  return (
    req: Request<any, any, any, any>,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user?.role || !roles.includes(req.user.role)) {
      const error = createTsRestError(
        403,
        "Access denied. Insufficient permissions.",
      );
      return res.status(403).json(error.body);
    }
    next();
  };
};

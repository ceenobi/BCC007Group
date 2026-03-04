import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Auth Middleware", () => {
  let verifyUser: any;
  let verifyVerifiedUser: any;
  let authorizedRoles: any;
  let auth: any;
  const mockGetSession = vi.fn();

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    vi.doMock("../config/keys", () => ({
      env: {
        databaseUrl: "mongodb://localhost:27017/test",
        nodeEnv: "test",
        resendApiKey: "test_resend_api_key",
        betterAuthSecret: "test_better_auth_secret",
        betterAuthUrl: "http://localhost:3000",
      },
    }));

    vi.doMock("../config/db.server", () => ({
      connectToDB: vi.fn().mockResolvedValue(undefined),
      gracefulShutdown: vi.fn().mockResolvedValue(undefined),
      withMongo: vi.fn((fn) => fn()),
    }));

    vi.doMock("mongoose", () => ({
      default: {
        connect: vi.fn(),
        connection: {
          db: {},
          getClient: vi.fn(),
          on: vi.fn(),
          readyState: 1,
          close: vi.fn(),
        },
      },
      connect: vi.fn(),
    }));

    vi.doMock("../config/better-auth", () => ({
      auth: {
        api: {
          getSession: mockGetSession,
        },
      },
    }));

    vi.doMock("better-auth/node", () => ({
      fromNodeHeaders: vi.fn(() => ({})),
    }));

    vi.doMock("../lib/tsRestResponse", () => ({
      createTsRestError: vi.fn((status, message) => ({
        status,
        body: { success: false, message },
      })),
    }));

    // Dynamically import the middleware and auth after mocks are set
    const middlewareModule = await import("./auth.middleware");
    verifyUser = middlewareModule.verifyUser;
    verifyVerifiedUser = middlewareModule.verifyVerifiedUser;
    authorizedRoles = middlewareModule.authorizedRoles;

    const authModule = await import("../config/better-auth");
    auth = authModule.auth;
  });

  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = { headers: {}, user: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      locals: {},
    };
    next = vi.fn();
  });

  describe("verifyUser", () => {
    it("should call next() if session is valid", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "1", role: "member" },
      });

      await verifyUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.locals.user).toBeDefined();
    });

    it("should return 401 if session is invalid", async () => {
      mockGetSession.mockResolvedValue(null);

      await verifyUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("verifyVerifiedUser", () => {
    it("should call next() if user is email verified", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "1", emailVerified: true },
      });

      await verifyVerifiedUser(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should return 403 if user is not email verified", async () => {
      mockGetSession.mockResolvedValue({
        user: { id: "1", emailVerified: false },
      });

      await verifyVerifiedUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe("authorizedRoles", () => {
    it("should call next() if user has one of the allowed roles", () => {
      req.user = {
        id: "1",
        role: "admin",
        name: "Admin",
        email: "admin@test.com",
      };
      const middleware = authorizedRoles("admin", "super_admin");

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it("should return 403 if user does not have the allowed role", () => {
      req.user = {
        id: "1",
        role: "member",
        name: "Member",
        email: "member@test.com",
      };
      const middleware = authorizedRoles("admin");

      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });
});

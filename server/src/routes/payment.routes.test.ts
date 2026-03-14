import { describe, it, expect, vi, beforeEach } from "vitest";
import express, { Request, Response, NextFunction } from "express";
import request from "supertest";
import { createExpressEndpoints } from "@ts-rest/express";

describe("Payment Routes", () => {
  let app: express.Express;
  let mockPaymentModel: any;
  let mockUserModel: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockPaymentModel = {
      find: vi.fn().mockReturnThis(),
      populate: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      lean: vi.fn(),
      countDocuments: vi.fn(),
      aggregate: vi.fn(),
      findOne: vi.fn().mockReturnThis(),
    };

    mockUserModel = {
      find: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      lean: vi.fn(),
    };

    vi.doMock("../models/payment", () => ({
      default: mockPaymentModel,
    }));

    vi.doMock("../models/user", () => ({
      default: mockUserModel,
    }));

    // Mock middleware
    vi.doMock("../middleware/auth.middleware", () => ({
      verifyUser: vi.fn((req, res, next) => {
        req.user = { id: "user-123", role: "member" };
        next();
      }),
      authorizedRoles: vi.fn(
        () => (req: Request, res: Response, next: NextFunction) => next(),
      ),
    }));

    vi.doMock("../middleware/cache.middleware", () => ({
      cacheMiddleware: vi.fn(
        () => (req: Request, res: Response, next: NextFunction) => next(),
      ),
      invalidateCache: vi.fn(),
    }));

    vi.doMock("../workflows/client", () => ({
      workflowClient: {
        trigger: vi.fn().mockResolvedValue({}),
      },
    }));

    vi.doMock("../config/db.server", () => ({
      connectMongoDb: vi.fn((op) => op()),
    }));

    const { getPaymentRouter } = await import("./payment.routes");
    const { paymentContract } = await import("../contract/payment.contract");

    app = express();
    app.use(express.json());

    createExpressEndpoints(paymentContract, getPaymentRouter(), app, {
      jsonQuery: true,
      responseValidation: true,
    });
  });

  describe("GET /api/v1/payments/user", () => {
    it("should list payments for the current user", async () => {
      const mockPayments = [
        {
          _id: "p1",
          userId: "user-123",
          amount: 2000,
          paymentType: "membership_dues",
          paymentStatus: "completed",
          reference: "ref1",
          isRecurring: false,
        },
      ];
      mockPaymentModel.lean.mockResolvedValue(mockPayments);
      mockPaymentModel.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get("/api/v1/payments/user")
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.payments).toHaveLength(1);
      expect(mockPaymentModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ userId: "user-123" }),
      );
    });
  });

  describe("GET /api/v1/payments/group", () => {
    it("should list group payments (admin level)", async () => {
      const mockPayments = [
        {
          _id: "p1",
          userId: "user-123",
          amount: 2000,
          paymentType: "membership_dues",
          paymentStatus: "completed",
          reference: "ref1",
          isRecurring: false,
        },
      ];
      mockPaymentModel.lean.mockResolvedValue(mockPayments);
      mockPaymentModel.countDocuments.mockResolvedValue(1);

      const response = await request(app)
        .get("/api/v1/payments/group")
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPaymentModel.find).toHaveBeenCalledWith({});
    });
  });

  describe("GET /api/v1/payments/reports", () => {
    it("should return payment reports with aggregations", async () => {
      const mockAggregateResult = [
        {
          statsTotals: [{ totalRevenue: 10000, totalCount: 5 }],
          statsCompleted: [{ completedRevenue: 8000, completedCount: 4 }],
          statsPending: [{ pendingRevenue: 2000, pendingCount: 1 }],
          typeBreakdown: [{ _id: "donation", revenue: 10000, count: 5 }],
          trends: [{ date: "2026-03", revenue: 10000, count: 5 }],
        },
      ];

      mockPaymentModel.aggregate.mockResolvedValue(mockAggregateResult);
      mockPaymentModel.findOne.mockReturnValue({
        lean: () => Promise.resolve({ createdAt: new Date() }),
      });

      const response = await request(app)
        .get("/api/v1/payments/reports")
        .query({ period: "all" });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stats.totalRevenue).toBe(10000);
    });
  });
});

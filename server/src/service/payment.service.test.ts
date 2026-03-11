import { describe, it, expect, vi, beforeEach } from "vitest";

describe("PaymentService", () => {
  let paymentService: any;
  let mockPaystack: any;
  let mockPaymentModel: any;
  let mockUserModel: any;
  let mockWorkflowClient: any;
  let mockInvalidateCache: any;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();

    mockPaystack = {
      post: vi.fn(),
      get: vi.fn(),
    };

    mockPaymentModel = {
      findOne: vi.fn(),
      findOneAndUpdate: vi.fn(),
      updateMany: vi.fn(),
      aggregate: vi.fn(),
      countDocuments: vi.fn(),
    };

    mockUserModel = {
      findById: vi.fn().mockReturnValue({
        lean: vi.fn().mockResolvedValue({ id: "user-123", email: "test@example.com", name: "Test User" }),
      }),
    };

    mockWorkflowClient = {
      trigger: vi.fn().mockResolvedValue({ workflowRunId: "test-run-id" }),
    };

    mockInvalidateCache = vi.fn();

    vi.doMock("../config/paystack", () => ({
      paystack: mockPaystack,
      getPaystack: () => mockPaystack,
    }));

    vi.doMock("../models/payment", () => ({
      default: mockPaymentModel,
    }));

    vi.doMock("../models/user", () => ({
      default: mockUserModel,
    }));

    vi.doMock("../workflows/client", () => ({
      workflowClient: mockWorkflowClient,
    }));

    vi.doMock("../middleware/cache.middleware", () => ({
      invalidateCache: mockInvalidateCache,
    }));

    // For recursive models, we might need to mock them multiple times
    vi.doMock("../config/keys", () => ({
      env: {
        paystackSecretKey: "test_secret_key",
        clientUrl: "http://localhost:3000",
        serverUrl: "http://localhost:4600",
        databaseUrl: "mongodb://localhost:27017/test",
      },
    }));

    vi.doMock("../config/db.server", () => ({
      connectMongoDb: vi.fn((op) => op()),
      connectToDB: vi.fn(),
      gracefulShutdown: vi.fn(),
    }));

    const module = await import("./payment.service");
    paymentService = module.paymentService;
  });

  const mockUser = {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
  };

  describe("initializePayment", () => {
    it("should initialize a one-time payment successfully", async () => {
      const data = {
        amount: 5000,
        paymentType: "donation",
        note: "Test donation",
      };

      mockPaystack.post.mockResolvedValue({
        data: {
          status: true,
          data: {
            authorization_url: "http://getPaystack().com/auth",
            reference: "ref1",
          },
        },
      });

      const result = await paymentService.initializePayment(
        data,
        mockUser as any,
      );

      expect(mockPaystack.post).toHaveBeenCalledWith(
        "/transaction/initialize",
        expect.objectContaining({
          email: mockUser.email,
          amount: 500000,
          metadata: expect.objectContaining({
            userId: mockUser.id,
            paymentType: "donation",
          }),
        }),
      );
      expect(result.status).toBe(true);
    });

    it("should throw error if amount is less than 2000 for non-dues", async () => {
      const data = { amount: 1000, paymentType: "donation" };
      await expect(
        paymentService.initializePayment(data as any, mockUser as any),
      ).rejects.toThrow("Minimum payment amount is 2000 Naira");
    });

    it("should block membership dues if already paid this month", async () => {
      mockPaymentModel.findOne.mockResolvedValue({ id: "existing-payment" });

      const data = { amount: 2000, paymentType: "membership_dues" };
      await expect(
        paymentService.initializePayment(data as any, mockUser as any),
      ).rejects.toThrow(
        "You have already paid your membership dues for this month.",
      );
    });
  });

  describe("verifyPayment", () => {
    it("should verify successfully and update database", async () => {
      const txData = {
        reference: "ref1",
        status: "success",
        amount: 500000,
        customer: { customer_code: "CUS_123" },
        metadata: { userId: mockUser.id, paymentType: "donation" },
      };

      mockPaystack.get.mockResolvedValue({
        data: { status: true, data: txData },
      });

      mockPaymentModel.findOneAndUpdate.mockResolvedValue({
        ...txData,
        amount: 5000,
      });
      mockUserModel.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockUser),
      });

      const result = await paymentService.verifyPayment(
        { reference: "ref1" },
        mockUser as any,
      );

      expect(mockPaymentModel.findOneAndUpdate).toHaveBeenCalledWith(
        { reference: "ref1" },
        expect.objectContaining({ paymentStatus: "completed", amount: 5000 }),
        expect.any(Object),
      );
      expect(mockWorkflowClient.trigger).toHaveBeenCalled();
      expect(mockInvalidateCache).toHaveBeenCalled();
      expect(result.status).toBe(true);
    });
  });

  describe("cancelSubscription", () => {
    it("should cancel subscription through Paystack API", async () => {
      mockPaystack.post.mockResolvedValue({ data: { status: true } });

      const result = await paymentService.cancelSubscription(
        mockUser as any,
        "SUB_123",
        "TOKEN_123",
      );

      expect(mockPaystack.post).toHaveBeenCalledWith("/subscription/disable", {
        code: "SUB_123",
        token: "TOKEN_123",
      });
      expect(mockPaymentModel.updateMany).toHaveBeenCalledWith(
        { paystackSubscriptionId: "SUB_123" },
        expect.objectContaining({
          $set: expect.objectContaining({ subscriptionStatus: "cancelled" }),
        }),
      );
      expect(result.status).toBe(true);
    });

    it("should fallback to fetching from Paystack if code/token are missing", async () => {
      // Mock transaction verify to get customer ID
      mockPaystack.get.mockImplementation((url: string) => {
        if (url.includes("/transaction/verify")) {
          return Promise.resolve({
            data: { data: { customer: { id: 789, customer_code: "CUS_123" } } },
          });
        }
        if (url.includes("/subscription")) {
          return Promise.resolve({
            data: {
              data: [
                {
                  status: "active",
                  subscription_code: "SUB_456",
                  email_token: "TOKEN_456",
                },
              ],
            },
          });
        }
        return Promise.reject("Not found");
      });

      mockPaystack.post.mockResolvedValue({ data: { status: true } });

      await paymentService.cancelSubscription(
        mockUser as any,
        "",
        "",
        "ref_missing",
      );

      expect(mockPaystack.get).toHaveBeenCalledWith(
        "/subscription",
        expect.objectContaining({ params: { customer: 789 } }),
      );
      expect(mockPaymentModel.updateMany).toHaveBeenNthCalledWith(
        1,
        { reference: "ref_missing" },
        expect.objectContaining({
          $set: expect.objectContaining({
            paystackSubscriptionId: "SUB_456",
            paystackEmailToken: "TOKEN_456",
          }),
        }),
      );
      expect(mockPaystack.post).toHaveBeenCalledWith("/subscription/disable", {
        code: "SUB_456",
        token: "TOKEN_456",
      });
      expect(mockPaymentModel.updateMany).toHaveBeenNthCalledWith(
        2,
        { paystackSubscriptionId: "SUB_456" },
        expect.objectContaining({
          $set: expect.objectContaining({ subscriptionStatus: "cancelled" }),
        }),
      );
    });
  });

  describe("handleWebhook", () => {
    it("should handle charge.success event", async () => {
      mockPaymentModel.findOneAndUpdate.mockResolvedValue({
        userId: mockUser.id,
      });
      mockUserModel.findById.mockReturnValue({
        lean: vi.fn().mockResolvedValue(mockUser),
      });

      const event = {
        event: "charge.success",
        data: {
          reference: "ref_webhook",
          amount: 200000,
          customer: { customer_code: "CUS_123" },
        },
      };

      await paymentService.handleWebhook(event);

      expect(mockPaymentModel.findOneAndUpdate).toHaveBeenCalledWith(
        { reference: "ref_webhook" },
        expect.objectContaining({ paymentStatus: "completed" }),
        expect.any(Object),
      );
      expect(mockWorkflowClient.trigger).toHaveBeenCalled();
    });

    it("should handle subscription.create event", async () => {
      const event = {
        event: "subscription.create",
        data: {
          subscription_code: "SUB_NEW",
          email_token: "TOKEN_NEW",
          customer: { customer_code: "CUS_123" },
          next_payment_date: "2026-04-01T00:00:00Z",
        },
      };

      await paymentService.handleWebhook(event);

      expect(mockPaymentModel.findOneAndUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          $or: expect.arrayContaining([
            { paystackSubscriptionId: "SUB_NEW" },
            expect.objectContaining({ paystackCustomerId: "CUS_123" }),
          ]),
        }),
        expect.objectContaining({
          $set: expect.objectContaining({ paystackSubscriptionId: "SUB_NEW" }),
        }),
        expect.objectContaining({ sort: { createdAt: -1 } }),
      );
    });
  });

  describe("verifyWebhookSignature", () => {
    it("should return true for valid signature", () => {
      const payload = "{}";
      const secret = "test_secret_key";
      const crypto = require("crypto");
      const signature = crypto
        .createHmac("sha512", secret)
        .update(payload)
        .digest("hex");

      const result = paymentService.verifyWebhookSignature(payload, signature);
      expect(result).toBe(true);
    });

    it("should return false for invalid signature", () => {
      const result = paymentService.verifyWebhookSignature("{}", "wrong_sig");
      expect(result).toBe(false);
    });
  });
});

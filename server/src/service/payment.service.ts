import crypto from "crypto";
import logger from "@/config/logger.js";
import { getPaystack } from "@/config/paystack.js";
import { type User as BetterAuthUser } from "@/config/better-auth.js";
import { env } from "@/config/keys.js";
import { workflowClient } from "@/workflows/client.js";
import User from "@/models/user.js";
import { invalidateCache } from "@/middleware/cache.middleware.js";

import { connectMongoDb } from "@/config/db.server.js";

export interface InitializePaymentData {
  amount: number;
  paymentType: "donation" | "event" | "membership_dues";
  isRecurring?: boolean;
  eventId?: string;
  note?: string;
}

export interface VerifyPaymentData {
  reference: string;
}

export interface PaystackSubscriptionResponse {
  status: boolean;
  message: string;
  data: {
    id: string;
    customer: string;
    plan: string;
    amount: number;
    status: string;
    next_payment_date?: string;
    created_at: string;
  };
}

export interface PaystackCreateResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    reference: string;
    access_code: string;
  };
}

// Paystack plan code
export const PAYSTACK_PLANS = {
  levy_plan: "PLN_m70z1675dnrdgeq",
};

export class PaymentService {
  /**
   * Initialize a payment (One-time or Subscription)
   */
  async initializePayment(
    data: InitializePaymentData,
    user: BetterAuthUser,
  ): Promise<PaystackCreateResponse> {
    try {
      // 1. Validation
      if (data.paymentType === "membership_dues") {
        const Payment = (await import("@/models/payment.js")).default;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );

        const existingPayment = await connectMongoDb(() => Payment.findOne({
          userId: user.id,
          paymentType: "membership_dues",
          paymentStatus: "completed",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        }));

        if (existingPayment) {
          throw new Error(
            "You have already paid your membership dues for this month.",
          );
        }

        data.amount = 2000; // Locked amount for membership
      } else if (data.amount < 2000) {
        throw new Error("Minimum payment amount is 2000 Naira");
      }

      const amountInKobo = data.amount * 100;
      const reference = `BCC-${crypto.randomBytes(4).toString("hex").toUpperCase()}-${Date.now()}`;

      // 2. Prepare Paystack request
      let response;
      if (data.paymentType === "membership_dues" && data.isRecurring) {
        // Handle Subscription
        const planCode = PAYSTACK_PLANS.levy_plan;
        response = await getPaystack().post("/transaction/initialize", {
          email: user.email,
          amount: amountInKobo,
          reference,
          plan: planCode,
          metadata: {
            userId: user.id,
            paymentType: data.paymentType,
            isRecurring: true,
            note: data.note,
            subscriptionStatus: "active",
          },
          callback_url: `${env.clientUrl}/payments/verify`,
        });
      } else {
        // Handle One-time payment
        response = await getPaystack().post("/transaction/initialize", {
          email: user.email,
          amount: amountInKobo,
          reference,
          metadata: {
            userId: user.id,
            paymentType: data.paymentType,
            eventId: data.eventId,
            isRecurring: false,
            note: data.note,
          },
          callback_url: `${env.clientUrl}/payments/verify`,
        });
      }

      return response.data;
    } catch (error: any) {
      logger.error(
        "Failed to initialize Paystack payment:",
        error.message || "Unknown error",
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to initialize payment",
      );
    }
  }

  /**
   * Verify a payment and update the database
   */
  async verifyPayment(data: VerifyPaymentData, user: BetterAuthUser): Promise<any> {
    try {
      const response = await getPaystack().get(
        `/transaction/verify/${data.reference}`,
      );

      if (response.data.status && response.data.data.status === "success") {
        const tx = response.data.data;
        const metadata = tx.metadata;

        const Payment = (await import("@/models/payment.js")).default;

        const paymentUpdate = {
          userId: metadata.userId,
          paymentType: metadata.paymentType,
          amount: tx.amount / 100,
          paymentStatus: "completed",
          reference: tx.reference,
          paystackCustomerId: tx.customer.customer_code,
          isRecurring: metadata.isRecurring || false,
          note: metadata.note,
          lastPaymentDate: new Date(),
          metadata: metadata,
          subscriptionStatus: metadata.isRecurring ? "active" : "",
        } as any;

        if (metadata.eventId) {
          paymentUpdate.event = metadata.eventId;
        }

        if (
          tx.plan_object &&
          tx.plan_object.plan_code === PAYSTACK_PLANS.levy_plan
        ) {
          paymentUpdate.subscriptionType = "levy_plan";
        }

        // Capture subscription details if available in transaction
        // Paystack nests subscription info under tx.subscription (object) for plan-based transactions
        const subscriptionCode =
          tx.subscription?.subscription_code || tx.subscription_code || null;
        const emailToken = tx.subscription?.email_token || null;

        if (subscriptionCode) {
          paymentUpdate.paystackSubscriptionId = subscriptionCode;
          if (emailToken) {
            paymentUpdate.paystackEmailToken = emailToken;
          }
          logger.info(
            `Captured subscription code: ${subscriptionCode} from verification`,
          );
        } else if (paymentUpdate.isRecurring) {
          logger.warn(
            `Recurring payment verified for ${tx.reference} but no subscription code found in verify response. Waiting for subscription.create webhook.`,
          );
        }

        const payment = await connectMongoDb(() => Payment.findOneAndUpdate(
          { reference: tx.reference },
          paymentUpdate,
          { upsert: true, returnDocument: "after" },
        ));
        //trigger payment confirmation workflow
        await this._triggerPaymentConfirmation(
          metadata.userId,
          tx.amount / 100,
          tx.reference,
        );
        await invalidateCache(`cache:payments:${user.id}`);
        return {
          status: true,
          message: "Payment verified and recorded",
          data: payment,
        };
      }

      throw new Error(
        `Payment verification failed: ${response.data.data.status}`,
      );
    } catch (error: any) {
      logger.error(
        "Failed to verify Paystack payment:",
        error.message || "Unknown error",
      );
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to verify payment",
      );
    }
  }

  /**
   * Cancel a subscription.
   * Falls back to fetching the subscription from Paystack when the
   * local record is missing code/token (legacy records from before the fix).
   */
  async cancelSubscription(
    user: BetterAuthUser,
    subscriptionCode: string,
    emailToken: string,
    reference?: string,
  ): Promise<any> {
    try {
      let code = subscriptionCode;
      let token = emailToken;

      // Fallback: if code or token are missing, fetch from Paystack
      if (!code || !token) {
        if (!reference) {
          throw new Error(
            "Cannot cancel subscription: missing subscription code/token and no payment reference to look up.",
          );
        }

        logger.warn(
          `cancelSubscription called with missing code/token for reference ${reference}. Fetching from Paystack...`,
        );

        // 1. Verify the transaction to get the customer code
        const txRes = await getPaystack().get(`/transaction/verify/${reference}`);
        const tx = txRes.data?.data;
        const customerCode = tx?.customer?.customer_code;
        const customerId = tx?.customer?.id;

        if (!customerId) {
          throw new Error("Could not determine customer ID from transaction");
        }

        // 2. List subscriptions for that customer using their numeric ID
        const subRes = await getPaystack().get(`/subscription`, {
          params: { customer: customerId },
        });

        const activeSub = (subRes.data?.data as any[])?.find(
          (s: any) => s.status === "active",
        );

        if (!activeSub) {
          logger.warn(
            `No active subscription found for customer ${customerCode}. Marking as cancelled locally to heal the state.`,
          );

          const Payment = (await import("@/models/payment.js")).default;
          await connectMongoDb(() => Payment.updateMany(
            { reference },
            { $set: { subscriptionStatus: "cancelled", isRecurring: false } },
          ));

          return {
            status: true,
            message:
              "Subscription successfully cancelled (no active remote subscription found)",
          };
        }

        code = activeSub.subscription_code;
        token = activeSub.email_token;

        // Save these back so future cancel attempts don't need the fallback
        const Payment = (await import("@/models/payment.js")).default;
        await connectMongoDb(() => Payment.updateMany(
          { reference },
          {
            $set: {
              paystackSubscriptionId: code,
              paystackEmailToken: token,
            },
          },
        ));
        logger.info(
          `Backfilled subscription code/token for reference ${reference}`,
        );
      }

      const response = await getPaystack().post("/subscription/disable", {
        code,
        token,
      });

      if (response.data && response.data.status === false) {
        throw new Error(
          response.data.message || "Paystack failed to cancel the subscription",
        );
      }

      // Mark as cancelled in DB
      const Payment = (await import("@/models/payment.js")).default;
      await connectMongoDb(() => Payment.updateMany(
        { paystackSubscriptionId: code },
        { $set: { subscriptionStatus: "cancelled", isRecurring: false } },
      ));
      await Promise.all([
        invalidateCache(`cache:payments:${user.id}`),
        invalidateCache(`cache:/api/v1/payments*`),
        invalidateCache(`cache:payment-reports*`),
      ]);
      return response.data;
    } catch (error: any) {
      logger.error(
        "Failed to cancel subscription:",
        error.message || "Unknown error",
      );
      throw new Error(
        error.response?.data?.message || "Failed to cancel subscription",
      );
    }
  }

  /**
   * Verify Paystack webhook signature
   */
  verifyWebhookSignature(payload: string | Buffer, signature: string): boolean {
    const secret = env.paystackSecretKey;
    if (!secret) {
      throw new Error("Paystack secret key not configured");
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(payload)
      .digest("hex");

    return hash === signature;
  }

  /**
   * Handle Paystack webhook events
   */
  async handleWebhook(event: any): Promise<void> {
    const { event: eventType, data } = event;
    const Payment = (await import("@/models/payment.js")).default;

    try {
      switch (eventType) {
        case "subscription.create":
          logger.info(
            `Webhook subscription.create: ${data.subscription_code} for customer ${data.customer.customer_code}`,
          );
          // Try to find the record either by subscription code (if already saved by verify)
          // or by customer and plan type when no subscription code is set yet
          await connectMongoDb(() => Payment.findOneAndUpdate(
            {
              $or: [
                { paystackSubscriptionId: data.subscription_code },
                {
                  paystackCustomerId: data.customer.customer_code,
                  paymentType: "membership_dues",
                  isRecurring: true,
                  // Match recent records where the subscription hasn't been set yet
                  paystackSubscriptionId: { $in: [null, "", undefined] },
                },
              ],
            },
            {
              $set: {
                paystackSubscriptionId: data.subscription_code,
                paystackEmailToken: data.email_token,
                isRecurring: true,
                nextPaymentDate: new Date(data.next_payment_date),
              },
            },
            { sort: { createdAt: -1 } },
          ));
          break;

        case "charge.success":
          logger.info(
            `Webhook charge.success: ${data.reference} (${data.amount})`,
          );

          const chargeUpdate: any = {
            paymentStatus: "completed",
            lastPaymentDate: new Date(),
          };

          // If this is a subscription charge, capture the code and email token
          if (data.subscription_code) {
            chargeUpdate.paystackSubscriptionId = data.subscription_code;
            if (data.next_payment_date) {
              chargeUpdate.nextPaymentDate = new Date(data.next_payment_date);
            }
            // Paystack also sends email_token in charge.success for subscription charges
            if (data.email_token) {
              chargeUpdate.paystackEmailToken = data.email_token;
            }
          }

          if (data.plan && data.plan.plan_code === PAYSTACK_PLANS.levy_plan) {
            chargeUpdate.subscriptionType = "levy_plan";
            chargeUpdate.isRecurring = true;
          }

          // Use reference to find the specific initial payment attempt
          const payment = await connectMongoDb(() => Payment.findOneAndUpdate(
            { reference: data.reference },
            chargeUpdate,
            { upsert: true, returnDocument: "after" },
          ));

          // Trigger workflow for successful charge
          if (payment) {
            await this._triggerPaymentConfirmation(
              payment.userId.toString(),
              data.amount / 100,
              data.reference,
            );
          }
          break;

        case "subscription.disable":
          logger.info(
            `Webhook subscription.disable: ${data.subscription_code}`,
          );
          await connectMongoDb(() => Payment.findOneAndUpdate(
            { paystackSubscriptionId: data.subscription_code },
            { isRecurring: false, subscriptionStatus: "cancelled" },
          ));
          break;

        default:
          logger.info("Unhandled webhook event:", eventType);
      }
    } catch (error) {
      logger.error("Error handling webhook:", error);
      throw error;
    }
  }

  /**
   * Get Paystack plan code based on subscription tier
   */
  private getPlanCode(plan: string): string {
    switch (plan.toLowerCase()) {
      case "levy_plan":
        return PAYSTACK_PLANS.levy_plan;
      default:
        throw new Error(`Invalid plan: ${plan}`);
    }
  }

  /**
   * Create a customer in Paystack
   */
  async createCustomer(
    email: string,
    userId: string,
    name: string,
  ): Promise<any> {
    try {
      const response = await getPaystack().post("/customer", {
        email,
        metadata: {
          userId,
          name,
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error(
        "Failed to create Paystack customer:",
        error.message || "Unknown error",
      );
      throw new Error(
        error.response?.data?.message || "Failed to create customer",
      );
    }
  }

  /**
   * Helper to trigger the payment confirmation workflow
   */
  private async _triggerPaymentConfirmation(
    userId: string,
    amount: number,
    reference: string,
  ) {
    try {
      const user = await connectMongoDb(() => User.findById(userId).lean());
      if (!user) {
        logger.error(`User ${userId} not found for payment confirmation`);
        return;
      }

      await workflowClient.trigger({
        url: `${env.serverUrl}/api/v1/workflows/payment-confirmation`,
        body: {
          user,
          amount,
          reference,
        },
      });
      logger.info(`Triggered payment confirmation workflow for ${reference}`);
    } catch (error: any) {
      logger.error(
        `Failed to trigger payment confirmation workflow for ${reference}:`,
        error.message || error,
      );
    }
  }
}

export const paymentService = new PaymentService();

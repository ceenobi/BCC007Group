import { initServer } from "@ts-rest/express";
import type { Request } from "express";
import { paystackContract } from "../contract/paystack.contract.js";
import { createTsRestSuccess, createTsRestError } from "../lib/tsRestResponse.js";
import tryCatchFn from "../lib/tryCatchFn.js";
import { customRateLimiter } from "../middleware/rateLimit.middleware.js";
import { authorizedRoles, verifyUser } from "../middleware/auth.middleware.js";
import axios from "axios";
import { env } from "../config/keys.js";
import { cacheMiddleware } from "../middleware/cache.middleware.js";
import logger from "../config/logger.js";
import { paymentService } from "../service/payment.service.js";
import { User } from "../config/better-auth.js";
import { serverEvents } from "../lib/events.js";
import { workflowClient } from "../workflows/client.js";

export const getPaystackRouter = () => {
  const s = initServer();

  return s.router(paystackContract, {
  paystack: {
    listBanks: {
      middleware: [
        verifyUser,
        authorizedRoles("member", "admin", "super_admin"),
        cacheMiddleware({ ttl: 3600 }),
      ],
      handler: tryCatchFn(async () => {
        const response = await axios.get("https://api.paystack.co/bank", {
          headers: {
            Authorization: `Bearer ${env.paystackSecretKey}`,
          },
        });
        if (!response.data.status) {
          logger.error("Failed to fetch banks", response.data);
          return createTsRestError(400, response.data.message);
        }
        return createTsRestSuccess(200, {
          success: true,
          message: "Banks fetched successfully",
          data: response.data.data,
        });
      }),
    },
    resolveAccount: {
      middleware: [
        customRateLimiter(20),
        verifyUser,
        authorizedRoles("member", "admin", "super_admin"),
        cacheMiddleware({ ttl: 3600 }),
      ],
      handler: tryCatchFn(async ({ req }) => {
        const { account_number, bank_code } = req.query;
        try {
          const response = await axios.get(
            `https://api.paystack.co/bank/resolve?account_number=${account_number}&bank_code=${bank_code}`,
            {
              headers: {
                Authorization: `Bearer ${env.paystackSecretKey}`,
              },
            },
          );
          if (!response.data.status) {
            logger.error("Failed to resolve account", response.data);
            return createTsRestError(400, response.data.message);
          }
          return createTsRestSuccess(200, {
            success: true,
            message: "Account resolved successfully",
            data: response.data.data,
          });
        } catch (error: any) {
          if (error.response?.status === 429) {
            logger.warn("Paystack rate limit hit (429)");
            return createTsRestError(
              429,
              "Paystack rate limit reached. Please try again in a few minutes.",
            );
          }
          throw error;
        }
      }),
    },
    initializePayment: {
      middleware: [customRateLimiter(10), verifyUser],
      handler: tryCatchFn(async ({ req, body }) => {
        if (!req.user?.isOnboarded) {
          return createTsRestError(401, "Unauthorized, You are not onboarded");
        }
        if (body.paymentType === "event" && !body.eventId) {
          return createTsRestError(400, "Event program is required");
        }
        const response = await paymentService.initializePayment(
          body,
          req?.user as User,
        );
        return createTsRestSuccess(200, response);
      }),
    },
    verifyPayment: {
      middleware: [customRateLimiter(10), verifyUser],
      handler: tryCatchFn(async ({ req, body }) => {
        const user = req.user as User;
        const response = await paymentService.verifyPayment(body, user);
        serverEvents.emit("payment:completed", response.data);
        return createTsRestSuccess(200, response);
      }),
    },
    cancelSubscription: {
      middleware: [customRateLimiter(10), verifyUser],
      handler: tryCatchFn(async ({ req, body }) => {
        const response = await paymentService.cancelSubscription(
          req?.user as User,
          body.code ?? "",
          body.token ?? "",
          body.reference,
        );
        // Trigger workflow for email
        const user = { name: req.user?.name, email: req.user?.email };
        workflowClient
          .trigger({
            url: `${env.serverUrl}/api/v1/workflows/cancel-subscription`,
            body: {
              user,
            },
          })
          .catch((error: any) => {
            logger.error(
              "Failed to trigger cancel subscription workflow:",
              error,
            );
          });
        return createTsRestSuccess(200, response);
      }),
    },
    webhook: {
      handler: tryCatchFn(async ({ req, body, headers }) => {
        const signature = headers["x-paystack-signature"] as string;
        const expressReq = req as unknown as Request;
        const payload = expressReq.rawBody || JSON.stringify(body);

        logger.info("Incoming Paystack Webhook", {
          hasRawBody: !!expressReq.rawBody,
          eventType: body?.event,
          reference: body?.data?.reference,
        });

        if (!paymentService.verifyWebhookSignature(payload, signature)) {
          logger.error("Paystack Webhook Signature Verification Failed", {
            signature: signature ? "exists" : "missing",
          });
          return createTsRestError(401, "Invalid signature");
        }

        logger.info(`Paystack Webhook Verified: ${body?.event}`);
        await paymentService.handleWebhook(body);

        return createTsRestSuccess(200, {
          success: true,
          message: "Webhook processed",
        });
      }),
    },
  },
});
};

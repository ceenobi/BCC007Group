import { initServer } from "@ts-rest/express";
import { authContract } from "../contract/auth.contract.js";
import {
  SignUpSchema,
  LoginSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ChangeEmailSchema,
  UpdateUserSchema,
  UpdateUserAvatarSchema,
} from "../lib/dataSchema.js";
import { auth } from "../config/better-auth.js";
import {
  createTsRestSuccess,
  createTsRestError,
} from "../lib/tsRestResponse.js";
import { fromNodeHeaders } from "better-auth/node";
import tryCatchFn from "../lib/tryCatchFn.js";
import { env } from "../config/keys.js";
import { type User as BetterAuthUser } from "../config/better-auth.js";
import logger from "../config/logger.js";
import { validateFormData } from "../middleware/formValidate.js";
import { customRateLimiter } from "../middleware/rateLimit.middleware.js";
import { authorizedRoles, verifyUser } from "../middleware/auth.middleware.js";
import { generateMemberId } from "../lib/options.js";
import { deleteFromCloudinary } from "../config/upload.js";
import User from "../models/user.js";
import BankDetails from "../models/bank.js";
import { workflowClient } from "../workflows/client.js";
import { invalidateCache } from "../middleware/cache.middleware.js";
import { serverEvents } from "../lib/events.js";
import { connectMongoDb } from "../config/db.server.js";

export const getAuthRouter = () => {
  const s = initServer();

  return s.router(authContract, {
    health: async () => {
      return {
        status: 200 as const,
        body: {
          status: "success" as const,
          message: "Server is healthy",
          environment: env.nodeEnv!,
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        },
      };
    },
    auth: {
      createUser: {
        middleware: [
          customRateLimiter(10),
          verifyUser,
          authorizedRoles("admin", "super_admin"),
          validateFormData(SignUpSchema),
        ],
        handler: tryCatchFn(async ({ req, res }) => {
          const { email, name } = req.body;
          const lastName = name.split(" ")[1] || "";
          const basePassword = lastName || "user";
          const suffix = "BCC007!";
          const loginPassword = basePassword + suffix;
          const authResponse = await auth.api.signUpEmail({
            body: {
              name,
              email,
              password: loginPassword,
              memberId: generateMemberId(),
              callbackURL: `${env.clientUrl}/email-verified`,
            },
            headers: fromNodeHeaders(req.headers),
            returnHeaders: true,
            asResponse: true,
          });
          if (!authResponse.ok) {
            const errorData: any = await authResponse.json().catch(() => ({}));
            logger.error("Failed to register user:", errorData);
            return createTsRestError(
              400,
              errorData.message || "Registration failed",
              errorData?.details || [],
            );
          }
          // Trigger workflow for email
          const user = { name };
          workflowClient
            .trigger({
              url: `${env.serverUrl}/api/v1/workflows/welcome-password`,
              body: {
                user,
                password: loginPassword,
              },
            })
            .catch((error: any) => {
              logger.error(
                "Failed to trigger welcome password workflow:",
                error,
              );
            });
          await invalidateCache("cache:/api/v1/members*");
          res.setHeaders(authResponse.headers);
          serverEvents.emit("member:created", user);
          return createTsRestSuccess(201, {
            success: true,
            message: "Member has been successfully registered",
          });
        }),
      },
      loginUser: {
        middleware: [validateFormData(LoginSchema)],
        handler: tryCatchFn(async ({ req, res }) => {
          const { email, password } = req.body;
          const authResponse = await auth.api.signInEmail({
            body: {
              email,
              password,
              callbackURL: `${env.clientUrl}/dashboard`,
            },
            headers: fromNodeHeaders(req.headers),
            returnHeaders: true,
            asResponse: true,
          });
          if (!authResponse.ok) {
            const errorData: any = await authResponse.json().catch(() => ({}));
            logger.error("Failed to login user:", errorData);
            return createTsRestError(400, errorData.message || "Login failed");
          }
          res.setHeaders(authResponse.headers);
          return createTsRestSuccess(200, {
            success: true,
            message: "Login successful",
          });
        }),
      },
      verifyEmail: {
        handler: tryCatchFn(async ({ req, res }) => {
          const token = req.query.token || "";
          const authResponse = await auth.api.verifyEmail({
            query: {
              token,
              callbackURL: `${env.clientUrl}/dashboard`,
            },
            headers: fromNodeHeaders(req.headers),
            returnHeaders: true,
            asResponse: true,
          });
          if (!authResponse.ok) {
            const errorData: any = await authResponse.json().catch(() => ({}));
            logger.error("Failed to verify email:", errorData);
            return createTsRestError(
              400,
              errorData.message || "Failed to verify email",
              errorData?.details || [],
            );
          }
          res.setHeaders(authResponse.headers);
          return createTsRestSuccess(200, {
            success: true,
            message: "Email verified successfully",
          });
        }),
      },
      forgotPassword: {
        middleware: [
          customRateLimiter(10),
          validateFormData(ForgotPasswordSchema),
        ],
        handler: tryCatchFn(async ({ req }) => {
          const { email } = req.body;
          const authResponse = await auth.api.requestPasswordReset({
            body: {
              email,
              redirectTo: `${env.clientUrl}/account/reset-password`,
            },
            asResponse: true,
          });
          if (!authResponse.ok) {
            const errorData: any = await authResponse.json().catch(() => ({}));
            logger.error("Failed to send password reset link:", errorData);
            return createTsRestError(
              400,
              errorData.message || "Failed to send password reset link",
            );
          }
          return createTsRestSuccess(200, {
            success: true,
            message: "Password reset link has been sent to your email",
          });
        }),
      },
      resetPassword: {
        middleware: [
          customRateLimiter(10),
          validateFormData(ResetPasswordSchema),
        ],
        handler: tryCatchFn(async ({ req }) => {
          const token = req.query.token || "";
          const { newPassword } = req.body;
          const authResponse = await auth.api.resetPassword({
            body: {
              newPassword,
              token,
            },
            asResponse: true,
          });
          if (!authResponse.ok) {
            const errorData: any = await authResponse.json().catch(() => ({}));
            logger.error("Failed to reset password:", errorData);
            return createTsRestError(
              400,
              errorData.message || "Failed to reset password",
              errorData?.details || [],
            );
          }
          return createTsRestSuccess(200, {
            success: true,
            message: "Password reset successful",
          });
        }),
      },
      getSession: tryCatchFn(async ({ req, res }) => {
        const response = await auth.api.getSession({
          headers: fromNodeHeaders(req.headers),
          asResponse: true,
        });
        const session = (await response.json()) as {
          user: BetterAuthUser;
        };
        if (!session || !session.user) {
          return createTsRestError(404, "No active session found");
        }
        res.setHeaders(response.headers);
        return createTsRestSuccess(200, session.user);
      }),
      logOutUser: tryCatchFn(async ({ req, res }) => {
        const response = await auth.api.signOut({
          headers: fromNodeHeaders(req.headers),
          asResponse: true,
          returnHeaders: true,
        });
        if (!response.ok) {
          return createTsRestError(404, "No active session found");
        }
        res.setHeaders(response.headers);
        return createTsRestSuccess(200, {
          success: true,
          message: "Logout successful",
        });
      }),
      resendEmailVerification: {
        middleware: [customRateLimiter(5)],
        handler: tryCatchFn(async ({ req }) => {
          const { email } = req.body;
          const response = await auth.api.sendVerificationEmail({
            body: {
              email: email,
              callbackURL: `${env.clientUrl}/email-verified`,
            },
            headers: fromNodeHeaders(req.headers),
            asResponse: true,
          });
          if (!response.ok) {
            return createTsRestError(400, "Failed to send verification email");
          }
          return createTsRestSuccess(200, {
            success: true,
            message: "Email verification link has been sent to your email",
          });
        }),
      },
      deleteAccount: {
        middleware: [
          verifyUser,
          authorizedRoles("member", "admin", "super_admin"),
        ],
        handler: tryCatchFn(async ({ req }) => {
          const authResponse = await auth.api.deleteUser({
            body: {
              callbackURL: `${env.clientUrl}/account/deleted`,
            },
            headers: fromNodeHeaders(req.headers),
            returnHeaders: true,
            asResponse: true,
          });
          if (!authResponse.ok) {
            const errorData: any = await authResponse.json().catch(() => ({}));
            logger.error("Failed to send account deletion email:", errorData);
            return createTsRestError(
              400,
              errorData.message || "Failed to send account deletion email",
            );
          }
          return createTsRestSuccess(200, {
            success: true,
            message: "Account deletion email has been sent to your email",
          });
        }),
      },
      confirmDeleteAccount: {
        middleware: [
          verifyUser,
          authorizedRoles("member", "admin", "super_admin"),
        ],
        handler: tryCatchFn(async ({ req }) => {
          const token = req.query.token || "";
          const authResponse = await auth.api.deleteUser({
            body: {
              token,
              callbackURL: `${env.clientUrl}/account/deleted`,
            },
            headers: fromNodeHeaders(req.headers),
            returnHeaders: true,
            asResponse: true,
          });
          if (!authResponse.ok) {
            const errorData: any = await authResponse.json().catch(() => ({}));
            logger.error("Failed to delete account:", errorData);
            return createTsRestError(
              400,
              errorData.message || "Failed to delete account",
            );
          }
          return createTsRestSuccess(200, {
            success: true,
            message: "Account deleted successfully",
          });
        }),
      },
      changePassword: {
        middleware: [
          verifyUser,
          authorizedRoles("member", "admin", "super_admin"),
        ],
        handler: tryCatchFn(async ({ req, res }) => {
          const { newPassword, currentPassword } = req.body;
          const authResponse = await auth.api.changePassword({
            body: {
              newPassword,
              currentPassword,
              revokeOtherSessions: true,
            },
            headers: fromNodeHeaders(req.headers),
            returnHeaders: true,
            asResponse: true,
          });
          if (!authResponse.ok) {
            const errorData: any = await authResponse.json().catch(() => ({}));
            logger.error("Failed to change password:", errorData);
            return createTsRestError(
              400,
              errorData.message || "Failed to change password",
            );
          }
          res.setHeaders(authResponse.headers);
          return createTsRestSuccess(200, {
            success: true,
            message: "Password changed successfully",
          });
        }),
      },
      changeEmail: {
        middleware: [
          customRateLimiter(5),
          verifyUser,
          authorizedRoles("member", "admin", "super_admin"),
          validateFormData(ChangeEmailSchema),
        ],
        handler: tryCatchFn(async ({ req }) => {
          const { newEmail } = req.body;
          const authResponse = await auth.api.changeEmail({
            body: {
              newEmail,
              callbackURL: `${env.clientUrl}/email-verified`,
            },
            headers: fromNodeHeaders(req.headers),
            returnHeaders: true,
            asResponse: true,
          });
          if (!authResponse.ok) {
            const errorData: any = await authResponse.json().catch(() => ({}));
            logger.error("Failed to change email:", errorData);
            return createTsRestError(
              400,
              errorData.message || "Failed to change email",
            );
          }
          return createTsRestSuccess(200, {
            success: true,
            message: "Email change request sent successfully",
          });
        }),
      },
      updateUser: {
        middleware: [
          customRateLimiter(5),
          verifyUser,
          authorizedRoles("member", "admin", "super_admin"),
          validateFormData(UpdateUserSchema),
        ],
        handler: tryCatchFn(async ({ req, res }) => {
          const {
            name,
            phone,
            occupation,
            location,
            gender,
            dateOfBirth,
            disableBirthDate,
            disableEmail,
            disableGender,
          } = req.body;
          const authResponse = await auth.api.updateUser({
            body: {
              name,
              phone,
              occupation,
              location,
              gender,
              dateOfBirth,
              disableBirthDate,
              disableEmail,
              disableGender,
            },
            headers: fromNodeHeaders(req.headers),
            returnHeaders: true,
            asResponse: true,
          });
          if (!authResponse.ok) {
            const errorData: any = await authResponse.json().catch(() => ({}));
            logger.error("Failed to update user:", errorData);
            return createTsRestError(
              400,
              errorData.message || "Failed to update user",
            );
          }
          res.setHeaders(authResponse.headers);
          return createTsRestSuccess(200, {
            success: true,
            message: "User updated successfully",
          });
        }),
      },
      updateAvatar: {
        middleware: [
          customRateLimiter(5),
          verifyUser,
          authorizedRoles("member", "admin", "super_admin"),
          validateFormData(UpdateUserAvatarSchema),
        ],
        handler: tryCatchFn(async ({ req, res }) => {
          const { image, imageId } = req.body;
          // Delete profile photo if it exists
          if (req.user?.imageId) {
            await deleteFromCloudinary(req.user.imageId);
          }
          const authResponse = await auth.api.updateUser({
            body: {
              image,
              imageId,
            },
            headers: fromNodeHeaders(req.headers),
            returnHeaders: true,
            asResponse: true,
          });
          if (!authResponse.ok) {
            const errorData: any = await authResponse.json().catch(() => ({}));
            logger.error("Failed to update avatar:", errorData);
            return createTsRestError(
              400,
              errorData.message || "Failed to update user avatar",
            );
          }
          res.setHeaders(authResponse.headers);
          return createTsRestSuccess(200, {
            success: true,
            message: "User avatar updated successfully",
          });
        }),
      },
      completeOnboarding: {
        middleware: [
          customRateLimiter(5),
          verifyUser,
          authorizedRoles("member", "admin", "super_admin"),
        ],
        handler: tryCatchFn(async ({ req }) => {
          const [user, bankDetails] = await connectMongoDb(() =>
            Promise.all([
              User.findById(req.user?.id).lean(),
              BankDetails.findOne({
                userId: req.user?.id,
              }).lean(),
            ]),
          );
          if (user.isOnboarded) {
            return createTsRestError(400, "User is already onboarded");
          }
          const avatarCompleted = user?.image ? true : false;
          const userProfileCompleted =
            user?.phone && user?.occupation && user?.location ? true : false;
          const bankAccountCompleted =
            bankDetails?.bankAccountName && bankDetails?.bankAccountNumber
              ? true
              : false;
          if (avatarCompleted && userProfileCompleted && bankAccountCompleted) {
            await connectMongoDb(() =>
              User.findByIdAndUpdate(
                req.user?.id,
                {
                  isOnboarded: true,
                },
                { returnDocument: "after" },
              ),
            );
          }
          return createTsRestSuccess(200, {
            success: true,
            message: "Onboarding completed successfully",
          });
        }),
      },
    },
  });
};

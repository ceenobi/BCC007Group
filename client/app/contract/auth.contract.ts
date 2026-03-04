import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  SignInSchema,
  SignUpSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
  ErrorSchema,
  UserSchema,
  UpdateUserSchema,
  UpdateUserAvatarSchema,
  ChangePasswordSchema,
  ChangeEmailSchema,
} from "~/lib/dataSchema";

const SuccessSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
const HealthResponseSchema = z.object({
  status: z.literal("success"),
  message: z.string(),
  environment: z.string(),
  timestamp: z.string(),
  uptime: z.number(),
});

const AuthUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  url: z.string().optional(),
});

const c = initContract();

export const authContract = c.router({
  // Health check
  health: {
    method: "GET",
    path: "/",
    responses: {
      200: HealthResponseSchema,
    },
    summary: "Health check endpoint",
  },
  auth: {
    createUser: {
      method: "POST",
      path: "/api/v1/auth/register",
      body: SignUpSchema,
      responses: {
        201: AuthUserResponseSchema,
        400: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Create a new user",
    },
    loginUser: {
      method: "POST",
      path: "/api/v1/auth/login",
      body: SignInSchema,
      responses: {
        200: AuthUserResponseSchema,
        400: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "login a user",
    },
    forgotPassword: {
      method: "POST",
      path: "/api/v1/auth/forgot-password",
      body: ForgotPasswordSchema,
      responses: {
        200: AuthUserResponseSchema,
        400: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "forgot password",
    },
    resetPassword: {
      method: "POST",
      path: "/api/v1/auth/reset-password",
      body: ResetPasswordSchema,
      query: z.object({
        token: z.string(),
      }),
      responses: {
        200: AuthUserResponseSchema,
        400: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "reset password",
    },
    getSession: {
      method: "GET",
      path: "/api/v1/auth/session",
      responses: {
        200: UserSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Get current user session",
      validateResponseOnClient: true,
      strictStatusCodes: true,
      metadata: {
        tags: ["Auth"],
      },
    },
    logOutUser: {
      method: "POST",
      path: "/api/v1/auth/logout",
      body: z.object({}),
      responses: {
        200: AuthUserResponseSchema,
        400: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "logout a user",
    },
    resendEmailVerification: {
      method: "POST",
      path: "/api/v1/auth/resend-email-verification",
      body: ForgotPasswordSchema,
      responses: {
        200: AuthUserResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "resend email verification",
    },
    verifyEmail: {
      method: "GET",
      path: "/api/v1/auth/verify-email",
      query: z.object({
        token: z.string(),
      }),
      responses: {
        200: AuthUserResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "verify email",
    },

    deleteAccount: {
      method: "POST",
      path: "/api/v1/auth/delete-account",
      body: z.object({}),
      responses: {
        200: SuccessSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "Delete user account",
    },
    confirmDeleteAccount: {
      method: "GET",
      path: "/api/v1/auth/confirm-delete-account",
      query: z.object({
        token: z.string(),
      }),
      responses: {
        200: AuthUserResponseSchema,
        400: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "confirm delete account",
    },
    changePassword: {
      method: "POST",
      path: "/api/v1/auth/change-password",
      body: ChangePasswordSchema,
      responses: {
        200: AuthUserResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "change password",
    },
    changeEmail: {
      method: "POST",
      path: "/api/v1/auth/change-email",
      body: ChangeEmailSchema,
      responses: {
        200: AuthUserResponseSchema,
        400: ErrorSchema,
        401: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "change email",
    },
    updateUser: {
      method: "PATCH",
      path: "/api/v1/auth/update-user",
      body: UpdateUserSchema,
      responses: {
        200: SuccessSchema,
        400: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "update a user",
    },
    updateAvatar: {
      method: "PATCH",
      path: "/api/v1/auth/update-avatar",
      body: UpdateUserAvatarSchema,
      responses: {
        200: SuccessSchema,
        400: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "update a user avatar",
    },
    completeOnboarding: {
      method: "PATCH",
      path: "/api/v1/auth/complete-onboarding",
      body: z.object({}),
      responses: {
        200: SuccessSchema,
        400: ErrorSchema,
        403: ErrorSchema,
        404: ErrorSchema,
        429: ErrorSchema,
        500: ErrorSchema,
      },
      summary: "complete onboarding",
    },
  },
});

export type AuthContract = typeof authContract;

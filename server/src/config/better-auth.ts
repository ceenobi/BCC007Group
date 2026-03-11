import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";
import { connectToDB } from "./db.server.js";
import { env } from "./keys.js";
import emailService from "../email/send-email.server.js";

await connectToDB();

export const auth = betterAuth({
  appName: "Bcc007Pay",
  database: mongodbAdapter(mongoose.connection.db as any, {
    client: mongoose.connection.getClient() as any,
    transaction: false,
  }),
  trustedOrigins: ["http://localhost:4500", env.clientUrl],
  baseURL:
    env.nodeEnv === "production" ? env.serverUrl : "http://localhost:4600",
  session: {
    maxAge: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Hardened for production
    sendResetPassword: async ({ user, url }) => {
      emailService.sendForgotPasswordEmail(user as User, url);
    },
    onPasswordReset: async ({ user }, request) => {
      await emailService.sendResetPasswordSuccessEmail(user as User);
    },
    resetPasswordTokenExpiresIn: 60 * 60 * 15,
    asResponse: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await emailService.sendVerificationEmail(user as User, url);
    },
    asResponse: true,
    emailVerificationTokenExpiresIn: 60 * 60 * 24 * 1, //1 day
  },
  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, newEmail, token }) => {
        const confirmUrl = `${env.serverUrl}/api/v1/auth/verify-email?token=${token}`;
        await emailService.sendConfirmChangeEmail(
          user as User,
          newEmail,
          confirmUrl,
        );
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, token }) => {
        const confirmUrl = `${env.serverUrl}/api/v1/auth/confirm-delete-account?token=${token}`;
        await emailService.sendConfirmDeleteEmail(user as User, confirmUrl);
      },
    },
    additionalFields: {
      role: {
        type: "string",
        input: true,
        enum: ["member", "admin", "super_admin"],
        defaultValue: "member",
      },
      isOnboarded: {
        type: "boolean",
        defaultValue: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      imageId: {
        type: "string",
        required: false,
      },
      memberId: {
        type: "string",
        required: false,
      },
      occupation: {
        type: "string",
        required: false,
      },
      location: {
        type: "string",
        required: false,
      },
      gender: {
        type: "string",
        required: false,
      },
      dateOfBirth: {
        type: "date",
        required: false,
      },
      disableBirthDate: {
        type: "boolean",
        defaultValue: false,
      },
      disableEmail: {
        type: "boolean",
        defaultValue: false,
      },
      disableGender: {
        type: "boolean",
        defaultValue: false,
      },
    },
  },
  advanced: {
    cookiePrefix: "__bcc007pay",
    crossSubDomainCookies: {
      enabled: env.nodeEnv === "production",
    },
    defaultCookieAttributes: {
      sameSite: env.nodeEnv === "production" ? "none" : "lax",
      secure: env.nodeEnv === "production",
      httpOnly: true,
      partitioned: env.nodeEnv === "production",
    },
  },
});

export type Session = typeof auth.$Infer.Session;

// Extend the User type to include custom fields
export type User = typeof auth.$Infer.Session.user & {
  role: string;
  isOnboarded: boolean;
  phone?: string;
  imageId?: string;
  memberId?: string;
  occupation?: string;
  location?: string;
  gender?: string;
  dateOfBirth?: string;
  disableBirthDate: boolean;
  disableEmail: boolean;
  disableGender: boolean;
};

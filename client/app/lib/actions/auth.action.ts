import { cache } from "react";
import { apiClient } from "../apiClient";
import type {
  ChangeEmailData,
  ChangePasswordData,
  ForgotPasswordData,
  ResetPasswordData,
  SigninFormData,
  SignupFormData,
  UpdateUserAvatarData,
} from "../dataSchema";

export const getUserSession = cache(
  async ({ cookie, origin }: { cookie: string; origin?: string }) => {
    return await (apiClient.auth.getSession as any)({
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(origin ? { Origin: origin } : {}),
      },
    });
  },
);

export const signUpWithEmail = async ({
  validated,
  cookie,
}: {
  validated: SignupFormData;
  cookie: string;
}) => {
  return await (apiClient.auth.createUser as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const signInWithEmail = async ({
  validated,
  origin,
}: {
  validated: SigninFormData;
  origin?: string;
}) => {
  return await (apiClient.auth.loginUser as any)({
    body: validated,
    headers: origin ? { Origin: origin } : undefined,
  });
};

export const forgotPassword = async ({
  validated,
}: {
  validated: ForgotPasswordData;
}) => {
  return await (apiClient.auth.forgotPassword as any)({
    body: validated,
  });
};

export const resetPassword = async ({
  validated,
  token,
  origin,
}: {
  validated: ResetPasswordData;
  token: string;
  origin?: string;
}) => {
  return await (apiClient.auth.resetPassword as any)({
    body: validated,
    query: {
      token,
    },
    headers: origin ? { Origin: origin } : undefined,
  });
};

export const changePassword = async ({
  validated,
  cookie,
}: {
  validated: ChangePasswordData;
  cookie: string;
}) => {
  return await (apiClient.auth.changePassword as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const changeEmail = async ({
  validated,
  cookie,
}: {
  validated: ChangeEmailData;
  cookie: string;
}) => {
  return await (apiClient.auth.changeEmail as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const logout = async ({ cookie }: { cookie: string }) => {
  return await (apiClient.auth.logOutUser as any)({
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const resendEmailVerification = async ({
  validated,
}: {
  validated: ForgotPasswordData;
}) => {
  return await (apiClient.auth.resendEmailVerification as any)({
    body: validated,
  });
};

export const updateAvatar = async ({
  validated,
  cookie,
}: {
  validated: UpdateUserAvatarData;
  cookie: string;
}) => {
  return await (apiClient.auth.updateAvatar as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const updateUser = async ({
  validated,
  cookie,
}: {
  validated: any;
  cookie: string;
}) => {
  return await (apiClient.auth.updateUser as any)({
    body: validated,
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const completeOnboarding = async ({ cookie }: { cookie: string }) => {
  return await (apiClient.auth.completeOnboarding as any)({
    body: {},
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const deleteAccount = async ({ cookie }: { cookie: string }) => {
  return await (apiClient.auth.deleteAccount as any)({
    body: {},
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

export const confirmDeleteAccount = async ({
  cookie,
  token,
}: {
  cookie: string;
  token: string;
}) => {
  return await (apiClient.auth.confirmDeleteAccount as any)({
    query: {
      token,
    },
    headers: cookie ? { Cookie: cookie } : undefined,
  });
};

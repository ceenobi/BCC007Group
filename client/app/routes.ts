import {
  type RouteConfig,
  index,
  layout,
  prefix,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  layout("routes/auth/layout.tsx", [
    ...prefix("account", [
      route("login", "routes/auth/login/login.tsx"),
      route(
        "forgot-password",
        "routes/auth/forgot-password/forgot-password.tsx",
      ),
      route("reset-password", "routes/auth/reset-password/reset-password.tsx"),
      route("verify-email", "routes/auth/verify-email/verify-email.tsx"),
    ]),
  ]),
  route("logout", "routes/auth/logout/logout.tsx"),
  route("email-verified", "routes/email-verified/email-verified.tsx"),
  route("uploads/upload-avatar", "routes/uploads/upload-avatar.ts"),
  layout("routes/dashboard/layout.tsx", [
    route("dashboard", "routes/dashboard/dashboard.tsx"),
    route("members/onboarding", "routes/dashboard/onboarding/onboarding.tsx"),
    route("members", "routes/dashboard/members/members.tsx", [
      route(":name/:id", "routes/dashboard/members/member.tsx"),
    ]),
    route("events", "routes/dashboard/events/events.tsx"),
    route("payments", "routes/dashboard/payments/payments.tsx", [
      route("verify", "routes/dashboard/payments/verify.tsx"),
      route("reports", "routes/dashboard/payments/reports.tsx"),
    ]),
    route("settings", "routes/dashboard/settings/settings.tsx"),
    route("help-desk", "routes/dashboard/help-desk/help-desk.tsx"),
    route("profile", "routes/dashboard/profile/profile.tsx"),
    route("transfers", "routes/dashboard/transfers/transfers.tsx"),
  ]),
] satisfies RouteConfig;

import { IEvent } from "~/models/event";
import { sendEmail } from "../config/email.server";
import {
  changeEmailTemplate,
  forgotPasswordTemplate,
  verifyEmailTemplate,
  resetPasswordSuccessTemplate,
  confirmDeleteTemplate,
  confirmChangeEmailTemplate,
  welcomePasswordTemplate,
  roleAssignedTemplate,
  eventCreatedTemplate,
  ticketCreatedTemplate,
  ticketIssueAssignedTemplate,
  ticketIssueResolvedTemplate,
  paymemtConfirmationTemplate,
  cancelSubscriptionTemplate,
} from "./templates";
import type { User } from "~/config/better-auth";

const emailService = {
  sendVerificationEmail: async (user: User, url: string) => {
    const htmlBody = verifyEmailTemplate(user.name, url);
    await sendEmail({
      email: user.email,
      subject: "Verify your account",
      message: htmlBody,
    });
  },
  sendForgotPasswordEmail: async (user: User, url: string) => {
    const htmlBody = forgotPasswordTemplate(user.name, url);
    await sendEmail({
      email: user.email,
      subject: "Reset your Password",
      message: htmlBody,
    });
  },
  sendChangeEmailVerification: async (
    user: User,
    newEmail: string,
    url: string,
  ) => {
    const htmlBody = changeEmailTemplate(user.name, newEmail, url);
    await sendEmail({
      email: user.email,
      subject: "Verify your email change",
      message: htmlBody,
    });
  },
  sendResetPasswordSuccessEmail: async (user: User) => {
    const htmlBody = resetPasswordSuccessTemplate(user.name);
    await sendEmail({
      email: user.email,
      subject: "Password Reset Successful",
      message: htmlBody,
    });
  },
  sendConfirmDeleteEmail: async (user: User, url: string) => {
    const htmlBody = confirmDeleteTemplate(user.name, url);
    await sendEmail({
      email: user.email,
      subject: "Confirm Account Deletion",
      message: htmlBody,
    });
  },
  sendConfirmChangeEmail: async (user: User, newEmail: string, url: string) => {
    const htmlBody = confirmChangeEmailTemplate(user.name, newEmail, url);
    await sendEmail({
      email: user.email,
      subject: "Confirm Email Change",
      message: htmlBody,
    });
  },
  sendWelcomePasswordEmail: async (user: User, password: string) => {
    const htmlBody = welcomePasswordTemplate(user.name, password);
    await sendEmail({
      email: user.email,
      subject: "Your login password",
      message: htmlBody,
    });
  },
  sendRoleAssignedEmail: async (user: User, role: string) => {
    const htmlBody = roleAssignedTemplate(user.name, role);
    await sendEmail({
      email: user.email,
      subject: "Role Assigned",
      message: htmlBody,
    });
  },
  sendEventCreatedEmail: async (user: User, event: IEvent) => {
    const htmlBody = eventCreatedTemplate(user.name, event.title);
    await sendEmail({
      email: user.email,
      subject: "Event Created",
      message: htmlBody,
    });
  },
  sendTicketCreatedEmail: async (user: User, ticketId: string) => {
    const htmlBody = ticketCreatedTemplate(user.name, ticketId);
    await sendEmail({
      email: user.email,
      subject: "Ticket Created",
      message: htmlBody,
    });
  },
  sendTicketIssueAssignedEmail: async (user: User, ticketId: string) => {
    const htmlBody = ticketIssueAssignedTemplate(user.name, ticketId);
    await sendEmail({
      email: user.email,
      subject: "Ticket Issue Assigned",
      message: htmlBody,
    });
  },
  sendTicketIssueResolvedEmail: async (user: User, ticketId: string) => {
    const htmlBody = ticketIssueResolvedTemplate(user.name, ticketId);
    await sendEmail({
      email: user.email,
      subject: "Ticket Issue Resolved",
      message: htmlBody,
    });
  },
  sendPaymentConfirmationEmail: async (user: User, amount: string, reference: string) => {
    const htmlBody = paymemtConfirmationTemplate(user.name, amount, reference);
    await sendEmail({
      email: user.email,
      subject: "Payment Confirmation",
      message: htmlBody,
    });
  },
  sendCancelSubscriptionEmail: async (user: User) => {
    const htmlBody = cancelSubscriptionTemplate(user.name);
    await sendEmail({
      email: user.email,
      subject: "Subscription Cancellation",
      message: htmlBody,
    });
  },
};

export default emailService;

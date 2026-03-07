import emailService from "@/email/send-email.server.js";
import logger from "@/config/logger.js";
import { type User } from "@/config/better-auth.js";
import { IEvent } from "@/models/event.js";

export const sendWelcomePasswordWorkflow = async (context: any) => {
  const { user, password } = context.requestPayload as {
    user: User;
    password: string;
  };

  await context.run("send-email", async () => {
    try {
      await emailService.sendWelcomePasswordEmail(user, password);
    } catch (error: any) {
      logger.error(
        `Workflow failed to send email for user ${user.email}:`,
        error,
      );
      throw error; // Rethrow to trigger retry
    }
  });
};

export const sendRoleAssignedWorkflow = async (context: any) => {
  const { user, role } = context.requestPayload as {
    user: User;
    role: string;
  };

  await context.run("send-email", async () => {
    try {
      await emailService.sendRoleAssignedEmail(user, role);
    } catch (error: any) {
      logger.error(
        `Workflow failed to send email for user ${user.email}:`,
        error,
      );
      throw error; // Rethrow to trigger retry
    }
  });
};

export const sendEventCreatedWorkflow = async (context: any) => {
  const { users, event } = context.requestPayload as {
    users: User[];
    event: IEvent;
  };

  for (const user of users) {
    await context.run(`send-email-${user.email}`, async () => {
      try {
        await emailService.sendEventCreatedEmail(user, event);
      } catch (error: any) {
        logger.error(
          `Workflow failed to send email for user ${user.email}:`,
          error,
        );
        throw error; // Rethrow to trigger retry
      }
    });
  }
};

export const sendTicketCreatedWorkflow = async (context: any) => {
  const { user, ticketId } = context.requestPayload as {
    user: User;
    ticketId: string;
  };

  await context.run("send-email", async () => {
    try {
      await emailService.sendTicketCreatedEmail(user, ticketId);
    } catch (error: any) {
      logger.error(
        `Workflow failed to send email for user ${user.email}:`,
        error,
      );
      throw error; // Rethrow to trigger retry
    }
  });
};

export const sendTicketIssueAssignedWorkflow = async (context: any) => {
  const { user, ticketId } = context.requestPayload as {
    user: User;
    ticketId: string;
  };

  await context.run("send-email", async () => {
    try {
      await emailService.sendTicketIssueAssignedEmail(user, ticketId);
    } catch (error: any) {
      logger.error(
        `Workflow failed to send email for user ${user.email}:`,
        error,
      );
      throw error; // Rethrow to trigger retry
    }
  });
};

export const sendTicketIssueResolvedWorkflow = async (context: any) => {
  const { user, ticketId } = context.requestPayload as {
    user: User;
    ticketId: string;
  };

  await context.run("send-email", async () => {
    try {
      await emailService.sendTicketIssueResolvedEmail(user, ticketId);
    } catch (error: any) {
      logger.error(
        `Workflow failed to send email for user ${user.email}:`,
        error,
      );
      throw error; // Rethrow to trigger retry
    }
  });
};

export const sendPaymentConfirmationWorkflow = async (context: any) => {
  const { user, amount, reference } = context.requestPayload as {
    user: User;
    amount: string;
    reference: string;
  };

  await context.run("send-email", async () => {
    try {
      await emailService.sendPaymentConfirmationEmail(user, amount, reference);
    } catch (error: any) {
      logger.error(
        `Workflow failed to send email for user ${user.email}:`,
        error,
      );
      throw error; // Rethrow to trigger retry
    }
  });
};

export const sendCancelSubscriptionWorkflow = async (context: any) => {
  const { user } = context.requestPayload as {
    user: User;
  };

  await context.run("send-email", async () => {
    try {
      await emailService.sendCancelSubscriptionEmail(user);
    } catch (error: any) {
      logger.error(
        `Workflow failed to send email for user ${user.email}:`,
        error,
      );
      throw error; // Rethrow to trigger retry
    }
  });
};



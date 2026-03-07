import express from "express";
import { serve } from "@upstash/workflow/express";
import {
  sendWelcomePasswordWorkflow,
  sendRoleAssignedWorkflow,
  sendEventCreatedWorkflow,
  sendTicketCreatedWorkflow,
  sendTicketIssueAssignedWorkflow,
  sendTicketIssueResolvedWorkflow,
  sendPaymentConfirmationWorkflow,
  sendCancelSubscriptionWorkflow,
} from "~/workflows/email.workflow";
import { updateEventStatuses } from "~/workflows/events";
import { calculateDashboardStats } from "~/workflows/dashboard.workflow";

const workflowRouter = express.Router();

workflowRouter.post("/welcome-password", serve(sendWelcomePasswordWorkflow));
workflowRouter.post("/role-assigned", serve(sendRoleAssignedWorkflow));
workflowRouter.post("/event-created", serve(sendEventCreatedWorkflow));
workflowRouter.post("/ticket-created", serve(sendTicketCreatedWorkflow));
workflowRouter.post(
  "/ticket-issue-assigned",
  serve(sendTicketIssueAssignedWorkflow),
);
workflowRouter.post(
  "/ticket-issue-resolved",
  serve(sendTicketIssueResolvedWorkflow),
);
workflowRouter.post(
  "/payment-confirmation",
  serve(sendPaymentConfirmationWorkflow),
);
workflowRouter.post(
  "/cancel-subscription",
  serve(sendCancelSubscriptionWorkflow),
);

// Route to be triggered by QStash Cron
workflowRouter.post("/event-status-sync", async (req, res) => {
  console.log("Incoming request to /event-status-sync");
  console.log("Headers:", JSON.stringify(req.headers, null, 2));
  try {
    const result = await updateEventStatuses();
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

// Route to be triggered by QStash Cron (e.g. hourly/nightly)
workflowRouter.post("/dashboard-stats-sync", async (req, res) => {
  console.log("Incoming request to /dashboard-stats-sync");
  try {
    const result = await calculateDashboardStats();
    return res.status(200).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
});

export default workflowRouter;

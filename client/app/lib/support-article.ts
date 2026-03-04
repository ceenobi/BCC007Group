export const helpdeskKnowledgeBase: HelpdeskKnowledgeBase[] = [
  {
    id: "KB-001",
    title: "How to Reset Your Password",
    content:
      "Click on the forgot password link on the login page and follow the instructions. Please note that the link is valid for 15 minutes.",
    category: "access",
    tags: ["password", "login", "security"],
    views: 156,
    helpful: 23,
    lastUpdated: new Date("2026-02-23"),
  },
  {
    id: "KB-002",
    title: "Creating an event",
    content:
      "Creating an event is an admin only feature. Kindly reach out to an admin for help if you need to organize an official meeting or announcement.",
    category: "event",
    tags: ["event", "admin", "organizer"],
    views: 89,
    helpful: 15,
    lastUpdated: new Date("2026-02-23"),
  },
  {
    id: "KB-003",
    title: "Making payments",
    content:
      "Payments can be made for donations, monthly levy, or events. You can use Paystack for secure transactions. A minimum amount of 2000 is required for most payments.",
    category: "payment",
    tags: ["payment", "donation", "paystack"],
    views: 234,
    helpful: 41,
    lastUpdated: new Date("2026-02-23"),
  },
  {
    id: "KB-004",
    title: "Reports and Trends",
    content:
      "View summary of personalized payments made so far in the Reports section. See payment trends, distributions, and the channels used for your transactions.",
    category: "report",
    tags: ["report", "analytics", "trends"],
    views: 67,
    helpful: 12,
    lastUpdated: new Date("2026-02-23"),
  },
  {
    id: "KB-005",
    title: "Completing Your Onboarding",
    content:
      "To fully access all features, ensure you complete the onboarding by providing your bank details and updating your profile information. This is necessary for receiving disbursements or managing finances.",
    category: "onboarding",
    tags: ["onboarding", "bank", "profile"],
    views: 312,
    helpful: 56,
    lastUpdated: new Date("2026-02-23"),
  },
  {
    id: "KB-006",
    title: "Managing Support Tickets",
    content:
      "If you encounter any issues, create a support ticket in the Help Desk. You can track the status (Open, In Progress, Resolved, Closed) and see who is assigned to your issue.",
    category: "support",
    tags: ["tickets", "help", "resolution"],
    views: 145,
    helpful: 28,
    lastUpdated: new Date("2026-02-23"),
  },
  {
    id: "KB-007",
    title: "Event Participation",
    content:
      "Stay updated with upcoming meetings and celebrations. You can mark your interest in events, view organizer details, and pay event-specific fees directly from the event card.",
    category: "event",
    tags: ["events", "rsvp", "participation"],
    views: 198,
    helpful: 34,
    lastUpdated: new Date("2026-02-23"),
  },
  {
    id: "KB-008",
    title: "User Roles and Permissions",
    content:
      "BCC007 uses Role-Based Access Control (RBAC). 'Super Admins' manage all facets, 'Admins' handle events and tickets, and 'Members' access personal dashboards and reports.",
    category: "access",
    tags: ["roles", "permissions", "rbac"],
    views: 112,
    helpful: 19,
    lastUpdated: new Date("2026-02-23"),
  },
  {
    id: "KB-009",
    title: "Profile Customization",
    content:
      "Personalize your experience by uploading a profile image and updating your location, occupation, and date of birth in your Profile Settings.",
    category: "profile",
    tags: ["profile", "settings", "avatar"],
    views: 87,
    helpful: 14,
    lastUpdated: new Date("2026-02-23"),
  },
  {
    id: "KB-010",
    title: "Downloading Invoices",
    content:
      "Keep track of your financial contributions. You can download PDF receipts/invoices for every payment made within the application for your personal records.",
    category: "payment",
    tags: ["invoices", "receipts", "pdf"],
    views: 176,
    helpful: 31,
    lastUpdated: new Date("2026-02-23"),
  },
];

export interface HelpdeskKnowledgeBase {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views: number;
  helpful: number;
  lastUpdated: Date;
}

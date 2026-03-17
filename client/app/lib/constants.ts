import {
  BadgeQuestionMark,
  Calendar,
  Wallet,
  HandCoins,
  LayoutDashboard,
  Settings,
  User,
  Users,
  Clock,
  CheckCheck,
  BadgeAlert,
  ClockFading,
  CircleAlert,
  X,
  HelpCircle,
  Check,
} from "lucide-react";
import type { EventData, UserData } from "./dataSchema";

export const highlightsImgs = [
  {
    id: "1",
    image:
      "https://unsplash.com/photos/n2qYTKRTBys/download?ixid=M3wxMjA3fDB8MXxhbGx8fHx8fHx8fHwxNzQ4Njk1ODk2fA&force=true&w=1920",
  },
  {
    id: "2",
    image:
      "https://unsplash.com/photos/g6i6NlucLYc/download?ixid=M3wxMjA3fDB8MXxzZWFyY2h8MzZ8fHBheW1lbnRzfGVufDB8fHx8MTc0OTY2MjA1NHww&force=true&w=1920",
  },
];

export const authFields = [
  {
    name: "name",
    label: "Name",
    type: "text",
    placeholder: "Member name",
  },
  {
    name: "email",
    label: "Email",
    type: "email",
    placeholder: "Member email",
  },
  {
    name: "newEmail",
    label: "New Email",
    type: "email",
    placeholder: "Your new email",
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    placeholder: "Your password",
  },
  {
    name: "phone",
    label: "Phone",
    type: "tel",
    placeholder: "+000(phone-number)",
  },
  {
    name: "newPassword",
    label: "New Password",
    type: "password",
    placeholder: "Your new password",
  },
  {
    name: "currentPassword",
    label: "Current Password",
    type: "password",
    placeholder: "Your current password",
  },
  {
    name: "newsletter",
    label: "I would like to receive updates and promotions",
    type: "checkbox",
    placeholder: "Subscribe to our newsletter",
  },
  {
    name: "occupation",
    label: "Occupation",
    type: "text",
    placeholder: "Your occupation",
  },
  {
    name: "location",
    label: "Location",
    type: "text",
    placeholder: "Enter location",
  },
  {
    name: "gender",
    label: "Gender",
    type: "select",
    placeholder: "Select your gender",
  },
  {
    name: "dateOfBirth",
    label: "Date of Birth",
    type: "date",
    placeholder: "Select your date of birth",
  },
  {
    name: "bank",
    label: "Bank",
    type: "select",
    placeholder: "Select your bank",
  },
  {
    name: "bankAccountNumber",
    label: "Bank Account Number",
    type: "number",
    placeholder: "Enter your bank account number",
  },
  {
    name: "bankAccountName",
    label: "Bank Account Name",
    type: "text",
    placeholder: "Enter your bank account name",
  },
  {
    name: "title",
    label: "Event title",
    type: "text",
    placeholder: "Event title",
  },
  {
    name: "description",
    label: "Description",
    type: "editor",
    placeholder: "Describe event",
  },
  {
    name: "date",
    label: "Date",
    type: "date",
    placeholder: "Select event date",
  },
  {
    name: "time",
    label: "Time",
    type: "time",
    placeholder: "Select event time",
  },
  {
    name: "eventType",
    label: "Event Type",
    type: "select",
    placeholder: "Select event type",
  },
  {
    name: "organizer",
    label: "Organizer",
    type: "command",
    placeholder: "Event organizer",
  },
  {
    name: "isPublic",
    label: "Is Public",
    type: "checkbox",
    placeholder: "Is event public?",
  },
  {
    name: "fees",
    label: "Fees: ₦(optional)",
    type: "number",
    placeholder: "Event fees",
  },
  {
    name: "paymentType",
    label: "Payment Type",
    type: "select",
    placeholder: "Select payment type",
    options: [
      { id: "donation", name: "donation" },
      { id: "event", name: "event" },
      { id: "membership_dues", name: "membership_dues" },
    ],
  },
  {
    name: "eventId",
    label: "Event - Support upcoming events",
    type: "select",
    placeholder: "Select event",
  },
  {
    name: "amount",
    label: "Amount",
    type: "number",
    placeholder: "Enter amount",
  },
  {
    name: "note",
    label: "Note (optional)",
    type: "textarea",
    placeholder: "Enter short description about the paymnent",
  },
  {
    name: "isRecurring",
    label: "Is Recurring (make this payment recurring?)",
    type: "checkbox",
    placeholder: "Is payment recurring?",
  },
];

export const ticketPriority = [
  { id: "low", name: "low" },
  { id: "medium", name: "medium" },
  { id: "high", name: "high" },
  { id: "critical", name: "critical" },
];

export const ticketCategory = [
  { id: "technical", name: "technical" },
  { id: "event", name: "event" },
  { id: "payment", name: "payment" },
  { id: "other", name: "other" },
];

export const ticketFields = [
  {
    name: "title",
    label: "Title",
    type: "text",
    placeholder: "Title",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Description",
  },
  {
    name: "priority",
    label: "Priority",
    type: "select",
    placeholder: "Priority",
    options: ticketPriority,
  },
  {
    name: "category",
    label: "Category",
    type: "select",
    placeholder: "Category",
    options: ticketCategory,
  },
];

export const sideBarLinks = [
  {
    id: "home",
    title: "Main Menu",
    children: [
      {
        name: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Members",
        href: "/members",
        icon: Users,
      },
      {
        name: "Events",
        href: "/events",
        icon: Calendar,
      },
    ],
  },
  {
    id: "finance",
    title: "Finance",
    children: [
      {
        name: "Payments",
        href: "/payments",
        icon: HandCoins,
      },
      {
        name: "Transfers",
        href: "/transfers",
        icon: Wallet,
      },
    ],
  },
  {
    id: "user",
    title: "User",
    children: [
      {
        name: "Profile",
        href: `/profile`,
        icon: User,
      },
      {
        name: "Settings",
        href: "/settings",
        icon: Settings,
      },
      {
        name: "Help Desk",
        href: "/help-desk",
        icon: BadgeQuestionMark,
      },
    ],
  },
];

export const genderData = [
  { id: "male", name: "male" },
  { id: "female", name: "female" },
  { id: "other", name: "other" },
];

export const roles = {
  member: "member",
  admin: "admin",
  super_admin: "super_admin",
} as const;

export type Role = (typeof roles)[keyof typeof roles];

export const permissions = {
  MANAGE_MEMBERS: [roles.admin, roles.super_admin],
  VIEW_REPORTS: [roles.admin, roles.super_admin],
  MANAGE_SETTINGS: [roles.super_admin, roles.admin, roles.member],
  MANAGE_EVENTS: [roles.admin, roles.super_admin],
  MANAGE_SESSIONS: [roles.super_admin],
  MANAGE_TICKETS: [roles.super_admin, roles.admin],
  ASSIGN_TICKET: [roles.super_admin],
  VIEW_PAYMENTS: [roles.admin, roles.super_admin],
} as const;

export type Permission = keyof typeof permissions;

export const memberRoleColors = {
  member:
    "border-yellow-600 bg-yellow-50 text-yellow-700 dark:border-yellow-300 dark:bg-yellow-100 dark:text-yellow-800",
  admin:
    "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-300 dark:bg-blue-100 dark:text-blue-800",
  super_admin:
    "border-red-600 bg-red-50 text-red-700 dark:border-red-300 dark:bg-red-100 dark:text-red-800",
};

export const isRoleVisible = (sessionUser: UserData, role: string) => {
  // Regular users can't see any role options
  if (sessionUser.role === "member") {
    return false;
  }
  // Admins can see user and admin roles
  if (sessionUser.role === "admin") {
    return ["member", "admin"].includes(role);
  }
  // Super admins can see all roles
  if (sessionUser.role === "super_admin") {
    return true;
  }

  return false;
};

export const canModifyRole = (
  sessionUser: UserData,
  targetRole: string,
  targetUser: UserData,
) => {
  // No one can modify super_admin users (except for specific cases handled below)
  if (targetUser.role === "super_admin") {
    // Super admins can modify other super admins (for demotion), but not themselves
    return (
      sessionUser.role === "super_admin" && sessionUser.id !== targetUser.id
    );
  }
  // Regular users can't modify any roles
  if (sessionUser.role === "member") {
    return false;
  }
  // Admins can modify user and admin roles (but not super_admin, handled above)
  if (sessionUser.role === "admin") {
    return ["member", "admin"].includes(targetRole);
  }

  // Super admins can modify any role (except downgrading themselves)
  if (sessionUser.role === "super_admin") {
    return true;
  }
  return false;
};

export const eventTypes = [
  { name: "meeting", id: "meeting" },
  { name: "birthday", id: "birthday" },
  { name: "announcement", id: "announcement" },
  { name: "other", id: "other" },
];
export const eventStatus = [
  { value: "upcoming", label: "Upcoming" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

export const updateProgress = (status: EventData["status"]) => {
  switch (status) {
    case "upcoming":
      return 25;
    case "ongoing":
      return 50;
    case "completed":
      return 100;
    case "cancelled":
      return 0;
    default:
      return 0;
  }
};

export const getStatusColor = (status: EventData["status"]) => {
  switch (status) {
    case "upcoming":
      return "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-300 dark:bg-blue-100 dark:text-blue-800";
    case "completed":
      return "border-green-600 bg-green-50 text-green-700 dark:border-green-300 dark:bg-green-100 dark:text-green-800";
    case "ongoing":
      return "border-yellow-600 bg-yellow-50 text-yellow-700 dark:border-yellow-300 dark:bg-yellow-100 dark:text-yellow-800";
    case "cancelled":
      return "border-red-600 bg-red-50 text-red-700 dark:border-red-300 dark:bg-red-100 dark:text-red-800";
    default:
      return "border-muted-foreground/20 bg-muted text-muted-foreground";
  }
};

export const getStatusIcon = (status: EventData["status"]) => {
  switch (status) {
    case "upcoming":
      return Clock;
    case "ongoing":
      return ClockFading;
    case "completed":
      return CheckCheck;
    default:
      return BadgeAlert;
  }
};

export const getPriorityColor = (priority: EventData["status"]) => {
  switch (priority) {
    case "upcoming":
      return "text-yellow-500";
    case "ongoing":
      return "text-blue-500";
    case "completed":
      return "text-green-500";
    default:
      return "text-red-500";
  }
};

export const getProgressColor = (status: EventData["status"]) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-500";
    case "ongoing":
      return "bg-yellow-500";
    case "completed":
      return "bg-green-500";
    case "cancelled":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

export const getEventTypeColor = (eventType: EventData["eventType"]) => {
  switch (eventType) {
    case "meeting":
      return "bg-blue-400 text-black";
    case "announcement":
      return "bg-green-400 text-black";
    case "birthday":
      return "bg-red-400 text-black";
    case "other":
      return "bg-gray-400 text-black";
    default:
      return "bg-red-400";
  }
};

export const getBGColor = (status: EventData["status"]) => {
  switch (status) {
    case "upcoming":
      return "bg-blue-500/5 dark:bg-blue-300/10 border-blue-500/20 dark:border-blue-500/30";
    case "ongoing":
      return "bg-amber-500/5 dark:bg-amber-300/10 border-amber-500/20 dark:border-amber-500/30";
    case "completed":
      return "bg-emerald-500/5 dark:bg-emerald-500/10 border-emerald-500/20 dark:border-emerald-500/30";
    default:
      return "bg-muted/50 border-border";
  }
};

export const getTicketStatusColor = (status: string) => {
  switch (status) {
    case "open":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "in-progress":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "resolved":
      return "bg-green-100 text-green-700 border-green-200";
    case "closed":
      return "bg-gray-100 text-gray-700 border-gray-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};

export const getTicketStatusIcon = (status: string) => {
  switch (status) {
    case "open":
      return CircleAlert;
    case "in-progress":
      return Clock;
    case "resolved":
      return Check;
    case "closed":
      return X;
    default:
      return HelpCircle;
  }
};

export const paymentStatusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-700 border-gray-200",
};

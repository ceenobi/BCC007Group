import { safeGetItem, safeSetItem } from "~/lib/storage";

export interface AppNotification {
  id: string;
  type: "ticket" | "event" | "payment" | "member";
  title: string;
  description: string;
  timestamp: Date;
  isRead: boolean;
  link?: string;
}

type Listener = (notifications: AppNotification[]) => void;

const NOTIFICATIONS_KEY = "bccpay_notifications";

// Load initial state from localStorage
let notifications: AppNotification[] = [];
try {
  const saved = safeGetItem(NOTIFICATIONS_KEY);
  if (saved) {
    notifications = JSON.parse(saved).map((n: any) => ({
      ...n,
      timestamp: new Date(n.timestamp), // Convert string back to Date
    }));
  }
} catch (e) {
  console.error("Failed to load notifications from storage", e);
}

const listeners: Set<Listener> = new Set();

const saveAndNotify = () => {
  safeSetItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
  listeners.forEach((l) => l([...notifications]));
};

export const notificationStore = {
  getNotifications: () => [...notifications],

  addNotification: (
    notification: Omit<AppNotification, "id" | "timestamp" | "isRead">,
  ) => {
    const newNotification: AppNotification = {
      ...notification,
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      isRead: false,
    };
    notifications = [newNotification, ...notifications].slice(0, 20); // Keep last 20
    saveAndNotify();
  },

  markAsRead: (id: string) => {
    notifications = notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n,
    );
    saveAndNotify();
  },

  markAllAsRead: () => {
    notifications = notifications.map((n) => ({ ...n, isRead: true }));
    saveAndNotify();
  },

  clearAll: () => {
    notifications = [];
    saveAndNotify();
  },

  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

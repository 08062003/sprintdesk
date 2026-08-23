import { create } from 'zustand';
import type { NotificationType } from '../types';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  source: 'system' | 'api';
}

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: number;
  lastPollTimestamp: number | null;
  isPolling: boolean;
  isPanelOpen: boolean;
  
  // Actions
  addNotification: (notification: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  setPanelOpen: (isOpen: boolean) => void;
  setPolling: (isPolling: boolean) => void;
  setLastPollTimestamp: (timestamp: number) => void;
  
  // Persistence
  saveToStorage: () => void;
  loadFromStorage: () => void;
}

// Simulated local storage for notifications
const notificationStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Silently fail if localStorage is not available
    }
  },
  removeItem: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Silently fail if localStorage is not available
    }
  }
};

const STORAGE_KEY = 'sprintdesk_notifications';

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  lastPollTimestamp: null,
  isPolling: false,
  isPanelOpen: false,

  addNotification: (notification) => {
    const newNotification: AppNotification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };

    set((state) => {
      const updatedNotifications = [newNotification, ...state.notifications];
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    });

    get().saveToStorage();
  },

  markAsRead: (id) => {
    set((state) => {
      const updatedNotifications = state.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    });

    get().saveToStorage();
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    }));

    get().saveToStorage();
  },

  deleteNotification: (id) => {
    set((state) => {
      const updatedNotifications = state.notifications.filter(n => n.id !== id);
      return {
        notifications: updatedNotifications,
        unreadCount: updatedNotifications.filter(n => !n.read).length,
      };
    });

    get().saveToStorage();
  },

  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });

    get().saveToStorage();
  },

  setPanelOpen: (isOpen) => {
    set({ isPanelOpen: isOpen });
  },

  setPolling: (isPolling) => {
    set({ isPolling });
  },

  setLastPollTimestamp: (timestamp) => {
    set({ lastPollTimestamp: timestamp });
  },

  saveToStorage: () => {
    const { notifications } = get();
    notificationStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  },

  loadFromStorage: () => {
    const stored = notificationStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const notifications = JSON.parse(stored);
        set({
          notifications,
          unreadCount: notifications.filter((n: AppNotification) => !n.read).length,
        });
      } catch (error) {
        console.error('Failed to load notifications from storage:', error);
      }
    }
  },
}));

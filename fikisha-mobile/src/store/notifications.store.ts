import { create } from 'zustand';
import { NotificationItem } from '@/types';

interface NotificationsState {
  notifications: NotificationItem[];
  setNotifications: (items: NotificationItem[]) => void;
  prependNotification: (item: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],

  setNotifications: (items) => set({ notifications: items }),

  // Used for instant local feedback when a websocket event arrives; the
  // authoritative copy (with its real id) replaces this the next time the
  // notifications screen fetches from the server.
  prependNotification: (item) =>
    set((state) => ({
      notifications: [
        {
          id: `local-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          isRead: false,
          createdAt: new Date().toISOString(),
          ...item,
        },
        ...state.notifications,
      ],
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((item) => ({ ...item, isRead: true })),
    })),

  clearNotifications: () => set({ notifications: [] }),
}));

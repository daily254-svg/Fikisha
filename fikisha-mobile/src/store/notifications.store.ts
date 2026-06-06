import { create } from 'zustand';
import { NotificationItem } from '@/types';

interface NotificationsState {
  notifications: NotificationItem[];
  addNotification: (notification: Omit<NotificationItem, 'id' | 'date' | 'time' | 'read'>) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          type: notification.type,
          title: notification.title,
          body: notification.body,
          date: notification.date || new Date().toLocaleDateString(),
          time: notification.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          read: false,
        },
        ...state.notifications,
      ],
    })),
  markAllRead: () => set((state) => ({
    notifications: state.notifications.map((item) => ({ ...item, read: true })),
  })),
  clearNotifications: () => set({ notifications: [] }),
}));

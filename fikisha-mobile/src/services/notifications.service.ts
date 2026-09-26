import { get, patch } from './api';
import { ENDPOINTS } from '@/constants/api';
import type { NotificationItem } from '@/types';

export const notificationsService = {
  getMine: (limit = 50): Promise<{ data: NotificationItem[] }> =>
    get(ENDPOINTS.notifications.mine, { limit }),

  markAllRead: (): Promise<{ data: { message: string } }> =>
    patch(ENDPOINTS.notifications.readAll),
};

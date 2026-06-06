import * as Notifications from 'expo-notifications';

export function getNotificationData(
  notification: Notifications.Notification,
): Record<string, unknown> {
  return (notification.request.content.data ?? {}) as Record<string, unknown>;
}

export function getNotificationType(
  notification: Notifications.Notification,
): string | null {
  const data = getNotificationData(notification);
  return (data.type as string) ?? null;
}

export function getNotificationBusId(
  notification: Notifications.Notification,
): string | null {
  const data = getNotificationData(notification);
  return (data.busId as string) ?? null;
}

export function getNotificationStopId(
  notification: Notifications.Notification,
): string | null {
  const data = getNotificationData(notification);
  return (data.stopId as string) ?? null;
}

export function getNotificationStudentId(
  notification: Notifications.Notification,
): string | null {
  const data = getNotificationData(notification);
  return (data.studentId as string) ?? null;
}

export function getNotificationDistance(
  notification: Notifications.Notification,
): number | null {
  const data = getNotificationData(notification);
  const d = data.distanceMeters;
  return d ? Number(d) : null;
}
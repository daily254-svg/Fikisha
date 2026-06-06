import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { authService } from './auth.service';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationsService = {
  registerForPushNotifications: async (): Promise<string | null> => {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Push notification permission denied');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    await authService.updateFcmToken(token);

    return token;
  },

  setupNotificationListeners: (
    onNotification: (notification: Notifications.Notification) => void,
    onResponse: (response: Notifications.NotificationResponse) => void,
  ) => {
    const notificationListener =
      Notifications.addNotificationReceivedListener(onNotification);

    const responseListener =
      Notifications.addNotificationResponseReceivedListener(onResponse);

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  },
};
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { store } from '@/store/store';
import { notificationsApi } from '@/store/notificationsApi';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let currentToken: string | null = null;

/**
 * Requests permission and registers this device's Expo push token with the
 * backend. No-ops (with a console warning) if the EAS project isn't
 * configured yet — same defensive fallback style as MailService when
 * RESEND_API_KEY is unset, so push simply doesn't fire until `eas init`
 * (or an equivalent projectId setup) is done, instead of crashing the app.
 */
export async function registerForPushNotifications(): Promise<void> {
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) {
    console.warn(
      'No EAS projectId configured (app.json extra.eas.projectId) — skipping push token registration.',
    );
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    currentToken = token;
    await store.dispatch(
      notificationsApi.endpoints.registerPushToken.initiate({ token }),
    );
  } catch (err) {
    console.warn('Failed to register push token', err);
  }
}

export async function unregisterPushNotifications(): Promise<void> {
  if (!currentToken) {
    return;
  }
  try {
    await store.dispatch(
      notificationsApi.endpoints.unregisterPushToken.initiate({ token: currentToken }),
    );
  } catch (err) {
    console.warn('Failed to unregister push token', err);
  } finally {
    currentToken = null;
  }
}

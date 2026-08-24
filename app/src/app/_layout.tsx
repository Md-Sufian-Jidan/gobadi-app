import { DarkTheme, DefaultTheme, ThemeProvider, Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { store, bootstrapAuth } from '@/store/store';
import type { RootState } from '@/store/store';
import { socketManager } from '@/lib/socket-manager';
import { registerForPushNotifications, unregisterPushNotifications } from '@/lib/push-notifications';
import { ErrorBoundary } from '@/components/error-boundary';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { user, isBootstrapping } = useSelector((state: RootState) => state.auth);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      socketManager.connect();
      registerForPushNotifications();
    } else {
      socketManager.disconnect();
      unregisterPushNotifications();
    }
  }, [user]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener(() => {
      router.push('/notifications');
    });
    return () => subscription.remove();
  }, [router]);

  if (isBootstrapping) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="index" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="login" />
        <Stack.Screen name="forgot" />
        <Stack.Screen name="reset-password" />
        <Stack.Screen name="congo" />
      </Stack.Protected>

      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Screen name="animal-details" />
      <Stack.Screen name="my-animal-detail" />
      <Stack.Screen name="search" />
      <Stack.Screen name="add-animal" />
      <Stack.Screen name="ai-scan" />
      <Stack.Screen name="ai-hold" />
      <Stack.Screen name="ai-summary" />
      <Stack.Screen name="all-doctors" />
      <Stack.Screen name="doctor-detail" />
      <Stack.Screen name="book-slot" />
      <Stack.Screen name="confirm-pay" />
      <Stack.Screen name="payment-method" />
      <Stack.Screen name="bkash-number" />
      <Stack.Screen name="payment-success" />
      <Stack.Screen name="billing-details" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="video-call" />
      <Stack.Screen name="my-treatment" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="order-success" />
      <Stack.Screen name="animal-billing-details" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="wishlist" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="notification-preferences" />
      <Stack.Screen name="book-animal" />
      <Stack.Screen name="booking-payment" />
      <Stack.Screen name="booking-bkash-number" />
      <Stack.Screen name="edit-profile" />
      <Stack.Screen name="profile-details" />
      <Stack.Screen name="profile-edit" />
      <Stack.Screen name="my-task" />
      <Stack.Screen name="add-task" />
      <Stack.Screen name="edit-task" />
      <Stack.Screen name="my-orders" />
      <Stack.Screen name="medical-records" />
      <Stack.Screen name="add-listing" />
      <Stack.Screen name="refer-earn" />
      <Stack.Screen name="help-support" />
      <Stack.Screen name="faqs" />
      <Stack.Screen name="contact-support" />
      <Stack.Screen name="report-issues" />
      <Stack.Screen name="subscription" />
      <Stack.Screen name="select-language" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="payment-methods" />
      <Stack.Screen name="add-payment-method" />
      <Stack.Screen name="otp-verification" />
      <Stack.Screen name="schedule" />
      <Stack.Screen name="calendar-settings" />
      <Stack.Screen name="working-hours" />
      <Stack.Screen name="block-time-off" />
    </Stack>
  );
}
export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    bootstrapAuth();
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <Provider store={store}>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <AnimatedSplashOverlay />
            <RootNavigator />
          </ThemeProvider>
        </Provider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

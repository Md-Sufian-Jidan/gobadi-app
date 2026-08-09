import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
} from '@/store/notificationsApi';
import { EmptyState } from '@/components/ui/empty-state';
import { RowSkeleton } from '@/components/ui/skeleton';

const TYPE_ICONS: Record<string, string> = {
  order: '📦',
  booking: '📅',
  payment: '💳',
  delivery: '🚚',
  reminder: '⏰',
  ai_ready: '🩺',
  prescription_ready: '💊',
  promotion: '🏷️',
  system: '🔔',
  message: '💬',
  referral: '🎁',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { data: notifications = [], isLoading } = useGetNotificationsQuery();
  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          style={styles.markAllBtn}
          disabled={!hasUnread}
          onPress={() => markAllRead()}
          activeOpacity={0.7}
        >
          <Text style={[styles.markAllText, !hasUnread && { opacity: 0.4 }]}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.listContainer}>
            <RowSkeleton />
            <RowSkeleton />
            <RowSkeleton />
          </View>
        </ScrollView>
      ) : notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <EmptyState title="You're all caught up" description="No notifications right now." />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.listContainer}>
            {notifications.map((n) => (
              <TouchableOpacity
                key={n.id}
                style={[styles.notificationCard, !n.isRead && styles.notificationCardUnread]}
                activeOpacity={0.85}
                onPress={() => !n.isRead && markRead(n.id)}
              >
                <Text style={styles.notificationIcon}>{TYPE_ICONS[n.type] || '🔔'}</Text>
                <View style={styles.notificationBody}>
                  <Text style={styles.notificationTitle}>{n.title}</Text>
                  <Text style={styles.notificationText} numberOfLines={2}>{n.body}</Text>
                  <Text style={styles.notificationTime}>{new Date(n.createdAt).toLocaleString()}</Text>
                </View>
                {!n.isRead && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 20,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: '700' },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#1A1817' },
  markAllBtn: { paddingHorizontal: 4, paddingVertical: 8 },
  markAllText: { fontSize: 12, fontWeight: '700', color: '#BD632F' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  listContainer: { gap: 12 },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 14,
  },
  notificationCardUnread: {
    backgroundColor: '#FFF8F4',
    borderColor: '#F0D6C4',
  },
  notificationIcon: { fontSize: 20, marginRight: 12 },
  notificationBody: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: '700', color: '#1A1817', marginBottom: 2 },
  notificationText: { fontSize: 12, color: '#7C7672', marginBottom: 4 },
  notificationTime: { fontSize: 10, color: '#9C9690' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BD632F',
    marginLeft: 8,
    marginTop: 4,
  },
});

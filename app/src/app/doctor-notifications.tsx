import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type FilterTab = 'all' | 'appointments' | 'patients' | 'messages';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: any;
  iconBg: string;
  iconColor: string;
}

const MOCK_NOTIFICATIONS: Record<string, { today: NotificationItem[]; thisWeek: NotificationItem[] }> = {
  all: {
    today: [
      { id: '1', title: 'Appointment Starting Soon', description: 'Appointment with Rahim\'s Cow', time: 'Today, 9:15 AM', icon: require('@/assets/images/doctor.png'), iconBg: '#FFF2EB', iconColor: '#BD632F' },
      { id: '2', title: 'New Consultation Request', description: 'A farmer requested a consultation for a sick cow.', time: 'Today, 8:00 AM', icon: require('@/assets/images/doctor.png'), iconBg: '#FFF2EB', iconColor: '#BD632F' },
    ],
    thisWeek: [
      { id: '3', title: 'Patient Follow-up Due', description: 'Follow-up consultation for Donald Tramp is due today.', time: 'Mon, 8:00 PM', icon: 'checkmark-circle', iconBg: '#E8F5E9', iconColor: '#4CAF50' },
    ],
  },
  appointments: {
    today: [
      { id: '1', title: 'Appointment Starting Soon', description: 'Appointment with Rahim\'s Cow', time: 'Today, 9:15 AM', icon: require('@/assets/images/doctor.png'), iconBg: '#FFF2EB', iconColor: '#BD632F' },
    ],
    thisWeek: [],
  },
  patients: {
    today: [
      { id: '2', title: 'New Consultation Request', description: 'A farmer requested a consultation for a sick cow.', time: 'Today, 8:00 AM', icon: require('@/assets/images/doctor.png'), iconBg: '#FFF2EB', iconColor: '#BD632F' },
    ],
    thisWeek: [
      { id: '3', title: 'Patient Follow-up Due', description: 'Follow-up consultation for Donald Tramp is due today.', time: 'Mon, 8:00 PM', icon: 'checkmark-circle', iconBg: '#E8F5E9', iconColor: '#4CAF50' },
    ],
  },
  messages: {
    today: [
      { id: '2', title: 'New Consultation Request', description: 'A farmer requested a consultation for a sick cow.', time: 'Today, 8:00 AM', icon: require('@/assets/images/doctor.png'), iconBg: '#FFF2EB', iconColor: '#BD632F' },
    ],
    thisWeek: [],
  },
};

export default function DoctorNotificationsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const filteredNotifications = MOCK_NOTIFICATIONS[activeTab] || MOCK_NOTIFICATIONS.all;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => router.push('/doctor-notification-preferences')} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabRow}>
        {(['all', 'appointments', 'patients', 'messages'] as FilterTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {filteredNotifications.today.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Today</Text>
            {filteredNotifications.today.map((item) => (
              <View key={item.id} style={styles.notificationCard}>
                {typeof item.icon === 'number' ? (
                  <Image source={item.icon} style={styles.notifAvatar} />
                ) : (
                  <View style={[styles.notifIcon, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                  </View>
                )}
                <View style={styles.notifInfo}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifDesc}>{item.description}</Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </>
        )}

        {filteredNotifications.thisWeek.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>This Week</Text>
            {filteredNotifications.thisWeek.map((item) => (
              <View key={item.id} style={styles.notificationCard}>
                {typeof item.icon === 'number' ? (
                  <Image source={item.icon} style={styles.notifAvatar} />
                ) : (
                  <View style={[styles.notifIcon, { backgroundColor: item.iconBg }]}>
                    <Ionicons name={item.icon as any} size={20} color={item.iconColor} />
                  </View>
                )}
                <View style={styles.notifInfo}>
                  <Text style={styles.notifTitle}>{item.title}</Text>
                  <Text style={styles.notifDesc}>{item.description}</Text>
                  <Text style={styles.notifTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1817' },
  settingsBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E6E1DC' },
  tabActive: { backgroundColor: '#FFFFFF', borderColor: '#BD632F' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#9C9690' },
  tabTextActive: { color: '#BD632F' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1817', marginBottom: 12 },
  notificationCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', padding: 14, marginBottom: 10, gap: 12 },
  notifAvatar: { width: 40, height: 40, borderRadius: 20 },
  notifIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#1A1817', marginBottom: 2 },
  notifDesc: { fontSize: 12, fontWeight: '500', color: '#7C7672', marginBottom: 4 },
  notifTime: { fontSize: 11, fontWeight: '500', color: '#9C9690' },
});

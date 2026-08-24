import React, { useState } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type FilterTab = 'all' | 'appointments' | 'patients' | 'messages';

interface NotifPreference {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  enabled: boolean;
}

export default function NotificationPreferencesScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [preferences, setPreferences] = useState<NotifPreference[]>([
    { id: '1', title: 'Appointments Reminders', description: 'Get notified about upcoming appointments', icon: 'calendar', iconBg: '#FFF2EB', iconColor: '#BD632F', enabled: true },
    { id: '2', title: 'Patient Messages', description: 'Get notified when patients send messages', icon: 'chatbubbles', iconBg: '#FFF2EB', iconColor: '#BD632F', enabled: true },
    { id: '3', title: 'Follow-up Reminders', description: 'Reminders for scheduled follow-ups', icon: 'notifications', iconBg: '#FFF2EB', iconColor: '#BD632F', enabled: true },
    { id: '4', title: 'Hygiene Reminder', description: 'Get notified about consultation payments', icon: 'medkit', iconBg: '#E8F5E9', iconColor: '#4CAF50', enabled: true },
    { id: '5', title: 'System Updates', description: 'Important updates from the platform', icon: 'hardware-chip', iconBg: '#F5F2EC', iconColor: '#7C7672', enabled: false },
  ]);

  const togglePreference = (id: string) => {
    setPreferences((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
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
        {preferences.map((pref) => (
          <View key={pref.id} style={styles.prefCard}>
            <View style={styles.prefLeft}>
              <View style={[styles.prefIcon, { backgroundColor: pref.iconBg }]}>
                <Ionicons name={pref.icon as any} size={20} color={pref.iconColor} />
              </View>
              <View style={styles.prefInfo}>
                <Text style={styles.prefTitle}>{pref.title}</Text>
                <Text style={styles.prefDesc}>{pref.description}</Text>
              </View>
            </View>
            <Switch
              value={pref.enabled}
              onValueChange={() => togglePreference(pref.id)}
              trackColor={{ true: '#BD632F', false: '#E6E1DC' }}
              thumbColor="#FFFFFF"
            />
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1817' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E6E1DC' },
  tabActive: { backgroundColor: '#FFFFFF', borderColor: '#BD632F' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#9C9690' },
  tabTextActive: { color: '#BD632F' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  prefCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', padding: 14, marginBottom: 10 },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  prefIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  prefInfo: { flex: 1 },
  prefTitle: { fontSize: 14, fontWeight: '700', color: '#1A1817', marginBottom: 2 },
  prefDesc: { fontSize: 11, fontWeight: '500', color: '#7C7672' },
});

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
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const router = useRouter();

  const menuItems = [
    { id: 'personal', label: 'Personal Information', icon: 'person-outline' as const, route: '/profile-details' },
    { id: 'notification', label: 'Notification', icon: 'notifications-outline' as const, route: '/notifications' },
    { id: 'language', label: 'Language', icon: 'language-outline' as const, route: '/select-language' },
    { id: 'help', label: 'Help & Support', icon: 'help-circle-outline' as const, route: '/help-support' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Profile</Text>

        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorInfoRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#BD632F" />
              </View>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>Dr. David Patel</Text>
              <Text style={styles.doctorSpecialty}>Veterinary Surgery</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>4.8 (141 reviews)</Text>
              </View>
              <Text style={styles.doctorLocation}>Cardiology Center, USA</Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>248</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>423</Text>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1 yrs</Text>
              <Text style={styles.statLabel}>Years Experience</Text>
            </View>
          </View>
        </View>

        {/* Wallet */}
        <Text style={styles.sectionTitle}>Wallet</Text>
        <TouchableOpacity style={styles.walletCard} activeOpacity={0.85} onPress={() => router.push('/wallet')}>
          <View style={styles.walletLeft}>
            <View style={styles.walletIcon}>
              <Ionicons name="wallet-outline" size={20} color="#BD632F" />
            </View>
            <Text style={styles.walletLabel}>Total Earnings</Text>
          </View>
          <View style={styles.walletRight}>
            <Text style={styles.walletAmount}>$99.00</Text>
            <Ionicons name="chevron-forward" size={18} color="#9C9690" />
          </View>
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, idx < menuItems.length - 1 && styles.menuItemBorder]}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconCircle}>
                  <Ionicons name={item.icon} size={20} color="#BD632F" />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9C9690" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  scrollContainer: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 100 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1817', marginBottom: 16 },
  doctorCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E6E1DC', padding: 16, marginBottom: 20 },
  doctorInfoRow: { flexDirection: 'row', marginBottom: 16 },
  avatarContainer: { position: 'relative', marginRight: 14 },
  avatarPlaceholder: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#FFFFFF' },
  doctorDetails: { flex: 1 },
  doctorName: { fontSize: 17, fontWeight: '800', color: '#1A1817', marginBottom: 2 },
  doctorSpecialty: { fontSize: 13, fontWeight: '500', color: '#7C7672', marginBottom: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  ratingText: { fontSize: 12, fontWeight: '600', color: '#7C7672' },
  doctorLocation: { fontSize: 12, fontWeight: '500', color: '#9C9690' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0ECE8', paddingTop: 14 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 18, fontWeight: '800', color: '#1A1817', marginBottom: 2 },
  statLabel: { fontSize: 11, fontWeight: '500', color: '#9C9690' },
  statDivider: { width: 1, backgroundColor: '#F0ECE8' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1817', marginBottom: 10 },
  walletCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E6E1DC', padding: 14, marginBottom: 20 },
  walletLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  walletIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center' },
  walletLabel: { fontSize: 14, fontWeight: '600', color: '#1A1817' },
  walletRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  walletAmount: { fontSize: 16, fontWeight: '800', color: '#BD632F' },
  menuContainer: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E6E1DC', overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F0ECE8' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center' },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#1A1817' },
});

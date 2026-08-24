import React from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import { logout } from '@/store/authApi';
import { useGetAnimalsQuery } from '@/store/animalsApi';
import type { RootState } from '@/store/store';

interface AnimalStats {
  cow: number;
  goat: number;
  buffalo: number;
}

function countByBreed(animals: Array<{ breed: string }>): AnimalStats {
  const stats: AnimalStats = { cow: 0, goat: 0, buffalo: 0 };
  for (const a of animals) {
    const breed = a.breed.toLowerCase();
    if (breed.includes('cow')) stats.cow += 1;
    else if (breed.includes('goat')) stats.goat += 1;
    else if (breed.includes('buffalo')) stats.buffalo += 1;
  }
  return stats;
}

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: animals = [] } = useGetAnimalsQuery();
  const stats = countByBreed(animals);

  const menuItems: Array<{
    id: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    route: any;
  }> = [
      { id: '1', label: 'My Task', icon: 'calendar-outline', route: '/my-task' },
      { id: '2', label: 'Notification', icon: 'notifications-outline', route: '/notifications' },
      { id: '3', label: 'Language', icon: 'language-outline', route: '/select-language' },
      { id: '4', label: 'Refer & Earn', icon: 'gift-outline', route: '/refer-earn' },
      { id: '5', label: 'Help & Support', icon: 'headset-outline', route: '/help-support' },
      { id: '6', label: 'My Orders', icon: 'cube-outline', route: '/my-orders' },
      { id: '7', label: 'Medical Records', icon: 'medical-outline', route: '/medical-records' },
    ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.headerTitle}>Profile</Text>

        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfoRow}>
            <Image
              source={require('@/assets/images/user_profile.png')}
              style={styles.avatar}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{user?.name || user?.phone || 'Farmer'}</Text>
              <Text style={styles.userSubtitle} numberOfLines={1}>
                {user?.phone || ''}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.8}
            >
              <Text style={styles.editText}>Edit</Text>
              <Ionicons name="pencil-outline" size={13} color="#1A1817" style={{ marginLeft: 3 }} />
            </TouchableOpacity>
          </View>

          <View style={styles.dashedDivider} />

          {/* Stats Boxes */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, styles.statBoxBlue]}>
              <Text style={[styles.statNumber, styles.statNumberBlue]}>
                {String(stats.cow || 0).padStart(2, '0')}
              </Text>
              <Text style={styles.statLabel}>Cow</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxOrange]}>
              <Text style={[styles.statNumber, styles.statNumberOrange]}>
                {String(stats.goat || 0).padStart(2, '0')}
              </Text>
              <Text style={styles.statLabel}>Goat</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxPink]}>
              <Text style={[styles.statNumber, styles.statNumberPink]}>
                {String(stats.buffalo || 0).padStart(2, '0')}
              </Text>
              <Text style={styles.statLabel}>Buffalo</Text>
            </View>
          </View>
        </View>

        {/* Current Plan Card */}
        <TouchableOpacity
          style={styles.planCard}
          onPress={() => router.push('/subscription')}
          activeOpacity={0.85}
        >
          <View style={styles.planDetails}>
            <Text style={styles.planLabel}>Current Plan</Text>
            <Text style={styles.planCost}>$99.00</Text>
            <Text style={styles.planBilling}>
              Next Billing : <Text style={{ fontWeight: '700' }}>Oct 15, 2026</Text>
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#7C7672" />
        </TouchableOpacity>

        {/* Menu Items List */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, idx) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItemRow,
                idx < menuItems.length - 1 && styles.menuItemDashedBorder,
              ]}
              onPress={() => item.route && router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconCircle}>
                  <Ionicons name={item.icon} size={20} color="#BD632F" />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9C9690" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={async () => {
            await logout(dispatch);
            router.replace('/');
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color="#E53935" style={{ marginRight: 6 }} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 110,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 20,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 2,
  },
  userSubtitle: {
    fontSize: 12,
    color: '#7C7672',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F2EC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1817',
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderStyle: 'dashed',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statBoxBlue: {
    backgroundColor: '#EDF4FE',
    borderColor: '#B8D4FC',
  },
  statBoxOrange: {
    backgroundColor: '#FFF2EB',
    borderColor: '#FCD2C1',
  },
  statBoxPink: {
    backgroundColor: '#FFF0F5',
    borderColor: '#FCCCDD',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statNumberBlue: {
    color: '#2B6CB0',
  },
  statNumberOrange: {
    color: '#BD632F',
  },
  statNumberPink: {
    color: '#D53F8C',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C7672',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  planDetails: {
    flex: 1,
  },
  planLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C7672',
    marginBottom: 4,
  },
  planCost: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 4,
  },
  planBilling: {
    fontSize: 11,
    color: '#7C7672',
    fontWeight: '500',
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  menuItemDashedBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E6E1DC',
    borderStyle: 'dashed',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1817',
  },
  signOutButton: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderColor: '#E53935',
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  signOutText: {
    color: '#E53935',
    fontSize: 15,
    fontWeight: '700',
  },
});

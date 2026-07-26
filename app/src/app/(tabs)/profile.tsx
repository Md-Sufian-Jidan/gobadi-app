import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';

import { logout } from '@/store/authApi';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();

  const menuItems = [
    { id: '1', label: 'My Task', icon: '📈', route: '/my-task' },
    { id: '2', label: 'Notification', icon: '🔔', route: null },
    { id: '3', label: 'Language', icon: '🔤', route: null },
    { id: '4', label: 'Refer & Earn', icon: '🎁', route: null },
    { id: '5', label: 'Help Support', icon: '🎧', route: null },
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
              <Text style={styles.userName}>Michal Wilson</Text>
              <Text style={styles.userSubtitle} numberOfLines={1}>
                Holding No. 105/19K, Maji...
              </Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.8}
            >
              <Text style={styles.editText}>Edit ✏️</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={[styles.statBox, styles.statBoxBlue]}>
              <Text style={[styles.statNumber, styles.statNumberBlue]}>03</Text>
              <Text style={styles.statLabel}>Cow</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxOrange]}>
              <Text style={[styles.statNumber, styles.statNumberOrange]}>12</Text>
              <Text style={styles.statLabel}>Goat</Text>
            </View>
            <View style={[styles.statBox, styles.statBoxPink]}>
              <Text style={[styles.statNumber, styles.statNumberPink]}>06</Text>
              <Text style={styles.statLabel}>Buffalo</Text>
            </View>
          </View>
        </View>

        {/* Subscription Plan Card */}
        <TouchableOpacity style={styles.planCard} activeOpacity={0.9}>
          <View style={styles.planDetails}>
            <Text style={styles.planLabel}>Current Plan</Text>
            <Text style={styles.planCost}>$99.00</Text>
            <Text style={styles.planBilling}>Next Billing : Oct 15, 2026</Text>
          </View>
          <Text style={styles.planChevron}>❯</Text>
        </TouchableOpacity>

        {/* Menu List */}
        <View style={styles.menuList}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => item.route && router.push(item.route as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={styles.menuIconContainer}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Text style={styles.menuChevron}>❯</Text>
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
    paddingTop: 24,
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
    borderRadius: 28,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  userSubtitle: {
    fontSize: 12,
    color: '#9C9690',
  },
  editButton: {
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  editText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1817',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#FAF9F6',
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statBoxBlue: {
    backgroundColor: '#F3F6FF',
    borderColor: '#D4E2FF',
  },
  statBoxOrange: {
    backgroundColor: '#FFF7F3',
    borderColor: '#FFE3D4',
  },
  statBoxPink: {
    backgroundColor: '#FFF2F6',
    borderColor: '#FFD4E2',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  statNumberBlue: {
    color: '#1976D2',
  },
  statNumberOrange: {
    color: '#BD632F',
  },
  statNumberPink: {
    color: '#D81B60',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#7C7672',
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F2F6FC',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D2E2FA',
    padding: 20,
    marginBottom: 20,
  },
  planDetails: {
    flex: 1,
  },
  planLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#657786',
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
    color: '#657786',
    fontWeight: '500',
  },
  planChevron: {
    fontSize: 14,
    color: '#BD632F',
    fontWeight: '700',
  },
  menuList: {
    gap: 12,
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 20,
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF8F4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 16,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  menuChevron: {
    fontSize: 12,
    color: '#9C9690',
  },
  signOutButton: {
    borderWidth: 1.5,
    borderColor: '#E53935',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signOutText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '700',
  },
});

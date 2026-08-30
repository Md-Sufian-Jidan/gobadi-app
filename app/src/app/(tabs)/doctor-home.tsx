import React from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import { useGetDoctorBookingsQuery } from '@/store/doctorPortalApi';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
}

function formatBookingTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

const QUICK_TILES = [
  { id: 'appointments', label: 'Appointments', icon: 'calendar-outline' as const, route: '/doctor-bookings' },
  { id: 'schedule', label: 'Schedule', icon: 'time-outline' as const, route: '/schedule' },
  { id: 'patients', label: 'Patients', icon: 'people-outline' as const, route: '/patient-details' },
  { id: 'discount', label: 'Apply Discount', icon: 'pricetag-outline' as const, route: '/apply-discount' },
];

export default function DoctorHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: bookings = [], isLoading } = useGetDoctorBookingsQuery();

  const ongoingPatients = bookings.filter(
    (b) => b.status === 'CONFIRMED' || b.status === 'RESCHEDULED'
  );
  const completedToday = bookings.filter((b) => b.status === 'COMPLETED').length;
  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const totalConsults = bookings.length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#BD632F" translucent />
      {/* Orange Header Banner */}
      <View style={styles.headerBannerWrapper}>
        <ImageBackground
          source={require('@/assets/Top BG.png')}
          style={[styles.headerBanner, { paddingTop: insets.top + 16 }]}
          resizeMode="cover"
        >
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>{getGreeting()}</Text>
              <Text style={styles.doctorName}>Dr. {user?.name || 'Nirmala Azalea'}</Text>
            </View>

            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.langPill}
                onPress={() => router.push('/select-language')}
                activeOpacity={0.8}
              >
                <Ionicons name="globe-outline" size={15} color="#FFFFFF" />
                <Text style={styles.langPillText}>EN</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.notifBtnWhite}
                onPress={() => router.push('/notifications')}
                activeOpacity={0.8}
              >
                <Ionicons name="notifications-outline" size={20} color="#BD632F" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.ongoingLabel}>Ongoing Patients</Text>
        </ImageBackground>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Ongoing Patient Cards */}
        {isLoading ? (
          <View style={styles.patientCard}>
            <ActivityIndicator size="small" color="#BD632F" />
          </View>
        ) : ongoingPatients.length === 0 ? (
          <View style={styles.emptyPatientCard}>
            <Ionicons name="person-outline" size={32} color="#E6E1DC" />
            <Text style={styles.emptyPatientText}>No ongoing patients right now</Text>
          </View>
        ) : (
          ongoingPatients.slice(0, 3).map((b) => (
            <View key={b.id} style={styles.patientCard}>
              <View style={styles.patientTimeCol}>
                <Text style={styles.patientTimeText}>
                  {formatBookingTime(b.startAt)}
                </Text>
                <Text style={styles.patientTimeText}>
                  {formatBookingTime(b.endAt)}
                </Text>
              </View>

              <View style={styles.patientDivider} />

              {/* Avatar placeholder */}
              <View style={styles.patientAvatar}>
                <Ionicons name="person" size={20} color="#BD632F" />
              </View>

              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{b.patientName || `Patient #${b.patientId}`}</Text>
                {b.patientPhone ? (
                  <Text style={styles.patientDetail}>{b.patientPhone}</Text>
                ) : null}
              </View>

              <TouchableOpacity style={styles.chatBtn} activeOpacity={0.8} onPress={() => router.push({ pathname: '/chat', params: { conversationId: String(b.patientId) } })}>
                <Ionicons name="chatbubble-outline" size={16} color="#BD632F" />
              </TouchableOpacity>
            </View>
          ))
        )}

        {/* Consults for Today */}
        <View style={styles.consultsCard}>
          <View style={styles.consultsLeft}>
            <Text style={styles.consultsTitle}>
              <Text style={styles.consultsTitleOrange}>Consults </Text>
              for today
            </Text>
            <Text style={styles.consultsSubtitle}>
              {completedToday} of {totalConsults} completed
            </Text>
          </View>

          {/* Pending Circle */}
          <View style={styles.pendingCircle}>
            <Text style={styles.pendingCount}>{pendingCount}</Text>
            <Text style={styles.pendingLabel}>pending</Text>
          </View>
        </View>

        {/* Quick Access Tiles */}
        <View style={styles.tilesGrid}>
          {QUICK_TILES.map((tile) => (
            <TouchableOpacity
              key={tile.id}
              style={styles.tile}
              onPress={() => router.push(tile.route as any)}
              activeOpacity={0.85}
            >
              <View style={styles.tileIconCircle}>
                <Ionicons name={tile.icon} size={26} color="#BD632F" />
              </View>
              <Text style={styles.tileLabel}>{tile.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  headerBannerWrapper: {
    backgroundColor: '#BD632F',
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  headerBanner: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  greetingText: {
    fontSize: 26,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  doctorName: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 38,
    gap: 6,
  },
  langPillText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  notifBtnWhite: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ongoingLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 110,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  patientTimeCol: {
    gap: 4,
  },
  patientTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C7672',
  },
  patientDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#E6E1DC',
  },
  patientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 2,
  },
  patientDetail: {
    fontSize: 12,
    color: '#9C9690',
    fontWeight: '500',
  },
  chatBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPatientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 24,
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  emptyPatientText: {
    fontSize: 13,
    color: '#9C9690',
    fontWeight: '500',
  },
  consultsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    paddingHorizontal: 20,
    paddingVertical: 18,
    marginTop: 8,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  consultsLeft: {
    gap: 4,
  },
  consultsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
  },
  consultsTitleOrange: {
    color: '#BD632F',
  },
  consultsSubtitle: {
    fontSize: 13,
    color: '#9C9690',
    fontWeight: '500',
  },
  pendingCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2.5,
    borderColor: '#BD632F',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pendingCount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1817',
  },
  pendingLabel: {
    fontSize: 10,
    color: '#9C9690',
    fontWeight: '600',
    marginTop: -2,
  },
  tilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  tile: {
    width: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    paddingVertical: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  tileIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tileLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
  },
});

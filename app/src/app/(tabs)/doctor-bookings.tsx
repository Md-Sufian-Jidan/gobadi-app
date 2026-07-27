import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  useGetDoctorBookingsQuery,
  useCompleteBookingMutation,
  type AppointmentStatus,
} from '@/store/doctorPortalApi';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function isActionable(status: AppointmentStatus): boolean {
  return status === 'CONFIRMED' || status === 'RESCHEDULED' || status === 'PENDING';
}

export default function DoctorBookingsScreen() {
  const { data: bookings, isLoading } = useGetDoctorBookingsQuery();
  const [completeBooking] = useCompleteBookingMutation();

  async function handleComplete(id: number) {
    try {
      await completeBooking(String(id)).unwrap();
    } catch (err) {
      console.log('Error completing booking:', err);
      Alert.alert('Could not complete', 'Please try again.');
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#BD632F" style={{ marginTop: 30 }} />
        ) : !bookings || bookings.length === 0 ? (
          <Text style={styles.emptyText}>No bookings yet.</Text>
        ) : (
          bookings.map((booking) => (
            <View key={booking.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.patientName}>{booking.patientName || `Patient #${booking.patientId}`}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{booking.status}</Text>
                </View>
              </View>
              <Text style={styles.dateText}>{formatDateTime(booking.startAt)}</Text>
              {booking.patientPhone ? <Text style={styles.phoneText}>📞 {booking.patientPhone}</Text> : null}

              {isActionable(booking.status) ? (
                <TouchableOpacity
                  style={styles.completeButton}
                  onPress={() => handleComplete(booking.id)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.completeButtonText}>Mark Complete</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1817',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 110,
  },
  emptyText: {
    fontSize: 13,
    color: '#9C9690',
    textAlign: 'center',
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
  },
  statusBadge: {
    backgroundColor: '#FFF8F4',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#BD632F',
  },
  dateText: {
    fontSize: 13,
    color: '#7C7672',
    marginBottom: 2,
  },
  phoneText: {
    fontSize: 12,
    color: '#9C9690',
    marginBottom: 12,
  },
  completeButton: {
    backgroundColor: '#BD632F',
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  completeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

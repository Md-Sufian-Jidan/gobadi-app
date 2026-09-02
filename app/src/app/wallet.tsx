import React from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
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

const BAR_DATA = [
  { day: 'MON', value: 0.4 },
  { day: 'TUE', value: 0.6 },
  { day: 'WED', value: 0.3 },
  { day: 'THU', value: 0.8 },
  { day: 'FRI', value: 0.55 },
  { day: 'SAT', value: 0.9 },
  { day: 'SUN', value: 0.7 },
];

const MAX_BAR_HEIGHT = 120;

export default function WalletScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Earnings Card */}
        <View style={styles.earningsCard}>
          <Text style={styles.totalLabel}>Total Earnings</Text>
          <Text style={styles.totalAmount}>$999</Text>

          <View style={styles.earningsRow}>
            <View>
              <Text style={styles.earningsLabel}>This Month</Text>
              <View style={styles.earningsValue}>
                <Ionicons name="arrow-up" size={14} color="#4CAF50" />
                <Text style={styles.earningsGreen}>$450</Text>
              </View>
            </View>
            <View>
              <Text style={styles.earningsLabel}>Last Transactions</Text>
              <Text style={styles.earningsValueText}>$150</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <TouchableOpacity
          style={styles.paymentMethodRow}
          onPress={() => router.push('/payment-methods')}
          activeOpacity={0.8}
        >
          <Text style={styles.paymentMethodLabel}>Payment Method</Text>
          <View style={styles.paymentMethodIcons}>
            <View style={[styles.miniIcon, { backgroundColor: '#E53935' }]}>
              <Ionicons name="paper-plane" size={12} color="#FFFFFF" />
            </View>
            <View style={[styles.miniIcon, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="wallet" size={12} color="#FFFFFF" />
            </View>
            <View style={[styles.miniIcon, { backgroundColor: '#1A237E' }]}>
              <Text style={styles.miniIconText}>VISA</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* 7 Days Performance */}
        <View style={styles.performanceSection}>
          <View style={styles.performanceHeader}>
            <Text style={styles.performanceTitle}>7 Days Performance</Text>
            <View style={styles.weeklyBadge}>
              <Text style={styles.weeklyText}>WEEKLY</Text>
            </View>
          </View>

          <View style={styles.chartContainer}>
            {BAR_DATA.map((item, index) => (
              <View key={item.day} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: item.value * MAX_BAR_HEIGHT,
                        backgroundColor: '#C4956A',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionCard}>
          <View style={styles.transactionLeft}>
            <View style={styles.transactionAvatar}>
              <Ionicons name="person" size={18} color="#BD632F" />
            </View>
            <View>
              <Text style={styles.transactionName}>Zhafira Azalea</Text>
              <Text style={styles.transactionDate}>Today, 10:30 AM</Text>
            </View>
          </View>
          <Text style={styles.transactionAmount}>+$45</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1817' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  totalLabel: { fontSize: 14, fontWeight: '500', color: '#7C7672', marginBottom: 4 },
  totalAmount: { fontSize: 36, fontWeight: '800', color: '#BD632F', marginBottom: 12 },
  earningsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E6E1DC', padding: 16, marginBottom: 20 },
  earningsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  earningsLabel: { fontSize: 12, fontWeight: '500', color: '#9C9690', marginBottom: 4 },
  earningsValue: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  earningsGreen: { fontSize: 16, fontWeight: '700', color: '#4CAF50' },
  earningsValueText: { fontSize: 16, fontWeight: '700', color: '#1A1817' },
  paymentMethodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E6E1DC', padding: 16, marginBottom: 24 },
  paymentMethodLabel: { fontSize: 14, fontWeight: '700', color: '#1A1817' },
  paymentMethodIcons: { flexDirection: 'row', gap: 4 },
  miniIcon: { width: 28, height: 18, borderRadius: 4, justifyContent: 'center', alignItems: 'center' },
  miniIconText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  performanceSection: { marginBottom: 24 },
  performanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  performanceTitle: { fontSize: 16, fontWeight: '700', color: '#1A1817' },
  weeklyBadge: { backgroundColor: '#FFF2EB', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4 },
  weeklyText: { fontSize: 11, fontWeight: '700', color: '#BD632F' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 160, backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E6E1DC', padding: 16 },
  barColumn: { alignItems: 'center', flex: 1 },
  barWrapper: { height: MAX_BAR_HEIGHT, justifyContent: 'flex-end' },
  bar: { width: 24, borderRadius: 6 },
  barLabel: { fontSize: 10, fontWeight: '600', color: '#9C9690', marginTop: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1817', marginBottom: 12 },
  transactionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', padding: 14 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  transactionAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center' },
  transactionName: { fontSize: 14, fontWeight: '700', color: '#1A1817' },
  transactionDate: { fontSize: 11, fontWeight: '500', color: '#9C9690' },
  transactionAmount: { fontSize: 15, fontWeight: '800', color: '#4CAF50' },
});

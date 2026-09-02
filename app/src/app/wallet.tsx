import React, { useMemo } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useGetBalanceQuery, useGetTransactionsQuery } from '@/store/walletApi';

const MAX_BAR_HEIGHT = 120;
const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function formatTransactionDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
}

export default function WalletScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;

  const { data: balance, isLoading: balanceLoading } = useGetBalanceQuery();
  const { data: transactions, isLoading: txLoading } = useGetTransactionsQuery({ limit: '10' });

  const weeklyData = useMemo(() => {
    const dayTotals: number[] = [0, 0, 0, 0, 0, 0, 0];
    if (transactions) {
      for (const tx of transactions) {
        const date = new Date(tx.createdAt);
        const dayIndex = date.getDay();
        dayTotals[dayIndex] += Math.abs(tx.amount);
      }
    }
    const maxVal = Math.max(...dayTotals, 1);
    return DAYS_OF_WEEK.map((day, i) => ({
      day,
      value: dayTotals[i] / maxVal,
    }));
  }, [transactions]);

  const thisMonthTotal = useMemo(() => {
    if (!transactions) return 0;
    const now = new Date();
    return transactions
      .filter((tx) => {
        const d = new Date(tx.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  }, [transactions]);

  const lastTransaction = useMemo(() => {
    if (!transactions || transactions.length === 0) return null;
    return transactions[0];
  }, [transactions]);

  const isLoading = balanceLoading || txLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Wallet</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BD632F" />
        </View>
      </SafeAreaView>
    );
  }

  const currency = balance?.currency || 'BDT';

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
          <Text style={styles.totalLabel}>Total Balance</Text>
          <Text style={styles.totalAmount}>{currency} {balance?.balance?.toLocaleString() ?? '0'}</Text>

          <View style={styles.earningsRow}>
            <View>
              <Text style={styles.earningsLabel}>This Month</Text>
              <View style={styles.earningsValue}>
                <Ionicons name="arrow-up" size={14} color="#4CAF50" />
                <Text style={styles.earningsGreen}>{currency} {thisMonthTotal.toLocaleString()}</Text>
              </View>
            </View>
            <View>
              <Text style={styles.earningsLabel}>Last Transaction</Text>
              <Text style={styles.earningsValueText}>
                {lastTransaction ? `${currency} ${Math.abs(lastTransaction.amount).toLocaleString()}` : 'N/A'}
              </Text>
            </View>
          </View>

          {balance?.coins !== undefined && balance.coins > 0 && (
            <View style={styles.coinsRow}>
              <Ionicons name="star" size={14} color="#F9A825" />
              <Text style={styles.coinsText}>{balance.coins} coins</Text>
            </View>
          )}
        </View>

        {/* Payment Method */}
        <TouchableOpacity
          style={styles.paymentMethodRow}
          onPress={() => router.push('/payment-methods')}
          activeOpacity={0.8}
        >
          <Text style={styles.paymentMethodLabel}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={18} color="#9C9690" />
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
            {weeklyData.map((item) => (
              <View key={item.day} style={styles.barColumn}>
                <View style={styles.barWrapper}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: Math.max(item.value * MAX_BAR_HEIGHT, 4),
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
        {transactions && transactions.length > 0 ? (
          transactions.slice(0, 5).map((tx) => (
            <View key={tx.id} style={styles.transactionCard}>
              <View style={styles.transactionLeft}>
                <View style={styles.transactionAvatar}>
                  <Ionicons name={tx.type === 'credit' ? 'arrow-down' : 'arrow-up'} size={18} color={tx.type === 'credit' ? '#4CAF50' : '#E53935'} />
                </View>
                <View>
                  <Text style={styles.transactionName}>{tx.description || tx.type}</Text>
                  <Text style={styles.transactionDate}>{formatTransactionDate(tx.createdAt)}</Text>
                </View>
              </View>
              <Text style={[styles.transactionAmount, { color: tx.type === 'credit' ? '#4CAF50' : '#E53935' }]}>
                {tx.type === 'credit' ? '+' : '-'}{currency} {Math.abs(tx.amount).toLocaleString()}
              </Text>
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
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
  coinsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E6E1DC' },
  coinsText: { fontSize: 13, fontWeight: '600', color: '#F9A825' },
  paymentMethodRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E6E1DC', padding: 16, marginBottom: 24 },
  paymentMethodLabel: { fontSize: 14, fontWeight: '700', color: '#1A1817' },
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
  transactionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', padding: 14, marginBottom: 10 },
  transactionLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  transactionAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center' },
  transactionName: { fontSize: 14, fontWeight: '700', color: '#1A1817' },
  transactionDate: { fontSize: 11, fontWeight: '500', color: '#9C9690' },
  transactionAmount: { fontSize: 15, fontWeight: '800' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyContainer: { alignItems: 'center', paddingVertical: 30 },
  emptyText: { fontSize: 14, fontWeight: '500', color: '#9C9690' },
});

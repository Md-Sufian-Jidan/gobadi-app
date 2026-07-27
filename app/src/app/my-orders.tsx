import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useGetCatalogQuery, useGetMyOrdersQuery } from '@/store/marketplaceApi';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function isPaidStatus(status: string): boolean {
  return status.toLowerCase() === 'paid';
}

export default function MyOrdersScreen() {
  const router = useRouter();
  const { data: orders, isLoading: ordersLoading } = useGetMyOrdersQuery();
  const { data: catalog } = useGetCatalogQuery();

  const catalogById = useMemo(
    () => Object.fromEntries((catalog || []).map((item) => [String(item.id), item])),
    [catalog],
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.circleButton} onPress={() => router.back()} activeOpacity={0.8}>
          <Text style={styles.buttonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {ordersLoading ? (
          <ActivityIndicator size="small" color="#BD632F" style={{ marginTop: 30 }} />
        ) : !orders || orders.length === 0 ? (
          <Text style={styles.emptyText}>You haven't placed any orders yet.</Text>
        ) : (
          orders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <View>
                  <Text style={styles.orderId}>{order.id}</Text>
                  <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                </View>
                <View
                  style={[
                    styles.statusIndicatorBadge,
                    isPaidStatus(order.paymentStatus) ? styles.statusCompleted : styles.statusUpcoming,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusIndicatorText,
                      isPaidStatus(order.paymentStatus) ? styles.statusTextCompleted : styles.statusTextUpcoming,
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>

              <View style={styles.itemsList}>
                {order.items.map((lineItem, idx) => {
                  const catalogItem = catalogById[lineItem.itemId];
                  return (
                    <View key={idx} style={styles.itemRow}>
                      <Text style={styles.itemName}>{catalogItem?.name || `Item #${lineItem.itemId}`}</Text>
                      <Text style={styles.itemQty}>x{lineItem.quantity}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.orderFooter}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>৳ {order.totalPrice.toLocaleString()}</Text>
              </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 16,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1817',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  emptyText: {
    fontSize: 13,
    color: '#9C9690',
    textAlign: 'center',
    paddingVertical: 40,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 16,
    marginBottom: 16,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#FAF9F6',
    paddingBottom: 12,
    marginBottom: 12,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  orderDate: {
    fontSize: 11,
    color: '#9C9690',
    marginTop: 2,
  },
  statusIndicatorBadge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusUpcoming: {
    backgroundColor: '#FFF8F4',
  },
  statusCompleted: {
    backgroundColor: '#E8F5E9',
  },
  statusIndicatorText: {
    fontSize: 11,
    fontWeight: '700',
  },
  statusTextUpcoming: {
    color: '#BD632F',
  },
  statusTextCompleted: {
    color: '#2E7D32',
  },
  itemsList: {
    gap: 6,
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 13,
    color: '#1A1817',
    fontWeight: '600',
  },
  itemQty: {
    fontSize: 13,
    color: '#7C7672',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#FAF9F6',
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 13,
    color: '#7C7672',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#BD632F',
  },
});

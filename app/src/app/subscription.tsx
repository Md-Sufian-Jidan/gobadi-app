import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useGetMySubscriptionQuery,
  useGetSubscriptionPlansQuery,
  useCancelSubscriptionMutation,
} from '@/store/subscriptionsApi';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { data: mySubscription, isLoading: subLoading } = useGetMySubscriptionQuery();
  const { data: plans, isLoading: plansLoading } = useGetSubscriptionPlansQuery();
  const [cancelSubscription, { isLoading: cancelling }] = useCancelSubscriptionMutation();

  const currentPlan = useMemo(() => {
    if (!mySubscription || !plans) return null;
    return plans.find((p) => p.id === mySubscription.planId) || null;
  }, [mySubscription, plans]);

  const handleManageBillings = () => {
    Alert.alert('Manage Billings', 'Redirecting to payment billing management portal...');
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription?',
      `Are you sure you want to cancel your ${currentPlan?.name || 'subscription'}? You will lose access to premium features.`,
      [
        { text: 'Keep Plan', style: 'cancel' },
        {
          text: 'Confirm Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelSubscription().unwrap();
              Alert.alert('Cancelled', 'Subscription auto-renewal has been cancelled.');
            } catch {
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          },
        },
      ]
    );
  };

  const isLoading = subLoading || plansLoading;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={{ width: 42 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BD632F" />
        </View>
      </SafeAreaView>
    );
  }

  if (!mySubscription || !currentPlan) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Subscription</Text>
          <View style={{ width: 42 }} />
        </View>
        <View style={styles.loadingContainer}>
          <Ionicons name="receipt-outline" size={48} color="#9C9690" />
          <Text style={styles.emptyText}>No active subscription</Text>
          <Text style={styles.emptySubtext}>Subscribe to a plan to access premium features</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>{currentPlan.name}</Text>

          <View style={styles.innerPlanBox}>
            <Text style={styles.innerLabel}>Current Plan</Text>
            <Text style={styles.innerPrice}>${currentPlan.price.toFixed(2)}</Text>
            <Text style={styles.innerBilling}>
              {mySubscription.status === 'active' ? 'Next Billing' : 'Expires'} : {new Date(mySubscription.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusBadge, mySubscription.status === 'active' ? styles.statusActive : styles.statusInactive]}>
                <Text style={[styles.statusText, mySubscription.status === 'active' ? styles.statusTextActive : styles.statusTextInactive]}>
                  {mySubscription.status.charAt(0).toUpperCase() + mySubscription.status.slice(1)}
                </Text>
              </View>
              {mySubscription.autoRenew && (
                <View style={styles.autoRenewBadge}>
                  <Text style={styles.autoRenewText}>Auto-renew ON</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.featuresList}>
            {currentPlan.features.map((item, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.checkIconBadge}>
                  <Ionicons name="checkmark" size={16} color="#BD632F" />
                </View>
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.manageBtn} onPress={handleManageBillings} activeOpacity={0.85}>
          <Text style={styles.manageBtnText}>Manage Billings</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelBtn, cancelling && { opacity: 0.5 }]}
          onPress={handleCancelSubscription}
          activeOpacity={0.85}
          disabled={cancelling}
        >
          {cancelling ? (
            <ActivityIndicator size="small" color="#E53935" />
          ) : (
            <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  scrollContainer: { paddingHorizontal: 24, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingTop: 12, marginBottom: 24 },
  backBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '700', color: '#1A1817' },
  planCard: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#E6E1DC', padding: 24, alignItems: 'center', marginBottom: 24 },
  planTitle: { fontSize: 18, fontWeight: '700', color: '#1A1817', marginBottom: 18, textAlign: 'center' },
  innerPlanBox: { width: '100%', backgroundColor: '#FFF2EB', borderRadius: 18, padding: 18, marginBottom: 20 },
  innerLabel: { fontSize: 12, color: '#7C7672', fontWeight: '500', marginBottom: 4 },
  innerPrice: { fontSize: 24, fontWeight: '800', color: '#1A1817', marginBottom: 4 },
  innerBilling: { fontSize: 12, color: '#7C7672', fontWeight: '500' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusActive: { backgroundColor: '#E8F5E9' },
  statusInactive: { backgroundColor: '#FFEBEE' },
  statusText: { fontSize: 11, fontWeight: '700' },
  statusTextActive: { color: '#4CAF50' },
  statusTextInactive: { color: '#E53935' },
  autoRenewBadge: { backgroundColor: '#E3F2FD', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  autoRenewText: { fontSize: 11, fontWeight: '700', color: '#2196F3' },
  dashedDivider: { width: '100%', height: 1, borderWidth: 1, borderColor: '#E6E1DC', borderStyle: 'dashed', marginBottom: 20 },
  featuresList: { width: '100%', gap: 14 },
  featureRow: { flexDirection: 'row', alignItems: 'center' },
  checkIconBadge: { marginRight: 12 },
  featureText: { fontSize: 14, fontWeight: '500', color: '#1A1817' },
  manageBtn: { backgroundColor: '#BD632F', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  manageBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  cancelBtn: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#E53935', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: '#E53935', fontSize: 16, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#1A1817' },
  emptySubtext: { fontSize: 13, fontWeight: '500', color: '#9C9690' },
});

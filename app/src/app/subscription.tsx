import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function SubscriptionScreen() {
  const router = useRouter();

  const features = [
    '7-day weather forecast',
    'AI crop health detection',
    'Unlimited fields',
    'Unlimited Alert',
  ];

  function handleManageBillings() {
    Alert.alert('Manage Billings', 'Redirecting to payment billing management portal...');
  }

  function handleCancelSubscription() {
    Alert.alert(
      'Cancel Subscription?',
      'Are you sure you want to cancel your Cropcore Premium subscription? You will lose access to premium AI features.',
      [
        { text: 'Keep Plan', style: 'cancel' },
        {
          text: 'Confirm Cancel',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Cancelled', 'Subscription auto-renewal has been cancelled.');
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Subscription</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Subscription Plan Card */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Cropcore Premium</Text>

          {/* Current Plan Inner Box */}
          <View style={styles.innerPlanBox}>
            <Text style={styles.innerLabel}>Current Plan</Text>
            <Text style={styles.innerPrice}>$99.00</Text>
            <Text style={styles.innerBilling}>Next Billing : Oct 15, 2025</Text>
          </View>

          <View style={styles.dashedDivider} />

          {/* Features List */}
          <View style={styles.featuresList}>
            {features.map((item, index) => (
              <View key={index} style={styles.featureRow}>
                <View style={styles.checkIconBadge}>
                  <Ionicons name="checkmark" size={16} color="#BD632F" />
                </View>
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Manage Billings Button */}
        <TouchableOpacity
          style={styles.manageBtn}
          onPress={handleManageBillings}
          activeOpacity={0.85}
        >
          <Text style={styles.manageBtnText}>Manage Billings</Text>
        </TouchableOpacity>

        {/* Cancel Subscription Button */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={handleCancelSubscription}
          activeOpacity={0.85}
        >
          <Text style={styles.cancelBtnText}>Cancel Subscription</Text>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1817',
  },
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 18,
    textAlign: 'center',
  },
  innerPlanBox: {
    width: '100%',
    backgroundColor: '#FFF2EB',
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },
  innerLabel: {
    fontSize: 12,
    color: '#7C7672',
    fontWeight: '500',
    marginBottom: 4,
  },
  innerPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 4,
  },
  innerBilling: {
    fontSize: 12,
    color: '#7C7672',
    fontWeight: '500',
  },
  dashedDivider: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  featuresList: {
    width: '100%',
    gap: 14,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkIconBadge: {
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1817',
  },
  manageBtn: {
    backgroundColor: '#BD632F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  manageBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E53935',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#E53935',
    fontSize: 16,
    fontWeight: '700',
  },
});

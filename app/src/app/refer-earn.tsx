import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ReferEarnScreen() {
  const router = useRouter();
  const referralCode = '#123ABC';

  async function handleShare() {
    try {
      await Share.share({
        message: `Join me on Gobaadi Farm Management App! Use my referral code ${referralCode} to get $100 bonus reward.`,
      });
    } catch (err) {
      console.log('Error sharing:', err);
    }
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

        <Text style={styles.headerTitle}>Refer & Earn</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Main Card */}
        <View style={styles.mainCard}>
          <Text style={styles.cardHeading}>Refer Friend and Earn</Text>
          <Text style={styles.rewardAmount}>$100</Text>
          <Text style={styles.rewardSubtitle}>You Can Earn for Every Referral</Text>

          {/* Farmer Illustration Badge */}
          <View style={styles.illustrationCircle}>
            <Text style={styles.farmerEmoji}>👨‍🌾</Text>
          </View>

          {/* Referral Code Box */}
          <View style={styles.codeBox}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <Text style={styles.codeValue}>{referralCode}</Text>
          </View>

          <View style={styles.dashedDivider} />

          {/* Steps List */}
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Share your code or invite link with farmer friends.
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>
                They sign up and complete their profile setup.
              </Text>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>
                They sign up and complete their first animal setup.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleShare}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnText}>Refer & Earn Now</Text>
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
    marginBottom: 20,
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
  mainCard: {
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
  cardHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 8,
  },
  rewardAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1817',
    marginBottom: 4,
  },
  rewardSubtitle: {
    fontSize: 13,
    color: '#7C7672',
    marginBottom: 20,
  },
  illustrationCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#687834',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  farmerEmoji: {
    fontSize: 54,
  },
  codeBox: {
    width: '100%',
    backgroundColor: '#FFF2EB',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  codeLabel: {
    fontSize: 12,
    color: '#7C7672',
    fontWeight: '500',
    marginBottom: 4,
  },
  codeValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1817',
    letterSpacing: 1,
  },
  dashedDivider: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  stepsList: {
    width: '100%',
    gap: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: 13,
    color: '#1A1817',
    fontWeight: '500',
    lineHeight: 18,
  },
  actionBtn: {
    backgroundColor: '#BD632F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

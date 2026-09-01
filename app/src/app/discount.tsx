import React, { useState, useMemo } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const QUICK_DISCOUNTS = [5, 10, 15, 20];

export default function DiscountScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;
  const params = useLocalSearchParams<{
    patientId?: string;
    patientName?: string;
    ownerName?: string;
    existingDiscount?: string;
  }>();

  const patientName = params.patientName || 'Melinda Gates';
  const ownerName = params.ownerName || 'Sophia Rodriguez';
  const existingDiscount = params.existingDiscount ? parseInt(params.existingDiscount, 10) : 0;

  const [selectedDiscount, setSelectedDiscount] = useState<number>(existingDiscount);
  const [customDiscount, setCustomDiscount] = useState(
    existingDiscount > 0 && !QUICK_DISCOUNTS.includes(existingDiscount) ? existingDiscount.toString() : ''
  );

  const discountPercent = selectedDiscount || (customDiscount ? parseInt(customDiscount, 10) : 0);
  const appointmentFee = 1000;
  const discountAmount = useMemo(() => {
    return Math.round(appointmentFee * (discountPercent / 100));
  }, [discountPercent]);
  const patientPays = appointmentFee - discountAmount;
  const hasDiscount = discountPercent > 0;

  const handleQuickDiscount = (percent: number) => {
    setSelectedDiscount(percent);
    setCustomDiscount('');
  };

  const handleCustomDiscount = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (numeric === '' || parseInt(numeric, 10) <= 100) {
      setCustomDiscount(numeric);
      setSelectedDiscount(0);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#BD632F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discount details</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.patientCard}>
          <View style={styles.patientAvatar}>
            <Ionicons name="paw" size={24} color="#BD632F" />
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patientName}</Text>
            <Text style={styles.patientOwner}>Owner: {ownerName}</Text>
          </View>
          <View style={styles.contactIcons}>
            <TouchableOpacity style={styles.contactBtn} activeOpacity={0.7}>
              <Ionicons name="call" size={18} color="#BD632F" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactBtn} activeOpacity={0.7}>
              <Ionicons name="chatbubble" size={18} color="#BD632F" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.lastAppointment}>Last appointment: 14th August</Text>

        <View style={styles.priceCard}>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Appointment fee</Text>
            <Text style={styles.priceValue}>৳ {appointmentFee.toLocaleString()}</Text>
          </View>
          <View style={styles.priceDividerDashed} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discount ({discountPercent}%)</Text>
            <Text style={styles.priceValue}>৳ {discountAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.priceDividerDashed} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Patient will pay</Text>
            <Text style={styles.totalValue}>৳ {patientPays.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Discount</Text>
        <View style={styles.quickDiscountRow}>
          {QUICK_DISCOUNTS.map((percent) => (
            <TouchableOpacity
              key={percent}
              style={[
                styles.quickDiscountBtn,
                selectedDiscount === percent && styles.quickDiscountBtnActive,
              ]}
              onPress={() => handleQuickDiscount(percent)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.quickDiscountText,
                  selectedDiscount === percent && styles.quickDiscountTextActive,
                ]}
              >
                {percent}%
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Custom Discount</Text>
        <View style={styles.customInputContainer}>
          <TextInput
            style={styles.customInput}
            placeholder="Discount %"
            placeholderTextColor="#A39E99"
            keyboardType="numeric"
            value={customDiscount}
            onChangeText={handleCustomDiscount}
          />
          <View style={styles.customInputIcon}>
            <Text style={styles.percentIcon}>%</Text>
          </View>
        </View>

      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.continueBtn, !hasDiscount && styles.continueBtnDisabled]}
          onPress={() => router.back()}
          activeOpacity={0.85}
          disabled={!hasDiscount}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>

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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1817',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  patientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
  },
  patientOwner: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7C7672',
    marginTop: 2,
  },
  contactIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lastAppointment: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7C7672',
    marginBottom: 20,
  },
  priceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 16,
    marginBottom: 24,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  priceDividerDashed: {
    borderBottomWidth: 1,
    borderBottomColor: '#E6E1DC',
    borderStyle: 'dashed',
    marginVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7C7672',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1817',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1A1817',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 12,
  },
  quickDiscountRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  quickDiscountBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E6E1DC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  quickDiscountBtnActive: {
    borderColor: '#BD632F',
    backgroundColor: '#BD632F',
  },
  quickDiscountText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#7C7672',
  },
  quickDiscountTextActive: {
    color: '#FFFFFF',
  },
  customInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    overflow: 'hidden',
    marginBottom: 20,
  },
  customInput: {
    flex: 1,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#1A1817',
  },
  customInputIcon: {
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: '#E6E1DC',
  },
  percentIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#BD632F',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  continueBtn: {
    backgroundColor: '#BD632F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  continueBtnDisabled: {
    backgroundColor: '#E6E1DC',
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

import React, { useState, useMemo } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
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
  const isEditMode = existingDiscount > 0;

  const [selectedDiscount, setSelectedDiscount] = useState<number>(existingDiscount);
  const [customDiscount, setCustomDiscount] = useState(
    existingDiscount > 0 && !QUICK_DISCOUNTS.includes(existingDiscount) ? existingDiscount.toString() : ''
  );
  const [showRemoveModal, setShowRemoveModal] = useState(false);

  const discountPercent = selectedDiscount || (customDiscount ? parseInt(customDiscount, 10) : 0);
  const appointmentFee = 1000;
  const discountAmount = useMemo(() => {
    return Math.round(appointmentFee * (discountPercent / 100));
  }, [discountPercent]);
  const patientPays = appointmentFee - discountAmount;
  const hasDiscount = discountPercent > 0;
  const hasChanges = discountPercent !== existingDiscount;

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

  const handleRemoveDiscount = () => {
    setShowRemoveModal(false);
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Discount details</Text>
        <View style={{ width: 40 }} />
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
          <View style={styles.priceDivider} />
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Discount ({discountPercent}%)</Text>
            <Text style={styles.priceValue}>৳ {discountAmount.toLocaleString()}</Text>
          </View>
          <View style={styles.priceDivider} />
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

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#BD632F" />
          <Text style={styles.infoText}>
            Discounts apply to the patient's next appointment fee only. They pay the discounted amount when booking.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        {isEditMode ? (
          <View style={styles.editButtonsRow}>
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.back()}
              activeOpacity={0.85}
            >
              <Text style={styles.editBtnText}>Edit discount</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => setShowRemoveModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.removeBtnText}>Remove discount</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.continueBtn, !hasDiscount && styles.continueBtnDisabled]}
            onPress={() => router.back()}
            activeOpacity={0.85}
            disabled={!hasDiscount}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={showRemoveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowRemoveModal(false)}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={20} color="#7C7672" />
            </TouchableOpacity>

            <View style={styles.modalPatientRow}>
              <View style={styles.modalAvatar}>
                <Ionicons name="paw" size={20} color="#BD632F" />
              </View>
              <View>
                <Text style={styles.modalPatientName}>{patientName}</Text>
                <Text style={styles.modalPatientOwner}>Owner: {ownerName}</Text>
              </View>
            </View>

            <View style={styles.trashIconContainer}>
              <View style={styles.trashCircle}>
                <Ionicons name="trash" size={40} color="#E53935" />
              </View>
            </View>

            <Text style={styles.modalTitle}>Remove this discount?</Text>
            <Text style={styles.modalDescription}>
              {discountPercent}% Discount for {patientName} will be removed and will not be applicable for the next appointment
            </Text>

            <TouchableOpacity
              style={styles.removeConfirmBtn}
              onPress={handleRemoveDiscount}
              activeOpacity={0.85}
            >
              <Text style={styles.removeConfirmBtnText}>Remove discount</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowRemoveModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
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
  priceDivider: {
    height: 1,
    backgroundColor: '#E6E1DC',
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
    borderRadius: 12,
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF2EB',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#7C7672',
    lineHeight: 18,
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
  editButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  editBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtnText: {
    color: '#BD632F',
    fontSize: 15,
    fontWeight: '700',
  },
  removeBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeBtnText: {
    color: '#E53935',
    fontSize: 15,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  modalPatientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 12,
    marginBottom: 24,
  },
  modalAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPatientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
  },
  modalPatientOwner: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7C7672',
  },
  trashIconContainer: {
    marginBottom: 20,
  },
  trashCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 8,
  },
  modalDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#7C7672',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  removeConfirmBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  removeConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cancelBtn: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#E6E1DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#7C7672',
    fontSize: 16,
    fontWeight: '600',
  },
});

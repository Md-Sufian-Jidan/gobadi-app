import React, { useState } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const REASONS = ['Vacation', 'Sick Leave', 'Conference/Training', 'Emergency', 'Other'];

type Step = 'form' | 'warning' | 'confirmation' | 'confirmed';

export default function BlockTimeOffScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;
  const [step, setStep] = useState<Step>('form');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [note, setNote] = useState('');
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  const handleContinue = () => {
    if (startDate && endDate && selectedReason) {
      setStep('warning');
    }
  };

  const handleWarningConfirm = () => {
    setStep('confirmation');
  };

  const handleFinalConfirm = () => {
    setStep('confirmed');
  };

  if (step === 'confirmed') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Block Confirmed</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.confirmedContent}>
          <View style={styles.confirmedCircle}>
            <Ionicons name="checkmark" size={48} color="#FFFFFF" />
          </View>
          <Text style={styles.confirmedTitle}>Your time has been blocked</Text>
          <Text style={styles.confirmedDate}>{startDate} - {endDate}</Text>
          <Text style={styles.confirmedSubtitle}>You will not receive any bookings during this time.</Text>
        </View>

        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.viewCalendarBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.viewCalendarBtnText}>View Calendar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => router.back()}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'confirmation') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Block time off</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.sectionTitle}>Cancelled Appointments</Text>

          {[
            { name: 'Clara Bennett', owner: 'Sophia Rodriguez', date: '24 Aug 2026', time: '10:00 AM' },
            { name: 'Clara Bennett', owner: 'Sophia Rodriguez', date: '24 Aug 2026', time: '12:00 PM' },
          ].map((appt, i) => (
            <View key={i} style={styles.cancelledCard}>
              <View style={styles.cancelledAvatar}>
                <Ionicons name="paw" size={20} color="#BD632F" />
              </View>
              <View style={styles.cancelledInfo}>
                <Text style={styles.cancelledName}>{appt.name}</Text>
                <Text style={styles.cancelledOwner}>Owner: {appt.owner}</Text>
                <Text style={styles.cancelledDateTime}>
                  <Ionicons name="calendar-outline" size={12} color="#9C9690" /> {appt.date} · {appt.time}
                </Text>
              </View>
              <View style={styles.cancelledBadge}>
                <Text style={styles.cancelledBadgeText}>Cancelled</Text>
              </View>
            </View>
          ))}

          <View style={styles.walletSection}>
            <View style={styles.walletHeader}>
              <Ionicons name="wallet-outline" size={18} color="#BD632F" />
              <Text style={styles.walletLabel}>Estimated Wallet Deduction</Text>
            </View>
            <Text style={styles.walletAmount}>৳ 1,250</Text>
          </View>

          <View style={styles.billingSection}>
            <Text style={styles.billingTitle}>Billing Details</Text>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Booking time off</Text>
              <Text style={styles.billingValue}>{startDate} - {endDate}</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Reason</Text>
              <Text style={styles.billingValue}>{selectedReason}</Text>
            </View>
            <View style={styles.billingDivider} />
            <Text style={styles.feesTitle}>Fees Details</Text>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Appointments fee</Text>
              <Text style={styles.billingValue}>৳ 1100</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Cancellation fee</Text>
              <Text style={styles.billingValue}>৳ 150</Text>
            </View>
            <View style={styles.billingDivider} />
            <View style={styles.billingRow}>
              <Text style={styles.totalLabel}>Total Fees</Text>
              <Text style={styles.totalValue}>৳ 1250</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Status</Text>
              <Text style={styles.paidText}>Paid</Text>
            </View>
          </View>

          <View style={styles.infoBanner}>
            <Ionicons name="information-circle-outline" size={20} color="#BD632F" />
            <Text style={styles.infoText}>
              By confirming, you agree that this amount will be deducted from your Gobadi wallet and the appointments will be cancelled.
            </Text>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.confirmBtn} onPress={handleFinalConfirm} activeOpacity={0.85}>
            <Text style={styles.confirmBtnText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtnBottom} onPress={() => setStep('form')} activeOpacity={0.85}>
            <Text style={styles.backBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'warning') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('form')} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Block time off</Text>
          <View style={{ width: 40 }} />
        </View>

        <Modal transparent animationType="fade" visible={true} onRequestClose={() => setStep('form')}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setStep('form')} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color="#7C7672" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>You have existing appointments</Text>
              <Text style={styles.modalDescription}>
                Blocking this time will cancel 2 appointments. Their booking amounts will be refunded, and applicable cancellation fees will be deducted from your wallet.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.modalBackBtn} onPress={() => setStep('form')} activeOpacity={0.85}>
                  <Text style={styles.modalBackBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={handleWarningConfirm} activeOpacity={0.85}>
                  <Text style={styles.modalConfirmBtnText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Block time off</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.fieldLabel}>Start date</Text>
        <TouchableOpacity
          style={styles.dateDropdown}
          onPress={() => setShowStartCalendar(!showStartCalendar)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dateText, !startDate && styles.datePlaceholder]}>
            {startDate || 'Select date'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9C9690" />
        </TouchableOpacity>

        {showStartCalendar && (
          <View style={styles.miniCalendar}>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={18} color="#BD632F" />
              </TouchableOpacity>
              <Text style={styles.calMonth}>April 2026</Text>
              <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={18} color="#BD632F" />
              </TouchableOpacity>
            </View>
            <View style={styles.calDayHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <Text key={d} style={styles.calDayText}>{d}</Text>
              ))}
            </View>
            <View style={styles.calDays}>
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                const isSelected = day >= 23 && day <= 26;
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.calDay, isSelected && styles.calDaySelected]}
                    onPress={() => {
                      setStartDate(`${day} April, 2026`);
                      setShowStartCalendar(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.calDayNumber, isSelected && styles.calDayNumberSelected]}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <Text style={[styles.fieldLabel, { marginTop: 20 }]}>End date</Text>
        <TouchableOpacity
          style={styles.dateDropdown}
          onPress={() => setShowEndCalendar(!showEndCalendar)}
          activeOpacity={0.7}
        >
          <Text style={[styles.dateText, !endDate && styles.datePlaceholder]}>
            {endDate || 'Select date'}
          </Text>
          <Ionicons name="chevron-down" size={18} color="#9C9690" />
        </TouchableOpacity>

        {showEndCalendar && (
          <View style={styles.miniCalendar}>
            <View style={styles.calHeader}>
              <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                <Ionicons name="chevron-back" size={18} color="#BD632F" />
              </TouchableOpacity>
              <Text style={styles.calMonth}>April 2026</Text>
              <TouchableOpacity onPress={() => {}} activeOpacity={0.7}>
                <Ionicons name="chevron-forward" size={18} color="#BD632F" />
              </TouchableOpacity>
            </View>
            <View style={styles.calDayHeader}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <Text key={d} style={styles.calDayText}>{d}</Text>
              ))}
            </View>
            <View style={styles.calDays}>
              {Array.from({ length: 30 }, (_, i) => {
                const day = i + 1;
                return (
                  <TouchableOpacity
                    key={day}
                    style={styles.calDay}
                    onPress={() => {
                      setEndDate(`${day} April, 2026`);
                      setShowEndCalendar(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.calDayNumber}>{day}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Reason <Text style={styles.required}>(Required)</Text></Text>
        <View style={styles.reasonsCard}>
          {REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={styles.reasonRow}
              onPress={() => setSelectedReason(reason)}
              activeOpacity={0.7}
            >
              <View style={[styles.radio, selectedReason === reason && styles.radioSelected]}>
                {selectedReason === reason && <View style={styles.radioDot} />}
              </View>
              <Text style={styles.reasonText}>{reason}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.fieldLabel, { marginTop: 20 }]}>Note <Text style={styles.optional}>(Optional)</Text></Text>
        <TextInput
          style={styles.noteInput}
          placeholder=""
          placeholderTextColor="#A39E99"
          value={note}
          onChangeText={setNote}
          multiline
        />

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#BD632F" />
          <Text style={styles.infoText}>
            Blocking time with existing appointments will require refunds and cancellation fees, which will be deducted from your wallet.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.continueBtn, !(startDate && endDate && selectedReason) && styles.continueBtnDisabled]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!startDate || !endDate || !selectedReason}
        >
          <Text style={styles.continueBtnText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#1A1817' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#1A1817', marginBottom: 8 },
  required: { color: '#BD632F' },
  optional: { color: '#9C9690' },
  dateDropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', paddingHorizontal: 16, height: 52 },
  dateText: { fontSize: 14, fontWeight: '500', color: '#1A1817' },
  datePlaceholder: { color: '#A39E99' },
  miniCalendar: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E6E1DC', padding: 14, marginTop: 8 },
  calHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calMonth: { fontSize: 15, fontWeight: '700', color: '#1A1817' },
  calDayHeader: { flexDirection: 'row', marginBottom: 8 },
  calDayText: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#9C9690' },
  calDays: { flexDirection: 'row', flexWrap: 'wrap' },
  calDay: { width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 6 },
  calDaySelected: { backgroundColor: '#BD632F', borderRadius: 16 },
  calDayNumber: { fontSize: 13, fontWeight: '500', color: '#1A1817' },
  calDayNumberSelected: { color: '#FFFFFF', fontWeight: '700' },
  reasonsCard: { backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E6E1DC', padding: 16 },
  reasonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#E6E1DC', justifyContent: 'center', alignItems: 'center' },
  radioSelected: { borderColor: '#BD632F' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#BD632F' },
  reasonText: { fontSize: 15, fontWeight: '500', color: '#1A1817' },
  noteInput: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', paddingHorizontal: 16, paddingVertical: 14, minHeight: 100, textAlignVertical: 'top', fontSize: 14, color: '#1A1817' },
  infoBanner: { flexDirection: 'row', backgroundColor: '#FFF2EB', borderRadius: 12, padding: 14, gap: 10, marginTop: 20 },
  infoText: { flex: 1, fontSize: 13, fontWeight: '500', color: '#7C7672', lineHeight: 18 },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FAF9F6', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 30 },
  continueBtn: { backgroundColor: '#BD632F', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  continueBtnDisabled: { backgroundColor: '#E6E1DC' },
  continueBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 30 },
  modalContainer: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, width: '100%' },
  modalCloseBtn: { alignSelf: 'flex-end', marginBottom: 8 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1817', marginBottom: 12 },
  modalDescription: { fontSize: 14, fontWeight: '500', color: '#7C7672', lineHeight: 20, marginBottom: 24 },
  modalButtons: { flexDirection: 'row', gap: 12 },
  modalBackBtn: { flex: 1, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: '#E6E1DC', justifyContent: 'center', alignItems: 'center' },
  modalBackBtnText: { color: '#7C7672', fontSize: 15, fontWeight: '600' },
  modalConfirmBtn: { flex: 1, height: 48, borderRadius: 24, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  modalConfirmBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1817', marginBottom: 12 },
  cancelledCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', padding: 14, marginBottom: 10, gap: 12 },
  cancelledAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center' },
  cancelledInfo: { flex: 1 },
  cancelledName: { fontSize: 14, fontWeight: '700', color: '#1A1817' },
  cancelledOwner: { fontSize: 12, color: '#7C7672', fontWeight: '500' },
  cancelledDateTime: { fontSize: 12, color: '#9C9690', fontWeight: '500', marginTop: 2 },
  cancelledBadge: { backgroundColor: '#FFEBEE', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  cancelledBadgeText: { fontSize: 11, fontWeight: '600', color: '#C62828' },
  walletSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', padding: 14, marginBottom: 16 },
  walletHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  walletLabel: { fontSize: 13, fontWeight: '600', color: '#1A1817' },
  walletAmount: { fontSize: 16, fontWeight: '800', color: '#BD632F' },
  billingSection: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', padding: 16, marginBottom: 16 },
  billingTitle: { fontSize: 16, fontWeight: '700', color: '#1A1817', marginBottom: 12 },
  billingRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  billingLabel: { fontSize: 13, color: '#7C7672', fontWeight: '500' },
  billingValue: { fontSize: 13, fontWeight: '600', color: '#1A1817' },
  billingDivider: { height: 1, backgroundColor: '#E6E1DC', marginVertical: 8 },
  feesTitle: { fontSize: 14, fontWeight: '700', color: '#1A1817', marginBottom: 8 },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#1A1817' },
  totalValue: { fontSize: 14, fontWeight: '800', color: '#1A1817' },
  paidText: { fontSize: 13, fontWeight: '600', color: '#2E7D32' },
  confirmBtn: { backgroundColor: '#BD632F', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  backBtnBottom: { height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: '#E6E1DC', justifyContent: 'center', alignItems: 'center' },
  backBtnText: { color: '#7C7672', fontSize: 16, fontWeight: '600' },
  confirmedContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  confirmedCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  confirmedTitle: { fontSize: 20, fontWeight: '700', color: '#1A1817', marginBottom: 8 },
  confirmedDate: { fontSize: 14, fontWeight: '600', color: '#BD632F', marginBottom: 8 },
  confirmedSubtitle: { fontSize: 14, fontWeight: '500', color: '#7C7672', textAlign: 'center' },
  viewCalendarBtn: { backgroundColor: '#BD632F', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  viewCalendarBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  doneBtn: { height: 52, borderRadius: 26, borderWidth: 1.5, borderColor: '#E6E1DC', justifyContent: 'center', alignItems: 'center' },
  doneBtnText: { color: '#7C7672', fontSize: 16, fontWeight: '600' },
});

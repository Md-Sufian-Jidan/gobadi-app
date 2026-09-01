import React, { useState } from 'react';
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

type DateFilter = 'today' | 'tomorrow' | 'this_week' | null;
type StatusFilter = 'all' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | null;
type ConsultationFilter = 'all' | 'video' | 'voice' | 'chat' | 'physical' | null;

export default function AppointmentFilterScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<DateFilter>('today');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [selectedConsultation, setSelectedConsultation] = useState<ConsultationFilter>('all');

  const handleApply = () => {
    const params: Record<string, string> = {};
    if (selectedDate) params.filterDate = selectedDate;
    if (selectedStatus && selectedStatus !== 'all') params.filterStatus = selectedStatus;
    if (selectedConsultation && selectedConsultation !== 'all') params.filterConsultationType = selectedConsultation;
    router.push({
      pathname: '/appointments',
      params,
    });
  };

  const handleClear = () => {
    setSelectedDate('today');
    setSelectedStatus('all');
    setSelectedConsultation('all');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color="#BD632F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter Appointments</Text>
        <TouchableOpacity onPress={handleClear} activeOpacity={0.7}>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.sectionTitle}>Date</Text>
        <View style={styles.chipRow}>
          {(['today', 'tomorrow', 'this_week'] as DateFilter[]).map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.chip, selectedDate === option && styles.chipActive]}
              onPress={() => setSelectedDate(selectedDate === option ? null : option)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedDate === option && styles.chipTextActive,
                ]}
              >
                {option === 'today'
                  ? 'Today'
                  : option === 'tomorrow'
                  ? 'Tomorrow'
                  : 'This week'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Booked Appointments</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'all', label: 'All' },
            { value: 'CONFIRMED', label: 'Upcoming' },
            { value: 'COMPLETED', label: 'Completed' },
            { value: 'CANCELLED', label: 'Cancelled' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.radioRow}
              onPress={() => setSelectedStatus(option.value as StatusFilter)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radioOuter,
                  selectedStatus === option.value && styles.radioOuterActive,
                ]}
              >
                {selectedStatus === option.value && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Consultation Type</Text>
        <View style={styles.radioGroup}>
          {[
            { value: 'all', label: 'All' },
            { value: 'video', label: 'Online - Video' },
            { value: 'voice', label: 'Online - Voice' },
            { value: 'chat', label: 'Online - Chat' },
            { value: 'physical', label: 'Physical' },
          ].map((option) => (
            <TouchableOpacity
              key={option.value}
              style={styles.radioRow}
              onPress={() => setSelectedConsultation(option.value as ConsultationFilter)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.radioOuter,
                  selectedConsultation === option.value && styles.radioOuterActive,
                ]}
              >
                {selectedConsultation === option.value && <View style={styles.radioInner} />}
              </View>
              <Text style={styles.radioLabel}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} activeOpacity={0.8}>
          <Text style={styles.applyBtnText}>Apply</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
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
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1817' },
  clearText: { fontSize: 15, fontWeight: '600', color: '#BD632F' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    marginTop: 20,
    marginBottom: 12,
  },
  chipRow: { flexDirection: 'row', gap: 10 },
  chip: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    backgroundColor: '#FFFFFF',
  },
  chipActive: {
    backgroundColor: '#BD632F',
    borderColor: '#BD632F',
  },
  chipText: { fontSize: 14, fontWeight: '600', color: '#7C7672' },
  chipTextActive: { color: '#FFFFFF' },
  radioGroup: { gap: 4 },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E6E1DC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterActive: { borderColor: '#BD632F' },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#BD632F',
  },
  radioLabel: { fontSize: 15, fontWeight: '500', color: '#1A1817' },
  bottomContainer: { paddingHorizontal: 20, paddingVertical: 16 },
  applyBtn: {
    backgroundColor: '#BD632F',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
  },
  applyBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});

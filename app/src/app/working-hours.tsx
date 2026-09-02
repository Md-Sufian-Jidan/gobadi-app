import React, { useState, useEffect } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  useGetMyDoctorProfileQuery,
  useGetAvailabilityQuery,
  useSetAvailabilityMutation,
  type Availability,
} from '@/store/doctorPortalApi';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_INDEX: Record<string, number> = {
  Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6,
};

interface DaySchedule {
  day: string;
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
  availabilityId?: number;
}

function formatTime12h(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

function time12to24(time12: string): string {
  const match = time12.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return '09:00';
  let [, h, m, ampm] = match;
  let hour = parseInt(h, 10);
  if (ampm.toUpperCase() === 'PM' && hour !== 12) hour += 12;
  if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
  return `${String(hour).padStart(2, '0')}:${m}`;
}

function buildEmptySchedule(): DaySchedule[] {
  return DAY_NAMES.map((day, idx) => ({
    day,
    dayOfWeek: idx,
    enabled: false,
    startTime: '09:00 AM',
    endTime: '05:00 PM',
  }));
}

export default function WorkingHoursScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;

  const { data: profile } = useGetMyDoctorProfileQuery();
  const doctorId = profile?.id;
  const { data: availability, isLoading: loadingAvailability } = useGetAvailabilityQuery(doctorId!, { skip: !doctorId });
  const [setAvailability, { isLoading: saving }] = useSetAvailabilityMutation();

  const [schedule, setSchedule] = useState<DaySchedule[]>(buildEmptySchedule());
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (availability && availability.length > 0) {
      const mapped: DaySchedule[] = DAY_NAMES.map((day, idx) => {
        const entry = availability.find((a) => a.dayOfWeek === idx);
        if (entry) {
          return {
            day,
            dayOfWeek: idx,
            enabled: entry.isActive,
            startTime: formatTime12h(entry.startTime),
            endTime: formatTime12h(entry.endTime),
            availabilityId: entry.id,
          };
        }
        return { day, dayOfWeek: idx, enabled: false, startTime: '09:00 AM', endTime: '05:00 PM' };
      });
      setSchedule(mapped);
    }
  }, [availability]);

  const toggleDay = (index: number) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, enabled: !item.enabled } : item))
    );
    setHasChanges(true);
  };

  const handleDayPress = (day: string) => {
    setSelectedDay(day);
  };

  const handleSaveDay = (daySchedule: DaySchedule) => {
    setSchedule((prev) =>
      prev.map((item) => (item.day === daySchedule.day ? daySchedule : item))
    );
    setHasChanges(true);
    setSelectedDay(null);
  };

  const handleSaveAll = async () => {
    if (!doctorId) return;
    const entries = schedule.map((s) => ({
      dayOfWeek: s.dayOfWeek,
      startTime: time12to24(s.startTime),
      endTime: time12to24(s.endTime),
      isActive: s.enabled,
    }));
    try {
      await setAvailability({ doctorId, entries }).unwrap();
      setHasChanges(false);
      Alert.alert('Saved', 'Working hours updated successfully.');
    } catch {
      Alert.alert('Error', 'Failed to save working hours.');
    }
  };

  if (selectedDay) {
    const dayData = schedule.find((d) => d.day === selectedDay) || schedule[0];
    const startHour12 = dayData.startTime;
    const endHour12 = dayData.endTime;
    const startIsAM = startHour12.includes('AM');
    const endIsAM = endHour12.includes('AM');

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedDay(null)} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedDay}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.timePickerContent}>
          <Text style={styles.timeLabel}>Start</Text>
          <View style={styles.timePickerRow}>
            <View style={styles.timeBox}>
              <Text style={styles.timeValue}>{startHour12.split(' ')[0]}</Text>
            </View>
            <View style={styles.ampmRow}>
              <TouchableOpacity
                style={[styles.ampmBtn, startIsAM && styles.ampmBtnActive]}
                activeOpacity={0.8}
                onPress={() => {
                  const time = startHour12.split(' ')[0];
                  handleSaveDay({ ...dayData, startTime: `${time} AM` });
                }}
              >
                <Text style={[styles.ampmText, startIsAM && styles.ampmTextActive]}>am</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ampmBtn, !startIsAM && styles.ampmBtnActive]}
                activeOpacity={0.8}
                onPress={() => {
                  const time = startHour12.split(' ')[0];
                  handleSaveDay({ ...dayData, startTime: `${time} PM` });
                }}
              >
                <Text style={[styles.ampmText, !startIsAM && styles.ampmTextActive]}>pm</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.timeLabel, { marginTop: 32 }]}>End</Text>
          <View style={styles.timePickerRow}>
            <View style={styles.timeBox}>
              <Text style={styles.timeValue}>{endHour12.split(' ')[0]}</Text>
            </View>
            <View style={styles.ampmRow}>
              <TouchableOpacity
                style={[styles.ampmBtn, endIsAM && styles.ampmBtnActive]}
                activeOpacity={0.8}
                onPress={() => {
                  const time = endHour12.split(' ')[0];
                  handleSaveDay({ ...dayData, endTime: `${time} AM` });
                }}
              >
                <Text style={[styles.ampmText, endIsAM && styles.ampmTextActive]}>am</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ampmBtn, !endIsAM && styles.ampmBtnActive]}
                activeOpacity={0.8}
                onPress={() => {
                  const time = endHour12.split(' ')[0];
                  handleSaveDay({ ...dayData, endTime: `${time} PM` });
                }}
              >
                <Text style={[styles.ampmText, !endIsAM && styles.ampmTextActive]}>pm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (loadingAvailability) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Working hours</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BD632F" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Working hours</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {schedule.map((item, index) => (
          <TouchableOpacity
            key={item.day}
            style={styles.dayRow}
            onPress={() => handleDayPress(item.day)}
            activeOpacity={0.7}
          >
            <Text style={styles.dayLabel}>{item.day}</Text>
            <Text style={styles.timeRange}>
              {item.startTime} - {item.endTime}
            </Text>
            <Switch
              value={item.enabled}
              onValueChange={() => toggleDay(index)}
              trackColor={{ true: '#BD632F', false: '#E6E1DC' }}
              thumbColor="#FFFFFF"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.saveBtn, (!hasChanges || saving) && styles.saveBtnDisabled]}
          onPress={handleSaveAll}
          activeOpacity={0.85}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.saveBtnText}>Save</Text>
          )}
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
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  dayRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#E6E1DC' },
  dayLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: '#1A1817' },
  timeRange: { fontSize: 13, fontWeight: '500', color: '#7C7672', marginRight: 14 },
  timePickerContent: { paddingHorizontal: 20, paddingBottom: 100 },
  timeLabel: { fontSize: 14, fontWeight: '600', color: '#1A1817', marginBottom: 12 },
  timePickerRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  timeBox: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', paddingHorizontal: 24, paddingVertical: 16 },
  timeValue: { fontSize: 28, fontWeight: '700', color: '#BD632F' },
  ampmRow: { flexDirection: 'row', gap: 8 },
  ampmBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#E6E1DC', backgroundColor: '#FFFFFF' },
  ampmBtnActive: { backgroundColor: '#BD632F', borderColor: '#BD632F' },
  ampmText: { fontSize: 14, fontWeight: '600', color: '#7C7672' },
  ampmTextActive: { color: '#FFFFFF' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FAF9F6', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 30 },
  saveBtn: { backgroundColor: '#BD632F', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#E6E1DC' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

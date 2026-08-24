import React, { useState } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface DaySchedule {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const INITIAL_SCHEDULE: DaySchedule[] = [
  { day: 'Saturday', enabled: false, startTime: '09:00 AM', endTime: '06:00 PM' },
  { day: 'Sunday', enabled: true, startTime: '09:00 AM', endTime: '05:00 PM' },
  { day: 'Monday', enabled: true, startTime: '09:00 AM', endTime: '05:00 PM' },
  { day: 'Tuesday', enabled: true, startTime: '09:00 AM', endTime: '05:00 PM' },
  { day: 'Wednesday', enabled: true, startTime: '09:00 AM', endTime: '05:00 PM' },
  { day: 'Thursday', enabled: true, startTime: '09:00 AM', endTime: '05:00 PM' },
  { day: 'Friday', enabled: false, startTime: '09:00 AM', endTime: '10:00 AM' },
];

export default function WorkingHoursScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;
  const [schedule, setSchedule] = useState<DaySchedule[]>(INITIAL_SCHEDULE);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const toggleDay = (index: number) => {
    setSchedule((prev) =>
      prev.map((item, i) => (i === index ? { ...item, enabled: !item.enabled } : item))
    );
  };

  const handleDayPress = (day: string) => {
    setSelectedDay(day);
  };

  if (selectedDay) {
    const dayData = schedule.find((d) => d.day === selectedDay);
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
              <Text style={styles.timeValue}>{dayData?.startTime.split(' ')[0]}</Text>
            </View>
            <View style={styles.ampmRow}>
              <TouchableOpacity style={[styles.ampmBtn, styles.ampmBtnActive]} activeOpacity={0.8}>
                <Text style={[styles.ampmText, styles.ampmTextActive]}>am</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.ampmBtn} activeOpacity={0.8}>
                <Text style={styles.ampmText}>pm</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.timeLabel, { marginTop: 32 }]}>End</Text>
          <View style={styles.timePickerRow}>
            <View style={styles.timeBox}>
              <Text style={styles.timeValue}>{dayData?.endTime.split(' ')[0]}</Text>
            </View>
            <View style={styles.ampmRow}>
              <TouchableOpacity style={styles.ampmBtn} activeOpacity={0.8}>
                <Text style={styles.ampmText}>am</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.ampmBtn, styles.ampmBtnActive]} activeOpacity={0.8}>
                <Text style={[styles.ampmText, styles.ampmTextActive]}>pm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomBar}>
          <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
            <Text style={styles.saveBtnText}>Save</Text>
          </TouchableOpacity>
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
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1817' },
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
  saveBtn: { backgroundColor: '#E6E1DC', height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

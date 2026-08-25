import React, { useState, useMemo, useCallback, useRef } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Modal,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import {
  useGetDoctorBookingsQuery,
  type DoctorAppointment,
} from '@/store/doctorPortalApi';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ViewMode = 'calendar' | 'list';
type CalendarGranularity = 'yearly' | 'monthly';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getWeekDates(reference: Date): Date[] {
  const start = new Date(reference);
  start.setDate(start.getDate() - start.getDay());
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function MonthGrid({
  year,
  month,
  appointmentDates,
  selectedDate,
  onSelectDate,
}: {
  year: number;
  month: number;
  appointmentDates: Set<string>;
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <View style={styles.monthGrid}>
      <Text style={styles.monthTitle}>{MONTH_NAMES[month]} {year}</Text>
      <View style={styles.dayHeaderRow}>
        {DAY_LETTERS.map((d, i) => (
          <Text key={i} style={styles.dayHeaderText}>{d}</Text>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {blanks.map((b) => (
          <View key={`blank-${b}`} style={styles.dayCell} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const key = formatDateKey(date);
          const hasAppointment = appointmentDates.has(key);
          const isToday = isSameDay(date, new Date());

          return (
            <TouchableOpacity
              key={day}
              style={styles.dayCell}
              onPress={() => onSelectDate(date)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dayNumber,
                  hasAppointment && styles.dayNumberHasAppointment,
                  isToday && !hasAppointment && styles.dayNumberToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayNumberText,
                    hasAppointment && styles.dayNumberTextAppointment,
                    isToday && !hasAppointment && styles.dayNumberTextToday,
                  ]}
                >
                  {day}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function WeekStrip({
  selectedDate,
  onSelectDate,
}: {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate.getTime()]);

  return (
    <View style={styles.weekStrip}>
      <View style={styles.weekDayHeader}>
        {DAY_SHORT.map((d, i) => (
          <Text key={i} style={styles.weekDayLabel}>{d}</Text>
        ))}
      </View>
      <View style={styles.weekDateRow}>
        {weekDates.map((date, i) => {
          const isSelected = isSameDay(date, selectedDate);
          const isToday = isSameDay(date, new Date());
          return (
            <TouchableOpacity
              key={i}
              style={[styles.weekDateCell, isSelected && styles.weekDateCellSelected]}
              onPress={() => onSelectDate(date)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.weekDateNumber,
                  isSelected && styles.weekDateNumberSelected,
                  isToday && !isSelected && styles.weekDateNumberToday,
                ]}
              >
                {date.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function DayBottomSheet({
  visible,
  appointments,
  selectedDate,
  onClose,
}: {
  visible: boolean;
  appointments: DoctorAppointment[];
  selectedDate: Date;
  onClose: () => void;
}) {
  const dayAppointments = useMemo(() => {
    return appointments
      .filter((a) => isSameDay(new Date(a.startAt), selectedDate))
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
  }, [appointments, selectedDate]);

  const now = new Date();
  const isToday = isSameDay(selectedDate, now);
  const currentHour = now.getHours();
  const currentMinutes = now.getMinutes();

  const pastAppts = dayAppointments.filter((a) => new Date(a.endAt) < now);
  const upcomingAppts = dayAppointments.filter((a) => new Date(a.startAt) >= now);

  const dayName = DAY_FULL[selectedDate.getDay()];
  const monthName = MONTH_NAMES[selectedDate.getMonth()];

  const formatHourLabel = (hour: number) => {
    const h = hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${String(h).padStart(2, '0')}:00 ${ampm}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.bottomSheetContainer}>
          <View style={styles.bottomSheetHandle} />

          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>
              {dayName}, {selectedDate.getDate()} {monthName}
            </Text>
            <Text style={styles.bottomSheetCount}>
              {dayAppointments.length} Appointment{dayAppointments.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bottomSheetScroll}
          >
            {dayAppointments.length === 0 ? (
              <View style={styles.emptyDayContainer}>
                <Ionicons name="calendar-outline" size={40} color="#E6E1DC" />
                <Text style={styles.emptyDayText}>No appointments for this day</Text>
              </View>
            ) : (
              <>
                {pastAppts.map((appt) => (
                  <DayAppointmentCard key={appt.id} appointment={appt} isPast />
                ))}

                {isToday && (
                  <View style={styles.current_time_container}>
                    <View style={styles.current_time_line} />
                    <View style={styles.current_time_dot} />
                    <Text style={styles.current_time_label}>
                      {String(currentHour).padStart(2, '0')}:{String(currentMinutes).padStart(2, '0')}
                    </Text>
                    <View style={styles.current_time_line_right} />
                  </View>
                )}

                {upcomingAppts.length > 0 && (
                  <>
                    <Text style={styles.upcoming_label}>Upcoming</Text>
                    {upcomingAppts.map((appt) => (
                      <DayAppointmentCard key={appt.id} appointment={appt} />
                    ))}
                  </>
                )}
              </>
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

function DayAppointmentCard({ appointment, isPast }: { appointment: DoctorAppointment; isPast?: boolean }) {
  return (
    <View style={[styles.dayAppointmentCard, isPast && styles.dayAppointmentCardPast]}>
      <View style={styles.dayAppointmentAvatar}>
        {appointment.animalImage ? (
          <View style={styles.dayAppointmentAvatarImage} />
        ) : (
          <Ionicons name="paw" size={20} color="#BD632F" />
        )}
      </View>
      <View style={styles.dayAppointmentInfo}>
        <Text style={styles.dayAppointmentName}>
          {appointment.animalName || appointment.patientName || `Patient #${appointment.patientId}`}
        </Text>
        {appointment.animalSpecies && (
          <Text style={styles.dayAppointmentDetail}>
            {appointment.animalSpecies}
            {appointment.animalAge ? ` · ${appointment.animalAge}` : ''}
          </Text>
        )}
        {appointment.symptoms && (
          <Text style={styles.dayAppointmentSymptoms}>{appointment.symptoms}</Text>
        )}
      </View>
    </View>
  );
}

function ListView({
  appointments,
}: {
  appointments: DoctorAppointment[];
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, DoctorAppointment[]>();
    appointments.forEach((a) => {
      const key = formatDateKey(new Date(a.startAt));
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [appointments]);

  const totalCount = appointments.length;
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  if (grouped.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="calendar-outline" size={48} color="#E6E1DC" />
        <Text style={styles.emptyText}>No appointments scheduled</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listScrollContainer}>
      <View style={styles.listMonthHeader}>
        <Text style={styles.listMonthTitle}>{MONTH_NAMES[currentMonth]} {currentYear}</Text>
        <Text style={styles.listMonthCount}>{totalCount} Appointments</Text>
      </View>

      {grouped.map(([dateKey, appts]) => {
        const date = new Date(dateKey + 'T12:00:00');
        return (
          <View key={dateKey} style={styles.listDateGroup}>
            <View style={styles.listDateSide}>
              <Text style={styles.listDateDayName}>{DAY_SHORT[date.getDay()]}</Text>
              <Text style={styles.listDateDayNumber}>{date.getDate()}</Text>
            </View>
            <View style={styles.listDateCards}>
              {appts.map((appt) => (
                <ListAppointmentCard key={appt.id} appointment={appt} />
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function ListAppointmentCard({ appointment }: { appointment: DoctorAppointment }) {
  const startDate = new Date(appointment.startAt);
  const endDate = new Date(appointment.endAt);

  const formatTimeShort = (iso: string) => {
    const d = new Date(iso);
    const h = d.getHours();
    const m = d.getMinutes();
    const ampm = h < 12 ? 'AM' : 'PM';
    const hour = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  return (
    <View style={styles.listAppointmentCard}>
      <View style={styles.listAppointmentDateBadge}>
        <Ionicons name="time-outline" size={14} color="#FFFFFF" />
        <Text style={styles.listAppointmentDateBadgeText}>
          {DAY_SHORT[startDate.getDay()]} Jun {startDate.getDate()} · {formatTimeShort(appointment.startAt)} - {formatTimeShort(appointment.endAt)}
        </Text>
      </View>
      <View style={styles.listAppointmentCardBody}>
        <View style={styles.listAppointmentAvatar}>
          {appointment.animalImage ? (
            <View style={styles.listAppointmentAvatarImage} />
          ) : (
            <Ionicons name="paw" size={20} color="#BD632F" />
          )}
        </View>
        <View style={styles.listAppointmentInfo}>
          <Text style={styles.listAppointmentName}>
            {appointment.animalName || appointment.patientName || `Patient #${appointment.patientId}`}
          </Text>
          {appointment.animalSpecies && (
            <Text style={styles.listAppointmentDetail}>
              {appointment.animalSpecies}
              {appointment.animalAge ? ` · ${appointment.animalAge}` : ''}
            </Text>
          )}
          {appointment.symptoms && (
            <Text style={styles.listAppointmentSymptoms}>{appointment.symptoms}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export default function ScheduleScreen() {
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;
  const router = useRouter();
  const user = useSelector((state: RootState) => state.auth.user);

  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [granularity, setGranularity] = useState<CalendarGranularity>('yearly');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [showDaySheet, setShowDaySheet] = useState(false);

  const { data: bookings = [], isLoading } = useGetDoctorBookingsQuery();

  const appointmentDates = useMemo(() => {
    const dates = new Set<string>();
    bookings.forEach((b) => {
      dates.add(formatDateKey(new Date(b.startAt)));
    });
    return dates;
  }, [bookings]);

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentMonth(date.getMonth());
    setCurrentYear(date.getFullYear());
    setShowDaySheet(true);
  }, []);

  const navigateMonth = useCallback((direction: number) => {
    setCurrentMonth((prev) => {
      let next = prev + direction;
      if (next < 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      if (next > 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return next;
    });
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Schedule</Text>
        {/* <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
          <Ionicons name="settings-outline" size={20} color="#BD632F" />
        </TouchableOpacity> */}
      </View>

      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.viewToggleButton, viewMode === 'calendar' && styles.viewToggleButtonActive]}
          onPress={() => setViewMode('calendar')}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewToggleText, viewMode === 'calendar' && styles.viewToggleTextActive]}>
            Full Calendar
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewToggleButton, viewMode === 'list' && styles.viewToggleButtonActive]}
          onPress={() => setViewMode('list')}
          activeOpacity={0.8}
        >
          <Text style={[styles.viewToggleText, viewMode === 'list' && styles.viewToggleTextActive]}>
            List View
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#BD632F" style={{ marginTop: 40 }} />
      ) : viewMode === 'list' ? (
        <ListView appointments={bookings} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.calendarScroll}>
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterBtn} activeOpacity={0.8}>
              <Ionicons name="options-outline" size={14} color="#1A1817" />
              <Text style={styles.filterBtnText}>Filter</Text>
            </TouchableOpacity>
            <View style={styles.granularityToggle}>
              <TouchableOpacity
                style={[styles.granularityBtn, granularity === 'yearly' && styles.granularityBtnActive]}
                onPress={() => setGranularity('yearly')}
                activeOpacity={0.8}
              >
                <Text style={[styles.granularityText, granularity === 'yearly' && styles.granularityTextActive]}>
                  Yearly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.granularityBtn, granularity === 'monthly' && styles.granularityBtnActive]}
                onPress={() => setGranularity('monthly')}
                activeOpacity={0.8}
              >
                <Text style={[styles.granularityText, granularity === 'monthly' && styles.granularityTextActive]}>
                  Monthly
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {granularity === 'yearly' ? (
            Array.from({ length: 12 }, (_, i) => (
              <MonthGrid
                key={i}
                year={currentYear}
                month={i}
                appointmentDates={appointmentDates}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            ))
          ) : (
            <>
              <View style={styles.monthNavigation}>
                <TouchableOpacity onPress={() => navigateMonth(-1)} style={styles.navBtn} activeOpacity={0.7}>
                  <Ionicons name="chevron-back" size={18} color="#BD632F" />
                </TouchableOpacity>
                <Text style={styles.monthNavTitle}>{MONTH_NAMES[currentMonth]} {currentYear}</Text>
                <TouchableOpacity onPress={() => navigateMonth(1)} style={styles.navBtn} activeOpacity={0.7}>
                  <Ionicons name="chevron-forward" size={18} color="#BD632F" />
                </TouchableOpacity>
              </View>
              <MonthGrid
                year={currentYear}
                month={currentMonth}
                appointmentDates={appointmentDates}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </>
          )}

          <WeekStrip selectedDate={selectedDate} onSelectDate={handleSelectDate} />
        </ScrollView>
      )}

      <DayBottomSheet
        visible={showDaySheet}
        appointments={bookings}
        selectedDate={selectedDate}
        onClose={() => setShowDaySheet(false)}
      />
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
    // justifyContent: 'space-between',
    gap: 20,
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
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1817',
  },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewToggle: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: '#FFF2EB',
    borderRadius: 20,
    padding: 4,
  },
  viewToggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 16,
  },
  viewToggleButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  viewToggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9C9690',
  },
  viewToggleTextActive: {
    color: '#1A1817',
    fontWeight: '700',
  },
  calendarScroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1817',
  },
  granularityToggle: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    overflow: 'hidden',
  },
  granularityBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
  },
  granularityBtnActive: {
    backgroundColor: '#BD632F',
  },
  granularityText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C7672',
  },
  granularityTextActive: {
    color: '#FFFFFF',
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 16,
  },
  navBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  monthNavTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
  },
  monthGrid: {
    marginBottom: 20,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 12,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#BD632F',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberHasAppointment: {
    backgroundColor: '#BD632F',
  },
  dayNumberToday: {
    backgroundColor: '#FFF2EB',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1A1817',
  },
  dayNumberTextAppointment: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dayNumberTextToday: {
    color: '#BD632F',
    fontWeight: '700',
  },
  weekStrip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 14,
    marginTop: 8,
    marginBottom: 16,
  },
  weekDayHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#9C9690',
  },
  weekDateRow: {
    flexDirection: 'row',
  },
  weekDateCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  weekDateCellSelected: {
    backgroundColor: '#BD632F',
    borderRadius: 20,
  },
  weekDateNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1817',
  },
  weekDateNumberSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  weekDateNumberToday: {
    color: '#BD632F',
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#FAF9F6',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.7,
    paddingBottom: 20,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E6E1DC',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 16,
  },
  bottomSheetHeader: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
  },
  bottomSheetCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#BD632F',
    marginTop: 4,
  },
  bottomSheetScroll: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  timeLabelContainer: {
    width: 70,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9C9690',
  },
  timeLine: {
    width: 20,
    alignItems: 'center',
  },
  timeLineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BD632F',
    marginTop: 4,
  },
  timeLineBar: {
    width: 2,
    flex: 1,
    backgroundColor: '#E6E1DC',
    marginTop: 4,
  },
  timeLineContent: {
    flex: 1,
    paddingLeft: 8,
  },
  dayAppointmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  dayAppointmentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayAppointmentInfo: {
    flex: 1,
  },
  dayAppointmentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  dayAppointmentDetail: {
    fontSize: 12,
    color: '#9C9690',
    fontWeight: '500',
  },
  dayAppointmentSymptoms: {
    fontSize: 12,
    color: '#BD632F',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  dayAppointmentCardPast: {
    opacity: 0.6,
  },
  dayAppointmentAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6E1DC',
  },
  emptyDayContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyDayText: {
    fontSize: 14,
    color: '#9C9690',
    fontWeight: '500',
  },
  current_time_container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  current_time_line: {
    flex: 1,
    height: 2,
    backgroundColor: '#1565C0',
  },
  current_time_dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#1565C0',
    marginHorizontal: 8,
  },
  current_time_label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1565C0',
    marginRight: 8,
  },
  current_time_line_right: {
    flex: 1,
    height: 2,
    backgroundColor: '#1565C0',
  },
  upcoming_label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
    marginTop: 8,
    marginBottom: 12,
  },
  listScrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  listMonthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  listMonthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
  },
  listMonthCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#BD632F',
  },
  listDateGroup: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  listDateSide: {
    width: 50,
    alignItems: 'center',
    marginRight: 12,
  },
  listDateDayName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9C9690',
    textTransform: 'uppercase',
  },
  listDateDayNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1817',
  },
  listDateCards: {
    flex: 1,
  },
  listAppointmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    marginBottom: 10,
    overflow: 'hidden',
  },
  listAppointmentDateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#BD632F',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  listAppointmentDateBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  listAppointmentCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
  listAppointmentAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listAppointmentAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E6E1DC',
  },
  listAppointmentInfo: {
    flex: 1,
  },
  listAppointmentName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  listAppointmentDetail: {
    fontSize: 12,
    color: '#9C9690',
    fontWeight: '500',
  },
  listAppointmentSymptoms: {
    fontSize: 12,
    color: '#BD632F',
    fontWeight: '500',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9C9690',
    fontWeight: '500',
  },
});

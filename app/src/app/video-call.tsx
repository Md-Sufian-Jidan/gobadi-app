import React, { useState, useEffect } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function VideoCallScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  const params = useLocalSearchParams<{
    doctorName?: string;
    duration?: string;
  }>();

  const doctorName = params.doctorName || 'Doctor';
  const initialDuration = params.duration ? parseInt(params.duration, 10) : 900;

  const [callEnded, setCallEnded] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isDoctor) return null;

  return (
    <View style={styles.container}>
      {/* Full Screen Video Background */}
      <View style={styles.videoBackground}>
        <View style={styles.videoPlaceholder}>
          <Ionicons name="videocam" size={48} color="rgba(255,255,255,0.08)" />
        </View>
      </View>

      {/* Picture-in-Picture (Doctor) */}
      <View style={styles.pipContainer}>
        <View style={styles.pipBox}>
          <View style={styles.pipPlaceholder}>
            <Ionicons name="person" size={28} color="#FFFFFF" />
          </View>
        </View>
      </View>

      {/* Status Bar */}
      <SafeAreaView style={styles.statusBar} />

      {/* Top Controls */}
      <TouchableOpacity style={styles.backBtnTop} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Doctor Name & Timer */}
      <View style={styles.callInfoOverlay}>
        <Text style={styles.callDoctorName}>{doctorName}</Text>
        <Text style={styles.callTimer}>{formatTimer(elapsed)}</Text>
      </View>

      {/* Bottom Quick Actions */}
      <View style={styles.bottomQuickActions}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
          <TouchableOpacity style={styles.quickActionChip} activeOpacity={0.8}>
            <Text style={styles.quickActionChipText}>Send prescription</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionChip} activeOpacity={0.8}>
            <Text style={styles.quickActionChipText}>Send recommendation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickActionChip} activeOpacity={0.8}>
            <Ionicons name="chevron-down" size={16} color="#1A1817" />
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Bottom Control Bar */}
      <View style={styles.controlBar}>
        <TouchableOpacity style={styles.controlBtn} activeOpacity={0.8}>
          <Ionicons name="videocam" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} activeOpacity={0.8}>
          <Ionicons name="mic" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlBtn} activeOpacity={0.8}>
          <Ionicons name="camera" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.endCallBtn} activeOpacity={0.8} onPress={() => setCallEnded(true)}>
          <Ionicons name="call" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Call Ended Modal */}
      <Modal visible={callEnded} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalCheckCircle}>
              <Ionicons name="checkmark" size={40} color="#FFFFFF" />
            </View>
            <Text style={styles.modalTitle}>Consultation ended!</Text>
            <Text style={styles.modalSubtitle}>Your consultation has ended successfully.</Text>
            <TouchableOpacity
              style={styles.modalHomeBtn}
              onPress={() => router.replace('/(tabs)/doctor-home')}
              activeOpacity={0.85}
            >
              <Text style={styles.modalHomeBtnText}>Back to home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  videoBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  videoPlaceholder: { flex: 1, backgroundColor: '#1A1817', justifyContent: 'center', alignItems: 'center' },
  statusBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  backBtnTop: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  pipContainer: { position: 'absolute', top: 50, right: 20 },
  pipBox: { width: 100, height: 140, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#FFFFFF' },
  pipPlaceholder: { flex: 1, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  callInfoOverlay: { position: 'absolute', bottom: 160, left: 0, right: 0, alignItems: 'center' },
  callDoctorName: { fontSize: 18, fontWeight: '700', color: '#FFFFFF', marginBottom: 4 },
  callTimer: { fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },
  bottomQuickActions: { position: 'absolute', bottom: 110, left: 0, right: 0, paddingHorizontal: 20 },
  quickActionsScroll: { flexDirection: 'row', gap: 8 },
  quickActionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, gap: 4 },
  quickActionChipText: { fontSize: 13, fontWeight: '600', color: '#1A1817' },
  controlBar: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
  controlBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  endCallBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  modalCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 32, alignItems: 'center', width: '100%' },
  modalCheckCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#4CAF50', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1A1817', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 14, fontWeight: '500', color: '#7C7672', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  modalHomeBtn: { backgroundColor: '#BD632F', borderRadius: 26, paddingHorizontal: 24, paddingVertical: 16, alignItems: 'center' },
  modalHomeBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

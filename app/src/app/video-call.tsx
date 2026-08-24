import React from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
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

export default function VideoCallScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;

  return (
    <View style={styles.container}>
      {/* Full Screen Video Background */}
      <View style={styles.videoBackground}>
        <View style={styles.videoPlaceholder}>
          <Text style={styles.videoPlaceholderText}>📹 Video Feed</Text>
        </View>
      </View>

      {/* Picture-in-Picture (Doctor) */}
      <View style={styles.pipContainer}>
        <View style={styles.pipBox}>
          <View style={styles.pipPlaceholder}>
            <Text style={styles.pipPlaceholderText}>👩‍⚕️</Text>
          </View>
        </View>
      </View>

      {/* Status Bar */}
      <SafeAreaView style={styles.statusBar} />

      {/* Top Controls */}
      <TouchableOpacity style={styles.backBtnTop} onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
      </TouchableOpacity>

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
            <Ionicons name="chevron-down" size={16} color="#FFFFFF" />
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
        <TouchableOpacity style={styles.endCallBtn} activeOpacity={0.8} onPress={() => router.back()}>
          <Ionicons name="call" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  videoBackground: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  videoPlaceholder: { flex: 1, backgroundColor: '#2D5016', justifyContent: 'center', alignItems: 'center' },
  videoPlaceholderText: { color: 'rgba(255,255,255,0.3)', fontSize: 16 },
  statusBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  backBtnTop: { position: 'absolute', top: 50, left: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  pipContainer: { position: 'absolute', top: 50, right: 20 },
  pipBox: { width: 100, height: 140, borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#FFFFFF' },
  pipPlaceholder: { flex: 1, backgroundColor: '#8B6914', justifyContent: 'center', alignItems: 'center' },
  pipPlaceholderText: { fontSize: 32 },
  bottomQuickActions: { position: 'absolute', bottom: 110, left: 0, right: 0, paddingHorizontal: 20 },
  quickActionsScroll: { flexDirection: 'row', gap: 8 },
  quickActionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, gap: 4 },
  quickActionChipText: { fontSize: 13, fontWeight: '600', color: '#FFFFFF' },
  controlBar: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
  controlBtn: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  endCallBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#E53935', justifyContent: 'center', alignItems: 'center' },
});

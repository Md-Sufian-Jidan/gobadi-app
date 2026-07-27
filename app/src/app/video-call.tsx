import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Image,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function VideoCallScreen() {
  const router = useRouter();
  const [seconds, setSeconds] = useState(932); // 15:32 is 15 minutes and 32 seconds
  const [isMuted, setIsMuted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Simple call timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Full screen Video feed of Doctor */}
      <ImageBackground
        source={require('@/assets/images/michael_doctor.png')}
        style={styles.doctorVideoFeed}
        resizeMode="cover"
      >
        {/* Header overlays */}
        <SafeAreaView style={styles.safeHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>

          {/* PIP User video preview */}
          <View style={styles.pipContainer}>
            <Image
              source={require('@/assets/images/user_cow_pip.png')}
              style={styles.pipImage}
            />
          </View>
        </SafeAreaView>

        {/* Doctor name & Time overlay at the bottom */}
        <View style={styles.bottomOverlay}>
          <Text style={styles.doctorName}>Dr. David Patel</Text>
          <Text style={styles.timerText}>{formatTime(seconds)}</Text>

          {/* Action buttons */}
          <View style={styles.actionsRow}>
            {/* End Call Button */}
            <TouchableOpacity
              style={styles.endCallButton}
              onPress={() => setShowSuccessModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.endCallIcon}>📞</Text>
            </TouchableOpacity>

            {/* Mute Button */}
            <TouchableOpacity
              style={[styles.muteButton, isMuted && styles.muteButtonActive]}
              onPress={() => setIsMuted(!isMuted)}
              activeOpacity={0.85}
            >
              <Text style={styles.muteIcon}>🎙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Congratulations Overlay Popup */}
        <Modal
          visible={showSuccessModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.successOuterCircle}>
                <View style={styles.successInnerCircle}>
                  <Text style={styles.checkmarkIcon}>✓</Text>
                </View>
              </View>

              <Text style={styles.congratsTitle}>Congratulations!</Text>
              <Text style={styles.congratsSubtitle}>
                Lorem Ipsum is simply dummy text of the printing and typesetting industry.
              </Text>

              <TouchableOpacity
                style={styles.backHomeButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  router.replace('/(tabs)');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.backHomeText}>← Back to home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  doctorVideoFeed: {
    flex: 1,
    justifyContent: 'space-between',
  },
  safeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  backArrow: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  pipContainer: {
    width: 100,
    height: 140,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  pipImage: {
    width: '100%',
    height: '100%',
  },
  bottomOverlay: {
    alignItems: 'center',
    paddingBottom: 48,
    paddingHorizontal: 24,
  },
  doctorName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  timerText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
    marginBottom: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E53935',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#E53935',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  endCallIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    transform: [{ rotate: '135deg' }],
  },
  muteButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(26, 24, 23, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  muteButtonActive: {
    backgroundColor: '#BD632F',
    borderColor: '#BD632F',
  },
  muteIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
  },
  successOuterCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  successInnerCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
  },
  congratsTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 12,
    textAlign: 'center',
  },
  congratsSubtitle: {
    fontSize: 13,
    color: '#7C7672',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  backHomeButton: {
    width: '100%',
    backgroundColor: '#BD632F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backHomeText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

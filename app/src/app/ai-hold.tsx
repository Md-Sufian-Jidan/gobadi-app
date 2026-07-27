import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAnalyzeSymptomsMutation } from '@/store/aiDiagnosisApi';

const { width, height } = Dimensions.get('window');

export default function AiHoldScreen() {
  const router = useRouter();
  const [scanState, setScanState] = useState<'holding' | 'scanning' | 'done'>('holding');
  const [progress] = useState(new Animated.Value(0));
  const [modalY] = useState(new Animated.Value(height));
  const [analyzeSymptoms, { data: diagnosis, error }] = useAnalyzeSymptomsMutation();

  useEffect(() => {
    // Trigger the scanner line animation while the analysis request runs
    Animated.timing(progress, {
      toValue: 1,
      duration: 3500,
      useNativeDriver: true,
    }).start();

    analyzeSymptoms({ symptoms: ['visual_scan'] })
      .unwrap()
      .then(() => {
        setScanState('done');
        Animated.spring(modalY, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }).start();
      })
      .catch(() => {
        // Surfaced via `error` below; leave the scan line running so the
        // user isn't stuck on a silently-frozen screen.
      });
  }, []);

  // Scan line animation interpolation
  const scanLineY = progress.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [height * 0.25, height * 0.65, height * 0.25],
  });

  return (
    <View style={styles.container}>
      {/* Cow Diagnostic Image Background */}
      <ImageBackground
        source={require('@/assets/images/cow_mouth.png')}
        style={styles.cameraBackground}
        resizeMode="cover"
      >
        {/* Back Button */}
        <SafeAreaView style={styles.safeHeader}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Scan Frame Guidelines */}
        <View style={styles.overlayFrameContainer}>
          <View style={styles.scanTargetArea}>
            {/* 4 Corner Markers */}
            <View style={[styles.cornerMarker, styles.topLeftCorner]} />
            <View style={[styles.cornerMarker, styles.topRightCorner]} />
            <View style={[styles.cornerMarker, styles.bottomLeftCorner]} />
            <View style={[styles.cornerMarker, styles.bottomRightCorner]} />
          </View>
        </View>

        {/* Laser Scanning Line Animation */}
        {scanState !== 'done' && (
          <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanLineY }] }]} />
        )}

        {/* Bottom Shutter & Status Indicators */}
        {scanState !== 'done' && (
          <View style={styles.bottomControls}>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeIcon}>⌛</Text>
              <Text style={styles.statusBadgeText}>Please hold still...</Text>
            </View>

            {/* Simulated shutter focus button */}
            <TouchableOpacity style={styles.shutterContainer} activeOpacity={0.9}>
              <View style={styles.shutterOuterRing}>
                <View style={styles.shutterInnerCircle} />
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* Backdrop overlay when modal is up */}
        {scanState === 'done' && <View style={styles.dimBackdrop} />}

        {/* Slide up scan results modal sheet */}
        <Animated.View style={[styles.modalSheet, { transform: [{ translateY: modalY }] }]}>
          {/* Handle bar */}
          <View style={styles.modalHandle} />

          {/* Diagnosis Header Info */}
          <View style={styles.diagnoseInfoBox}>
            <View style={styles.cowInfoRow}>
              <View style={styles.cowAvatarCircle}>
                <Text style={styles.cowAvatarEmoji}>🐮</Text>
              </View>
              <View style={styles.cowMetaCol}>
                <Text style={styles.cowTitle}>Cow</Text>
                <Text style={styles.cowTime}>Detected : just now</Text>
              </View>
            </View>
            <View style={styles.matchBadge}>
              <Text style={styles.matchBadgeText}>
                {diagnosis ? `${Math.round(diagnosis.confidenceScore * 100)}% ✅` : '—'}
              </Text>
            </View>
          </View>

          {/* Diagnosis detail block */}
          <View style={styles.diagnosticBody}>
            {error ? (
              <Text style={styles.diagnosticParagraph}>
                Something went wrong analyzing this scan. Please try again.
              </Text>
            ) : (
              <>
                <Text style={styles.diagnosticTitle}>{diagnosis?.analysisResult ?? 'Analyzing...'}</Text>
                {diagnosis?.recommendations?.length ? (
                  <Text style={styles.actionPlanLabel}>Immediate Action Plan</Text>
                ) : null}
              </>
            )}
          </View>

          {/* Details Summary Action button */}
          <TouchableOpacity
            style={styles.summaryButton}
            disabled={!diagnosis}
            onPress={() => router.replace({ pathname: '/ai-summary', params: { id: String(diagnosis!.id) } })}
            activeOpacity={0.85}
          >
            <Text style={styles.summaryButtonText}>Details Summary</Text>
          </TouchableOpacity>
        </Animated.View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraBackground: {
    flex: 1,
  },
  safeHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  overlayFrameContainer: {
    position: 'absolute',
    top: height * 0.25,
    left: width * 0.15,
    width: width * 0.7,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTargetArea: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  cornerMarker: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: '#FFFFFF',
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 16,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 16,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 16,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 16,
  },
  scanLine: {
    position: 'absolute',
    left: width * 0.15,
    width: width * 0.7,
    height: 3,
    backgroundColor: '#00FF66',
    shadowColor: '#00FF66',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 24, 23, 0.75)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 24,
  },
  statusBadgeIcon: {
    fontSize: 14,
    marginRight: 6,
    color: '#FFFFFF',
  },
  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  shutterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterOuterRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shutterInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
  },
  dimBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#E6E1DC',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 20,
  },
  diagnoseInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  cowInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cowAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E9E5DF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cowAvatarEmoji: {
    fontSize: 22,
  },
  cowMetaCol: {
    justifyContent: 'center',
  },
  cowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
  },
  cowTime: {
    fontSize: 12,
    color: '#7C7672',
    marginTop: 2,
  },
  matchBadge: {
    backgroundColor: '#EEFBEF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  matchBadgeText: {
    color: '#2E7D32',
    fontSize: 12,
    fontWeight: '700',
  },
  diagnosticBody: {
    marginBottom: 24,
  },
  diagnosticTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  diagnosticSubtitle: {
    fontSize: 13,
    color: '#C62828',
    fontWeight: '600',
    marginBottom: 16,
  },
  diagnosticParagraph: {
    fontSize: 13,
    color: '#4C4844',
    lineHeight: 18,
    marginBottom: 12,
  },
  actionPlanLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
    marginTop: 8,
  },
  summaryButton: {
    backgroundColor: '#BD632F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  summaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useGetDiagnosisHistoryQuery } from '@/store/aiDiagnosisApi';

export default function AiSummaryScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { data: history } = useGetDiagnosisHistoryQuery();
  const diagnosis = history?.find((d) => String(d.id) === id) ?? history?.[0];

  const confidencePct =
    diagnosis?.confidenceScore != null ? Math.round(diagnosis.confidenceScore * 100) : null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => router.replace('/(tabs)/doctors')}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Summary</Text>

        <TouchableOpacity style={styles.circleButton} activeOpacity={0.8}>
          <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Cow Info Header Card */}
        <View style={styles.diagnoseInfoBox}>
          <View style={styles.cowInfoRow}>
            <View style={styles.cowAvatarCircle}>
              <Text style={styles.cowAvatarEmoji}>🐮</Text>
            </View>
            <View style={styles.cowMetaCol}>
              <Text style={styles.cowTitle}>Cow</Text>
              <Text style={styles.cowTime}>
                {diagnosis ? new Date(diagnosis.createdAt).toLocaleString() : 'No scan found'}
              </Text>
            </View>
          </View>
          <View style={styles.matchBadge}>
            <Text style={styles.matchBadgeText}>{confidencePct !== null ? `${confidencePct}% ✅` : '—'}</Text>
          </View>
        </View>

        {/* Diagnostic Detail Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.diagnosticTitle}>{diagnosis?.analysisResult ?? 'No diagnosis available'}</Text>
          <Text style={styles.diagnosticSubtitle}>Highly contagious viral disease</Text>

          <View style={styles.divider} />

          <Text style={styles.diagnosticParagraph}>
            Foot-and-Mouth Disease (FMD) is a highly viral illness affecting cloven-hoofed livestock like cattle, pigs, and sheep, but it poses absolutely no threat to human health or food safety.
          </Text>
          <Text style={styles.diagnosticParagraph}>
            If FMD has been detected in your herd or region, immediate action is required to prevent widespread transmission and massive economic losses.
          </Text>

          <View style={styles.divider} />

          {/* Action plan list */}
          <Text style={styles.actionPlanHeader}>Immediate Action Plan</Text>

          {(diagnosis?.recommendations ?? []).map((rec, index) => (
            <View key={index} style={styles.actionRow}>
              <Text style={styles.actionNumber}>{index + 1}.</Text>
              <View style={styles.actionTextCol}>
                <Text style={styles.actionTitle}>{rec}</Text>
              </View>
            </View>
          ))}

          {!!diagnosis?.recommendedDoctorIds.length && (
            <TouchableOpacity
              style={styles.summaryButton}
              onPress={() => router.push({ pathname: '/doctor-detail', params: { id: String(diagnosis.recommendedDoctorIds[0]) } })}
              activeOpacity={0.85}
            >
              <Text style={styles.summaryButtonText}>View Recommended Doctor</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    marginBottom: 20,
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1817',
  },
  diagnoseInfoBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  cowInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cowAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FAF9F6',
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
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  diagnosticTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  diagnosticSubtitle: {
    fontSize: 13,
    color: '#7C7672',
    fontWeight: '600',
    marginBottom: 16,
  },
  diagnosticParagraph: {
    fontSize: 13,
    color: '#4C4844',
    lineHeight: 18,
    marginBottom: 12,
  },
  linkText: {
    color: '#BD632F',
    textDecorationLine: 'underline',
  },
  summaryButton: {
    backgroundColor: '#BD632F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  summaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#FAF9F6',
    marginVertical: 16,
  },
  actionPlanHeader: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 16,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  actionNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
    marginRight: 6,
    width: 18,
  },
  actionTextCol: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
    lineHeight: 18,
  },
  actionDesc: {
    fontWeight: '400',
    color: '#7C7672',
  },
});

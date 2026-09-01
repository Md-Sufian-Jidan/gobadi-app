import React, { useState, useRef } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABS = [
  { key: 'all', label: 'All', count: 12 },
  { key: 'consults', label: 'Consults', count: 3 },
  { key: 'treatments', label: 'Treatments', count: 2 },
  { key: 'vaccination', label: 'Vaccination', count: 4 },
  { key: 'labTests', label: 'Lab Tests', count: 3 },
  { key: 'files', label: 'Files', count: 3 },
];

const MOCK_PATIENT = {
  name: 'Donald Tramp',
  species: 'Albino Buffalo',
  age: '8 months',
  weight: '725 Kg',
  owner: 'Sophia Rodriguez',
  lastVisited: '14th Aug, 2026',
};

const MOCK_ACTIVITIES = [
  {
    id: '1',
    date: '18 Aug, 2026',
    title: 'Fever Consultation',
    doctor: 'Dr. Karim',
    status: 'Ongoing' as const,
  },
  {
    id: '2',
    date: '15 Aug 2026',
    title: 'Deworming',
    doctor: 'Dr. Karim',
    status: 'Completed' as const,
  },
  {
    id: '3',
    date: '10 Aug 2026',
    title: 'Blood Test (CBC)',
    doctor: 'Dr. Rahman',
    status: 'Completed' as const,
  },
];

const MOCK_CONSULTATIONS = [
  {
    id: '1',
    date: '18 Aug 2026',
    time: '10:30 AM',
    title: 'Fever Consultation',
    doctor: 'Dr. Rahman',
    status: 'Ongoing' as const,
    clinicalActions: [
      'Took history from owner',
      'Performed physical examination',
      'Measured temperature (40.2°C)',
      'Assessed dehydration level',
    ],
    testsOrdered: 'None',
    diagnosis: 'Pyrexia (High fever) likely due to bacterial infection',
    prescription: 'Meloxicam: 15 ml IM – Once daily for 3 days',
  },
];

const MOCK_TREATMENTS = [
  {
    id: '1',
    startedDate: '18 Aug 2026',
    daysProgress: 'Days 2 of 5',
    title: 'Antipyretic & Supportive Therapy',
    doctor: 'Dr. Rahman',
    status: 'Ongoing' as const,
    assessment: [
      'History: High fever for 3 days, weakness, reduced appetite',
      'Physical exam: Temperature 40.2°C, mild, pulse normal',
    ],
    treatmentPlan: 'Antipyretic & supportive therapy to reduce fever, improve appetite and hydration',
    nextFollowUp: '20 Aug 2026',
  },
  {
    id: '2',
    startedDate: '10 Aug 2026',
    daysProgress: 'Days 4 of 7',
    title: 'Vitamin & Mineral Supplement',
    doctor: 'Dr. Rahman',
    status: 'Completed' as const,
    assessment: [],
    treatmentPlan: '',
    nextFollowUp: '',
  },
];

const MOCK_VACCINATIONS = [
  {
    id: '1',
    date: '18 Aug 2026',
    time: '10:30 AM',
    title: 'Deworming',
    doctor: 'Dr. Rahman',
    status: 'Ongoing' as const,
    purpose: 'Eliminate internal parasites and worms',
    medicine: [
      'Albendazole 10% Oral Suspension',
      'Dose: 10 ml per 100 kg body weight',
    ],
    administration: [
      'Given orally using oral drench gun',
      'Administered after morning feeding',
    ],
    observation: [
      'Moderate worm load suspected based on history',
      'Body condition normal',
    ],
  },
];

const MOCK_LAB_TESTS = [
  {
    id: '1',
    date: '10 Aug 2026',
    title: 'Blood Test (CBC)',
    doctor: 'Dr. Rahman',
    status: 'Normal' as const,
    sampleDetails: [
      'Sample type: Blood',
      'Collection Time: 10 Aug 2026 - 09:15 AM',
    ],
    reportSummary: [
      'CBC values are within normal reference ranges',
      'No signs of bacterial infection or anemia',
    ],
    adviceGiven: [
      'Continue current medication',
      'Provide clean drinking water',
      'Maintain good hygiene',
      'Follow up after 3 days',
    ],
    nextFollowUp: '20 Aug 2026',
  },
];

const MOCK_FILES = [
  { id: '1', name: 'Blood Test Report', date: '18 Aug 2026', type: 'PDF', size: '420 KB' },
  { id: '2', name: 'Prescription - 18 Aug 2026', date: '18 Aug 2026', type: 'PDF', size: '420 KB' },
  { id: '3', name: 'Fecal Examination Report', date: '05 Jul 2026', type: 'PDF', size: '350 KB' },
];

function StatusBadge({ status }: { status: string }) {
  const bgColor = status === 'Ongoing' ? '#FFF3E0' : status === 'Completed' ? '#E8F5E9' : '#E3F2FD';
  const textColor = status === 'Ongoing' ? '#E65100' : status === 'Completed' ? '#2E7D32' : '#1565C0';

  return (
    <View style={[statusBadgeStyles.badge, { backgroundColor: bgColor }]}>
      <Text style={[statusBadgeStyles.text, { color: textColor }]}>{status}</Text>
    </View>
  );
}

const statusBadgeStyles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
});

function AllTab() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <View style={tabStyles.section}>
      <Text style={tabStyles.sectionTitle}>Recent activities</Text>
      {MOCK_ACTIVITIES.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={tabStyles.activityCard}
          onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={tabStyles.activityHeader}>
            <View style={tabStyles.activityInfo}>
              <Text style={tabStyles.activityDate}>{item.date}</Text>
              <Text style={tabStyles.activityTitle}>{item.title}</Text>
              <Text style={tabStyles.activityDoctor}>{item.doctor}</Text>
            </View>
            <View style={tabStyles.activityRight}>
              <StatusBadge status={item.status} />
              <Ionicons
                name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#9C9690"
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
        </TouchableOpacity>
      ))}

      <Text style={[tabStyles.sectionTitle, { marginTop: 20 }]}>Consultations</Text>
      {MOCK_CONSULTATIONS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={tabStyles.activityCard}
          onPress={() => setExpandedId(expandedId === `cons-${item.id}` ? null : `cons-${item.id}`)}
          activeOpacity={0.7}
        >
          <View style={tabStyles.activityHeader}>
            <View style={tabStyles.activityInfo}>
              <Text style={tabStyles.activityDate}>{item.date} · {item.time}</Text>
              <Text style={tabStyles.activityTitle}>{item.title}</Text>
              <Text style={tabStyles.activityDoctor}>{item.doctor}</Text>
            </View>
            <View style={tabStyles.activityRight}>
              <StatusBadge status={item.status} />
              <Ionicons
                name={expandedId === `cons-${item.id}` ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#9C9690"
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
          {expandedId === `cons-${item.id}` && (
            <View style={tabStyles.expandedContent}>
              <Text style={tabStyles.detailLabelFirst}>Clinical Actions:</Text>
              {item.clinicalActions.map((action, i) => (
                <Text key={i} style={tabStyles.bulletItem}>• {action}</Text>
              ))}
              <Text style={tabStyles.detailLabel}>Test ordered:</Text>
              <Text style={tabStyles.detailText}>{item.testsOrdered}</Text>
              <Text style={tabStyles.detailLabel}>Diagnosis:</Text>
              <Text style={tabStyles.detailText}>{item.diagnosis}</Text>
              <Text style={tabStyles.detailLabel}>Treatment / Prescription:</Text>
              <Text style={tabStyles.detailText}>{item.prescription}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function ConsultsTab() {
  const [expandedId, setExpandedId] = useState<string | null>('1');

  return (
    <View style={tabStyles.section}>
      {MOCK_CONSULTATIONS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={tabStyles.activityCard}
          onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={tabStyles.activityHeader}>
            <View style={tabStyles.activityInfo}>
              <Text style={tabStyles.activityDate}>{item.date} · {item.time}</Text>
              <Text style={tabStyles.activityTitle}>{item.title}</Text>
              <Text style={tabStyles.activityDoctor}>{item.doctor}</Text>
            </View>
            <View style={tabStyles.activityRight}>
              <StatusBadge status={item.status} />
              <Ionicons
                name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#9C9690"
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
          {expandedId === item.id && (
            <View style={tabStyles.expandedContent}>
              <Text style={tabStyles.detailLabelFirst}>Clinical Actions:</Text>
              {item.clinicalActions.map((action, i) => (
                <Text key={i} style={tabStyles.bulletItem}>• {action}</Text>
              ))}
              <Text style={tabStyles.detailLabel}>Test ordered:</Text>
              <Text style={tabStyles.detailText}>{item.testsOrdered}</Text>
              <Text style={tabStyles.detailLabel}>Diagnosis:</Text>
              <Text style={tabStyles.detailText}>{item.diagnosis}</Text>
              <Text style={tabStyles.detailLabel}>Treatment / Prescription:</Text>
              <Text style={tabStyles.detailText}>{item.prescription}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function TreatmentsTab() {
  const [expandedId, setExpandedId] = useState<string | null>('1');

  return (
    <View style={tabStyles.section}>
      <Text style={tabStyles.sectionTitle}>Treatments</Text>
      {MOCK_TREATMENTS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={tabStyles.activityCard}
          onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={tabStyles.treatmentHeader}>
            <View style={tabStyles.activityInfo}>
              <Text style={tabStyles.treatmentSubheader}>
                Started: {item.startedDate} · {item.daysProgress}
              </Text>
              <Text style={tabStyles.activityTitle}>{item.title}</Text>
              <Text style={tabStyles.activityDoctor}>{item.doctor}</Text>
            </View>
            <View style={tabStyles.activityRight}>
              <StatusBadge status={item.status} />
              <Ionicons
                name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#9C9690"
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
          {expandedId === item.id && item.assessment.length > 0 && (
            <View style={tabStyles.expandedContent}>
              <Text style={tabStyles.detailLabelFirst}>Assessment:</Text>
              {item.assessment.map((a, i) => (
                <Text key={i} style={tabStyles.bulletItem}>• {a}</Text>
              ))}
              <Text style={tabStyles.detailLabel}>Treatment plan:</Text>
              <Text style={tabStyles.detailText}>{item.treatmentPlan}</Text>
              {item.nextFollowUp && (
                <View style={tabStyles.followUpRow}>
                  <Text style={tabStyles.detailLabel}>Next Follow-up:</Text>
                  <Text style={tabStyles.followUpDate}>{item.nextFollowUp}</Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function VaccinationTab() {
  const [expandedId, setExpandedId] = useState<string | null>('1');

  return (
    <View style={tabStyles.section}>
      <Text style={tabStyles.sectionTitle}>Vaccinations</Text>
      {MOCK_VACCINATIONS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={tabStyles.activityCard}
          onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={tabStyles.activityHeader}>
            <View style={tabStyles.activityInfo}>
              <Text style={tabStyles.activityDate}>{item.date} · {item.time}</Text>
              <Text style={tabStyles.activityTitle}>{item.title}</Text>
              <Text style={tabStyles.activityDoctor}>{item.doctor}</Text>
            </View>
            <View style={tabStyles.activityRight}>
              <StatusBadge status={item.status} />
              <Ionicons
                name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#9C9690"
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
          {expandedId === item.id && (
            <View style={tabStyles.expandedContent}>
              <Text style={tabStyles.detailLabelFirst}>Purpose</Text>
              <Text style={tabStyles.detailText}>{item.purpose}</Text>
              <Text style={tabStyles.detailLabel}>Medicine given</Text>
              {item.medicine.map((m, i) => (
                <Text key={i} style={tabStyles.bulletItem}>• {m}</Text>
              ))}
              <Text style={tabStyles.detailLabel}>Administration</Text>
              {item.administration.map((a, i) => (
                <Text key={i} style={tabStyles.bulletItem}>• {a}</Text>
              ))}
              <Text style={tabStyles.detailLabel}>Observation</Text>
              {item.observation.map((o, i) => (
                <Text key={i} style={tabStyles.bulletItem}>• {o}</Text>
              ))}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function LabTestsTab() {
  const [expandedId, setExpandedId] = useState<string | null>('1');

  return (
    <View style={tabStyles.section}>
      <Text style={tabStyles.sectionTitle}>Lab Tests</Text>
      {MOCK_LAB_TESTS.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={tabStyles.activityCard}
          onPress={() => setExpandedId(expandedId === item.id ? null : item.id)}
          activeOpacity={0.7}
        >
          <View style={tabStyles.activityHeader}>
            <View style={tabStyles.activityInfo}>
              <Text style={tabStyles.activityDate}>{item.date}</Text>
              <Text style={tabStyles.activityTitle}>{item.title}</Text>
              <Text style={tabStyles.activityDoctor}>{item.doctor}</Text>
            </View>
            <View style={tabStyles.activityRight}>
              <StatusBadge status={item.status} />
              <Ionicons
                name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#9C9690"
                style={{ marginTop: 8 }}
              />
            </View>
          </View>
          {expandedId === item.id && (
            <View style={tabStyles.expandedContent}>
              <Text style={tabStyles.detailLabelFirst}>Sample Details</Text>
              {item.sampleDetails.map((s, i) => (
                <Text key={i} style={tabStyles.bulletItem}>• {s}</Text>
              ))}
              <Text style={tabStyles.detailLabel}>Report Summary</Text>
              {item.reportSummary.map((r, i) => (
                <Text key={i} style={tabStyles.bulletItem}>• {r}</Text>
              ))}
              <Text style={tabStyles.detailLabel}>Advice given</Text>
              {item.adviceGiven.map((a, i) => (
                <Text key={i} style={tabStyles.bulletItem}>• {a}</Text>
              ))}
              {item.nextFollowUp && (
                <View style={tabStyles.followUpRow}>
                  <Text style={tabStyles.detailLabel}>Next Follow-up:</Text>
                  <Text style={tabStyles.followUpDate}>{item.nextFollowUp}</Text>
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

function FilesTab() {
  return (
    <View style={tabStyles.section}>
      <Text style={tabStyles.sectionTitle}>Files</Text>
      {MOCK_FILES.map((item) => (
        <View key={item.id} style={tabStyles.fileCard}>
          <View style={tabStyles.fileIcon}>
            <Ionicons name="document-text" size={28} color="#E53935" />
            <Text style={tabStyles.fileType}>pdf</Text>
          </View>
          <View style={tabStyles.fileInfo}>
            <Text style={tabStyles.fileName}>{item.name}</Text>
            <Text style={tabStyles.fileMeta}>{item.date} · {item.type} · {item.size}</Text>
          </View>
          <TouchableOpacity style={tabStyles.downloadBtn} activeOpacity={0.7}>
            <Ionicons name="download-outline" size={20} color="#BD632F" />
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );
}

export default function PatientDetailsScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;
  const [activeTab, setActiveTab] = useState('all');
  const scrollViewRef = useRef<ScrollView>(null);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'all': return <AllTab />;
      case 'consults': return <ConsultsTab />;
      case 'treatments': return <TreatmentsTab />;
      case 'vaccination': return <VaccinationTab />;
      case 'labTests': return <LabTestsTab />;
      case 'files': return <FilesTab />;
      default: return <AllTab />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#BD632F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.patientCard}>
          <View style={styles.patientAvatar}>
            <Ionicons name="paw" size={32} color="#BD632F" />
          </View>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{MOCK_PATIENT.name}</Text>
            <View style={styles.patientInfoRow}>
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Species</Text>
                <Text style={styles.patientInfoValue}>{MOCK_PATIENT.species}</Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Age</Text>
                <Text style={styles.patientInfoValue}>{MOCK_PATIENT.age}</Text>
              </View>
              <View style={styles.patientInfoItem}>
                <Text style={styles.patientInfoLabel}>Weight</Text>
                <Text style={styles.patientInfoValue}>{MOCK_PATIENT.weight}</Text>
              </View>
            </View>
            <View style={styles.patientOwnerRow}>
              <View style={styles.patientOwnerItem}>
                <Text style={styles.patientInfoLabel}>Owner</Text>
                <Text style={styles.patientInfoValue}>{MOCK_PATIENT.owner}</Text>
              </View>
              <View style={styles.patientOwnerItem}>
                <Text style={styles.patientInfoLabel}>Last visited</Text>
                <Text style={styles.patientInfoValue}>{MOCK_PATIENT.lastVisited}</Text>
              </View>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {renderTabContent()}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.consultBtn} activeOpacity={0.85} onPress={() => router.push({ pathname: '/chat', params: { conversationId: '1', fullPage: 'true' } })}>
          <Text style={styles.consultBtnText}>Start Consultation</Text>
        </TouchableOpacity>
      </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1817',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  patientCard: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
  },
  patientAvatar: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  patientName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 8,
  },
  patientInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  patientInfoItem: {
    flex: 1,
  },
  patientInfoLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BD632F',
    marginBottom: 2,
  },
  patientInfoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1817',
  },
  patientOwnerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  patientOwnerItem: {
    flex: 1,
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
  },
  tabActive: {
    backgroundColor: '#BD632F',
    borderColor: '#BD632F',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C7672',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 30,
  },
  consultBtn: {
    backgroundColor: '#BD632F',
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
  },
  consultBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

const tabStyles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 12,
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 16,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityInfo: {
    flex: 1,
  },
  activityRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  activityDate: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9C9690',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 2,
  },
  activityDoctor: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7C7672',
  },
  treatmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  treatmentSubheader: {
    fontSize: 11,
    fontWeight: '600',
    color: '#BD632F',
    marginBottom: 4,
  },
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E6E1DC',
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 8,
    marginTop: 12,
  },
  detailLabelFirst: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 8,
    marginTop: 0,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7C7672',
    lineHeight: 20,
  },
  bulletItem: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7C7672',
    lineHeight: 22,
    paddingLeft: 10,
    marginBottom: 2,
  },
  followUpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6E1DC',
  },
  followUpDate: {
    fontSize: 14,
    fontWeight: '700',
    color: '#BD632F',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E6E1DC',
    marginVertical: 8,
  },
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  fileIcon: {
    width: 48,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileType: {
    fontSize: 9,
    fontWeight: '700',
    color: '#E53935',
    marginTop: 2,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  fileMeta: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9C9690',
    marginTop: 2,
  },
  downloadBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

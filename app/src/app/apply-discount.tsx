import React, { useState } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type TabType = 'all' | 'discountGiven';

const MOCK_PATIENTS = [
  {
    id: '1',
    name: 'Donald Tramp',
    owner: 'Habib Ullah Bashar',
    lastAppointment: 'Today',
    discount: 10,
  },
  {
    id: '2',
    name: 'Melinda Gates',
    owner: 'Sophia Rodriguez',
    lastAppointment: '14th August',
    discount: 12,
  },
  {
    id: '3',
    name: 'Melinda Gates',
    owner: 'Sophia Rodriguez',
    lastAppointment: '14th August',
    discount: 10,
  },
  {
    id: '4',
    name: 'Melinda Gates',
    owner: 'Sophia Rodriguez',
    lastAppointment: '14th August',
    discount: 5,
  },
  {
    id: '5',
    name: 'Donald Tramp',
    owner: 'Habib Ullah Bashar',
    lastAppointment: 'Yesterday',
    discount: 0,
  },
  {
    id: '6',
    name: 'Courtney Henry',
    owner: 'Sophia Rodriguez',
    lastAppointment: '14th August',
    discount: 15,
  },
  {
    id: '7',
    name: 'Theresa Webb',
    owner: 'Sophia Rodriguez',
    lastAppointment: '14th August',
    discount: 10,
  },
];

export default function ApplyDiscountScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPatients = MOCK_PATIENTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.owner.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'discountGiven') {
      return matchesSearch && p.discount > 0;
    }
    return matchesSearch;
  });

  const discountGivenCount = MOCK_PATIENTS.filter((p) => p.discount > 0).length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Apply Discount</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color="#9C9690" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by patient or owner"
            placeholderTextColor="#A39E99"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.infoBanner}>
          <Ionicons name="information-circle-outline" size={20} color="#BD632F" />
          <Text style={styles.infoText}>
            Discounts apply to the patient's next appointment fee only. They pay the discounted amount when booking.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Recent Patients</Text>

        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
              All ({MOCK_PATIENTS.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'discountGiven' && styles.tabActive]}
            onPress={() => setActiveTab('discountGiven')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'discountGiven' && styles.tabTextActive]}>
              Discount Given({discountGivenCount})
            </Text>
          </TouchableOpacity>
        </View>

        {filteredPatients.map((patient) => (
          <TouchableOpacity
            key={patient.id}
            style={styles.patientCard}
            onPress={() =>
              router.push({
                pathname: '/discount',
                params: {
                  patientId: patient.id,
                  patientName: patient.name,
                  ownerName: patient.owner,
                  existingDiscount: patient.discount.toString(),
                },
              })
            }
            activeOpacity={0.7}
          >
            <View style={styles.patientAvatar}>
              <Ionicons name="paw" size={20} color="#BD632F" />
            </View>
            <View style={styles.patientInfo}>
              <Text style={styles.patientName}>{patient.name}</Text>
              <Text style={styles.patientOwner}>Owner: {patient.owner}</Text>
              <Text style={styles.patientLastAppointment}>
                Last appointment: {patient.lastAppointment}
              </Text>
            </View>
            {patient.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountBadgeText}>{patient.discount}%</Text>
              </View>
            )}
            <Ionicons name="chevron-forward" size={18} color="#9C9690" />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A1817',
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1817',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FFF2EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: '#7C7672',
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 12,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
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
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  patientAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF2EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
  },
  patientOwner: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7C7672',
    marginTop: 2,
  },
  patientLastAppointment: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9C9690',
    marginTop: 2,
  },
  discountBadge: {
    backgroundColor: '#FFF2EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  discountBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#BD632F',
  },
});

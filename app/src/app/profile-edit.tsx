import React, { useState } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type Tab = 'about' | 'experience' | 'credentials';

export default function ProfileEditScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;
  const [activeTab, setActiveTab] = useState<Tab>('about');

  // About fields
  const [name, setName] = useState('Ramesh Kumar');
  const [phone, setPhone] = useState('+91 9988776655');
  const [location, setLocation] = useState('Bhuj Kutch Gujarat 370001');
  const [about, setAbout] = useState("Hi, I'm Dr. Johnny Williams. I became a doctor to help people. I have been given much and I want to give back. Primary area to help is family medicine, geriatrics...");

  // Experience fields
  const [expTitle, setExpTitle] = useState('Veterinary Surgery');
  const [expInstitute, setExpInstitute] = useState('Gobaadi Veterinary Clinic');
  const [expLocation, setExpLocation] = useState('Bhuj Kutch Gujarat 370001');
  const [expStartMonth, setExpStartMonth] = useState('August');
  const [expStartYear, setExpStartYear] = useState('2026');
  const [expCurrentlyWorking, setExpCurrentlyWorking] = useState(true);
  const [expHighlights, setExpHighlights] = useState("Hi, I'm Dr. Johnny Williams. I became a doctor to help people. I have been given much and I want to give back. Primary area to help is family medicine, geriatrics...");

  // Credentials fields
  const [certName, setCertName] = useState('Veterinary Surgeon');
  const [certInstitute, setCertInstitute] = useState('Gobaadi Veterinary College');
  const [certLocation, setCertLocation] = useState('Bhuj Kutch Gujarat 370001');
  const [certStartMonth, setCertStartMonth] = useState('August');
  const [certEndYear, setCertEndYear] = useState('2026');
  const [certCurrentlyStudying, setCertCurrentlyStudying] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Doctor Card */}
        <View style={styles.doctorCard}>
          <View style={styles.doctorInfoRow}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color="#BD632F" />
              </View>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.doctorDetails}>
              <Text style={styles.doctorName}>Dr. David Patel</Text>
              <Text style={styles.doctorSpecialty}>Veterinary Surgery</Text>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color="#F59E0B" />
                <Text style={styles.ratingText}>4.8 (141 reviews)</Text>
              </View>
              <Text style={styles.doctorLocation}>Cardiology Center, USA</Text>
            </View>
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>248</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>423</Text>
              <Text style={styles.statLabel}>Consultations</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>1 yrs</Text>
              <Text style={styles.statLabel}>Years Experience</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          {(['about', 'experience', 'credentials'] as Tab[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
                {tab === 'about' ? 'About' : tab === 'experience' ? 'Experience' : 'Professional Credentials'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* About Tab - Edit */}
        {activeTab === 'about' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Personal information</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons name="pencil-outline" size={20} color="#7C7672" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Your Name</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
              <Ionicons name="mic-outline" size={18} color="#BD632F" />
            </View>

            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            </View>

            <Text style={styles.fieldLabel}>Location (Village/District)</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={location} onChangeText={setLocation} />
              <Ionicons name="location-outline" size={18} color="#BD632F" />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 8 }]}>About</Text>
            <TextInput
              style={styles.textarea}
              value={about}
              onChangeText={setAbout}
              multiline
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Experience Tab - Edit */}
        {activeTab === 'experience' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Experiences</Text>
              <View style={styles.sectionActions}>
                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={20} color="#E53935" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons name="pencil-outline" size={20} color="#7C7672" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Position Title</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={expTitle} onChangeText={setExpTitle} />
              <Ionicons name="mic-outline" size={18} color="#BD632F" />
            </View>

            <Text style={styles.fieldLabel}>Institute Name</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={expInstitute} onChangeText={setExpInstitute} />
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            </View>

            <Text style={styles.fieldLabel}>Location (Village/District)</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={expLocation} onChangeText={setExpLocation} />
              <Ionicons name="location-outline" size={18} color="#BD632F" />
            </View>

            <View style={styles.halfRow}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Start month</Text>
                <View style={styles.dropdownField}>
                  <Text style={styles.dropdownText}>{expStartMonth}</Text>
                  <Ionicons name="chevron-down" size={16} color="#9C9690" />
                </View>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Start year</Text>
                <View style={styles.dropdownField}>
                  <Text style={styles.dropdownText}>{expStartYear}</Text>
                  <Ionicons name="chevron-down" size={16} color="#9C9690" />
                </View>
              </View>
            </View>

            <View style={styles.switchRow}>
              <Switch
                value={expCurrentlyWorking}
                onValueChange={setExpCurrentlyWorking}
                trackColor={{ true: '#BD632F', false: '#E6E1DC' }}
                thumbColor="#FFFFFF"
              />
              <Text style={styles.switchLabel}>I'm currently working here</Text>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Highlights</Text>
            <TextInput
              style={styles.textarea}
              value={expHighlights}
              onChangeText={setExpHighlights}
              multiline
              textAlignVertical="top"
            />

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Experience Certificate (optional)</Text>
            <TouchableOpacity style={styles.uploadArea} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={36} color="#D1CCC7" />
              <Text style={styles.uploadText}>Tap to upload photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addMoreBtn} activeOpacity={0.8}>
              <Ionicons name="image-outline" size={18} color="#7C7672" />
              <Text style={styles.addMoreBtnText}>Add More</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Credentials Tab - Edit */}
        {activeTab === 'credentials' && (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Professional Credentials</Text>
              <View style={styles.sectionActions}>
                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons name="trash-outline" size={20} color="#E53935" />
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.7}>
                  <Ionicons name="pencil-outline" size={20} color="#7C7672" />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.fieldLabel}>Certifications</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={certName} onChangeText={setCertName} />
              <Ionicons name="mic-outline" size={18} color="#BD632F" />
            </View>

            <Text style={styles.fieldLabel}>Institute Name</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={certInstitute} onChangeText={setCertInstitute} />
              <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
            </View>

            <Text style={styles.fieldLabel}>Location (Village/District)</Text>
            <View style={styles.inputRow}>
              <TextInput style={styles.input} value={certLocation} onChangeText={setCertLocation} />
              <Ionicons name="location-outline" size={18} color="#BD632F" />
            </View>

            <View style={styles.halfRow}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Start year</Text>
                <View style={styles.dropdownField}>
                  <Text style={styles.dropdownText}>{certStartMonth}</Text>
                  <Ionicons name="chevron-down" size={16} color="#9C9690" />
                </View>
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>End year</Text>
                <View style={styles.dropdownField}>
                  <Text style={styles.dropdownText}>{certEndYear}</Text>
                  <Ionicons name="chevron-down" size={16} color="#9C9690" />
                </View>
              </View>
            </View>

            <View style={styles.switchRow}>
              <Switch
                value={certCurrentlyStudying}
                onValueChange={setCertCurrentlyStudying}
                trackColor={{ true: '#BD632F', false: '#E6E1DC' }}
                thumbColor="#FFFFFF"
              />
              <Text style={styles.switchLabel}>I'm currently studying here</Text>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Academic Credentials*</Text>
            <TouchableOpacity style={styles.uploadArea} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={36} color="#D1CCC7" />
              <Text style={styles.uploadText}>Tap to upload photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.addMoreBtn} activeOpacity={0.8}>
              <Ionicons name="image-outline" size={18} color="#7C7672" />
              <Text style={styles.addMoreBtnText}>Add More</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1817' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },

  // Doctor Card
  doctorCard: { backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E6E1DC', padding: 16, marginBottom: 16 },
  doctorInfoRow: { flexDirection: 'row', marginBottom: 14 },
  avatarContainer: { position: 'relative', marginRight: 14 },
  avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4CAF50', borderWidth: 2, borderColor: '#FFFFFF' },
  doctorDetails: { flex: 1 },
  doctorName: { fontSize: 16, fontWeight: '800', color: '#1A1817', marginBottom: 2 },
  doctorSpecialty: { fontSize: 12, fontWeight: '500', color: '#7C7672', marginBottom: 3 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  ratingText: { fontSize: 11, fontWeight: '600', color: '#7C7672' },
  doctorLocation: { fontSize: 11, fontWeight: '500', color: '#9C9690' },
  statsRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F0ECE8', paddingTop: 12 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 16, fontWeight: '800', color: '#1A1817', marginBottom: 2 },
  statLabel: { fontSize: 10, fontWeight: '500', color: '#9C9690' },
  statDivider: { width: 1, backgroundColor: '#F0ECE8' },

  // Tabs
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#E6E1DC', marginBottom: 16 },
  tab: { paddingVertical: 10, marginRight: 20 },
  tabActive: { borderBottomWidth: 2, borderBottomColor: '#1A1817' },
  tabText: { fontSize: 13, fontWeight: '600', color: '#9C9690' },
  tabTextActive: { color: '#1A1817', fontWeight: '700' },

  // Sections
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1A1817' },
  sectionActions: { flexDirection: 'row', gap: 10 },

  // Fields
  fieldLabel: { fontSize: 12, fontWeight: '500', color: '#9C9690', marginBottom: 6, marginTop: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E6E1DC', paddingHorizontal: 14, height: 48, marginBottom: 10, gap: 8 },
  input: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1A1817', height: '100%' },
  textarea: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', padding: 14, minHeight: 120, fontSize: 13, fontWeight: '500', color: '#1A1817', lineHeight: 19, marginBottom: 10 },

  halfRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  halfField: { flex: 1 },
  dropdownField: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E6E1DC', paddingHorizontal: 14, height: 48 },
  dropdownText: { fontSize: 14, fontWeight: '600', color: '#1A1817' },

  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  switchLabel: { fontSize: 13, fontWeight: '600', color: '#1A1817' },

  uploadArea: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1.5, borderColor: '#E6E1DC', borderStyle: 'dashed', height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  uploadText: { fontSize: 12, fontWeight: '500', color: '#D1CCC7', marginTop: 6 },
  addMoreBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  addMoreBtnText: { fontSize: 13, fontWeight: '600', color: '#7C7672' },
});

import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ISSUE_TYPES = [
  'App Not Working',
  'Payment Issue',
  'Animal Record Sync Error',
  'Doctor Consultation Problem',
  'Other Technical Bug',
];

export default function ReportIssuesScreen() {
  const router = useRouter();
  const [selectedIssue, setSelectedIssue] = useState('E.g App Not Working');
  const [description, setDescription] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleBrowseFile() {
    setFileName('screenshot_bug_log.png');
    Alert.alert('File Attached', 'Screenshot attached successfully.');
  }

  function handleSubmit() {
    if (!description.trim()) {
      Alert.alert('Missing Info', 'Please describe the issue in detail.');
      return;
    }
    Alert.alert('Report Submitted', 'Thank you for reporting. Our team will inspect it promptly.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Report Issues</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Issue Type Dropdown */}
        <Text style={styles.fieldLabel}>What Happened ?</Text>
        <TouchableOpacity
          style={styles.dropdownInput}
          onPress={() => setShowDropdown(!showDropdown)}
          activeOpacity={0.8}
        >
          <Text style={styles.dropdownValue}>{selectedIssue}</Text>
          <Ionicons name={showDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#7C7672" />
        </TouchableOpacity>

        {showDropdown && (
          <View style={styles.dropdownMenu}>
            {ISSUE_TYPES.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedIssue(type);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Description Field */}
        <Text style={styles.fieldLabel}>Description</Text>
        <View style={styles.descriptionWrapper}>
          <TextInput
            style={styles.descriptionInput}
            multiline
            numberOfLines={4}
            placeholder="Please Describe in Detail What happened"
            placeholderTextColor="#A39E99"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        {/* File Upload Box */}
        <View style={styles.uploadCard}>
          <View style={styles.uploadIconBadge}>
            <Ionicons name="camera-outline" size={24} color="#2B6CB0" />
          </View>
          <Text style={styles.uploadTitle}>Drag & Drop</Text>
          <Text style={styles.uploadSubtitle}>Select File and Upload Here</Text>

          {fileName && <Text style={styles.attachedFileName}>📎 {fileName}</Text>}

          <View style={styles.dashedDivider} />

          <TouchableOpacity
            style={styles.browseBtn}
            onPress={handleBrowseFile}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={18} color="#2B6CB0" style={{ marginRight: 4 }} />
            <Text style={styles.browseBtnText}>Browse File</Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
          activeOpacity={0.85}
        >
          <Text style={styles.submitBtnText}>Submit Report</Text>
        </TouchableOpacity>
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
    paddingTop: 12,
    marginBottom: 24,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1817',
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 8,
  },
  dropdownInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 16,
    height: 52,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  dropdownValue: {
    fontSize: 14,
    color: '#7C7672',
    fontWeight: '500',
  },
  dropdownMenu: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    marginTop: -14,
    marginBottom: 20,
    paddingVertical: 6,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F2EC',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#1A1817',
    fontWeight: '500',
  },
  descriptionWrapper: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 18,
    padding: 14,
    marginBottom: 20,
  },
  descriptionInput: {
    height: 100,
    textAlignVertical: 'top',
    fontSize: 14,
    color: '#1A1817',
  },
  uploadCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 24,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  uploadIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EDF4FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 12,
    color: '#7C7672',
    marginBottom: 12,
  },
  attachedFileName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#BD632F',
    marginBottom: 10,
  },
  dashedDivider: {
    width: '100%',
    height: 1,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  browseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF4FE',
    borderRadius: 14,
    height: 44,
    paddingHorizontal: 28,
  },
  browseBtnText: {
    color: '#2B6CB0',
    fontSize: 14,
    fontWeight: '700',
  },
  submitBtn: {
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
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

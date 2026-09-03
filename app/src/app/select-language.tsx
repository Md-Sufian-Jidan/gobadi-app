import React from 'react';
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
import { LANGUAGES } from '@/constants/languages';
import { useLanguage } from '@/hooks/use-language';

export default function SelectLanguageScreen() {
  const router = useRouter();
  const { language, setLanguage } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Language</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.helperText}>
          Choose your preferred language for the interface and notifications.
        </Text>

        {/* Language List */}
        <View style={styles.languageList}>
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[styles.languageCard, isSelected && styles.languageCardActive]}
                onPress={() => setLanguage(lang.id)}
                activeOpacity={0.8}
              >
                <View style={styles.languageInfo}>
                  <Text style={[styles.languageName, isSelected && styles.languageNameActive]}>
                    {lang.name}
                  </Text>
                  <Text style={[styles.languageNative, isSelected && styles.languageNativeActive]}>
                    {lang.nativeName}
                  </Text>
                </View>
                <View style={[styles.radio, isSelected && styles.radioActive]}>
                  {isSelected && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Voice Selection Mode */}
        <TouchableOpacity style={styles.voiceRow} activeOpacity={0.8}>
          <Text style={styles.voiceText}>Voice Selection Mode</Text>
          <Ionicons name="mic-outline" size={20} color="#9C9690" />
        </TouchableOpacity>
      </ScrollView>

      {/* Save Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.saveBtn} activeOpacity={0.85}>
          <Text style={styles.saveBtnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1817' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  helperText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 24,
  },
  languageList: {
    gap: 12,
    marginBottom: 16,
  },
  languageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E6E1DC',
    padding: 16,
  },
  languageCardActive: {
    borderColor: '#BD632F',
    backgroundColor: '#FFF8F4',
  },
  languageInfo: { flex: 1 },
  languageName: { fontSize: 16, fontWeight: '700', color: '#1A1817', marginBottom: 2 },
  languageNameActive: { color: '#BD632F' },
  languageNative: { fontSize: 12, fontWeight: '500', color: '#9C9690' },
  languageNativeActive: { color: '#BD632F' },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D1CCC7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioActive: {
    borderColor: '#BD632F',
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#BD632F',
  },
  voiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    padding: 16,
  },
  voiceText: { fontSize: 14, fontWeight: '600', color: '#1A1817' },
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
  saveBtn: {
    backgroundColor: '#BD632F',
    borderRadius: 26,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

import React, { useState } from 'react';
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

interface Language {
  id: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  { id: 'en', name: 'English', nativeName: 'English' },
  { id: 'bn', name: 'Bangla', nativeName: 'বাংলা' },
];

export default function SelectLanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('en');

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
        {/* Language Cards */}
        <View style={styles.languageGrid}>
          {LANGUAGES.map((lang) => (
            <TouchableOpacity
              key={lang.id}
              style={[styles.languageCard, selected === lang.id && styles.languageCardActive]}
              onPress={() => setSelected(lang.id)}
              activeOpacity={0.8}
            >
              <View style={styles.languageInfo}>
                <Text style={[styles.languageName, selected === lang.id && styles.languageNameActive]}>
                  {lang.name}
                </Text>
                <Text style={[styles.languageNative, selected === lang.id && styles.languageNativeActive]}>
                  {lang.nativeName}
                </Text>
              </View>
              {selected === lang.id ? (
                <View style={styles.checkCircle}>
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </View>
              ) : (
                <Ionicons name="volume-high-outline" size={20} color="#9C9690" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Voice Selection Mode */}
        <TouchableOpacity style={styles.voiceRow} activeOpacity={0.8}>
          <Text style={styles.voiceText}>Voice Selection Mode</Text>
          <Ionicons name="mic-outline" size={20} color="#9C9690" />
        </TouchableOpacity>
      </ScrollView>

      {/* Update Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.updateBtn} activeOpacity={0.85}>
          <Text style={styles.updateBtnText}>Update App Language</Text>
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
  languageGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  languageCard: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1.5, borderColor: '#E6E1DC', padding: 16 },
  languageCardActive: { borderColor: '#BD632F', backgroundColor: '#FFF8F4' },
  languageInfo: { flex: 1 },
  languageName: { fontSize: 16, fontWeight: '700', color: '#1A1817', marginBottom: 2 },
  languageNameActive: { color: '#BD632F' },
  languageNative: { fontSize: 12, fontWeight: '500', color: '#9C9690' },
  languageNativeActive: { color: '#BD632F' },
  checkCircle: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  voiceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#E6E1DC', padding: 16 },
  voiceText: { fontSize: 14, fontWeight: '600', color: '#1A1817' },
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FAF9F6', paddingHorizontal: 20, paddingVertical: 16, paddingBottom: 30 },
  updateBtn: { backgroundColor: '#BD632F', borderRadius: 26, paddingVertical: 16, alignItems: 'center' },
  updateBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

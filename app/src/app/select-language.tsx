import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface Language {
  id: string;
  name: string;
  nativeName: string;
  code: string;
}

const LANGUAGES: Language[] = [
  { id: 'en', name: 'English', nativeName: 'English', code: 'EN' },
  { id: 'bn', name: 'Bangla', nativeName: 'বাংলা', code: 'BN' },
];

export default function SelectLanguageScreen() {
  const router = useRouter();
  const [selected, setSelected] = useState('en');
  const [voiceMode, setVoiceMode] = useState(false);

  function handleUpdate() {
    const lang = LANGUAGES.find((l) => l.id === selected);
    Alert.alert('Language Updated', `App language has been set to ${lang?.name}.`, [
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

        <Text style={styles.headerTitle}>Select Language</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Language Options Grid */}
        <View style={styles.languagesGrid}>
          {LANGUAGES.map((lang) => {
            const isSel = lang.id === selected;
            return (
              <TouchableOpacity
                key={lang.id}
                style={[styles.langCard, isSel && styles.langCardSelected]}
                onPress={() => setSelected(lang.id)}
                activeOpacity={0.8}
              >
                <View>
                  <Text style={[styles.langNativeName, isSel && styles.langNativeNameSelected]}>
                    {lang.nativeName}
                  </Text>
                  <Text style={[styles.langName, isSel && styles.langNameSelected]}>
                    {lang.name}
                  </Text>
                </View>

                <View style={[styles.speakerBadge, isSel && styles.speakerBadgeSelected]}>
                  <Ionicons
                    name="volume-medium"
                    size={16}
                    color={isSel ? '#FFFFFF' : '#9C9690'}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Voice Selection Mode Row */}
        <TouchableOpacity
          style={[styles.voiceModeRow, voiceMode && styles.voiceModeRowActive]}
          onPress={() => setVoiceMode(!voiceMode)}
          activeOpacity={0.8}
        >
          <Text style={[styles.voiceModeText, voiceMode && styles.voiceModeTextActive]}>
            Voice Selection Mode
          </Text>
          <View style={[styles.micCircle, voiceMode && styles.micCircleActive]}>
            <Ionicons
              name="mic-outline"
              size={20}
              color={voiceMode ? '#BD632F' : '#9C9690'}
            />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Bottom Update Button */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.updateBtn}
          onPress={handleUpdate}
          activeOpacity={0.85}
        >
          <Text style={styles.updateBtnText}>Update App Language</Text>
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
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
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
  languagesGrid: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 20,
  },
  langCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    paddingHorizontal: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  langCardSelected: {
    borderColor: '#BD632F',
    borderWidth: 1.5,
    backgroundColor: '#FFF8F4',
  },
  langNativeName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1817',
    marginBottom: 2,
  },
  langNativeNameSelected: {
    color: '#BD632F',
  },
  langName: {
    fontSize: 12,
    color: '#7C7672',
    fontWeight: '500',
  },
  langNameSelected: {
    color: '#BD7D5B',
  },
  speakerBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F5F2EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speakerBadgeSelected: {
    backgroundColor: '#BD632F',
  },
  voiceModeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 2,
  },
  voiceModeRowActive: {
    borderColor: '#BD632F',
    borderWidth: 1.5,
    backgroundColor: '#FFF8F4',
  },
  voiceModeText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
  },
  voiceModeTextActive: {
    color: '#BD632F',
  },
  micCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F5F2EC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micCircleActive: {
    backgroundColor: '#FFF2EB',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingBottom: 32,
    paddingTop: 16,
    backgroundColor: '#FAF9F6',
  },
  updateBtn: {
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
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});

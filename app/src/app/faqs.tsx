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

type FaqTab = 'general' | 'doctor' | 'photo';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQS: Record<FaqTab, FAQItem[]> = {
  general: [
    { id: '1', question: 'What is the Smart Farming App?', answer: 'The Smart Farming App helps farmers manage daily agricultural activities such as crop planning, weather tracking, pest alerts, marketplace trading, and equipment sharing—all in one place.' },
    { id: '2', question: 'How accurate is the weather forecast?', answer: 'Our weather forecasts use data from multiple meteorological sources and are updated every hour for maximum accuracy in your local area.' },
    { id: '3', question: 'How can I add my farm or field details?', answer: 'You can add your farm details by navigating to the Farms section and tapping the "Add Farm" button. Fill in the required information and save.' },
    { id: '4', question: 'Can I share my equipment with others?', answer: 'Yes! Our equipment sharing feature allows you to list your farming equipment for rent or shared use with other farmers in your area.' },
  ],
  doctor: [
    { id: '5', question: 'How do I connect with a veterinarian?', answer: 'You can browse available veterinarians in the Doctors tab and book a consultation directly through the app.' },
    { id: '6', question: 'Can I get prescriptions through the app?', answer: 'Yes, after a consultation, the veterinarian can send prescriptions directly through the chat feature.' },
  ],
  photo: [
    { id: '7', question: 'How does photo diagnosis work?', answer: 'Upload a clear photo of your animal\'s condition and our AI-powered system will provide an initial assessment within minutes.' },
  ],
};

export default function FAQsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<FaqTab>('general');
  const [expandedId, setExpandedId] = useState<string>('1');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? '' : id);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>FAQs</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tab Row */}
      <View style={styles.tabRow}>
        {(['general', 'doctor', 'photo'] as FaqTab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'general' ? 'General' : tab === 'doctor' ? 'Doctor Connection' : 'Photo Diagnosis'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {FAQS[activeTab].map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.faqCard}
            onPress={() => toggleExpand(item.id)}
            activeOpacity={0.8}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{item.question}</Text>
              <Ionicons
                name={expandedId === item.id ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#7C7672"
              />
            </View>
            {expandedId === item.id && (
              <Text style={styles.faqAnswer}>{item.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1817' },
  tabRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  tab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E6E1DC' },
  tabActive: { backgroundColor: '#FFFFFF', borderColor: '#BD632F' },
  tabText: { fontSize: 12, fontWeight: '600', color: '#9C9690' },
  tabTextActive: { color: '#BD632F' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40 },
  faqCard: { backgroundColor: '#FFFFFF', borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', padding: 16, marginBottom: 10 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 14, fontWeight: '700', color: '#1A1817', flex: 1, marginRight: 8 },
  faqAnswer: { fontSize: 13, fontWeight: '500', color: '#7C7672', lineHeight: 19, marginTop: 10 },
});

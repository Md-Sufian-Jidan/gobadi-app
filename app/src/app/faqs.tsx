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

interface FAQItem {
  id: string;
  category: string;
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    id: '1',
    category: 'General',
    question: 'What is the Smart Farming App?',
    answer:
      'The Smart Farming App helps farmers manage daily agricultural activities such as crop planning, weather tracking, pest alerts, marketplace trading, and equipment sharing—all in one place.',
  },
  {
    id: '2',
    category: 'General',
    question: 'How accurate is the weather forecast?',
    answer:
      'Our weather updates rely on real-time localized satellite data updated hourly with high precision for your specific district.',
  },
  {
    id: '3',
    category: 'General',
    question: 'How can I add my farm or field details?',
    answer:
      'Navigate to the My Farm section on your home dashboard and tap the + Add Farm button to input land size, animal count, and location.',
  },
  {
    id: '4',
    category: 'General',
    question: 'Can I share my equipment with others?',
    answer:
      'Yes! You can list your machinery or farm equipment on our community marketplace for rental or sharing with neighboring farmers.',
  },
  {
    id: '5',
    category: 'Doctor Connection',
    question: 'How do I book a vet consultation?',
    answer:
      'Go to the Doctors tab, select a category or search for a specialist near you, and tap Book Slot to choose your preferred time.',
  },
  {
    id: '6',
    category: 'Photo Diagnosis',
    question: 'How does AI health scanning work?',
    answer:
      'Simply snap a clear photo of your animal using the Scan Now camera feature. Our AI model will analyze symptoms and provide instant care guidance.',
  },
];

const CATEGORIES = ['General', 'Doctor Connection', 'Photo Diagnosis'];

export default function FAQsScreen() {
  const router = useRouter();
  const [activeCat, setActiveCat] = useState('General');
  const [expandedId, setExpandedId] = useState<string | null>('1');

  const filteredFaqs = FAQS.filter((f) => f.category === activeCat);

  function toggleAccordion(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
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

        <Text style={styles.headerTitle}>FAQs</Text>

        <View style={{ width: 42 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Category Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {CATEGORIES.map((cat) => {
            const isSel = cat === activeCat;
            return (
              <TouchableOpacity
                key={cat}
                style={[styles.catPill, isSel && styles.catPillSelected]}
                onPress={() => setActiveCat(cat)}
                activeOpacity={0.8}
              >
                <Text style={[styles.catText, isSel && styles.catTextSelected]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Accordion Cards List */}
        <View style={styles.accordionList}>
          {filteredFaqs.map((faq) => {
            const isExpanded = faq.id === expandedId;
            return (
              <View key={faq.id} style={styles.accordionCard}>
                <TouchableOpacity
                  style={styles.accordionHeader}
                  onPress={() => toggleAccordion(faq.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.questionText}>{faq.question}</Text>
                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#1A1817"
                  />
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.accordionBody}>
                    <View style={styles.dashedDivider} />
                    <Text style={styles.answerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
    marginBottom: 20,
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
  categoriesRow: {
    paddingHorizontal: 24,
    gap: 10,
    marginBottom: 20,
  },
  catPill: {
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catPillSelected: {
    borderColor: '#BD632F',
    backgroundColor: '#FFF8F4',
    borderWidth: 1.5,
  },
  catText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7C7672',
  },
  catTextSelected: {
    color: '#1A1817',
    fontWeight: '700',
  },
  accordionList: {
    paddingHorizontal: 24,
    gap: 14,
  },
  accordionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1817',
    flex: 1,
    marginRight: 10,
  },
  accordionBody: {
    marginTop: 12,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  answerText: {
    fontSize: 13,
    color: '#7C7672',
    lineHeight: 20,
  },
});

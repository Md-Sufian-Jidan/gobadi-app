import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import PrescriptionBottomSheet from '@/components/PrescriptionBottomSheet';

type ConsultationState = 'idle' | 'active' | 'ended' | 'prescription_sent';

interface ChatMessage {
  id: string;
  sender: 'patient' | 'doctor';
  text: string;
  time: string;
  isPrescription?: boolean;
  prescriptionDate?: string;
  prescriptionSize?: string;
}

const MOCK_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'patient', text: 'Assalamualaikum dr.  My cow is sick for 3 days and not eating at all.', time: '09:55' },
  { id: '2', sender: 'doctor', text: 'Walaikumassalam, I have noted the issue. I will check during consultation', time: '09:55' },
];

const CONSULTATION_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'patient', text: 'My cattle is been sick for almost 3 days straight and not eating anything at all.', time: '09:55' },
  { id: '2', sender: 'doctor', text: 'What was the temperature?', time: '09:55' },
];

const ENDED_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'patient', text: 'My cattle is been sick for almost 3 days straight and not eating anything at all.', time: '09:55' },
  { id: '2', sender: 'doctor', text: 'What was the temperature?', time: '09:55' },
];

const PRESCRIPTION_MESSAGES: ChatMessage[] = [
  { id: '1', sender: 'patient', text: 'My cattle is been sick for almost 3 days straight and not eating anything at all.', time: '09:55' },
  { id: '2', sender: 'doctor', text: 'What was the temperature?', time: '09:55' },
  { id: '3', sender: 'doctor', text: '', time: '09:55', isPrescription: true, prescriptionDate: '18 Aug 2026', prescriptionSize: '420 KB' },
];

function formatTimeRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const [consultationState, setConsultationState] = useState<ConsultationState>('idle');
  const [inputText, setInputText] = useState('');
  const [remainingTime] = useState(14 * 60 + 28);
  const flatListRef = useRef<FlatList>(null);
  const [showPrescriptionSheet, setShowPrescriptionSheet] = useState(false);

  const messages = consultationState === 'prescription_sent'
    ? PRESCRIPTION_MESSAGES
    : consultationState === 'ended'
    ? ENDED_MESSAGES
    : consultationState === 'active'
    ? CONSULTATION_MESSAGES
    : MOCK_MESSAGES;

  const handleStartConsultation = () => {
    setConsultationState('active');
  };

  const handleEndConsultation = () => {
    setConsultationState('ended');
  };

  const handleSendPrescription = () => {
    setShowPrescriptionSheet(true);
  };

  const handlePrescriptionSent = () => {
    setConsultationState('prescription_sent');
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setInputText('');
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isDoctor = item.sender === 'doctor';

    if (item.isPrescription) {
      return (
        <View style={styles.messageRowRight}>
          <View style={styles.prescriptionBubble}>
            <View style={styles.prescriptionHeader}>
              <Ionicons name="document-text" size={18} color="#FFFFFF" />
              <Text style={styles.prescriptionTitle}>Prescription - {item.prescriptionDate}</Text>
            </View>
            <Text style={styles.prescriptionMeta}>
              {item.prescriptionDate} · PDF · {item.prescriptionSize}
            </Text>
            <View style={styles.prescriptionFooter}>
              <Text style={styles.prescriptionTime}>{item.time}</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={isDoctor ? styles.messageRowRight : styles.messageRowLeft}>
        {!isDoctor && (
          <View style={styles.patientAvatar}>
            <Ionicons name="paw" size={16} color="#BD632F" />
          </View>
        )}
        <View style={isDoctor ? styles.doctorBubble : styles.patientBubble}>
          <Text style={isDoctor ? styles.doctorBubbleText : styles.patientBubbleText}>
            {item.text}
          </Text>
          <Text style={isDoctor ? styles.doctorTimeText : styles.patientTimeText}>
            {item.time}
          </Text>
        </View>
      </View>
    );
  };

  // ─── Main Chat View ───
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Donald Tramp</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.7} onPress={() => router.push('/video-call')}>
            <Ionicons name="call" size={18} color="#1A1817" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/video-call')}
          >
            <Ionicons name="videocam" size={18} color="#1A1817" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={18} color="#1A1817" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Appointment Banner (idle & active states) */}
      {(consultationState === 'idle' || consultationState === 'active') && (
        <View style={styles.upcomingBanner}>
          <View style={styles.upcomingBannerLeft}>
            <View style={styles.upcomingBannerAvatar}>
              <Ionicons name="paw" size={24} color="#BD632F" />
            </View>
            <View>
              <Text style={styles.upcomingBannerTime}>10:00 AM · Today</Text>
              <Text style={styles.upcomingBannerName}>Donald Tramp</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.upcomingBannerJoin} activeOpacity={0.85}>
            <Text style={styles.upcomingBannerJoinText}>Join</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Consultation Started Banner (active state) */}
      {consultationState === 'active' && (
        <View style={styles.consultationBanner}>
          <Text style={styles.consultationBannerTitle}>Consultation started</Text>
          <Text style={styles.consultationBannerDesc}>You are now in consultation with Sophia Rodriguez</Text>
          <Text style={styles.consultationBannerBullet}>•  Start time: 10:00 AM</Text>
          <Text style={styles.consultationBannerBullet}>•  Max Duration: 30 min</Text>
          <Text style={styles.consultationBannerRemaining}>•  Remaining time: {formatTimeRemaining(remainingTime)}</Text>
          <TouchableOpacity style={styles.endConsultationBtn} onPress={handleEndConsultation} activeOpacity={0.85}>
            <Text style={styles.endConsultationBtnText}>End Consultation</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Consultation Ended Banner (ended & prescription_sent states) */}
      {(consultationState === 'ended' || consultationState === 'prescription_sent') && (
        <View style={styles.consultationBanner}>
          <Text style={styles.consultationBannerEndedTitle}>Consultation ended!</Text>
          <Text style={styles.consultationBannerDesc}>Your consultation with Sophia Rodriguez has ended.</Text>
          <Text style={styles.consultationBannerBullet}>•  Start time: 10:00 AM</Text>
          <Text style={styles.consultationBannerBullet}>•  Max Duration: 30 min</Text>
          <Text style={styles.consultationBannerRemaining}>•  Remaining time: {formatTimeRemaining(remainingTime)}</Text>
        </View>
      )}

      {/* Next Step Card (ended & prescription_sent states) */}
      {(consultationState === 'ended' || consultationState === 'prescription_sent') && (
        <View style={styles.nextStepInline}>
          <Text style={styles.nextStepInlineTitle}>Next Step</Text>
          <View style={styles.nextStepInlineOption}>
            {consultationState === 'prescription_sent' ? (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            ) : (
              <View style={styles.radioOuter}>
                <View style={styles.radioInner} />
              </View>
            )}
            <Text style={styles.nextStepInlineText}>Send prescription, recommendation, note</Text>
          </View>
          {consultationState === 'ended' && (
            <TouchableOpacity style={styles.sendPrescriptionInlineBtn} onPress={handleSendPrescription} activeOpacity={0.85}>
              <Text style={styles.sendPrescriptionInlineBtnText}>Send Prescription</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>Today</Text>
          </View>
        }
      />

      {/* Quick Actions (active state) */}
      {consultationState === 'active' && (
        <View style={styles.quickActionsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.8} onPress={() => setShowPrescriptionSheet(true)}>
              <Text style={styles.quickActionText}>Send prescription</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.8}>
              <Text style={styles.quickActionText}>Send recommendation</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionBtn} activeOpacity={0.8}>
              <Ionicons name="chevron-down" size={16} color="#7C7672" />
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      {/* Start Consultation Button (idle state) */}
      {consultationState === 'idle' && (
        <View style={styles.startConsultationContainer}>
          <TouchableOpacity style={styles.startConsultationBtn} onPress={handleStartConsultation} activeOpacity={0.85}>
            <Text style={styles.startConsultationBtnText}>Start Consultation</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Bar */}
      {consultationState !== 'idle' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={0}
        >
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#A39E99"
              value={inputText}
              onChangeText={setInputText}
            />
            <TouchableOpacity style={styles.plusBtn} activeOpacity={0.8}>
              <Ionicons name="add" size={22} color="#BD632F" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.micBtn} activeOpacity={0.8}>
              <Ionicons name="mic" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* Prescription Bottom Sheet */}
      <PrescriptionBottomSheet
        visible={showPrescriptionSheet}
        onClose={() => setShowPrescriptionSheet(false)}
        onSend={handlePrescriptionSent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1A1817' },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerActionBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center' },

  // Upcoming Banner
  upcomingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E6D5C3', marginHorizontal: 20, borderRadius: 16, padding: 12, marginBottom: 12 },
  upcomingBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  upcomingBannerAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center' },
  upcomingBannerTime: { fontSize: 11, fontWeight: '600', color: '#BD632F' },
  upcomingBannerName: { fontSize: 15, fontWeight: '800', color: '#1A1817' },
  upcomingBannerJoin: { backgroundColor: '#BD632F', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8 },
  upcomingBannerJoinText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Consultation Banner
  consultationBanner: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E6E1DC', padding: 16, marginBottom: 12 },
  consultationBannerTitle: { fontSize: 16, fontWeight: '800', color: '#1A1817', marginBottom: 4 },
  consultationBannerEndedTitle: { fontSize: 16, fontWeight: '800', color: '#E53935', marginBottom: 4 },
  consultationBannerDesc: { fontSize: 13, fontWeight: '500', color: '#7C7672', marginBottom: 8 },
  consultationBannerBullet: { fontSize: 13, fontWeight: '500', color: '#1A1817', lineHeight: 20 },
  consultationBannerRemaining: { fontSize: 13, fontWeight: '600', color: '#BD632F', lineHeight: 20 },
  endConsultationBtn: { backgroundColor: '#E6E1DC', borderRadius: 20, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  endConsultationBtnText: { color: '#1A1817', fontSize: 14, fontWeight: '700' },

  // Next Step (inline)
  nextStepInline: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E6E1DC', padding: 16, marginBottom: 12 },
  nextStepInlineTitle: { fontSize: 15, fontWeight: '800', color: '#1A1817', marginBottom: 8 },
  nextStepInlineOption: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nextStepInlineText: { fontSize: 13, fontWeight: '500', color: '#7C7672', flex: 1 },
  sendPrescriptionInlineBtn: { backgroundColor: '#BD632F', borderRadius: 20, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  sendPrescriptionInlineBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E6E1DC', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'transparent' },

  // Messages
  messagesList: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  dateSeparator: { alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E6E1DC', paddingHorizontal: 16, paddingVertical: 6, marginVertical: 12 },
  dateSeparatorText: { fontSize: 12, fontWeight: '600', color: '#9C9690' },
  messageRowLeft: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, maxWidth: '85%' },
  messageRowRight: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16, maxWidth: '85%', alignSelf: 'flex-end' },
  patientAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  patientBubble: { backgroundColor: '#F5EDE6', borderRadius: 18, borderBottomLeftRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' },
  patientBubbleText: { fontSize: 14, fontWeight: '500', color: '#1A1817', lineHeight: 19 },
  patientTimeText: { fontSize: 10, fontWeight: '500', color: '#9C9690', marginTop: 4, alignSelf: 'flex-end' },
  doctorBubble: { backgroundColor: '#BD632F', borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 10, maxWidth: '100%' },
  doctorBubbleText: { fontSize: 14, fontWeight: '500', color: '#FFFFFF', lineHeight: 19 },
  doctorTimeText: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginTop: 4, alignSelf: 'flex-end' },

  // Prescription Message
  prescriptionBubble: { backgroundColor: '#BD632F', borderRadius: 18, borderBottomRightRadius: 4, paddingHorizontal: 14, paddingVertical: 12, maxWidth: '100%', minWidth: 220 },
  prescriptionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  prescriptionTitle: { fontSize: 14, fontWeight: '700', color: '#FFFFFF' },
  prescriptionMeta: { fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.7)', marginBottom: 4 },
  prescriptionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  prescriptionTime: { fontSize: 10, fontWeight: '500', color: 'rgba(255,255,255,0.7)' },

  // Quick Actions
  quickActionsContainer: { paddingHorizontal: 20, paddingBottom: 8 },
  quickActions: { flexDirection: 'row', gap: 8 },
  quickActionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E6E1DC', paddingHorizontal: 14, paddingVertical: 8, gap: 4 },
  quickActionText: { fontSize: 13, fontWeight: '600', color: '#7C7672' },

  // Start Consultation
  startConsultationContainer: { paddingHorizontal: 20, paddingBottom: 16 },
  startConsultationBtn: { backgroundColor: '#BD632F', borderRadius: 26, paddingVertical: 16, alignItems: 'center' },
  startConsultationBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Input Bar
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 28, borderWidth: 1, borderColor: '#E6E1DC', height: 52, paddingHorizontal: 16, marginHorizontal: 20, marginBottom: 12, gap: 8 },
  textInput: { flex: 1, fontSize: 14, color: '#1A1817', height: '100%' },
  plusBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  micBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
});

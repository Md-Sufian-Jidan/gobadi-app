import React, { useState, useRef, useEffect } from 'react';
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
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import PrescriptionBottomSheet from '@/components/PrescriptionBottomSheet';
import { useGetMessagesQuery, useSendMessageMutation } from '@/store/chatApi';
import { useGetByIdQuery as useGetConsultationQuery } from '@/store/consultationsApi';
import { API_URL } from '@/constants/api';

type ConsultationState = 'idle' | 'active' | 'ended' | 'prescription_sent';

interface ChatMessageUI {
  id: string;
  sender: 'patient' | 'doctor';
  text: string;
  time: string;
  isPrescription?: boolean;
  prescriptionDate?: string;
  prescriptionSize?: string;
}

function formatTimeRemaining(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    consultationId?: string;
    conversationId?: string;
    patientName?: string;
    animalImage?: string;
  }>();

  const consultationId = params.consultationId || '';
  const conversationId = params.conversationId ? parseInt(params.conversationId, 10) : undefined;
  const patientName = params.patientName || 'Patient';
  const animalImage = params.animalImage || '';

  const { data: consultation } = useGetConsultationQuery(consultationId, { skip: !consultationId });
  const { data: apiMessages, isLoading: messagesLoading } = useGetMessagesQuery(conversationId, { skip: !conversationId });
  const [sendMessage, { isLoading: sending }] = useSendMessageMutation();

  const [consultationState, setConsultationState] = useState<ConsultationState>('idle');
  const [inputText, setInputText] = useState('');
  const [remainingTime] = useState(14 * 60 + 28);
  const flatListRef = useRef<FlatList>(null);
  const [showPrescriptionSheet, setShowPrescriptionSheet] = useState(false);
  const [localMessages, setLocalMessages] = useState<ChatMessageUI[]>([]);

  useEffect(() => {
    if (consultation) {
      if (consultation.status === 'ENDED') {
        setConsultationState('ended');
      } else if (consultation.status === 'IN_PROGRESS') {
        setConsultationState('active');
      }
    }
  }, [consultation]);

  useEffect(() => {
    if (apiMessages) {
      const mapped: ChatMessageUI[] = apiMessages.map((msg) => ({
        id: msg.id.toString(),
        sender: msg.sender === 'doctor' ? 'doctor' : 'patient',
        text: msg.text,
        time: new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isPrescription: !!msg.attachmentUrl,
        prescriptionDate: msg.attachmentUrl ? new Date(msg.createdAt).toLocaleDateString() : undefined,
        prescriptionSize: msg.attachmentUrl ? 'PDF' : undefined,
      }));
      setLocalMessages(mapped);
    }
  }, [apiMessages]);

  useEffect(() => {
    if (!conversationId) return;
    const socket = io(API_URL, { transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('joinConversation', conversationId);
    });
    socket.on('newMessage', (msg: any) => {
      const newMsg: ChatMessageUI = {
        id: msg.id?.toString() || Date.now().toString(),
        sender: msg.sender === 'doctor' ? 'doctor' : 'patient',
        text: msg.text,
        time: new Date(msg.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setLocalMessages((prev) => [...prev, newMsg]);
    });
    return () => { socket.disconnect(); };
  }, [conversationId]);

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

  const handleSendMessage = async () => {
    if (!inputText.trim() || sending) return;
    const text = inputText.trim();
    setInputText('');
    const optimistic: ChatMessageUI = {
      id: `temp-${Date.now()}`,
      sender: 'doctor',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLocalMessages((prev) => [...prev, optimistic]);
    try {
      await sendMessage({ text, conversationId }).unwrap();
    } catch {
      setLocalMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  };

  const renderMessage = ({ item }: { item: ChatMessageUI }) => {
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
            {animalImage ? (
              <Image source={{ uri: animalImage }} style={styles.patientAvatarImage} />
            ) : (
              <Ionicons name="paw" size={16} color="#BD632F" />
            )}
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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{patientName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.7} onPress={() => router.push('/video-call')}>
            <Ionicons name="call" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerActionBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/video-call')}
          >
            <Ionicons name="videocam" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerActionBtn} activeOpacity={0.7}>
            <Ionicons name="ellipsis-vertical" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Upcoming Appointment Banner (idle & active states) */}
      {(consultationState === 'idle' || consultationState === 'active') && consultation && (
        <View style={styles.upcomingBanner}>
          <View style={styles.upcomingBannerLeft}>
            <View style={styles.upcomingBannerAvatar}>
              {animalImage ? (
                <Image source={{ uri: animalImage }} style={styles.upcomingBannerAvatarImage} />
              ) : (
                <Ionicons name="paw" size={24} color="#BD632F" />
              )}
            </View>
            <View>
              <Text style={styles.upcomingBannerTime}>
                {new Date(consultation.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · Today
              </Text>
              <Text style={styles.upcomingBannerName}>{patientName}</Text>
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
          <Text style={styles.consultationBannerDesc}>You are now in consultation with {patientName}</Text>
          <Text style={styles.consultationBannerBullet}>•  Start time: {consultation ? new Date(consultation.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
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
          <Text style={styles.consultationBannerDesc}>Your consultation with {patientName} has ended.</Text>
          <Text style={styles.consultationBannerBullet}>•  Start time: {consultation ? new Date(consultation.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</Text>
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
      {messagesLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#BD632F" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={localMessages}
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
      )}

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
            <TouchableOpacity
              style={[styles.micBtn, sending && { opacity: 0.5 }]}
              activeOpacity={0.8}
              onPress={handleSendMessage}
              disabled={sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="mic" size={18} color="#FFFFFF" />
              )}
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12, backgroundColor: '#BD632F' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerActionBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },

  // Upcoming Banner
  upcomingBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#E6D5C3', marginHorizontal: 20, borderRadius: 14, padding: 12, marginBottom: 12 },
  upcomingBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  upcomingBannerAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  upcomingBannerAvatarImage: { width: 44, height: 44, borderRadius: 12 },
  upcomingBannerTime: { fontSize: 11, fontWeight: '600', color: '#BD632F' },
  upcomingBannerName: { fontSize: 15, fontWeight: '800', color: '#1A1817' },
  upcomingBannerJoin: { backgroundColor: '#BD632F', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 8 },
  upcomingBannerJoinText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  // Consultation Banner
  consultationBanner: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', padding: 14, marginBottom: 12 },
  consultationBannerTitle: { fontSize: 15, fontWeight: '800', color: '#1A1817', marginBottom: 4 },
  consultationBannerEndedTitle: { fontSize: 15, fontWeight: '800', color: '#E53935', marginBottom: 4 },
  consultationBannerDesc: { fontSize: 13, fontWeight: '500', color: '#7C7672', marginBottom: 8 },
  consultationBannerBullet: { fontSize: 13, fontWeight: '500', color: '#1A1817', lineHeight: 20 },
  consultationBannerRemaining: { fontSize: 13, fontWeight: '600', color: '#BD632F', lineHeight: 20 },
  endConsultationBtn: { backgroundColor: '#E6E1DC', borderRadius: 14, paddingVertical: 10, alignItems: 'center', marginTop: 12 },
  endConsultationBtnText: { color: '#1A1817', fontSize: 14, fontWeight: '700' },

  // Next Step (inline)
  nextStepInline: { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 14, borderWidth: 1, borderColor: '#E6E1DC', padding: 14, marginBottom: 12 },
  nextStepInlineTitle: { fontSize: 15, fontWeight: '800', color: '#1A1817', marginBottom: 8 },
  nextStepInlineOption: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nextStepInlineText: { fontSize: 13, fontWeight: '500', color: '#7C7672', flex: 1 },
  sendPrescriptionInlineBtn: { backgroundColor: '#BD632F', borderRadius: 14, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  sendPrescriptionInlineBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#E6E1DC', justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: 'transparent' },

  // Messages
  messagesList: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  dateSeparator: { alignSelf: 'center', backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#E6E1DC', paddingHorizontal: 16, paddingVertical: 6, marginVertical: 12 },
  dateSeparatorText: { fontSize: 12, fontWeight: '600', color: '#9C9690' },
  messageRowLeft: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14, maxWidth: '85%' },
  messageRowRight: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 14, maxWidth: '85%', alignSelf: 'flex-end' },
  patientAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center', marginRight: 8, overflow: 'hidden' },
  patientAvatarImage: { width: 32, height: 32, borderRadius: 16 },
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
  startConsultationBtn: { backgroundColor: '#BD632F', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  startConsultationBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },

  // Input Bar
  inputBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 28, borderWidth: 1, borderColor: '#E6E1DC', height: 52, paddingHorizontal: 16, marginHorizontal: 20, marginBottom: 12, gap: 8 },
  textInput: { flex: 1, fontSize: 14, color: '#1A1817', height: '100%' },
  plusBtn: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, borderColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },
  micBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

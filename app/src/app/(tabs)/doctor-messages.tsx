import React, { useState } from 'react';
import { useRequireDoctor } from '@/hooks/use-require-doctor';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface ChatListItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isPending: boolean;
}

const MOCK_CHATS: ChatListItem[] = [
  { id: '1', name: 'Emily Carter', lastMessage: 'Thank you for the detailed exp...', time: '4:00 PM', unreadCount: 0, isPending: false },
  { id: '2', name: 'Sophia Nguyen', lastMessage: 'Send prescription, re...', time: '12:45 P...', unreadCount: 1, isPending: true },
  { id: '3', name: 'Martin Randolph', lastMessage: 'Thank you doctor, I will follow...', time: '11:30 AM', unreadCount: 2, isPending: false },
  { id: '4', name: "Liam O'Connor", lastMessage: 'Please reschedule for next we...', time: '1:15 PM', unreadCount: 0, isPending: false },
  { id: '5', name: 'Aisha Hassan', lastMessage: 'Send prescription, re...', time: '2:00 PM', unreadCount: 1, isPending: true },
  { id: '6', name: 'Carlos Méndez', lastMessage: 'I have some concerns about m...', time: '3:30 PM', unreadCount: 0, isPending: false },
];

export default function DoctorMessagesScreen() {
  const router = useRouter();
  const isDoctor = useRequireDoctor();
  if (!isDoctor) return null;
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chat</Text>
        <TouchableOpacity style={styles.searchBtn} activeOpacity={0.7}>
          <Ionicons name="search" size={20} color="#1A1817" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Upcoming Appointment Banner */}
        <TouchableOpacity style={styles.upcomingCard} activeOpacity={0.85}>
          <View style={styles.upcomingContent}>
            <View style={styles.upcomingLeft}>
              <Text style={styles.upcomingLabel}>Upcoming appointment</Text>
              <Text style={styles.upcomingTime}>10:00 AM · Today</Text>
              <Text style={styles.upcomingPetName}>Donald Tramp</Text>
              <Text style={styles.upcomingStarts}>Starts in 20 min</Text>
              <Text style={styles.upcomingOwner}>Owner   Sophia Rodriguez</Text>
            </View>
            <View style={styles.upcomingRight}>
              <View style={styles.upcomingPetAvatar}>
                <Ionicons name="paw" size={28} color="#BD632F" />
              </View>
              <TouchableOpacity style={styles.joinBtn} activeOpacity={0.85} onPress={() => router.push('/video-call')}>
                <Text style={styles.joinBtnText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>

        {/* Recent Chats */}
        <Text style={styles.sectionTitle}>Recent chats</Text>

        {MOCK_CHATS.map((chat) => (
          <TouchableOpacity
            key={chat.id}
            style={styles.chatItem}
            activeOpacity={0.7}
            onPress={() => router.push({ pathname: '/chat', params: { conversationId: chat.id } })}
          >
            <View style={styles.chatAvatar}>
              <Ionicons name="paw" size={22} color="#BD632F" />
            </View>
            <View style={styles.chatInfo}>
              <View style={styles.chatTopRow}>
                <Text style={styles.chatName}>{chat.name}</Text>
                <Text style={styles.chatTime}>{chat.time}</Text>
              </View>
              <View style={styles.chatBottomRow}>
                {chat.isPending ? (
                  <Text style={styles.pendingText}>
                    Pending: <Text style={styles.chatLastMessage}>{chat.lastMessage}</Text>
                  </Text>
                ) : (
                  <Text style={styles.chatLastMessage} numberOfLines={1}>{chat.lastMessage}</Text>
                )}
                {chat.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{chat.unreadCount}</Text>
                  </View>
                )}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF9F6' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1A1817' },
  searchBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 100 },
  upcomingCard: { backgroundColor: '#E6D5C3', borderRadius: 20, padding: 16, marginBottom: 24 },
  upcomingContent: { flexDirection: 'row', justifyContent: 'space-between' },
  upcomingLeft: { flex: 1, marginRight: 12 },
  upcomingLabel: { fontSize: 14, fontWeight: '800', color: '#BD632F', marginBottom: 4 },
  upcomingTime: { fontSize: 12, fontWeight: '600', color: '#7C7672', marginBottom: 2 },
  upcomingPetName: { fontSize: 17, fontWeight: '800', color: '#1A1817', marginBottom: 2 },
  upcomingStarts: { fontSize: 12, fontWeight: '500', color: '#9C9690', marginBottom: 4 },
  upcomingOwner: { fontSize: 12, fontWeight: '500', color: '#7C7672' },
  upcomingRight: { alignItems: 'center', gap: 8 },
  upcomingPetAvatar: { width: 64, height: 64, borderRadius: 16, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  joinBtn: { backgroundColor: '#BD632F', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  joinBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1A1817', marginBottom: 12 },
  chatItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0ECE8' },
  chatAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFF2EB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  chatInfo: { flex: 1 },
  chatTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  chatName: { fontSize: 15, fontWeight: '700', color: '#1A1817' },
  chatTime: { fontSize: 12, fontWeight: '500', color: '#9C9690' },
  chatBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  chatLastMessage: { fontSize: 13, fontWeight: '500', color: '#9C9690', flex: 1 },
  pendingText: { fontSize: 13, fontWeight: '500', color: '#BD632F', flex: 1 },
  unreadBadge: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#BD632F', justifyContent: 'center', alignItems: 'center', marginLeft: 8 },
  unreadText: { color: '#FFFFFF', fontSize: 11, fontWeight: '700' },
});

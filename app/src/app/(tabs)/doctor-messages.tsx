import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGetConversationsQuery } from '@/store/chatApi';
import { useConversationListSocket } from '@/hooks/use-chat-socket';

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
}

export default function DoctorMessagesScreen() {
  const router = useRouter();
  const { data: conversations = [], isLoading } = useGetConversationsQuery();
  useConversationListSocket();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <ActivityIndicator size="small" color="#BD632F" style={{ marginTop: 30 }} />
        ) : conversations.length === 0 ? (
          <Text style={styles.emptyText}>No conversations yet.</Text>
        ) : (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.id}
              style={styles.conversationCard}
              activeOpacity={0.7}
              onPress={() =>
                router.push({ pathname: '/chat', params: { conversationId: conversation.id } })
              }
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarEmoji}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.patientName}>Patient #{conversation.patientId}</Text>
                <Text style={styles.lastMessageDate}>
                  {conversation.lastMessageAt ? formatDate(conversation.lastMessageAt) : 'No messages yet'}
                </Text>
              </View>
              <Text style={styles.chevron}>❯</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1A1817',
  },
  scrollContainer: {
    paddingHorizontal: 24,
    paddingBottom: 110,
  },
  emptyText: {
    fontSize: 13,
    color: '#9C9690',
    textAlign: 'center',
    paddingVertical: 40,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF1E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 18,
  },
  patientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1817',
  },
  lastMessageDate: {
    fontSize: 12,
    color: '#9C9690',
    marginTop: 2,
  },
  chevron: {
    fontSize: 14,
    color: '#BD632F',
  },
});

import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useSendAttachmentMessageMutation,
} from '@/store/chatApi';
import { useChatSocket } from '@/hooks/use-chat-socket';

export default function ChatScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const conversationId = params.conversationId ? Number(params.conversationId) : undefined;
  const { data: dbMessages = [] } = useGetMessagesQuery(conversationId);
  const [sendMessage] = useSendMessageMutation();
  const [sendAttachmentMessage] = useSendAttachmentMessageMutation();
  const [inputText, setInputText] = useState('');
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const { isOtherUserTyping, emitTyping } = useChatSocket(conversationId);

  const messages = useMemo(
    () =>
      [...dbMessages]
        .reverse()
        .map((m) => ({
          id: String(m.id),
          sender: m.sender,
          text: m.text,
          time: m.time,
          attachmentUrl: m.attachmentUrl,
          attachmentType: m.attachmentType,
          avatar: m.sender === 'user'
            ? require('@/assets/images/doctor_avatar.png')
            : require('@/assets/images/doctor.png'),
        })),
    [dbMessages],
  );

  const handleChangeText = (text: string) => {
    setInputText(text);
    emitTyping(text.length > 0);
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;
    const textToSend = inputText;
    setInputText('');
    emitTyping(false);
    try {
      await sendMessage({ text: textToSend, conversationId }).unwrap();
    } catch (err) {
      console.log('Error sending message to API:', err);
    }
  };

  const handlePickAttachment = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const name = asset.uri.split('/').pop() ?? `photo-${Date.now()}.jpg`;
    const type = asset.mimeType ?? 'image/jpeg';

    try {
      await sendAttachmentMessage({
        conversationId,
        file: { uri: asset.uri, name, type },
      }).unwrap();
    } catch (err) {
      console.log('Error sending attachment to API:', err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>←</Text>
          </TouchableOpacity>

          {/* Doctor Info Row */}
          <View style={styles.doctorHeaderCol}>
            <View style={styles.avatarWrapper}>
              <Image source={require('@/assets/images/doctor.png')} style={styles.doctorAvatar} />
              <View style={styles.activeDot} />
            </View>
            <Text style={styles.doctorName}>Dr. David Patel</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.circleButton} activeOpacity={0.8}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Message Area */}
      <FlatList
        data={messages}
        inverted
        keyExtractor={(msg) => msg.id}
        contentContainerStyle={styles.chatScroll}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          isOtherUserTyping ? (
            <View style={[styles.messageRow, styles.doctorRow]}>
              <View style={[styles.bubble, styles.doctorBubble]}>
                <Text style={[styles.bubbleText, styles.doctorText]}>typing…</Text>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item: msg }) => {
          const isDoctor = msg.sender === 'doctor';
          return (
            <View style={[styles.messageRow, isDoctor ? styles.doctorRow : styles.userRow]}>
              {/* User Avatar on the left for user messages */}
              {!isDoctor && (
                <Image source={msg.avatar} style={styles.bubbleAvatarLeft} />
              )}

              {/* Message Bubble */}
              <View style={[styles.bubble, isDoctor ? styles.doctorBubble : styles.userBubble]}>
                {msg.attachmentUrl && msg.attachmentType === 'image' && (
                  <TouchableOpacity onPress={() => setPreviewImageUrl(msg.attachmentUrl!)}>
                    <Image source={{ uri: msg.attachmentUrl }} style={styles.attachmentImage} />
                  </TouchableOpacity>
                )}
                {msg.attachmentUrl && msg.attachmentType === 'document' && (
                  <TouchableOpacity
                    style={styles.documentChip}
                    onPress={() => Linking.openURL(msg.attachmentUrl!)}
                  >
                    <Text
                      style={[
                        styles.documentChipText,
                        isDoctor ? styles.doctorText : styles.userText,
                      ]}
                    >
                      📄 Document
                    </Text>
                  </TouchableOpacity>
                )}
                {!!msg.text && (
                  <Text style={[styles.bubbleText, isDoctor ? styles.doctorText : styles.userText]}>
                    {msg.text}
                  </Text>
                )}
                <Text style={[styles.timeText, isDoctor ? styles.doctorTime : styles.userTime]}>
                  {msg.time}
                </Text>
              </View>

              {/* Doctor Avatar on the right for doctor messages */}
              {isDoctor && (
                <Image source={msg.avatar} style={styles.bubbleAvatarRight} />
              )}
            </View>
          );
        }}
      />

      {/* Input controls */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={20}
      >
        <View style={styles.inputBar}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={handlePickAttachment}
            activeOpacity={0.85}
          >
            <Text style={styles.attachIcon}>📎</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor="#A39E99"
            value={inputText}
            onChangeText={handleChangeText}
          />
          <TouchableOpacity
            style={styles.micButton}
            onPress={handleSendMessage}
            activeOpacity={0.85}
          >
            <Text style={styles.micIcon}>🎙️</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={!!previewImageUrl} transparent animationType="fade">
        <TouchableOpacity
          style={styles.imagePreviewOverlay}
          activeOpacity={1}
          onPress={() => setPreviewImageUrl(null)}
        >
          {previewImageUrl && (
            <Image source={{ uri: previewImageUrl }} style={styles.imagePreviewFull} resizeMode="contain" />
          )}
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FAF9F6',
    backgroundColor: '#FAF9F6',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#BD632F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  menuIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  doctorHeaderCol: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 14,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 10,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  activeDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#00FF66',
    borderWidth: 1.5,
    borderColor: '#FAF9F6',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1817',
  },
  chatScroll: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 120,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 20,
    maxWidth: '85%',
  },
  doctorRow: {
    alignSelf: 'flex-start',
  },
  userRow: {
    alignSelf: 'flex-end',
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    position: 'relative',
  },
  doctorBubble: {
    backgroundColor: '#BD632F',
    borderBottomLeftRadius: 4,
    marginRight: 8,
  },
  userBubble: {
    backgroundColor: '#FFF8F4',
    borderBottomRightRadius: 4,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E6E1DC',
  },
  bubbleText: {
    fontSize: 14,
    lineHeight: 18,
  },
  doctorText: {
    color: '#FFFFFF',
  },
  userText: {
    color: '#1A1817',
  },
  timeText: {
    fontSize: 10,
    marginTop: 6,
  },
  doctorTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  userTime: {
    color: '#9C9690',
  },
  bubbleAvatarLeft: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  bubbleAvatarRight: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6E1DC',
    borderRadius: 28,
    height: 56,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#1A1817',
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#BD632F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  micIcon: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  attachButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  attachIcon: {
    fontSize: 18,
  },
  attachmentImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginBottom: 6,
  },
  documentChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 6,
  },
  documentChipText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  imagePreviewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePreviewFull: {
    width: '100%',
    height: '80%',
  },
});

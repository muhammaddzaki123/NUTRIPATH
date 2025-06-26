// app/(root)/(konsultasi)/chat/[id].tsx

import { useChat } from '@/components/ChatContext';
import { Message, Nutritionist } from '@/constants/chat';
import { useGlobalContext } from '@/lib/global-provider';
import { FontAwesome, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// --- Komponen Gelembung Pesan ---
const MessageBubble = ({
  message,
  isUser,
  onLongPress,
}: {
  message: Message;
  isUser: boolean;
  onLongPress: (messageId: string, chatId: string) => void;
}) => {
  const alignStyle = isUser ? 'items-end' : 'items-start';
  const bubbleStyle = isUser ? 'bg-primary-500' : 'bg-gray-200';
  const textStyle = isUser ? 'text-white' : 'text-black-300';

  return (
    <View className={`w-full flex ${alignStyle} my-1`}>
      <TouchableOpacity
        onLongPress={() => onLongPress(message.$id, message.chatId)}
        activeOpacity={0.8}
        className={`max-w-[80%] p-3 rounded-2xl ${bubbleStyle}`}
      >
        <Text className={`text-base font-rubik ${textStyle}`}>{message.text}</Text>
        <View className="flex-row items-center self-end mt-1">
          <Text className={`text-xs ${isUser ? 'text-white/70' : 'text-gray-500'}`}>
            {new Date(message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isUser && message.read && (
            <FontAwesome name="check-double" size={12} color="white" className="ml-1" />
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

// --- Komponen Input Pesan ---
const MessageInput = ({ onSend, isSending }: { onSend: (text: string) => void; isSending: boolean }) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim()) {
      onSend(text.trim());
      setText('');
      Keyboard.dismiss();
    }
  };

  return (
    <View className="flex-row items-center bg-white p-3 border-t border-gray-200">
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Ketik pesan..."
        className="flex-1 bg-gray-100 rounded-full px-4 py-3 mr-3 text-base"
        multiline
        editable={!isSending}
      />
      <TouchableOpacity
        onPress={handleSend}
        disabled={!text.trim() || isSending}
        className={`w-12 h-12 rounded-full items-center justify-center ${
          text.trim() && !isSending ? 'bg-primary-500' : 'bg-gray-300'
        }`}
      >
        {isSending ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <FontAwesome name="send" size={18} color="white" />
        )}
      </TouchableOpacity>
    </View>
  );
};

// --- Komponen Utama Halaman Chat ---
const ChatScreen = () => {
  const { id: partnerId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const {
    nutritionists,
    messages,
    addMessage,
    markMessageAsRead,
    loading: chatLoading,
    setCurrentChat,
    deleteMessage,
    deleteAllMessages,
  } = useChat();
  const { user } = useGlobalContext();
  const [isSending, setIsSending] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { chatId, chatPartner } = useMemo(() => {
    if (!user || !partnerId) return { chatId: null, chatPartner: null };

    const computedChatId =
      user.userType === 'nutritionist' ? `${partnerId}-${user.$id}` : `${user.$id}-${partnerId}`;

    const partner =
      user.userType === 'nutritionist'
        ? (messages[computedChatId]?.[0]?.userDetails as Nutritionist) || {
            name: `User ${partnerId}`,
            avatar: '',
            status: 'offline',
          }
        : nutritionists.find((n: Nutritionist) => n.$id === partnerId);

    return { chatId: computedChatId, chatPartner: partner };
  }, [user, partnerId, messages, nutritionists]);

  useEffect(() => {
    if (chatId) {
      setCurrentChat(chatId);
      const chatMessages = messages[chatId] || [];
      chatMessages.forEach((msg) => {
        if (!msg.read && msg.sender !== user?.userType) {
          markMessageAsRead(msg.$id).catch(console.error);
        }
      });
    }
    return () => setCurrentChat(null);
  }, [chatId, messages, user, markMessageAsRead, setCurrentChat]);

  useEffect(() => {
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages[chatId || '']]);

  const handleSend = async (text: string) => {
    if (!partnerId) return;
    setIsSending(true);
    try {
      await addMessage(partnerId, text);
    } catch (error) {
      console.error('Gagal mengirim pesan:', error);
      Alert.alert('Error', 'Gagal mengirim pesan. Silakan coba lagi.');
    } finally {
      setIsSending(false);
    }
  };

  const confirmDelete = (messageId: string, currentChatId: string) => {
    Alert.alert(
      'Hapus Pesan',
      'Apakah Anda yakin ingin menghapus pesan ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => handleDelete(messageId, currentChatId),
        },
      ],
      { cancelable: true }
    );
  };

  const handleDelete = async (messageId: string, currentChatId: string) => {
    try {
      await deleteMessage(messageId, currentChatId);
    } catch (error) {
      console.error('Gagal menghapus pesan:', error);
      Alert.alert('Error', 'Gagal menghapus pesan.');
    }
  };

  const handleClearChat = async () => {
    if (!chatId) return;
    setMenuVisible(false);
    Alert.alert(
      'Hapus Riwayat Chat',
      'Tindakan ini akan menghapus semua pesan dalam percakapan ini secara permanen. Anda yakin?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus Semua',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllMessages(chatId);
            } catch (error) {
              Alert.alert('Error', 'Gagal membersihkan riwayat chat.');
            }
          },
        },
      ]
    );
  };

  if (chatLoading && !chatPartner) {
    return (
      <SafeAreaView className="flex-1 bg-primary-500 items-center justify-center">
        <ActivityIndicator size="large" color="white" />
      </SafeAreaView>
    );
  }

  if (!user || !chatPartner) {
    return (
      <SafeAreaView className="flex-1 bg-primary-500 items-center justify-center p-4">
        <Text className="text-white text-lg text-center">
          Partner chat tidak ditemukan atau Anda belum login.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-white underline">Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const chatMessages = messages[chatId || ''] || [];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Image
            source={{ uri: chatPartner.avatar }}
            style={styles.avatar}
          />
          <View>
            <Text className="text-white text-lg font-rubik-bold">{chatPartner.name}</Text>
            <Text className="text-white/80 text-sm font-rubik">{chatPartner.status}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => setMenuVisible(true)} className="p-2">
          <MaterialCommunityIcons name="dots-vertical" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {chatMessages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-gray-500 text-center">
                Mulai percakapan dengan {chatPartner.name}!
              </Text>
            </View>
          ) : (
            chatMessages.map((message) => (
              <MessageBubble
                key={message.$id}
                message={message}
                isUser={message.sender === user.userType}
                onLongPress={confirmDelete}
              />
            ))
          )}
        </ScrollView>

        <MessageInput onSend={handleSend} isSending={isSending} />
      </KeyboardAvoidingView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity style={styles.menuItem} onPress={handleClearChat}>
              <Text style={styles.menuText}>Hapus Semua Pesan</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0BBEBB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: '#fff',
  },
  messagesContainer: {
    flexGrow: 1,
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 10,
    marginTop: 60,
    marginRight: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
});

export default ChatScreen;
import { useChat } from '@/components/ChatContext';
import { Message, Nutritionist } from '@/constants/chat';
import { useGlobalContext } from '@/lib/global-provider';
import { FontAwesome } from '@expo/vector-icons';
import { Link, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ChatScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { nutritionists, messages, addMessage, markMessageAsRead, loading, setCurrentChat } = useChat();
  const { user } = useGlobalContext();
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // For nutritionist view, we need to find the user details from messages
  const chatPartner = useMemo(() => {
    if (!user || !id) return null;

    if (user.userType === 'nutritionist') {
      const chatId = `${id}-${user.$id}`;
      const chatMessages = messages[chatId] || [];
      const lastMessage = chatMessages[chatMessages.length - 1];
      return lastMessage?.userDetails || { name: `User ${id}`, avatar: null };
    } else {
      return nutritionists.find((n: Nutritionist) => n.$id === id);
    }
  }, [user, id, messages, nutritionists]);

  useEffect(() => {
    if (!user) {
      Alert.alert(
        'Tidak dapat mengakses chat',
        'Anda harus login terlebih dahulu',
        [{ text: 'OK', onPress: () => router.replace('/sign-in') }]
      );
      return;
    }

    if (user && id) {
      // Compute chatId based on user type
      const chatIdComputed = user.userType === 'nutritionist'
        ? `${id}-${user.$id}`      // For nutritionist view: userId-nutritionistId
        : `${user.$id}-${id}`;     // For user view: userId-nutritionistId
      
      console.log('Setting current chat:', chatIdComputed);
      setCurrentChat(chatIdComputed);
    }
  }, [user, id]);

  const chatId = user && id 
    ? (user.userType === 'nutritionist' ? `${id}-${user.$id}` : `${user.$id}-${id}`)
    : null;

  // Deduplicate messages using useMemo
  const chatMessages = useMemo(() => {
    if (!chatId || !messages[chatId]) return [];

    // Create a Map to store unique messages by their ID
    const uniqueMessages = new Map<string, Message>();
    messages[chatId].forEach((msg) => {
      if (!uniqueMessages.has(msg.$id)) {
        uniqueMessages.set(msg.$id, msg);
      }
    });

    // Convert Map back to array and sort by time
    return Array.from(uniqueMessages.values())
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [chatId, messages]);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
    return () => clearTimeout(timer);
  }, [chatMessages]);

  // Mark messages as read
  useEffect(() => {
    const markUnreadMessages = async () => {
      for (const message of chatMessages) {
        if (!message.read && message.sender !== user?.userType) {
          try {
            await markMessageAsRead(message.$id);
          } catch (error) {
            console.error('Error marking message as read:', error);
          }
        }
      }
    };
    if (chatMessages.length > 0) {
      markUnreadMessages();
    }
  }, [chatMessages, user]);

  const handleSend = async () => {
    if (!user) {
      Alert.alert(
        'Tidak dapat mengirim pesan',
        'Anda harus login terlebih dahulu',
        [{ text: 'OK', onPress: () => router.replace('/sign-in') }]
      );
      return;
    }

    if (!id) {
      Alert.alert('Error', 'ID chat partner tidak ditemukan');
      return;
    }

    if (!newMessage.trim()) {
      Alert.alert('Error', 'Pesan tidak boleh kosong');
      return;
    }

    if (sending) return;

    try {
      setSending(true);
      await addMessage(id, newMessage.trim());
      setNewMessage('');
      
      // Scroll to bottom after sending
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert(
        'Gagal mengirim pesan',
        'Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.'
      );
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#1CD6CE] items-center justify-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">Memuat percakapan...</Text>
      </SafeAreaView>
    );
  }

  if (!chatPartner) {
    return (
      <SafeAreaView className="flex-1 bg-[#1CD6CE] items-center justify-center">
        <Text className="text-white text-lg">
          {user?.userType === 'nutritionist' ? 'User tidak ditemukan' : 'Ahli gizi tidak ditemukan'}
        </Text>
        <Link href="/konsultasi" className="mt-4">
          <Text className="text-white underline">Kembali ke {user?.userType === 'nutritionist' ? 'daftar chat' : 'daftar ahli gizi'}</Text>
        </Link>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#1CD6CE]">
      {/* Header */}
      <View className="flex-row items-center px-4 py-3">
        <Link href="/konsultasi" className="mr-auto">
          <View className="w-8 h-8 justify-center">
            <Text className="text-white text-2xl">←</Text>
          </View>
        </Link>
        <View className="flex-row items-center absolute left-0 right-0 justify-center">
          <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-2">
            {chatPartner.avatar ? (
              <Image 
                source={{ uri: chatPartner.avatar }}
                style={{ width: 40, height: 40, borderRadius: 20 }}
              />
            ) : (
              <FontAwesome name="user-circle" size={24} color="#666" />
            )}
          </View>
          <Text className="text-white text-lg font-bold">
            {chatPartner.name}
          </Text>
          {user?.userType === 'user' && 'status' in chatPartner && (
            <View 
              className={`w-2 h-2 rounded-full ${
                (chatPartner as Nutritionist).status === 'online' ? 'bg-green-500' : 'bg-gray-400'
              } ml-2`} 
            />
          )}
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Chat Messages */}
        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 bg-white rounded-t-3xl px-4 pt-4"
          contentContainerStyle={{ paddingBottom: 16 }}
        >
          {chatMessages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-gray-500 text-center">
                Belum ada percakapan. Mulai chat dengan {chatPartner.name} sekarang!
              </Text>
            </View>
          ) : (
            chatMessages.map((message: Message, index: number) => {
              const isUser = message.sender === user?.userType;
              const showAvatar = !isUser && (!chatMessages[index - 1] || chatMessages[index - 1].sender === user?.userType);
              
              return (
                <View 
                  key={message.$id}
                  className={`flex-row ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
                >
                  {!isUser && showAvatar && (
                    <View className="w-8 h-8 rounded-full bg-gray-100 mr-2">
                      {chatPartner.avatar ? (
                        <Image 
                          source={{ uri: chatPartner.avatar }}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <FontAwesome name="user-circle" size={20} color="#666" />
                      )}
                    </View>
                  )}
                  <View 
                    className={`rounded-2xl px-4 py-2 max-w-[75%] ${
                      isUser ? 'bg-[#1CD6CE]' : 'bg-gray-100'
                    }`}
                  >
                    <Text className={isUser ? 'text-white' : 'text-gray-900'}>
                      {message.text}
                    </Text>
                    <Text 
                      className={`text-xs mt-1 ${
                        isUser ? 'text-white/70' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.time).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {message.read && isUser && (
                        <Text className="ml-1">✓</Text>
                      )}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Message Input */}
        <View className="bg-white border-t border-gray-200 px-4 py-2">
          <View className="flex-row items-center">
            <TextInput
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Ketik pesan..."
              className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
              multiline
              maxLength={500}
              editable={!sending}
            />
            <TouchableOpacity 
              onPress={handleSend}
              disabled={!newMessage.trim() || sending}
              className={`w-10 h-10 rounded-full items-center justify-center ${
                newMessage.trim() && !sending ? 'bg-[#1CD6CE]' : 'bg-gray-300'
              }`}
            >
              {sending ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <FontAwesome name="send" size={16} color="white" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatScreen;
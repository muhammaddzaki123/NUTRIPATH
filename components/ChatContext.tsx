// components/ChatContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import {
  Message,
  Nutritionist,
  User,
  MessageState,
  UnreadMessageState,
  ChatContextType,
} from '@/constants/chat';
import { useGlobalContext } from '@/lib/global-provider';
import {
  getNutritionists,
  getChatMessages,
  getNutritionistChats,
  sendMessage,
  subscribeToAllChatUpdates, // Menggunakan subscription global
  updateNutritionistStatus,
  getUserDetails,
  markMessageAsRead, // Impor fungsi ini
  getUnreadCount
} from '@/lib/chat-service';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat harus digunakan di dalam ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useGlobalContext();
  const [messages, setMessages] = useState<MessageState>({});
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk memperbarui atau menambahkan pesan dengan aman (mencegah duplikasi)
  const upsertMessage = useCallback(async (newMessage: Message) => {
    // Menambahkan detail pengirim jika belum ada
    if (!newMessage.userDetails && newMessage.userId) {
      const details = await getUserDetails(newMessage.userId);
      newMessage.userDetails = details || undefined;
    }

    setMessages(prev => {
      const chatMessages = prev[newMessage.chatId] || [];
      const messageIndex = chatMessages.findIndex(msg => msg.$id === newMessage.$id);

      let updatedMessages;
      if (messageIndex !== -1) {
        // Update pesan yang sudah ada
        updatedMessages = [...chatMessages];
        updatedMessages[messageIndex] = newMessage;
      } else {
        // Tambahkan pesan baru
        updatedMessages = [...chatMessages, newMessage];
      }
      
      // Urutkan kembali untuk memastikan urutan waktu yang benar
      updatedMessages.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      
      return { ...prev, [newMessage.chatId]: updatedMessages };
    });
  }, []);

  // Efek untuk memuat data awal
  useEffect(() => {
    const initialize = async () => {
      if (!user) {
        setLoading(false);
        setNutritionists([]);
        setMessages({});
        return;
      }

      setLoading(true);
      try {
        const fetchedNutritionists = await getNutritionists();
        setNutritionists(fetchedNutritionists);

        if (user.userType === 'nutritionist') {
          await updateNutritionistStatus(user.$id, 'online');
          const chats = await getNutritionistChats(user.$id);
          // Mengisi detail pengguna untuk setiap chat
          for (const chatId in chats) {
              for (const msg of chats[chatId]) {
                  if (msg.userId && !msg.userDetails) {
                      msg.userDetails = await getUserDetails(msg.userId) || undefined;
                  }
              }
          }
          setMessages(chats);
        } else {
            // Pengguna biasa memuat chat mereka sendiri
            const chatPromises = fetchedNutritionists.map(n => {
                const chatId = `${user.$id}-${n.$id}`;
                return getChatMessages(chatId);
            });
            const allChats = await Promise.all(chatPromises);
            const initialMessages: MessageState = {};
            allChats.forEach(chat => {
                if (chat.length > 0) {
                    initialMessages[chat[0].chatId] = chat;
                }
            });
            setMessages(initialMessages);
        }
      } catch (error) {
        console.error("Gagal menginisialisasi ChatProvider:", error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
    
    // Cleanup saat logout
    return () => {
      if (user?.userType === 'nutritionist') {
        updateNutritionistStatus(user.$id, 'offline').catch(console.error);
      }
    };
  }, [user]);

  // Efek untuk langganan real-time global
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToAllChatUpdates((response) => {
      if (response.events.includes('databases.*.collections.*.documents.*.create')) {
        const newMessage = response.payload as Message;
        // Filter: Hanya proses pesan yang relevan untuk pengguna ini
        if (newMessage.userId === user.$id || newMessage.nutritionistId === user.$id) {
          upsertMessage(newMessage);
        }
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user, upsertMessage]);

  const addMessage = async (targetId: string, text: string) => {
    if (!user) throw new Error('Pengguna tidak terautentikasi');

    const isUserSender = user.userType === 'user';
    const userId = isUserSender ? user.$id : targetId;
    const nutritionistId = isUserSender ? targetId : user.$id;
    const chatId = `${userId}-${nutritionistId}`;

    // Tidak perlu lagi pembaruan optimis karena langganan real-time akan menangani ini
    try {
      await sendMessage({ userId, nutritionistId, text, chatId }, user.userType);
    } catch (error) {
      console.error("Gagal mengirim pesan:", error);
      throw error;
    }
  };

  // Kalkulasi pesan belum dibaca dari state pesan yang ada
  const unreadMessages = useMemo(() => {
    const counts: UnreadMessageState = {};
    if (user) {
        Object.entries(messages).forEach(([chatId, msgList]) => {
            counts[chatId] = msgList.filter(
                (msg) => !msg.read && msg.sender !== user.userType
            ).length;
        });
    }
    return counts;
  }, [messages, user]);

  const contextValue: ChatContextType = {
    messages,
    addMessage,
    nutritionists,
    unreadMessages,
    loading,
    setCurrentChat: () => { },
    markMessageAsRead,
    currentChat: null
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};
// components/ChatContext.tsx

import {
    Message,
    Nutritionist,
    User,
    MessageState,
    UnreadMessageState,
    ChatContextType
} from '@/constants/chat';
import { useGlobalContext } from '@/lib/global-provider';
import {
    deleteAllMessages as deleteAllMessagesFromDB,
    deleteMessage as deleteMessageFromDB,
    getChatMessages,
    getNutritionistChats,
    getNutritionists,
    getUnreadCount,
    getUserDetails,
    markMessageAsRead,
    sendMessage,
    subscribeToAllChatUpdates,
    updateNutritionistStatus
} from '@/lib/chat-service';
import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

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
    const [currentChat, setCurrentChat] = useState<string | null>(null);


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

        try {
            await sendMessage({ userId, nutritionistId, text, chatId }, user.userType);
        } catch (error) {
            console.error("Gagal mengirim pesan:", error);
            throw error;
        }
    };
    
    // Fungsi baru untuk menghapus satu pesan dari state secara lokal
    const removeMessage = (messageId: string, chatId: string) => {
      setMessages(prev => {
        const chatMessages = prev[chatId] || [];
        const updatedMessages = chatMessages.filter(msg => msg.$id !== messageId);
        return { ...prev, [chatId]: updatedMessages };
      });
    };
    
    // Fungsi baru untuk membersihkan semua pesan dari state untuk chat tertentu
    const clearChat = (chatId: string) => {
      setMessages(prev => ({
        ...prev,
        [chatId]: [],
      }));
    };
    
    const deleteMessage = async (messageId: string, chatId: string) => {
      // 1. Update UI secara optimis
      removeMessage(messageId, chatId);
      try {
        // 2. Hapus dari database
        await deleteMessageFromDB(messageId);
      } catch (error) {
        // Jika gagal, idealnya kita kembalikan pesan ke state (opsional)
        console.error("Gagal menghapus pesan dari DB:", error);
      }
    };
    
    const deleteAllMessages = async (chatId: string) => {
      // 1. Update UI secara optimis
      clearChat(chatId);
      try {
        // 2. Hapus semua dari database
        await deleteAllMessagesFromDB(chatId);
      } catch (error) {
        console.error("Gagal menghapus semua pesan dari DB:", error);
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
        currentChat,
        setCurrentChat,
        markMessageAsRead,
        deleteMessage,
        deleteAllMessages,
    };

    return (
        <ChatContext.Provider value={contextValue}>
            {children}
        </ChatContext.Provider>
    );
};
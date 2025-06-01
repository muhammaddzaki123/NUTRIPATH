import {
  ChatContextType,
  Message,
  MessageState,
  Nutritionist,
  UnreadMessageState,
  User
} from '@/constants//chat';
import { useGlobalContext } from '@/lib/global-provider';
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getChatMessages,
  getNutritionistChats,
  getNutritionists,
  getUnreadCount,
  getUserDetails,
  markMessageAsRead,
  sendMessage,
  subscribeToChat,
  subscribeToNutritionistChats,
  updateNutritionistStatus
} from '@/lib/chat-service';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<MessageState>({});
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessageState>({});
  const [loading, setLoading] = useState(false);
  const [userDetailsCache, setUserDetailsCache] = useState<Map<string, User>>(new Map());
  const { user } = useGlobalContext() as { user: User | null };

  // Cache user details
  const cacheUserDetails = useCallback(async (userId: string) => {
    if (!userDetailsCache.has(userId)) {
      const userDetails = await getUserDetails(userId);
      if (userDetails) {
        setUserDetailsCache(prev => new Map(prev).set(userId, userDetails));
      }
    }
    return userDetailsCache.get(userId);
  }, [userDetailsCache]);

  // Update message with user details
  const enrichMessageWithUserDetails = useCallback(async (message: Message): Promise<Message> => {
    if (message.userDetails) return message;
    
    const userDetails = await cacheUserDetails(message.userId);
    return {
      ...message,
      userDetails: userDetails || undefined
    };
  }, [cacheUserDetails]);

  // Update messages helper
  const updateMessages = useCallback(async (chatId: string, newMessage: Message) => {
    const enrichedMessage = await enrichMessageWithUserDetails(newMessage);
    
    setMessages((prev: MessageState) => {
      const chatMessages = prev[chatId] || [];
      const messageExists = chatMessages.some((msg: Message) => msg.$id === enrichedMessage.$id);
      
      if (messageExists) {
        const updatedMessages = chatMessages.map((msg: Message) =>
          msg.$id === enrichedMessage.$id ? enrichedMessage : msg
        );
        return {
          ...prev,
          [chatId]: updatedMessages
        };
      }
      
      return {
        ...prev,
        [chatId]: [...chatMessages, enrichedMessage].sort(
          (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
        )
      };
    });
  }, [enrichMessageWithUserDetails]);

  // Fetch nutritionists list and setup status
  useEffect(() => {
    const fetchNutritionists = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        console.log('Fetching nutritionists...');
        const fetchedNutritionists = await getNutritionists();
        setNutritionists(fetchedNutritionists);
        console.log('Fetched nutritionists:', fetchedNutritionists.length);

        // If user is a nutritionist, update their status to online
        if (user.userType === 'nutritionist') {
          await updateNutritionistStatus(user.$id, 'online');
          
          // Load all chats for nutritionist
          const chats = await getNutritionistChats(user.$id);
          
          // Enrich all messages with user details
          const enrichedChats: MessageState = {};
          for (const [chatId, chatMessages] of Object.entries(chats)) {
            const enrichedMessages = await Promise.all(
              chatMessages.map(msg => enrichMessageWithUserDetails(msg))
            );
            enrichedChats[chatId] = enrichedMessages;
          }
          
          setMessages(enrichedChats);
        }
      } catch (error) {
        console.error('Error fetching nutritionists:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNutritionists();

    // Cleanup: Set nutritionist status to offline when unmounting
    return () => {
      if (user?.userType === 'nutritionist') {
        updateNutritionistStatus(user.$id, 'offline').catch(console.error);
      }
    };
  }, [user, enrichMessageWithUserDetails]);

  // Subscribe to real-time messages for current chat
  useEffect(() => {
    if (!user || !currentChat) return;

    let unsubscribe: (() => void) | undefined;
    let isSubscribed = true;
    
    const setupSubscription = async () => {
      try {
        console.log('Setting up subscription for chat:', currentChat);
        
        unsubscribe = await subscribeToChat(currentChat, async (newMessage: Message) => {
          if (!isSubscribed) return;
          console.log('Received message:', newMessage);
          await updateMessages(newMessage.chatId, newMessage);

          // Update unread count for messages from the other party
          if (user.userType === 'nutritionist' && newMessage.sender === 'user' ||
              user.userType === 'user' && newMessage.sender === 'nutritionist') {
            if (currentChat !== newMessage.chatId) {
              setUnreadMessages((prev: UnreadMessageState) => ({
                ...prev,
                [newMessage.chatId]: (prev[newMessage.chatId] || 0) + 1
              }));
            }
          }
        });

        console.log('Chat subscription setup successful');
      } catch (error) {
        console.error('Error setting up chat subscription:', error);
      }
    };

    setupSubscription();

    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        console.log('Cleaning up chat subscription');
        unsubscribe();
      }
    };
  }, [user, currentChat, updateMessages]);

  // Subscribe to all chats if user is a nutritionist
  useEffect(() => {
    if (!user || user.userType !== 'nutritionist') return;

    let unsubscribe: (() => void) | undefined;
    let isSubscribed = true;

    const setupNutritionistSubscription = async () => {
      try {
        console.log('Setting up nutritionist subscription');
        
        unsubscribe = await subscribeToNutritionistChats(user.$id, async (newMessage: Message) => {
          if (!isSubscribed) return;
          console.log('Received message for nutritionist:', newMessage);
          await updateMessages(newMessage.chatId, newMessage);

          // Update unread count if message is from user
          if (newMessage.sender === 'user' && currentChat !== newMessage.chatId) {
            setUnreadMessages((prev: UnreadMessageState) => ({
              ...prev,
              [newMessage.chatId]: (prev[newMessage.chatId] || 0) + 1
            }));
          }
        });

        console.log('Nutritionist subscription setup successful');
      } catch (error) {
        console.error('Error setting up nutritionist subscription:', error);
      }
    };

    setupNutritionistSubscription();

    return () => {
      isSubscribed = false;
      if (unsubscribe) {
        console.log('Cleaning up nutritionist subscription');
        unsubscribe();
      }
    };
  }, [user, currentChat, updateMessages]);

  // Fetch existing messages and unread count for current chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user || !currentChat) return;
      
      try {
        setLoading(true);
        console.log('Fetching messages for chat:', currentChat);
        
        const [chatMessages, unreadCount] = await Promise.all([
          getChatMessages(currentChat),
          getUnreadCount(
            currentChat,
            user.userType as 'user' | 'nutritionist'
          )
        ]);
        
        // Enrich messages with user details
        const enrichedMessages = await Promise.all(
          chatMessages.map(msg => enrichMessageWithUserDetails(msg))
        );

        setMessages((prev: MessageState) => ({
          ...prev,
          [currentChat]: enrichedMessages
        }));

        setUnreadMessages((prev: UnreadMessageState) => ({
          ...prev,
          [currentChat]: unreadCount
        }));

        // Mark messages as read when opening chat
        for (const message of chatMessages) {
          if (!message.read && message.sender !== user.userType) {
            try {
              await markMessageAsRead(message.$id);
            } catch (error) {
              console.error('Error marking message as read:', error);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user, currentChat, enrichMessageWithUserDetails]);

  const addMessage = async (targetId: string, text: string) => {
    if (!user) throw new Error('User not authenticated');

    const userId = user.userType === 'nutritionist' ? targetId : user.$id;
    const nutritionistId = user.userType === 'nutritionist' ? user.$id : targetId;
    const chatId = `${userId}-${nutritionistId}`;

    console.log('Sending message:', {
      userId,
      nutritionistId,
      chatId,
      text,
      senderType: user.userType
    });

    const timestamp = new Date().toISOString();
    
    const tempId = `temp-${Date.now()}`;
    const tempMessage: Partial<Message> = {
      $id: tempId,
      chatId,
      text,
      sender: user.userType,
      time: timestamp,
      read: false,
      userId,
      nutritionistId
    };

    // Get user details for the temp message
    const userDetails = await cacheUserDetails(userId);
    const enrichedTempMessage = {
      ...tempMessage,
      userDetails
    } as Message;

    // Optimistic update
    setMessages((prev: MessageState) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), enrichedTempMessage]
    }));

    try {
      const sentMessage = await sendMessage({
        userId,
        nutritionistId,
        text,
        chatId
      }, user.userType);

      // Enrich sent message with user details
      const enrichedMessage = await enrichMessageWithUserDetails(sentMessage);

      // Update temporary message with server response
      setMessages((prev: MessageState) => ({
        ...prev,
        [chatId]: prev[chatId].map((msg: Message) => 
          msg.$id === tempId ? enrichedMessage : msg
        )
      }));

      console.log('Message sent successfully:', enrichedMessage);
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove temporary message if sending failed
      setMessages((prev: MessageState) => ({
        ...prev,
        [chatId]: prev[chatId].filter((msg: Message) => msg.$id !== tempId)
      }));
      throw error;
    }
  };

  return (
    <ChatContext.Provider 
      value={{ 
        messages, 
        addMessage, 
        nutritionists, 
        currentChat, 
        setCurrentChat,
        markMessageAsRead,
        unreadMessages,
        loading
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

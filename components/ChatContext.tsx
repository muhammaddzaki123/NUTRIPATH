import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    ChatContextType,
    Message,
    MessageState,
    Nutritionist,
    UnreadMessageState,
    User
} from '../constants/chat';
import {
    getChatMessages,
    getNutritionistChats,
    getNutritionists,
    getUnreadCount,
    markMessageAsRead,
    sendMessage,
    subscribeToChat,
    subscribeToNutritionistChats,
    updateNutritionistStatus
} from '../lib/chat-service';
import { useGlobalContext } from '../lib/global-provider';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<MessageState>({});
  const [nutritionists, setNutritionists] = useState<Nutritionist[]>([]);
  const [currentChat, setCurrentChat] = useState<string | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<UnreadMessageState>({});
  const [loading, setLoading] = useState(false);
  const { user } = useGlobalContext() as { user: User | null };

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
          setMessages(chats);
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
  }, [user]);

  // Subscribe to real-time messages for current chat
  useEffect(() => {
    if (!user || !currentChat) return;

    let unsubscribe: (() => void) | undefined;
    let isSubscribed = true;
    
    const setupSubscription = async () => {
      try {
        console.log('Setting up subscription for chat:', currentChat);
        
        unsubscribe = await subscribeToChat(currentChat, (newMessage: Message) => {
          if (!isSubscribed) return;

          console.log('Received message:', newMessage);
          
          setMessages((prev: MessageState) => {
            const chatMessages = prev[newMessage.chatId] || [];
            const messageExists = chatMessages.some((msg: Message) => msg.$id === newMessage.$id);
            
            if (messageExists) {
              // Update existing message (e.g., read status)
              return {
                ...prev,
                [newMessage.chatId]: chatMessages.map((msg: Message) =>
                  msg.$id === newMessage.$id ? newMessage : msg
                )
              };
            }
            
            // Add new message
            return {
              ...prev,
              [newMessage.chatId]: [...chatMessages, newMessage]
            };
          });

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
  }, [user, currentChat]);

  // Subscribe to all chats if user is a nutritionist
  useEffect(() => {
    if (!user || user.userType !== 'nutritionist') return;

    let unsubscribe: (() => void) | undefined;
    let isSubscribed = true;

    const setupNutritionistSubscription = async () => {
      try {
        console.log('Setting up nutritionist subscription');
        
        unsubscribe = await subscribeToNutritionistChats(user.$id, (newMessage: Message) => {
          if (!isSubscribed) return;

          console.log('Received message for nutritionist:', newMessage);
          
          setMessages((prev: MessageState) => {
            const chatMessages = prev[newMessage.chatId] || [];
            const messageExists = chatMessages.some((msg: Message) => msg.$id === newMessage.$id);
            
            if (messageExists) {
              return {
                ...prev,
                [newMessage.chatId]: chatMessages.map((msg: Message) =>
                  msg.$id === newMessage.$id ? newMessage : msg
                )
              };
            }
            
            return {
              ...prev,
              [newMessage.chatId]: [...chatMessages, newMessage].sort(
                (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
              )
            };
          });

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
  }, [user]);

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
        
        setMessages((prev: MessageState) => ({
          ...prev,
          [currentChat]: chatMessages
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
  }, [user, currentChat]);

  const addMessage = async (targetId: string, text: string) => {
    if (!user) throw new Error('User not authenticated');

    // For nutritionist, targetId is userId
    // For user, targetId is nutritionistId
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

    // Optimistic update
    setMessages((prev: MessageState) => ({
      ...prev,
      [chatId]: [...(prev[chatId] || []), tempMessage as Message]
    }));

    try {
      const sentMessage = await sendMessage({
        userId,
        nutritionistId,
        text,
        chatId
      }, user.userType);

      // Update temporary message with server response
      setMessages((prev: MessageState) => ({
        ...prev,
        [chatId]: prev[chatId].map((msg: Message) => 
          msg.$id === tempId ? sentMessage : msg
        )
      }));

      console.log('Message sent successfully:', sentMessage);
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

import { Query } from 'react-native-appwrite';
import { ChatSubscriptionResponse, Message, Nutritionist, SendMessageData } from '../constants/chat';
import { client, config, databases } from './appwrite';

// Get list of nutritionists with proper filtering and sorting
export const getNutritionists = async (): Promise<Nutritionist[]> => {
  try {
    console.log("Fetching nutritionists list...");
    const response = await databases.listDocuments(
      config.databaseId!,
      config.ahligiziCollectionId!,
      [
        Query.equal('userType', 'nutritionist'),
        Query.orderAsc('name'),
        Query.limit(10) // Limit initial load for better performance
      ]
    );
    
    console.log("Found nutritionists:", response.documents.length);
    return response.documents as Nutritionist[];
  } catch (error) {
    console.error('Error getting nutritionists:', error);
    throw error;
  }
};

// Send a new message
export const sendMessage = async (message: SendMessageData, senderType: 'user' | 'nutritionist'): Promise<Message> => {
  try {
    if (!message.text?.trim() || !message.chatId || !message.userId || !message.nutritionistId) {
      throw new Error('Data pesan tidak lengkap');
    }

    const timestamp = new Date().toISOString();

    // Ensure chatId is always in format: userId-nutritionistId
    const [firstId, secondId] = message.chatId.split('-');
    const correctChatId = senderType === 'user' 
      ? `${message.userId}-${message.nutritionistId}`
      : `${message.userId}-${message.nutritionistId}`;

    console.log('Sending message:', {
      chatId: correctChatId,
      userId: message.userId,
      nutritionistId: message.nutritionistId,
      sender: senderType,
      text: message.text.trim()
    });
    
    const response = await databases.createDocument(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      'unique()',
      {
        chatId: correctChatId,
        userId: message.userId,
        nutritionistId: message.nutritionistId,
        text: message.text.trim(),
        sender: senderType,
        time: timestamp,
        read: false
      }
    );

    if (!response) {
      throw new Error('Gagal membuat dokumen pesan');
    }

    console.log(`Message sent by ${senderType}:`, response);
    return response as Message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark a message as read
export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    await databases.updateDocument(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      messageId,
      { read: true }
    );
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Get all messages for a specific chat
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    console.log('Fetching messages for chat:', chatId);
    const response = await databases.listDocuments(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      [
        Query.equal('chatId', chatId),
        Query.orderAsc('time'),
        Query.limit(50) // Limit for better performance
      ]
    );
    
    console.log('Found messages:', response.documents.length);
    return response.documents as Message[];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

// Subscribe to real-time chat updates
export const subscribeToChat = async (
  chatId: string, 
  callback: (message: Message) => void
) => {
  if (!chatId) {
    throw new Error('Chat ID is required for subscription');
  }

  try {
    console.log('Setting up subscription for chat:', chatId);
    
    const unsubscribe = await client.subscribe(
      `databases.${config.databaseId}.collections.${config.chatMessagesCollectionId}.documents`,
      (response: ChatSubscriptionResponse) => {
        const message = response.payload as Message;
        
        // Only process messages for this chat
        if (message?.chatId !== chatId) return;

        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          console.log('New message received:', message);
          callback(message);
        }
        
        if (response.events.includes('databases.*.collections.*.documents.*.update')) {
          console.log('Message updated:', message);
          callback(message);
        }
      }
    );

    console.log('Chat subscription setup successful');
    return () => {
      console.log('Cleaning up chat subscription');
      unsubscribe();
    };
  } catch (error) {
    console.error('Error setting up chat subscription:', error);
    throw new Error(`Failed to setup chat subscription: ${error}`);
  }
};

// Get all chats for a nutritionist
export const getNutritionistChats = async (nutritionistId: string) => {
  try {
    console.log('Fetching chats for nutritionist:', nutritionistId);
    
    const response = await databases.listDocuments(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      [
        Query.equal('nutritionistId', nutritionistId),
        Query.orderDesc('time'),
        Query.limit(100) // Limit for better performance
      ]
    );

    console.log('Total messages found:', response.documents.length);

    // Group messages by chatId
    const chats = response.documents.reduce<{ [key: string]: Message[] }>((acc, doc) => {
      const message = doc as Message;
      if (!acc[message.chatId]) {
        acc[message.chatId] = [];
      }
      acc[message.chatId].push(message);
      return acc;
    }, {});

    // Sort messages within each chat
    Object.keys(chats).forEach(chatId => {
      chats[chatId].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    });

    console.log('Grouped chats:', Object.keys(chats).length);
    return chats;
  } catch (error) {
    console.error('Error getting nutritionist chats:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async (chatId: string, userType: 'user' | 'nutritionist'): Promise<number> => {
  try {
    const response = await databases.listDocuments(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      [
        Query.equal('chatId', chatId),
        Query.equal('read', false),
        Query.equal('sender', userType === 'user' ? 'nutritionist' : 'user')
      ]
    );

    return response.total;
  } catch (error) {
    console.error('Error getting unread count:', error);
    return 0;
  }
};

// Update nutritionist status
export const updateNutritionistStatus = async (
  nutritionistId: string, 
  status: 'online' | 'offline'
): Promise<void> => {
  try {
    await databases.updateDocument(
      config.databaseId!,
      config.ahligiziCollectionId!,
      nutritionistId,
      {
        status,
        lastSeen: new Date().toISOString()
      }
    );
  } catch (error) {
    console.error('Error updating nutritionist status:', error);
    throw error;
  }
};

// Subscribe to nutritionist chats
export const subscribeToNutritionistChats = async (
  nutritionistId: string,
  callback: (message: Message) => void
) => {
  if (!nutritionistId) {
    throw new Error('Nutritionist ID is required for subscription');
  }

  try {
    console.log('Setting up nutritionist chats subscription:', nutritionistId);
    
    const unsubscribe = await client.subscribe(
      `databases.${config.databaseId}.collections.${config.chatMessagesCollectionId}.documents`,
      (response: ChatSubscriptionResponse) => {
        const message = response.payload as Message;
        
        // Only process messages for this nutritionist
        if (message?.nutritionistId !== nutritionistId) return;

        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          console.log('New message for nutritionist:', message);
          callback(message);
        }
      }
    );

    console.log('Nutritionist chats subscription setup successful');
    return () => {
      console.log('Cleaning up nutritionist chats subscription');
      unsubscribe();
    };
  } catch (error) {
    console.error('Error setting up nutritionist chats subscription:', error);
    throw new Error(`Failed to setup nutritionist chats subscription: ${error}`);
  }
};

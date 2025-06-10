import { Query } from 'react-native-appwrite';
import { ChatSubscriptionResponse, Message, Nutritionist, SendMessageData, User } from '../constants/chat';
import { client, config, databases } from './appwrite';
import { createChatNotification } from './notification-service';

// Helper function to validate chatId format
const validateChatId = (chatId: string): boolean => {
  return chatId.includes('-') && chatId.split('-').length === 2;
};

// Helper function to generate consistent chatId
export const generateChatId = (userId: string, nutritionistId: string): string => {
  // Always use format: smaller ID - larger ID for consistency
  const [id1, id2] = [userId, nutritionistId].sort();
  return `${id1}-${id2}`;
};

// Get user details by ID
export const getUserDetails = async (userId: string): Promise<User | null> => {
  try {
    console.log('Fetching user details for:', userId);
    const response = await databases.getDocument(
      config.databaseId!,
      config.usersProfileCollectionId!,
      userId
    );
    console.log('Found user:', response);
    return response as User;
  } catch (error) {
    console.error('Error getting user details:', error);
    return null;
  }
};

// Get list of nutritionists with proper filtering and sorting
export const getNutritionists = async (): Promise<Nutritionist[]> => {
  try {
    console.log("Fetching nutritionists list...");
    const response = await databases.listDocuments(
      config.databaseId!,
      config.ahligiziCollectionId!,
      [
        Query.equal('userType', 'nutritionist'),
        Query.orderAsc('name')
      ]
    );
    
    console.log("Found nutritionists:", response.documents.length);
    return response.documents as Nutritionist[];
  } catch (error) {
    console.error('Error getting nutritionists:', error);
    throw error;
  }
};

// Send a new message with duplicate prevention and notification creation
export const sendMessage = async (message: SendMessageData, senderType: 'user' | 'nutritionist'): Promise<Message> => {
  try {
    if (!message.text?.trim() || !message.userId || !message.nutritionistId) {
      throw new Error('Data pesan tidak lengkap');
    }

    // Ensure consistent chatId format
    const chatId = generateChatId(message.userId, message.nutritionistId);
    
    // Generate unique message hash
    const messageHash = `${chatId}-${message.text.trim()}-${senderType}-${Date.now()}`;
    
    // Enhanced duplicate check with shorter window
    const recentMessages = await databases.listDocuments(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      [
        Query.equal('chatId', chatId),
        Query.equal('text', message.text.trim()),
        Query.equal('sender', senderType),
        Query.orderDesc('time'),
        Query.limit(2)
      ]
    );

    // Stricter duplicate prevention (3 second window)
    if (recentMessages.documents.length > 0) {
      const lastMessage = recentMessages.documents[0] as Message;
      const timeDiff = Date.now() - new Date(lastMessage.time).getTime();
      if (timeDiff < 3000) { // 3 seconds
        console.log('Preventing duplicate message. Hash:', messageHash);
        return lastMessage;
      }
    }

    const timestamp = new Date().toISOString();
    
    console.log('Sending message:', {
      chatId,
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
        chatId,
        userId: message.userId,
        nutritionistId: message.nutritionistId,
        text: message.text.trim(),
        sender: senderType,
        time: timestamp,
        read: false,
        messageHash,
        processedAt: Date.now()
      }
    );

    if (!response) {
      throw new Error('Gagal membuat dokumen pesan');
    }

    // Create notification for the recipient
    try {
      // Get sender details
      let senderDetails: User | null = null;
      let nutritionistDetails: Nutritionist | null = null;

      if (senderType === 'user') {
        senderDetails = await getUserDetails(message.userId);
      } else {
        try {
          const nutritionistResponse = await databases.getDocument(
            config.databaseId!,
            config.ahligiziCollectionId!,
            message.nutritionistId
          );
          nutritionistDetails = nutritionistResponse as Nutritionist;
        } catch (error) {
          console.error('Error getting nutritionist details:', error);
        }
      }

      const senderName = senderType === 'user' 
        ? (senderDetails?.name || 'User') 
        : (nutritionistDetails?.name || 'Ahli Gizi');

      // Create notification for recipient using consistent chatId
      await createChatNotification(
        message.userId,
        message.nutritionistId,
        senderName,
        message.text.trim(),
        chatId,
        senderType === 'user'
      );

      console.log('Chat notification created successfully');
    } catch (notificationError) {
      console.error('Error creating chat notification:', notificationError);
    }

    return response as Message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Get all messages for a specific chat with duplicate prevention
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    if (!validateChatId(chatId)) {
      throw new Error('Invalid chat ID format. Expected format: userId-nutritionistId');
    }

    console.log('Fetching messages for chat:', chatId);
    const response = await databases.listDocuments(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      [
        Query.equal('chatId', chatId),
        Query.orderAsc('time')
      ]
    );
    
    // Remove duplicates and get unique user IDs
    const uniqueMessages = new Map<string, Message>();
    const userIds = new Set<string>();
    
    response.documents.forEach((doc) => {
      const message = doc as Message;
      const key = `${message.text}-${message.time}-${message.sender}`;
      if (!uniqueMessages.has(key)) {
        uniqueMessages.set(key, message);
        userIds.add(message.userId);
      }
    });

    // Fetch user details for all users in parallel
    const userDetailsPromises = Array.from(userIds).map(userId => getUserDetails(userId));
    const userDetails = await Promise.all(userDetailsPromises);
    const userMap = new Map<string, User>();
    userDetails.forEach(user => {
      if (user) {
        userMap.set(user.$id, user);
      }
    });

    // Add user details to messages and sort
    const messages = Array.from(uniqueMessages.values())
      .map(message => ({
        ...message,
        userDetails: userMap.get(message.userId)
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    console.log('Found unique messages:', messages.length);
    return messages;
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
};

// Get all chats for a nutritionist with duplicate prevention
export const getNutritionistChats = async (nutritionistId: string) => {
  try {
    console.log('Fetching chats for nutritionist:', nutritionistId);
    
    const response = await databases.listDocuments(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      [
        Query.equal('nutritionistId', nutritionistId),
        Query.orderDesc('time')
      ]
    );

    console.log('Total messages found:', response.documents.length);

    // Group messages by chatId and remove duplicates
    const chats: { [key: string]: Message[] } = {};
    const userIds = new Set<string>();
    const processedMessageKeys = new Set<string>();

    for (const doc of response.documents) {
      const message = doc as Message;
      
      // Skip invalid chatId format
      if (!validateChatId(message.chatId)) {
        console.error('Invalid chat ID format:', message.chatId);
        continue;
      }

      if (!chats[message.chatId]) {
        chats[message.chatId] = [];
        userIds.add(message.userId);
      }

      // Enhanced duplicate check
      const messageKey = `${message.text}-${message.sender}-${message.time}`;
      if (processedMessageKeys.has(messageKey)) {
        console.log('Skipping duplicate message:', messageKey);
        continue;
      }
      processedMessageKeys.add(messageKey);

      chats[message.chatId].push(message);
    }

    // Fetch user details for all users in parallel
    const userDetailsPromises = Array.from(userIds).map(userId => getUserDetails(userId));
    const userDetails = await Promise.all(userDetailsPromises);
    const userMap = new Map<string, User>();
    userDetails.forEach(user => {
      if (user) {
        userMap.set(user.$id, user);
      }
    });

    // Sort messages within each chat and add user details
    Object.keys(chats).forEach(chatId => {
      chats[chatId].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      chats[chatId] = chats[chatId].map(message => ({
        ...message,
        userDetails: userMap.get(message.userId)
      }));
    });

    console.log('Grouped unique chats:', Object.keys(chats).length);
    return chats;
  } catch (error) {
    console.error('Error getting nutritionist chats:', error);
    throw error;
  }
};

// Subscribe to real-time chat updates with duplicate prevention
export const subscribeToChat = async (
  chatId: string, 
  callback: (message: Message) => void
) => {
  if (!chatId || !validateChatId(chatId)) {
    throw new Error('Invalid chat ID format or chat ID is missing. Expected format: userId-nutritionistId');
  }

  try {
    console.log('Setting up subscription for chat:', chatId);
    
    // Track processed messages to prevent duplicates
    const processedMessages = new Set<string>();
    
    let lastMessageId: string | null = null;
    let lastMessageTime: number = 0;

    const unsubscribe = await client.subscribe(
      `databases.${config.databaseId}.collections.${config.chatMessagesCollectionId}.documents`,
      (response: ChatSubscriptionResponse) => {
        const message = response.payload as Message;
        
        // Only process messages for this chat
        if (message?.chatId !== chatId) return;

        // Enhanced duplicate prevention
        const messageKey = `${message.$id}-${message.text}-${message.sender}`;
        if (processedMessages.has(messageKey)) {
          console.log('Preventing duplicate message:', messageKey);
          return;
        }
        processedMessages.add(messageKey);

        // Additional time-based duplicate prevention
        const currentTime = Date.now();
        if (message.$id === lastMessageId && currentTime - lastMessageTime < 1000) {
          console.log('Preventing duplicate event for message:', message.$id);
          return;
        }

        lastMessageId = message.$id;
        lastMessageTime = currentTime;

        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          console.log('New message received:', message);
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

// Get unread message count
export const getUnreadCount = async (chatId: string, userType: 'user' | 'nutritionist'): Promise<number> => {
  try {
    if (!validateChatId(chatId)) {
      console.error('Invalid chat ID format:', chatId);
      return 0;
    }

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

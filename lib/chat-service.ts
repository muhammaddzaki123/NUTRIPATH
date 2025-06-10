import { Query } from 'react-native-appwrite';
import { ChatSubscriptionResponse, Message, Nutritionist, SendMessageData, User } from '../constants/chat';
import { client, config, databases } from './appwrite';
import { createChatNotification } from './notification-service';

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
    if (!message.text?.trim() || !message.chatId || !message.userId || !message.nutritionistId) {
      throw new Error('Data pesan tidak lengkap');
    }

    // Check for recent duplicate messages
    const recentMessages = await databases.listDocuments(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      [
        Query.equal('chatId', message.chatId),
        Query.equal('text', message.text.trim()),
        Query.equal('sender', senderType),
        Query.orderDesc('time'),
        Query.limit(1)
      ]
    );

    // If a duplicate message was sent in the last 5 seconds, don't send again
    if (recentMessages.documents.length > 0) {
      const lastMessage = recentMessages.documents[0] as Message;
      const timeDiff = Date.now() - new Date(lastMessage.time).getTime();
      if (timeDiff < 5000) { // 5 seconds
        console.log('Preventing duplicate message:', message.text);
        return lastMessage;
      }
    }

    const timestamp = new Date().toISOString();
    
    console.log('Sending message:', {
      chatId: message.chatId,
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
        chatId: message.chatId,
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

    // Create notification for the recipient
    try {
      // Get sender details
      let senderDetails: User | null = null;
      let nutritionistDetails: Nutritionist | null = null;

      if (senderType === 'user') {
        senderDetails = await getUserDetails(message.userId);
      } else {
        // Get nutritionist details
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

      // Create notification for recipient
      await createChatNotification(
        message.userId,
        message.nutritionistId,
        senderName,
        message.text.trim(),
        message.chatId,
        senderType === 'user'
      );

      console.log('Chat notification created successfully');
    } catch (notificationError) {
      console.error('Error creating chat notification:', notificationError);
      // Don't throw error here, message was sent successfully
    }

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

// Get all messages for a specific chat with duplicate prevention
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
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

// Subscribe to real-time chat updates with duplicate prevention
export const subscribeToChat = async (
  chatId: string, 
  callback: (message: Message) => void
) => {
  if (!chatId) {
    throw new Error('Chat ID is required for subscription');
  }

  try {
    console.log('Setting up subscription for chat:', chatId);
    
    let lastMessageId: string | null = null;
    let lastMessageTime: number = 0;

    const unsubscribe = await client.subscribe(
      `databases.${config.databaseId}.collections.${config.chatMessagesCollectionId}.documents`,
      (response: ChatSubscriptionResponse) => {
        const message = response.payload as Message;
        
        // Only process messages for this chat
        if (message?.chatId !== chatId) return;

        // Prevent duplicate events within 1 second
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

    response.documents.forEach((doc) => {
      const message = doc as Message;
      if (!chats[message.chatId]) {
        chats[message.chatId] = [];
        userIds.add(message.userId);
      }

      // Check for duplicates before adding
      const isDuplicate = chats[message.chatId].some(
        (m) => m.$id === message.$id || 
              (m.text === message.text && 
               m.sender === message.sender && 
               Math.abs(new Date(m.time).getTime() - new Date(message.time).getTime()) < 1000)
      );

      if (!isDuplicate) {
        chats[message.chatId].push(message);
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

// Subscribe to nutritionist chats with duplicate prevention
export const subscribeToNutritionistChats = async (
  nutritionistId: string,
  callback: (message: Message) => void
) => {
  if (!nutritionistId) {
    throw new Error('Nutritionist ID is required for subscription');
  }

  try {
    console.log('Setting up nutritionist chats subscription:', nutritionistId);
    
    let lastMessageId: string | null = null;
    let lastMessageTime: number = 0;

    const unsubscribe = await client.subscribe(
      `databases.${config.databaseId}.collections.${config.chatMessagesCollectionId}.documents`,
      (response: ChatSubscriptionResponse) => {
        const message = response.payload as Message;
        
        // Only process messages for this nutritionist
        if (message?.nutritionistId !== nutritionistId) return;

        // Prevent duplicate events within 1 second
        const currentTime = Date.now();
        if (message.$id === lastMessageId && currentTime - lastMessageTime < 1000) {
          console.log('Preventing duplicate event for message:', message.$id);
          return;
        }

        lastMessageId = message.$id;
        lastMessageTime = currentTime;

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
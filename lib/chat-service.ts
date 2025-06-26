// lib/chat-service.ts

import { Query } from 'react-native-appwrite';
import {
  ChatSubscriptionResponse,
  Message,
  Nutritionist,
  SendMessageData,
  User,
} from '../constants/chat';
import { client, config, databases } from './appwrite';
import { createChatNotification } from './notification-service';

const userDetailsCache = new Map<string, User | null>();

export const getUserDetails = async (userId: string): Promise<User | null> => {
  if (userDetailsCache.has(userId)) {
    return userDetailsCache.get(userId) ?? null;
  }
  try {
    const user = await databases.getDocument<User>(
      config.databaseId!,
      config.usersProfileCollectionId!,
      userId
    );
    userDetailsCache.set(userId, user);
    return user;
  } catch (error) {
    console.error(`Gagal mengambil detail pengguna (ID: ${userId}):`, error);
    userDetailsCache.set(userId, null);
    return null;
  }
};

export const getNutritionists = async (): Promise<Nutritionist[]> => {
  try {
    const response = await databases.listDocuments<Nutritionist>(
      config.databaseId!,
      config.ahligiziCollectionId!,
      [Query.orderAsc('name')]
    );
    return response.documents;
  } catch (error) {
    console.error('Gagal mengambil daftar ahli gizi:', error);
    throw new Error('Tidak dapat memuat daftar ahli gizi.');
  }
};

export const sendMessage = async (
  messageData: SendMessageData,
  senderType: 'user' | 'nutritionist'
): Promise<Message> => {
  if (!messageData.text?.trim()) {
    throw new Error('Pesan tidak boleh kosong.');
  }

  try {
    const document = {
      chatId: messageData.chatId,
      userId: messageData.userId,
      nutritionistId: messageData.nutritionistId,
      text: messageData.text.trim(),
      sender: senderType,
      time: new Date().toISOString(),
      read: false,
    };

    const response = await databases.createDocument<Message>(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      'unique()',
      document
    );

    const sender = senderType === 'user'
      ? await getUserDetails(messageData.userId)
      : await databases.getDocument<Nutritionist>(config.databaseId!, config.ahligiziCollectionId!, messageData.nutritionistId);
    
    if (sender) {
      createChatNotification(
        messageData.userId,
        messageData.nutritionistId,
        sender.name,
        document.text,
        document.chatId,
        senderType === 'user'
      ).catch(err => console.error("Gagal membuat notifikasi chat:", err));
    }

    return response;
  } catch (error) {
    console.error('Gagal mengirim pesan:', error);
    throw new Error('Terjadi kesalahan saat mengirim pesan.');
  }
};

export const markMessageAsRead = async (messageId: string): Promise<void> => {
  try {
    await databases.updateDocument(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      messageId,
      { read: true }
    );
  } catch (error) {
    if ((error as any).code !== 404) {
      console.error(`Gagal menandai pesan ${messageId} sebagai dibaca:`, error);
    }
  }
};

export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const response = await databases.listDocuments<Message>(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      [Query.equal('chatId', chatId), Query.orderAsc('time')]
    );
    return response.documents;
  } catch (error) {
    console.error(`Gagal mengambil pesan untuk chat ${chatId}:`, error);
    throw new Error('Tidak dapat memuat riwayat percakapan.');
  }
};

export const getNutritionistChats = async (nutritionistId: string): Promise<Record<string, Message[]>> => {
    try {
        const response = await databases.listDocuments<Message>(
            config.databaseId!,
            config.chatMessagesCollectionId!,
            [
                Query.equal('nutritionistId', nutritionistId),
                Query.orderDesc('time')
            ]
        );

        const chats: Record<string, Message[]> = {};
        for (const doc of response.documents) {
            if (!chats[doc.chatId]) {
                chats[doc.chatId] = [];
            }
            chats[doc.chatId].push(doc);
        }

        for (const chatId in chats) {
            chats[chatId].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        }

        return chats;
    } catch (error) {
        console.error('Gagal mengambil chat ahli gizi:', error);
        throw new Error("Tidak dapat mengambil daftar percakapan.");
    }
};

export const subscribeToAllChatUpdates = (
  callback: (response: ChatSubscriptionResponse) => void
) => {
  try {
    const channel = `databases.${config.databaseId}.collections.${config.chatMessagesCollectionId}.documents`;
    return client.subscribe(channel, callback);
  } catch (error) {
    console.error(`Gagal berlangganan ke channel chat:`, error);
    return () => {};
  }
};

export const updateNutritionistStatus = async (
  nutritionistId: string,
  status: 'online' | 'offline'
): Promise<void> => {
  try {
    await databases.updateDocument(
      config.databaseId!,
      config.ahligiziCollectionId!,
      nutritionistId,
      { status, lastSeen: new Date().toISOString() }
    );
  } catch (error) {
    console.error(`Gagal memperbarui status ahli gizi ${nutritionistId}:`, error);
  }
};

export const getUnreadCount = async (
    chatId: string,
    recipientType: 'user' | 'nutritionist'
): Promise<number> => {
    const senderType = recipientType === 'user' ? 'nutritionist' : 'user';
    try {
        const response = await databases.listDocuments(
            config.databaseId!,
            config.chatMessagesCollectionId!,
            [
                Query.equal('chatId', chatId),
                Query.equal('read', false),
                Query.equal('sender', senderType),
            ]
        );
        return response.total;
    } catch (error) {
        console.error(`Gagal menghitung pesan belum dibaca untuk chat ${chatId}:`, error);
        return 0;
    }
};


export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    await databases.deleteDocument(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      messageId
    );
  } catch (error) {
    console.error('Gagal menghapus pesan:', error);
    throw new Error('Tidak dapat menghapus pesan ini.');
  }
};

export const deleteAllMessages = async (chatId: string): Promise<void> => {
  try {
    // 1. Ambil semua pesan dalam chat
    const messages = await getChatMessages(chatId);

    // 2. Buat array of promises untuk menghapus setiap pesan
    const deletePromises = messages.map(message => 
      databases.deleteDocument(
        config.databaseId!,
        config.chatMessagesCollectionId!,
        message.$id
      )
    );

    // 3. Jalankan semua promises secara paralel
    await Promise.all(deletePromises);

  } catch (error) {
    console.error('Gagal menghapus semua pesan:', error);
    throw new Error('Tidak dapat membersihkan riwayat percakapan ini.');
  }
};
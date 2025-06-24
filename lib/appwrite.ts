import { ChatSubscriptionResponse, Message, Nutritionist } from "@/constants/chat";
import {
  Account,
  Avatars,
  Client,
  Databases,
  Models,
  Query,
  Storage,
  Functions
} from "react-native-appwrite";

// --- KONFIGURASI APPWRITE ---
export const config = {
  platform: "com.poltekes.nutripath",
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  databaseId: process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID,
  artikelCollectionId: process.env.EXPO_PUBLIC_APPWRITE_ARTIKEL_COLLECTION_ID,
  foodRecallCollectionId: process.env.EXPO_PUBLIC_APPWRITE_FOOD_RECALL_COLLECTION_ID,
  usersProfileCollectionId: process.env.EXPO_PUBLIC_APPWRITE_USERS_PROFILE_COLLECTION_ID,
  ahligiziCollectionId: process.env.EXPO_PUBLIC_APPWRITE_AHLIGIZI_COLLECTION_ID,
  chatMessagesCollectionId: process.env.EXPO_PUBLIC_APPWRITE_CHAT_MESSAGES_COLLECTION_ID,
  nutritionistChatCollectionId: process.env.EXPO_PUBLIC_APPWRITE_NUTRITIONIST_CHAT_COLLECTION_ID,
  storageBucketId: process.env.EXPO_PUBLIC_APPWRITE_STORAGE_BUCKET_ID || 'default',
  notificationsCollectionId: process.env.EXPO_PUBLIC_APPWRITE_NOTIFICATION_COLLECTION_ID,

  loginlogCollectionId:process.env.EXPO_PUBLIC_APPWRITE_LOGINLOG_COLLECTION_ID,
  loginlogFunctionId:process.env.EXPO_PUBLIC_APPWRITE_LOGINLOG_FUNCTION_ID,
};

// --- INISIALISASI KLIEN ---
export const client = new Client();
client
  .setEndpoint(config.endpoint!)
  .setProject(config.projectId!)
  .setPlatform(config.platform!);

export const avatar = new Avatars(client);
export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);

// =================================================================
// LAYANAN OTENTIKASI PENGGUNA (USER & AHLI GIZI) - PERBAIKAN
// =================================================================

type UserProfile = Models.Document & {
  userType: 'user' | 'nutritionist';
  name: string;
  email: string;
  avatar: string;
  disease?: 'hipertensi' | 'diabetes_melitus' | 'kanker';
  specialization?: 'hipertensi' | 'diabetes_melitus' | 'kanker';
  age?: string;
  gender?: string;
};

async function updateUserStatus(userId: string, userType: 'user' | 'nutritionist', status: 'online' | 'offline'): Promise<void> {
  const collectionId = userType === 'user'
    ? config.usersProfileCollectionId!
    : config.ahligiziCollectionId!;

  try {
    await databases.updateDocument(
      config.databaseId!,
      collectionId,
      userId,
      { status, lastSeen: new Date().toISOString() }
    );
  } catch (error) {
    console.error(`Gagal memperbarui status untuk ${userType} dengan ID ${userId}:`, error);
  }
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  try {
    await account.deleteSession("current").catch(() => { });
    await account.createEmailPasswordSession(email, password);
    const user = await getCurrentUser();
    if (!user) {
      await account.deleteSession("current");
      throw new Error("Profil pengguna tidak ditemukan. Silakan hubungi administrator.");
    }

    await updateUserStatus(user.$id, user.userType, 'online');
    return user;
  } catch (error: any) {
    console.error("Error pada fungsi signIn:", error);
    throw new Error(error.message || "Email atau password yang Anda masukkan salah.");
  }
}

/**
 * @returns Data profil pengguna atau null jika tidak ada sesi aktif.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) return null;
    try {
      const userProfile = await databases.getDocument(
        config.databaseId!,
        config.usersProfileCollectionId!,
        currentAccount.$id
      );
      return { ...userProfile, userType: 'user' } as UserProfile;
    } catch (e) {
    }

    try {
      const nutritionistProfile = await databases.getDocument(
        config.databaseId!,
        config.ahligiziCollectionId!,
        currentAccount.$id
      );
      return { ...nutritionistProfile, userType: 'nutritionist' } as UserProfile;
    } catch (e) {
      console.error("Akun valid, tetapi profil tidak ditemukan di database:", currentAccount.$id);
      return null;
    }
  } catch (error) {
    return null;
  }
}

export async function logout(): Promise<void> {
  let session;
  try {
    session = await getCurrentUser();
  } catch (e) {
    console.log("Tidak ada sesi aktif yang ditemukan, melanjutkan logout.");
  }
  
  try {
    if (session) {
      await updateUserStatus(session.$id, session.userType, 'offline');
    }

    await account.deleteSession("current");

  } catch (error) {
    console.error("Error saat proses akhir logout:", error);
    throw error;
  }
}

//artikel
export async function getArticles() {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.artikelCollectionId!,
      [
        Query.equal("isPublished", true),
        Query.orderDesc("$createdAt")
      ]
    );
    
    // Transform the response to match our Article interface
    const articles = result.documents.map(doc => ({
      $id: doc.$id,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
      title: doc.title,
      description: doc.description,
      content: doc.content,
      image: doc.image,
      category: doc.category,
      author: doc.author,
      tags: doc.tags || [],
      isPublished: doc.isPublished,
      viewCount: doc.viewCount || 0
    }));

    return articles;
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function getArticleById(id: string) {
  try {
    const doc = await databases.getDocument(
      config.databaseId!,
      config.artikelCollectionId!,
      id
    );

    // Transform the response to match our Article interface
    const article = {
      $id: doc.$id,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
      title: doc.title,
      description: doc.description,
      content: doc.content,
      image: doc.image,
      category: doc.category,
      author: doc.author,
      tags: doc.tags || [],
      isPublished: doc.isPublished,
      viewCount: doc.viewCount || 0
    };

    // Update view count
    if (doc.isPublished) {
      await databases.updateDocument(
        config.databaseId!,
        config.artikelCollectionId!,
        id,
        {
          viewCount: (doc.viewCount || 0) + 1
        }
      );
    }

    return article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}
//artikel last



export const sendMessage = async (message: Omit<Message, '$id' | 'sender' | 'time' | 'read'>) => {
  try {
    if (!message.text?.trim() || !message.chatId || !message.userId || !message.nutritionistId) {
      throw new Error('Data pesan tidak lengkap');
    }

    const timestamp = new Date().toISOString();
    
    const response = await databases.createDocument(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      'unique()',
      {
        ...message,
        text: message.text.trim(),
        sender: 'user',
        time: timestamp,
        read: false
      }
    );

    if (!response) {
      throw new Error('Gagal membuat dokumen pesan');
    }

    return response;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
}

export const markMessageAsRead = async (messageId: string) => {
  try {
    const response = await databases.updateDocument(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      messageId,
      { read: true }
    );
    return response;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
}

export const getNutritionists = async (): Promise<Nutritionist[]> => {
  try {
    console.log("Fetching nutritionists list...");
    const response = await databases.listDocuments(
      config.databaseId!,
      config.ahligiziCollectionId!,
      [Query.orderAsc('name')]
    );
    
    console.log("Found nutritionists:", response.documents.length);
    
    const nutritionists = response.documents.map(doc => ({
      ...doc,
      name: doc.name,
      status: doc.status || 'offline',
      type: doc.type,
      specialization: doc.specialization,
      avatar: doc.avatar || avatar.getInitials(doc.name).toString(),
      lastSeen: doc.lastSeen
    })) as Nutritionist[];

    console.log("Processed nutritionists data:", nutritionists);
    return nutritionists;
  } catch (error) {
    console.error('Error getting nutritionists:', error);
    throw error;
  }
}

export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const response = await databases.listDocuments(
      config.databaseId!,
      config.chatMessagesCollectionId!,
      [
        Query.equal('chatId', chatId),
        Query.orderAsc('time')
      ]
    );
    
    return response.documents.map(doc => ({
      $id: doc.$id,
      $createdAt: doc.$createdAt,
      $updatedAt: doc.$updatedAt,
      $permissions: doc.$permissions,
      $collectionId: doc.$collectionId,
      $databaseId: doc.$databaseId,
      chatId: doc.chatId,
      userId: doc.userId,
      nutritionistId: doc.nutritionistId,
      text: doc.text,
      sender: doc.sender,
      time: doc.time,
      read: doc.read
    })) as Message[];
  } catch (error) {
    console.error('Error getting chat messages:', error);
    throw error;
  }
}

// Fungsi Update Profil
export async function updateUserProfile(userId: string, data: {
  name?: string;
  age?: string;
  gender?: string;
  disease?: string;
}) {
  try {
    const response = await databases.updateDocument(
      config.databaseId!,
      config.usersProfileCollectionId!,
      userId,
      data
    );
    return response;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
}

export async function subscribeToChat(
  chatId: string, 
  callback: (message: Message) => void
) {
  if (!chatId) {
    throw new Error('Chat ID is required for subscription');
  }

  try {
    const unsubscribe = await client.subscribe(
      `databases.${config.databaseId}.collections.${config.chatMessagesCollectionId}.documents`,
      (response: ChatSubscriptionResponse) => {
        if (response.events.includes('databases.*.collections.*.documents.*.create')) {
          const message = response.payload;
          if (message && message.chatId === chatId) {
            console.log('New message received:', message);
            callback(message as Message);
          }
        }
      }
    );

    console.log('Chat subscription setup successful for chat:', chatId);
    return unsubscribe;
  } catch (error) {
    console.error('Error setting up chat subscription:', error);
    throw new Error(`Failed to setup chat subscription: ${error}`);
  }
}

// Notification Functions
export async function createNotification(notificationData: {
  userId: string;
  type: 'chat' | 'article' | 'recall';
  title: string;
  description: string;
  read?: boolean;
}) {
  try {
    const payload = {
      userId: notificationData.userId,
      type: notificationData.type,
      title: notificationData.title,
      description: notificationData.description,
      timestamp: new Date().toISOString(),
      read: notificationData.read ?? false,
    };
    
    const response = await databases.createDocument(
      config.databaseId!,
      config.notificationsCollectionId!,
      'unique()',
      payload
    );
    console.log('Notification created successfully:', response);
    return response;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

export async function getNotifications(userId: string, page: number = 1, pageSize: number = 10) {
  try {
    const result = await databases.listDocuments(
      config.databaseId!,
      config.notificationsCollectionId!,
      [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(pageSize),
        Query.offset((page - 1) * pageSize)
      ]
    );
    console.log('Notifications found:', result.documents.length);
    return result.documents;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
}

export async function deleteNotificationFromDB(notificationId: string) {
  try {
    const response = await databases.deleteDocument(
      config.databaseId!,
      config.notificationsCollectionId!,
      notificationId
    );
    console.log('Notification deleted:', response);
    return response;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
}

export async function markNotificationAsRead(notificationId: string) {
  try {
    const response = await databases.updateDocument(
      config.databaseId!,
      config.notificationsCollectionId!,
      notificationId,
      { read: true }
    );
    console.log('Notification marked as read:', response);
    return response;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
}


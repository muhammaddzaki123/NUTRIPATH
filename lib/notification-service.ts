import { Models } from 'react-native-appwrite';
import { Notification, NotificationParams } from '@/types/notification';
import { createNotification, deleteNotificationFromDB, getNotifications as getAppwriteNotifications, markNotificationAsRead } from './appwrite';

export const getNotifications = async (params: NotificationParams): Promise<Notification[]> => {
  try {
    const notifications: Notification[] = [];
    
    // Add chat notifications from unread messages
    Object.entries(params.unreadMessages).forEach(([chatId, count]) => {
      if (count > 0) {
        const nutritionist = params.nutritionists.find(n => n.$id === chatId);
        if (nutritionist) {
          notifications.push({
            $id: `chat-${chatId}`,
            userId: nutritionist.$id,
            type: 'chat',
            title: `New messages from ${nutritionist.name}`,
            description: `You have ${count} unread message${count > 1 ? 's' : ''}`,
            timestamp: new Date().toISOString(),
            read: false,
            data: {
              chatId,
              nutritionistId: nutritionist.$id
            }
          });
        }
      }
    });

    // Get notifications from Appwrite and merge them
    try {
      const userId = params.nutritionists[0]?.userId;
      if (userId) {
        const appwriteNotifications = await getAppwriteNotifications(
          userId,
          params.page,
          params.pageSize
        );
        appwriteNotifications.forEach((doc: Models.Document) => {
          notifications.push({
            $id: doc.$id,
            userId: doc.userId,
            type: doc.type as 'chat' | 'article' | 'recall',
            title: doc.title,
            description: doc.description,
            timestamp: doc.timestamp,
            read: doc.read,
            data: doc.data
          });
        });
      }
    } catch (error) {
      console.error('Error fetching Appwrite notifications:', error);
    }

    // Sort notifications by timestamp, newest first
    return notifications.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    console.error('Error in getNotifications:', error);
    throw error;
  }
};

export const markAsRead = async (notificationId: string) => {
  try {
    return await markNotificationAsRead(notificationId);
  } catch (error) {
    console.error('Error in markAsRead:', error);
    throw error;
  }
};

export const markAllAsRead = async (userId: string) => {
  try {
    // Get all unread notifications
    const notifications = await getNotifications({
      unreadMessages: {},
      nutritionists: [],
      page: 1,
      pageSize: 1000
    });
    
    // Mark each notification as read
    const promises = notifications
      .filter(n => !n.read)
      .map(n => markAsRead(n.$id));
    
    await Promise.all(promises);
    return true;
  } catch (error) {
    console.error('Error in markAllAsRead:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    return await deleteNotificationFromDB(notificationId);
  } catch (error) {
    console.error('Error in deleteNotification:', error);
    throw error;
  }
};

export const sendNotification = async (notificationData: {
  userId: string;
  type: 'chat' | 'article' | 'recall';
  title: string;
  description: string;
  read?: boolean;
  data?: {
    chatId?: string;
    articleId?: string;
    nutritionistId?: string;
  };
}) => {
  try {
    return await createNotification(notificationData);
  } catch (error) {
    console.error('Error in sendNotification:', error);
    throw error;
  }
};

// Helper function to create chat notification
export const createChatNotification = async (
  userId: string,
  nutritionistName: string,
  message: string,
  chatId: string,
  nutritionistId: string
) => {
  return await sendNotification({
    userId,
    type: 'chat',
    title: `New message from ${nutritionistName}`,
    description: message,
    data: {
      chatId,
      nutritionistId
    }
  });
};

// Helper function to create article notification
export const createArticleNotification = async (
  userId: string,
  articleTitle: string,
  articleId: string
) => {
  return await sendNotification({
    userId,
    type: 'article',
    title: 'New Article Available',
    description: `Check out new article: ${articleTitle}`,
    data: {
      articleId
    }
  });
};

// Helper function to create recall notification
export const createRecallNotification = async (
  userId: string,
  title: string,
  description: string
) => {
  return await sendNotification({
    userId,
    type: 'recall',
    title,
    description
  });
};

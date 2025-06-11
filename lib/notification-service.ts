
import { Query } from 'react-native-appwrite';
import {
  CreateNotificationParams,
  Notification,
  NotificationParams,
  NotificationType
} from '../types/notification';
import {
  config,
  databases,
  deleteNotificationFromDB,
  markNotificationAsRead
} from './appwrite';
import { getFoodRecallById } from './recall-service';

// Get notifications with enriched data
export const getNotifications = async (params: NotificationParams): Promise<Notification[]> => {
  try {
    const notifications: Notification[] = [];
    
    // Get all notifications from Appwrite
    const appwriteNotifications = await databases.listDocuments(
      config.databaseId!,
      config.notificationsCollectionId!,
      [
        Query.equal('userId', params.userId),
        Query.orderDesc('timestamp'),
        Query.limit(params.pageSize || 10),
        Query.offset((params.page ? params.page - 1 : 0) * (params.pageSize || 10))
      ]
    );

    // Enrich notifications with additional data
    for (const doc of appwriteNotifications.documents) {
      try {
        // Parse the stringified data
        let parsedData = null;
        try {
          parsedData = doc.data ? JSON.parse(doc.data as string) : null;
        } catch (parseError) {
          console.error('Error parsing notification data:', parseError);
          parsedData = null;
        }
        
        // Convert Appwrite document to our Notification type
        const notification: Notification = {
          $id: doc.$id,
          userId: doc.userId,
          type: doc.type as NotificationType,
          title: doc.title,
          description: doc.description,
          timestamp: doc.timestamp || new Date().toISOString(),
          read: doc.read || false,
          data: parsedData
        };

        // Enrich recall notifications with recall data if needed
        if (notification.type === 'recall' && notification.data?.recallId) {
          try {
            const recallData = await getFoodRecallById(notification.data.recallId);
            notification.data = {
              ...notification.data,
              recallData
            };
          } catch (error) {
            console.error('Error fetching recall data:', error);
          }
        }

        notifications.push(notification);
      } catch (error) {
        console.error('Error processing notification:', error);
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error in getNotifications:', error);
    throw error;
  }
};

// Create notification
export const createNotification = async (params: CreateNotificationParams): Promise<void> => {
  try {
    await databases.createDocument(
      config.databaseId!,
      config.notificationsCollectionId!,
      'unique()',
      {
        userId: params.userId,
        type: params.type,
        title: params.title,
        description: params.description,
        timestamp: new Date().toISOString(),
        read: params.read || false,
        data: params.data ? JSON.stringify(params.data) : '{}'
      }
    );
  } catch (error) {
    console.error('Error in createNotification:', error);
    throw error;
  }
};

// Create chat notification
export const createChatNotification = async (
  userId: string,
  nutritionistId: string,
  senderName: string,
  message: string,
  chatId: string,
  isFromUser: boolean,
  isRecallShare: boolean = false
): Promise<void> => {
  const recipientId = isFromUser ? nutritionistId : userId;
  const senderType = isFromUser ? "pasien" : "nutritionist";
  
  const title = isRecallShare 
    ? `${senderName} membagikan data Food Recall`
    : `Pesan baru dari ${senderType} ${senderName}`;

  await createNotification({
    userId: recipientId,
    type: 'chat',
    title,
    description: message,
    data: {
      chatId,
      nutritionistId,
      isRecallShare
    }
  });
};

// Create recall notification
export const createRecallNotification = async (
  userId: string,
  recallId: string,
  recallData: any,
  nutritionistId?: string
): Promise<void> => {
  const title = 'Pengingat Food Record';
  const description = `Food Record untuk ${recallData.name} telah ${nutritionistId ? 'dibagikan ke ahli gizi' : 'dibuat'}`;

  await createNotification({
    userId,
    type: 'recall',
    title,
    description,
    data: {
      recallId,
      nutritionistId,
      recallData
    }
  });

  if (nutritionistId) {
    await createNotification({
      userId: nutritionistId,
      type: 'recall',
      title: 'Food Record Baru',
      description: `${recallData.name} telah membagikan data Food Record`,
      data: {
        recallId,
        userId,
        recallData
      }
    });
  }
};

// Create article notification
export const createArticleNotification = async (
  articleId: string,
  articleTitle: string,
  articleSummary: string,
  userIds: string[]
): Promise<void> => {
  try {
    const notifications = userIds.map(userId =>
      createNotification({
        userId,
        type: 'article',
        title: 'Artikel Baru Tersedia',
        description: articleSummary,
        data: {
          articleId,
          articleTitle
        }
      })
    );

    await Promise.all(notifications);
  } catch (error) {
    console.error('Error creating article notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    await markNotificationAsRead(notificationId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async (userId: string): Promise<void> => {
  try {
    const notifications = await getNotifications({ userId });
    await Promise.all(
      notifications
        .filter(n => !n.read)
        .map(n => markAsRead(n.$id))
    );
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Delete notification
export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await deleteNotificationFromDB(notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

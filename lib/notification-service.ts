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

// Helper function to generate consistent chatId
const generateChatId = (userId: string, nutritionistId: string): string => {
  // Always use format: smaller ID - larger ID for consistency
  const [id1, id2] = [userId, nutritionistId].sort();
  return `${id1}-${id2}`;
};

// Helper function to prevent duplicate notifications
const checkRecentNotification = async (
  userId: string,
  type: NotificationType,
  chatId?: string,
  timeWindow: number = 5000 // 5 seconds default
): Promise<boolean> => {
  try {
    const recentTime = new Date(Date.now() - timeWindow).toISOString();
    
    const query = [
      Query.equal('userId', userId),
      Query.equal('type', type),
      Query.greaterThan('timestamp', recentTime)
    ];

    if (chatId) {
      query.push(Query.search('data', chatId));
    }

    const recent = await databases.listDocuments(
      config.databaseId!,
      config.notificationsCollectionId!,
      query
    );

    return recent.total > 0;
  } catch (error) {
    console.error('Error checking recent notifications:', error);
    return false;
  }
};

// Get notifications with enriched data and duplicate prevention
export const getNotifications = async (params: NotificationParams): Promise<Notification[]> => {
  try {
    const notifications: Notification[] = [];
    const processedIds = new Set<string>();
    
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
        // Skip if we've already processed this notification
        if (processedIds.has(doc.$id)) continue;
        processedIds.add(doc.$id);

        // Parse the stringified data
        let parsedData = null;
        try {
          parsedData = doc.data ? JSON.parse(doc.data as string) : null;
          
          // For chat notifications, ensure chatId is in consistent format
          if (doc.type === 'chat' && parsedData?.chatId) {
            const [id1, id2] = parsedData.chatId.split('-');
            if (id1 && id2) {
              parsedData.chatId = generateChatId(id1, id2);
            }
          }
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

// Create notification with duplicate prevention
export const createNotification = async (params: CreateNotificationParams): Promise<void> => {
  try {
    // Check for recent duplicate notifications
    const hasDuplicate = await checkRecentNotification(
      params.userId,
      params.type,
      params.data?.chatId
    );

    if (hasDuplicate) {
      console.log('Skipping duplicate notification:', params);
      return;
    }

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

// Create chat notification with consistent chatId format
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
  
  // Ensure consistent chatId format
  const formattedChatId = generateChatId(userId, nutritionistId);
  
  const title = isRecallShare 
    ? `${senderName} membagikan data Food Recall`
    : `Pesan baru dari ${senderType} ${senderName}`;

  // Check for recent duplicate notifications
  const hasDuplicate = await checkRecentNotification(recipientId, 'chat', formattedChatId);
  
  if (hasDuplicate) {
    console.log('Skipping duplicate chat notification');
    return;
  }

  await createNotification({
    userId: recipientId,
    type: 'chat',
    title,
    description: message,
    data: {
      chatId: formattedChatId,
      nutritionistId,
      isRecallShare
    }
  });
};

// Rest of the file remains unchanged...
export const createRecallNotification = async (
  userId: string,
  recallId: string,
  recallData: any,
  nutritionistId?: string
): Promise<void> => {
  const title = 'Pengingat Food Recall';
  const description = `Food Recall untuk ${recallData.name} telah ${nutritionistId ? 'dibagikan ke ahli gizi' : 'dibuat'}`;

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
      title: 'Food Recall Baru',
      description: `${recallData.name} telah membagikan data Food Recall`,
      data: {
        recallId,
        userId,
        recallData
      }
    });
  }
};

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

export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    await markNotificationAsRead(notificationId);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

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

export const deleteNotification = async (notificationId: string): Promise<void> => {
  try {
    await deleteNotificationFromDB(notificationId);
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw error;
  }
};

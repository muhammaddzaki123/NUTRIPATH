// import { Models, Query, RealtimeResponseEvent } from 'react-native-appwrite';
// import { client, config, databases } from './appwrite';

// export interface Notification extends Models.Document {
//   userId: string;
//   type: 'message' | 'recall';
//   title: string;
//   message: string;
//   time: string;
//   read: boolean;
//   data?: {
//     period?: 'morning' | 'evening';
//     senderName?: string;
//     message?: string;
//   };
// }

// interface RealtimeNotification {
//   $id: string;
//   $createdAt: string;
//   $updatedAt: string;
//   $permissions: string[];
//   $collectionId: string;
//   $databaseId: string;
//   userId: string;
//   type: 'message' | 'recall';
//   title: string;
//   message: string;
//   time: string;
//   read: boolean;
//   data?: {
//     period?: 'morning' | 'evening';
//     senderName?: string;
//     message?: string;
//   };
// }

// export const getNotifications = async (userId: string): Promise<Notification[]> => {
//   try {
//     const response = await databases.listDocuments<Notification>(
//       config.databaseId!,
//       config.notificationsCollectionId!,
//       [
//         Query.equal('userId', userId),
//         Query.orderDesc('time'),
//         Query.limit(50)
//       ]
//     );
    
//     return response.documents;
//   } catch (error) {
//     console.error('Error fetching notifications:', error);
//     return [];
//   }
// };

// type CreateNotificationData = Omit<Notification, keyof Models.Document>;

// export const createNotification = async (notification: CreateNotificationData) => {
//   try {
//     const response = await databases.createDocument<Notification>(
//       config.databaseId!,
//       config.notificationsCollectionId!,
//       'unique()',
//       notification
//     );
    
//     return response;
//   } catch (error) {
//     console.error('Error creating notification:', error);
//     throw error;
//   }
// };

// export const markNotificationAsRead = async (notificationId: string) => {
//   try {
//     const response = await databases.updateDocument<Notification>(
//       config.databaseId!,
//       config.notificationsCollectionId!,
//       notificationId,
//       { read: true }
//     );
    
//     return response;
//   } catch (error) {
//     console.error('Error marking notification as read:', error);
//     throw error;
//   }
// };

// export const subscribeToNotifications = async (
//   userId: string,
//   onNotification: (notification: Notification) => void
// ) => {
//   try {
//     const unsubscribe = await client.subscribe<RealtimeResponseEvent<RealtimeNotification>>(
//       `databases.${config.databaseId}.collections.${config.notificationsCollectionId}.documents`,
//       (response: RealtimeResponseEvent<RealtimeNotification>) => {
//         if (
//           response.events.includes('databases.*.collections.*.documents.*.create') &&
//           response.payload?.userId === userId
//         ) {
//           onNotification(response.payload as Notification);
//         }
//       }
//     );

//     return unsubscribe;
//   } catch (error) {
//     console.error('Error subscribing to notifications:', error);
//     throw error;
//   }
// };

// // Helper function to create recall notifications
// export const createRecallNotification = async (userId: string, period: 'morning' | 'evening') => {
//   const now = new Date();
  
//   const notification: CreateNotificationData = {
//     userId,
//     type: 'recall',
//     title: `Pengingat Food Recall ${period === 'morning' ? 'Pagi' : 'Sore'}`,
//     message: `Jangan lupa untuk mencatat asupan makanan ${period === 'morning' ? 'pagi' : 'sore'} hari Anda`,
//     time: now.toISOString(),
//     read: false,
//     data: { period }
//   };

//   return createNotification(notification);
// };

// // Helper function to create message notification
// export const createMessageNotification = async (userId: string, senderName: string, message: string) => {
//   const notification: CreateNotificationData = {
//     userId,
//     type: 'message',
//     title: 'Pesan Baru',
//     message: `${senderName}: ${message}`,
//     time: new Date().toISOString(),
//     read: false,
//     data: { senderName, message }
//   };

//   return createNotification(notification);
// };

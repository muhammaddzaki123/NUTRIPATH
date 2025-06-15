/// <reference lib="dom" />
import { Redirect, Stack, useRouter } from 'expo-router';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '../../../components/ChatContext';
import NotificationItem from '../../../components/NotificationItem';
import { useGlobalContext } from '../../../lib/global-provider';
import { deleteNotification, getNotifications, markAllAsRead, markAsRead } from '../../../lib/notification-service';
import type { Notification } from '../../../types/notification';
import { formatTimestamp } from '../../../utils/date';

const PAGE_SIZE = 10;

interface NotificationGroup {
  date: string;
  notifications: Notification[];
}

export default function NotificationScreen(): ReactElement {
  const router = useRouter();
  const { unreadMessages, nutritionists } = useChat();
  const { user } = useGlobalContext();
  const [notifications, setNotifications] = useState<Array<Notification>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'chat' | 'article' | 'recall'>('all');
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);

  const fetchNotifications = async (pageNum = 1, shouldRefresh = false): Promise<void> => {
    // Prevent multiple fetches within 500ms
    const now = Date.now();
    if (now - lastFetchTime < 500 || !user) return;
    setLastFetchTime(now);

    try {
      // Log fetch attempt for debugging
      if (Platform.OS !== 'web') {
        console.log(`Fetching notifications: page ${pageNum}, refresh: ${shouldRefresh}`);
      }
      const notifs = await getNotifications({
        userId: user.$id,
        unreadMessages,
        nutritionists,
        page: pageNum,
        pageSize: PAGE_SIZE
      });

      const filteredNotifs = filterType === 'all' 
        ? notifs 
        : notifs.filter((n: Notification) => n.type === filterType);

      setNotifications((prev: Array<Notification>) => {
        if (shouldRefresh) return filteredNotifs;
        
        // Remove duplicates based on $id
        const existingIds = new Set(prev.map((n: Notification) => n.$id));
        const newNotifs = filteredNotifs.filter((n: Notification) => !existingIds.has(n.$id));
        return [...prev, ...newNotifs];
      });

      setHasMore(notifs.length === PAGE_SIZE);
      if (!shouldRefresh) {
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let timeoutId: ReturnType<typeof setTimeout>;

    const init = () => {
      if (!user || !mounted) return;
      
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (mounted) {
          setPage(1);
          fetchNotifications(1, true);
        }
      }, 500);
    };

    init();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [user?.$id, filterType]);

  const handleRefresh = (): void => {
    if (refreshing) return;
    setRefreshing(true);
    fetchNotifications(1, true);
  };

  const loadMore = (): void => {
    if (!hasMore || loading || refreshing) return;
    fetchNotifications(page + 1);
  };

  const handleNotificationPress = async (notification: Notification): Promise<void> => {
    try {
      if (!notification.read) {
        await markAsRead(notification.$id);
        setNotifications((prev: Array<Notification>) => 
          prev.map((n: Notification) => 
            n.$id === notification.$id ? { ...n, read: true } : n
          )
        );
      }

      switch (notification.type) {
        case 'chat':
          if (!notification.data || !user) break;

          try {
            // Parse notification data
            const notifData = typeof notification.data === 'string' 
              ? JSON.parse(notification.data) 
              : notification.data;

            const chatId = notifData?.chatId as string;

            // Validasi data yang diperlukan
            if (!chatId) {
              if (Platform.OS !== 'web') {
                console.warn('Chat ID tidak ditemukan dalam notifikasi:', notification.data);
              }
              break;
            }

            // --- PERBAIKAN DIMULAI DI SINI ---
            // 1. Pisahkan string chatId untuk mendapatkan ID user dan ahli gizi
            const ids = chatId.split('-');
            const userIdFromChat = ids[0];
            const nutritionistIdFromChat = ids[1];

            // 2. Tentukan ID partner chat berdasarkan tipe user yang sedang login
            const partnerId = user.userType === 'nutritionist' 
                ? userIdFromChat 
                : nutritionistIdFromChat;
            
            // Debug log
            if (Platform.OS !== 'web') {
              console.log(`[Chat] Opening: Navigating to chat with partner ID: ${partnerId}`);
            }

            // 3. Gunakan partnerId yang benar untuk navigasi
            router.push({
              pathname: "/(root)/(konsultasi)/chat/[id]",
              params: { id: partnerId } // Menggunakan ID partner yang benar
            });
            // --- PERBAIKAN SELESAI ---

          } catch (err) {
            if (Platform.OS !== 'web') {
              console.warn('Chat routing error:', err);
            }
          }
          break;
        case 'article':
          if (notification.data?.articleId) {
            router.push({
              pathname: "/(root)/(Artikel)/artikel",
              params: { id: notification.data.articleId }
            });
          }
          break;
        case 'recall':
          router.push({
            pathname: "/(root)/(tabs)"
          });
          break;
      }
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteNotification(id);
      setNotifications((prev: Array<Notification>) => 
        prev.filter((n: Notification) => n.$id !== id)
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleMarkAllAsRead = async (): Promise<void> => {
    if (!user) return;
    try {
      await markAllAsRead(user.$id);
      setNotifications((prev: Array<Notification>) => 
        prev.map((n: Notification) => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const renderFilterButton = (type: 'all' | 'chat' | 'article' | 'recall', label: string): ReactElement => (
    <TouchableOpacity
      key={type}
      onPress={() => setFilterType(type)}
      className={`px-4 py-2 rounded-full mr-2 ${
        filterType === type ? 'bg-blue-500' : 'bg-gray-200'
      }`}
    >
      <Text className={`font-rubik ${
        filterType === type ? 'text-white' : 'text-gray-600'
      }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  // Memoize grouped notifications
  const groupedData = useMemo(() => {
    const groups: { [key: string]: Array<Notification> } = {};
    
    // Sort notifications by timestamp (newest first)
    const sortedNotifications = [...notifications].sort((a: Notification, b: Notification) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Group by date and ensure no duplicates
    sortedNotifications.forEach((notification: Notification) => {
      const date = formatTimestamp(notification.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      if (!groups[date].some((n: Notification) => n.$id === notification.$id)) {
        groups[date].push(notification);
      }
    });

    return Object.entries(groups).map(([date, notifications]) => ({
      date,
      notifications
    }));
  }, [notifications]);

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  if (loading && !refreshing && notifications.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#1CD6CE" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen options={{ headerShown: false }} />
      
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-2xl font-rubik-bold text-gray-900">
            Notifikasi
          </Text>
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            className="px-3 py-2 bg-blue-500 rounded-lg"
          >
            <Text className="font-rubik text-white">Tandai Semua Dibaca</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
          {renderFilterButton('all', 'Semua')}
          {renderFilterButton('chat', 'Chat')}
          {renderFilterButton('article', 'Artikel')}
          {renderFilterButton('recall', 'Pengingat')}
        </ScrollView>
      </View>

      {notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-500 text-center font-rubik">
            Belum ada notifikasi
          </Text>
        </View>
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={(item: NotificationGroup) => item.date}
          renderItem={({ item }: { item: NotificationGroup }) => (
            <View>
              <Text className="px-4 py-2 bg-gray-100 font-rubik-medium text-gray-600">
                {item.date}
              </Text>
              {item.notifications.map((notification: Notification) => (
                <NotificationItem
                  key={`${item.date}-${notification.$id}`}
                  id={notification.$id}
                  type={notification.type}
                  title={notification.title}
                  description={notification.description}
                  timestamp={formatTimestamp(notification.timestamp)}
                  read={notification.read}
                  onPress={() => handleNotificationPress(notification)}
                  onDelete={() => handleDelete(notification.$id)}
                />
              ))}
            </View>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1CD6CE']}
              tintColor="#1CD6CE"
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={notifications.length === 0 ? { flex: 1 } : undefined}
          className="flex-1"
        />
      )}
    </SafeAreaView>
  );
}
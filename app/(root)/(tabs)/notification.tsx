import { Redirect, Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '../../../components/ChatContext';
import NotificationItem from '../../../components/NotificationItem';
import { generateChatId } from '../../../lib/chat-service';
import { useGlobalContext } from '../../../lib/global-provider';
import { deleteNotification, getNotifications, markAllAsRead, markAsRead } from '../../../lib/notification-service';
import { type Notification } from '../../../types/notification';

const PAGE_SIZE = 10;

import { formatTimestamp } from '../../../utils/date';

export default function NotificationScreen() {
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

  const fetchNotifications = useCallback(async (pageNum = 1, shouldRefresh = false) => {
    try {
      if (!user) return;
      
      // Prevent multiple fetches within 2 seconds
      const now = Date.now();
      if (now - lastFetchTime < 2000 && !shouldRefresh) {
        return;
      }
      setLastFetchTime(now);
      
      const notifs = await getNotifications({
        userId: user.$id,
        unreadMessages,
        nutritionists,
        page: pageNum,
        pageSize: PAGE_SIZE
      });

      // Remove duplicates based on notification ID
      const uniqueNotifs = shouldRefresh ? notifs : [...notifications, ...notifs];
      const seen = new Set<string>();
      const filteredNotifs = uniqueNotifs.filter((n: Notification) => {
        if (seen.has(n.$id)) return false;
        seen.add(n.$id);
        return filterType === 'all' || n.type === filterType;
      });

      setNotifications(filteredNotifs);
      setHasMore(notifs.length === PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, unreadMessages, nutritionists, filterType, notifications, lastFetchTime]);

  useEffect(() => {
    let mounted = true;
    
    if (mounted && user) {
      fetchNotifications(1, true);
    }
    
    return () => {
      mounted = false;
    };
  }, [user, filterType]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    fetchNotifications(1, true);
  }, [fetchNotifications]);

  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchNotifications(nextPage);
    }
  }, [hasMore, loading, page, fetchNotifications]);

  const handleNotificationPress = useCallback(async (notification: Notification) => {
    try {
      if (!notification.read) {
        await markAsRead(notification.$id);
        setNotifications((prev: Array<Notification>) => 
          prev.map((n: Notification) => n.$id === notification.$id ? { ...n, read: true } : n)
        );
      }

      switch (notification.type) {
        case 'chat':
          if (notification.data?.chatId && notification.data?.nutritionistId && user) {
            // Ensure consistent chatId format
            const chatId = generateChatId(user.$id, notification.data.nutritionistId);
            console.log('Navigating to chat with ID:', chatId);
            router.push({
              pathname: "/(root)/(konsultasi)/chat/[id]",
              params: { id: chatId }
            });
          } else {
            console.error('Missing required chat data:', notification.data);
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
  }, [router, user]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev: Array<Notification>) => prev.filter((n: Notification) => n.$id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, []);

  const handleMarkAllAsRead = useCallback(async () => {
    try {
      if (!user) return;
      await markAllAsRead(user.$id);
      setNotifications((prev: Array<Notification>) => prev.map((n: Notification) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  }, [user]);

  const renderFilterButton = useCallback((type: 'all' | 'chat' | 'article' | 'recall', label: string) => (
    <TouchableOpacity
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
  ), [filterType]);

  // Group notifications by date
  const groupedNotifications = useCallback(() => {
    return notifications.reduce((groups: { [key: string]: Array<Notification> }, notification: Notification) => {
      const date = formatTimestamp(notification.timestamp);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    }, {});
  }, [notifications]);

  if (!user) {
    return <Redirect href="/sign-in" />;
  }

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#1CD6CE" />
      </View>
    );
  }

  const groupedNotifs = groupedNotifications();

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />
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
          data={Object.entries(groupedNotifs) as [string, Array<Notification>][]}
          keyExtractor={([date]: [string, Array<Notification>]) => date}
          renderItem={({ item: [date, dateNotifications] }: { item: [string, Array<Notification>] }) => (
            <View>
              <Text className="px-4 py-2 bg-gray-100 font-rubik-medium text-gray-600">
                {date}
              </Text>
              {dateNotifications.map((notification: Notification) => (
                <NotificationItem
                  key={notification.$id}
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
          contentContainerStyle={notifications.length === 0 && { flex: 1 }}
          className="flex-1"
        />
      )}
    </SafeAreaView>
  );
}

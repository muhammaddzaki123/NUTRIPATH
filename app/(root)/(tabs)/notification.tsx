import { useChat } from '@/components/ChatContext';
import NotificationItem from '@/components/NotificationItem';
import { useGlobalContext } from '@/lib/global-provider';
import { getNotifications } from '@/lib/notification-service';
import { type Notification } from '@/types/notification';
import { Redirect, Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotificationScreen() {
  const router = useRouter();
  const { unreadMessages, nutritionists } = useChat();
  const { user } = useGlobalContext();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const notifs = await getNotifications({
        unreadMessages,
        nutritionists
      });
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [unreadMessages, nutritionists]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = (notification: Notification) => {
    switch (notification.type) {
      case 'chat':
        if (notification.data?.chatId) {
          router.push({
            pathname: "/(root)/(konsultasi)/chat/[id]",
            params: { id: notification.data.chatId }
          });
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
  };

  // Redirect if not logged in
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

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <Stack.Screen 
        options={{
          headerShown: false
        }}
      />
      <View className="px-4 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-rubik-bold text-gray-900">
          Notifikasi
        </Text>
      </View>

      {notifications.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-500 text-center font-rubik">
            Belum ada notifikasi
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.$id}
          renderItem={({ item }) => (
            <NotificationItem
              id={item.$id}
              type={item.type}
              title={item.title}
              description={item.description}
              timestamp={item.timestamp}
              onPress={() => handleNotificationPress(item)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#1CD6CE']}
              tintColor="#1CD6CE"
            />
          }
          contentContainerStyle={notifications.length === 0 && { flex: 1 }}
          className="flex-1"
        />
      )}
    </SafeAreaView>
  );
}

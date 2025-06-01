import { Message } from '@/constants/chat';
import { getChatMessages, logoutNutritionist } from '@/lib/appwrite';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardAhliGizi() {
  const [chats, setChats] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const messages = await getChatMessages('current');
      setChats(messages);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutNutritionist('current');
      router.replace('/(root)/(ahligizi)' as any);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="bg-[#1CD6CE] p-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">
            Dashboard Ahli Gizi
          </Text>
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-white/20 px-4 py-2 rounded-lg"
          >
            <Text className="text-white">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        <View className="p-4 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">
            Daftar Konsultasi
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#1CD6CE" />
          </View>
        ) : (
          <FlatList
            data={chats}
            keyExtractor={(item) => item.$id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-4 border-b border-gray-200"
                onPress={() => router.push(`/chat/${item.chatId}` as any)}
              >
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="font-bold text-gray-900">
                      User ID: {item.userId}
                    </Text>
                    <Text className="text-gray-600" numberOfLines={1}>
                      {item.text}
                    </Text>
                  </View>
                  <Text className="text-gray-500 text-sm">
                    {new Date(item.time).toLocaleTimeString()}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={() => (
              <View className="p-4">
                <Text className="text-gray-500 text-center">
                  Belum ada konsultasi aktif
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
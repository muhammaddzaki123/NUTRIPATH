import { useChat } from '@/components/ChatContext';
import { Nutritionist } from '@/constants/chat';
import { useGlobalContext } from '@/lib/global-provider';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const KonsultasiScreen = () => {
  const { nutritionists, unreadMessages, loading: chatLoading, messages } = useChat();
  const { user } = useGlobalContext();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Check if user is logged in
  if (!user) {
    return (
      <SafeAreaView className="flex-1 bg-[#1CD6CE] items-center justify-center">
        <Text className="text-white text-lg mb-4">Silakan login terlebih dahulu</Text>
        <TouchableOpacity 
          onPress={() => router.replace('/sign-in')}
          className="bg-white px-6 py-2 rounded-full"
        >
          <Text className="text-[#1CD6CE] font-semibold">Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Show loading state
  if ((loading && user.userType === 'nutritionist') || (chatLoading && user.userType === 'user')) {
    return (
      <SafeAreaView className="flex-1 bg-[#1CD6CE] items-center justify-center">
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4">
          {user.userType === 'nutritionist' ? 'Memuat daftar chat...' : 'Memuat daftar ahli gizi...'}
        </Text>
      </SafeAreaView>
    );
  }

  // If user is a nutritionist, show chat list
  if (user.userType === 'nutritionist') {
    const chatList = Object.entries(messages)
      .map(([chatId, chatMessages]) => {
        const lastMessage = chatMessages[chatMessages.length - 1];
        const userId = chatId.split('-')[0];
        const unreadCount = chatMessages.filter(
          msg => !msg.read && msg.sender === 'user'
        ).length;

        // Get user details from the last message
        const userDetails = lastMessage?.userDetails;

        return {
          chatId,
          lastMessage,
          userId,
          unreadCount,
          timestamp: lastMessage?.time || '',
          userName: userDetails?.name || `User ${userId}`,
          userAvatar: userDetails?.avatar || `User ${user.avatar}`,
        };
      })
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    return (
      <SafeAreaView className="flex-1 bg-[#1CD6CE]">
        <View className="flex-row items-center px-4 py-3">
          <Link href="/" className="mr-auto">
            <View className="w-8 h-8 justify-center">
              <Text className="text-white text-2xl">←</Text>
            </View>
          </Link>
          <Text className="text-white text-xl font-bold absolute left-0 right-0 text-center">
            CHAT KONSULTASI
          </Text>
        </View>

        <ScrollView className="flex-1 bg-white rounded-t-3xl">
          <View className="p-4">
            {chatList.length > 0 ? (
              chatList.map(({ chatId, lastMessage, userId, unreadCount, userName, userAvatar }) => (
                <Link
                  key={chatId}
                  href={`/chat/${userId}`}
                  asChild
                >
                  <TouchableOpacity 
                    className="mb-4 bg-white rounded-xl border border-gray-100 shadow-sm p-4"
                    style={{ elevation: 2 }}
                  >
                    <View className="flex-row items-center">
                      <View className="w-12 h-12 rounded-full bg-gray-100 items-center justify-center">
                        {userAvatar ? (
                          <Image 
                            source={{ uri: userAvatar }}
                            className="w-12 h-12 rounded-full"
                          />
                        ) : (
                          <FontAwesome name="user-circle" size={30} color="#666" />
                        )}
                      </View>
                      <View className="ml-3 flex-1">
                        <Text className="font-bold text-gray-900">
                          {userName}
                        </Text>
                        {lastMessage && (
                          <>
                            <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                              {lastMessage.text}
                            </Text>
                            <Text className="text-gray-400 text-xs mt-1">
                              {new Date(lastMessage.time).toLocaleString()}
                            </Text>
                          </>
                        )}
                      </View>
                      {unreadCount > 0 && (
                        <View className="bg-red-500 rounded-full px-2 py-1 ml-2">
                          <Text className="text-white text-xs font-bold">
                            {unreadCount}
                          </Text>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                </Link>
              ))
            ) : (
              <View className="py-8">
                <Text className="text-center text-gray-500">
                  Belum ada chat konsultasi
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // For regular users, show nutritionist list
  return (
    <SafeAreaView className="flex-1 bg-[#1CD6CE]">
      <View className="flex-row items-center pt-5 pb-2 mb-4 justify-between">
        <TouchableOpacity onPress={() => router.replace('/')} className='mr-auto'>
          <Ionicons name="arrow-back" size={24} color={"white"} className='ml-2' />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold  ml-4 ">RECALL</Text>
      </View>
      <ScrollView 
        className="flex-1 bg-white rounded-t-3xl"
        removeClippedSubviews={true}
      >
        <View className="p-4">
          {nutritionists && nutritionists.length > 0 ? (
            nutritionists.map((nutritionist: Nutritionist) => (
              <Link
                key={nutritionist.$id}
                href={`/chat/${nutritionist.$id}`}
                asChild
              >
                <TouchableOpacity 
                  className="mb-4 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
                  style={{ elevation: 2 }}
                >
                  {/* Header with Status */}
                  <View className="flex-row items-center p-4 border-b border-gray-100">
                    <View className="w-16 h-16 rounded-full bg-gray-100 items-center justify-center">
                      {nutritionist.avatar ? (
                        <Image 
                          source={{ uri: nutritionist.avatar }}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <FontAwesome name="user-circle" size={40} color="#666" />
                      )}
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-bold text-gray-900">
                        {nutritionist.name}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <View className={`w-2 h-2 rounded-full ${
                          nutritionist.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        } mr-2`} />
                        <Text className="text-sm text-gray-500 capitalize">
                          {nutritionist.status}
                        </Text>
                        {unreadMessages[nutritionist.$id] > 0 && (
                          <View className="ml-auto bg-red-500 rounded-full px-2 py-1">
                            <Text className="text-xs text-white font-bold">
                              {unreadMessages[nutritionist.$id]}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>

                  {/* Specialist Info */}
                  <View className="p-4 bg-gray-50">
                    <View className="mb-2">
                      <Text className="text-sm font-semibold text-gray-700">
                        Spesialisasi:
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {nutritionist.specialization}
                      </Text>
                    </View>

                    <View className="mb-2">
                      <Text className="text-sm font-semibold text-gray-700">
                        Tipe:
                      </Text>
                      <Text className="text-sm text-gray-600">
                        {nutritionist.type}
                      </Text>
                    </View>

                    {nutritionist.lastSeen && nutritionist.status === 'offline' && (
                      <View>
                        <Text className="text-xs text-gray-500">
                          Terakhir online: {new Date(nutritionist.lastSeen).toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Link>
            ))
          ) : (
            <View className="py-8">
              <Text className="text-center text-gray-500">
                Tidak ada ahli gizi yang tersedia saat ini
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default KonsultasiScreen;

import { useChat } from '@/components/ChatContext';
import { Nutritionist, User } from '@/constants/chat';
import { useGlobalContext } from '@/lib/global-provider';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
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
      <SafeAreaView className="flex-1 bg-primary-500 items-center justify-center">
        {/* Atur status bar untuk layar ini */}
        <StatusBar backgroundColor="#0BBEBB" style="light" />
        <Text className="text-white text-lg mb-4 text-center px-8">
          Anda harus login untuk mengakses fitur konsultasi.
        </Text>
        <TouchableOpacity
          onPress={() => router.replace('/sign-in')}
          className="bg-white px-8 py-3 rounded-full shadow-lg"
        >
          <Text className="text-primary-500 font-rubik-bold text-base">Login Sekarang</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Show loading state
  if ((loading && user.userType === 'nutritionist') || (chatLoading && user.userType === 'user')) {
    return (
      <SafeAreaView className="flex-1 bg-primary-500 items-center justify-center">
        <StatusBar backgroundColor="#0BBEBB" style="light" />
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-4 font-rubik text-base">
          {user.userType === 'nutritionist' ? 'Memuat daftar chat...' : 'Memuat daftar ahli gizi...'}
        </Text>
      </SafeAreaView>
    );
  }

  // --- Tampilan untuk Ahli Gizi ---
  if (user.userType === 'nutritionist') {
    const chatList = Object.entries(messages)
      .map(([chatId, chatMessages]) => {
        const lastMessage = chatMessages[chatMessages.length - 1];
        const userId = chatId.split('-')[0];
        const unreadCount = chatMessages.filter(
          msg => !msg.read && msg.sender === 'user'
        ).length;
        const userDetails = lastMessage?.userDetails as User & { status?: 'online' | 'offline'; lastSeen?: string };

        return {
          chatId,
          lastMessage,
          userId,
          unreadCount,
          timestamp: lastMessage?.time || '',
          userName: userDetails?.name || `User ${userId}`,
          userAvatar: userDetails?.avatar,
          userStatus: userDetails?.status,
          userLastSeen: userDetails?.lastSeen,
        };
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
      <SafeAreaView className="flex-1 bg-primary-500">
        <StatusBar backgroundColor="#0BBEBB" style="light" />
        <View className="flex-row items-center justify-between px-4 py-3">
          <TouchableOpacity onPress={() => router.replace('/')} className="p-2 -ml-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-rubik-bold">
            Chat Konsultasi
          </Text>
          <View className="w-8" />
        </View>

        <ScrollView className="flex-1 bg-gray-50 rounded-t-3xl">
          <View className="p-4">
            {chatList.length > 0 ? (
              chatList.map(({ chatId, lastMessage, userId, unreadCount, userName, userAvatar, userStatus, userLastSeen }) => (
                <Link
                  key={chatId}
                  href={{ pathname: '/(root)/(konsultasi)/chat/[id]', params: { id: userId } }}
                  asChild
                >
                  <TouchableOpacity
                    className="mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                    style={{ elevation: 3 }}
                  >
                    <View className="flex-row items-center p-4">
                      <View className="relative">
                        {userAvatar ? (
                          <Image
                            source={{ uri: userAvatar }}
                            className="w-14 h-14 rounded-full"
                          />
                        ) : (
                          <FontAwesome name="user-circle" size={36} color="#ccc" />
                        )}
                        <View className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                          userStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                      </View>
                      <View className="ml-4 flex-1">
                        <Text className="font-rubik-bold text-lg text-gray-900">
                          {userName}
                        </Text>
                        {lastMessage && (
                          <Text className="text-gray-500 text-sm mt-1" numberOfLines={1}>
                            {lastMessage.text}
                          </Text>
                        )}
                      </View>
                      <View className="items-end">
                        {lastMessage && (
                          <Text className="text-gray-400 text-xs mb-1">
                            {new Date(lastMessage.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Text>
                        )}
                        {unreadCount > 0 && (
                          <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center">
                            <Text className="text-white text-xs font-bold">
                              {unreadCount}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View className="px-4 pb-3 pt-2 bg-slate-50 border-t border-slate-100">
                       <Text className="text-sm font-rubik-medium text-gray-700 capitalize">
                          Status: <Text className="font-rubik">{userStatus}</Text>
                        </Text>
                        {userLastSeen && userStatus === 'offline' && (
                          <Text className="text-xs text-gray-500 mt-2">
                            Terakhir online: {new Date(userLastSeen).toLocaleString('id-ID')}
                          </Text>
                        )}
                    </View>
                  </TouchableOpacity>
                </Link>
              ))
            ) : (
              <View className="pt-20 items-center">
                <Text className="text-center text-gray-500 font-rubik">
                  Belum ada chat konsultasi.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // --- Tampilan untuk Pengguna Biasa ---
  return (
    <SafeAreaView className="flex-1 bg-primary-500">
        <StatusBar backgroundColor="#0BBEBB" style="light" />
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity onPress={() => router.replace('/')} className="p-2 -ml-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-rubik-bold">
          Pilih Ahli Gizi
        </Text>
        <View className="w-8" />
      </View>

      <ScrollView className="flex-1 bg-gray-50 rounded-t-3xl">
        <View className="p-4">
          {nutritionists && nutritionists.length > 0 ? (
            nutritionists.map((nutritionist: Nutritionist) => (
              <Link
                key={nutritionist.$id}
                href={{ pathname: '/(root)/(konsultasi)/chat/[id]', params: { id: nutritionist.$id } }}
                asChild
              >
                <TouchableOpacity
                  className="mb-4 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
                  style={{ elevation: 3 }}
                >
                  <View className="flex-row items-center p-4">
                    <View className="relative">
                      {nutritionist.avatar ? (
                        <Image
                          source={{ uri: nutritionist.avatar }}
                          className="w-16 h-16 rounded-full"
                        />
                      ) : (
                        <FontAwesome name="user-circle" size={50} color="#ccc" />
                      )}
                      <View className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                        nutritionist.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                      }`} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-lg font-rubik-bold text-gray-900">
                        {nutritionist.name}
                      </Text>
                       <Text className="text-sm text-gray-600 capitalize mt-1">
                        {nutritionist.status}
                      </Text>
                    </View>
                    {unreadMessages[nutritionist.$id] > 0 && (
                      <View className="bg-red-500 rounded-full w-6 h-6 items-center justify-center">
                        <Text className="text-white text-xs font-bold">
                          {unreadMessages[nutritionist.$id]}
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  <View className="px-4 pb-3 pt-2 bg-slate-50 border-t border-slate-100">
                     <Text className="text-sm font-rubik-medium text-gray-700">
                        Spesialisasi: <Text className="font-rubik">{nutritionist.specialization}</Text>
                      </Text>
                      <Text className="text-sm font-rubik-medium text-gray-700 mt-1">
                        Tipe: <Text className="font-rubik">{nutritionist.type}</Text>
                      </Text>

                      {nutritionist.lastSeen && nutritionist.status === 'offline' && (
                        <Text className="text-xs text-gray-500 mt-2">
                          Terakhir online: {new Date(nutritionist.lastSeen).toLocaleString('id-ID')}
                        </Text>
                      )}
                  </View>
                </TouchableOpacity>
              </Link>
            ))
          ) : (
            <View className="pt-20 items-center">
              <Text className="text-center text-gray-500 font-rubik">
                Tidak ada ahli gizi yang tersedia saat ini.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default KonsultasiScreen;
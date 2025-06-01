import { Article } from '@/constants/article';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { useArticles } from '@/constants/useArticles';
import { logout } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const Home = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const { user, refetch } = useGlobalContext();
  const router = useRouter();
  const { articles, loading, error } = useArticles();

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      Alert.alert("Success", "Logged out successfully");
      refetch();
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  return (
    <View className="flex-1 bg-[#B7E5E7] relative">
      {/* Background Illustrations - Doctor and Patient */}
      <Image
        source={images.bg1}
        className="absolute bottom-0 left-0 w-full h-64"
        resizeMode="contain"
      />

      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-4 ">
        <Image 
          source={images.logoawal}
          className="w-44 h-20"
          resizeMode="contain"
        />
        <TouchableOpacity onPress={() => setMenuVisible(!menuVisible)}>
          <Image 
            source={{uri: user?.avatar}}
            className="w-10 h-10 rounded-full"
          />
        </TouchableOpacity>
        {menuVisible && (
          <>
            {/* Transparent overlay to close when tapping outside */}
            <TouchableOpacity 
              className="absolute inset-0 z-40" 
              onPress={() => setMenuVisible(false)} 
            />

            <View className="absolute top-20 right-4 bg-white rounded-2xl p-4 shadow-xl w-56 z-50">
              <TouchableOpacity 
                className="flex-row items-center mb-4"
                onPress={() => {
                  setMenuVisible(false);
                  handleLogout();
                }}
              >
                <Image source={icons.logout} className="w-6 h-6 mr-3 tint-red-500" />
                <Text className="text-lg font-semibold text-black">Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => {
                  setMenuVisible(false);
                  router.push('/profile');
                }}
              >
                <Text className="text-lg font-semibold text-black">About Us</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Carousel Section */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="h-[200px] bg-[#0BBEBB] rounded-lg mt-2 -mb-[180px]" />
        <View className="h-[219px] rounded-lg mt-2">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-4 rounded-lg"
          >
            {loading ? (
              <View className="justify-center items-center p-4">
                <ActivityIndicator size="small" color="#000" />
                <Text className="ml-2">Loading articles...</Text>
              </View>
            ) : error ? (
              <View className="justify-center items-center p-4">
                <Text className="text-red-500">{error}</Text>
              </View>
            ) : articles.length === 0 ? (
              <View className="justify-center items-center p-4">
                <Text className="text-gray-600">No articles available</Text>
              </View>
            ) : (
              articles.slice(0, 5).map((article: Article) => {
                const imageUrl = article.image || 'https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg';
                return (
                  <TouchableOpacity 
                    key={article.$id} 
                    className="mr-3"
                    onPress={() => router.push(`./detail/${article.$id}`)}
                  >
                    <View className="bg-white rounded-2xl overflow-hidden w-72 shadow-lg">
                      <View className="bg-white p-3 rounded-t-2xl">
                        <Image 
                          source={{ uri: imageUrl }}
                          className="w-full h-36 rounded-xl"
                          resizeMode="cover"
                        />
                      </View>
                      <View className="p-3">
                        <Text 
                          className="text-base font-bold mb-1" 
                          numberOfLines={1}
                          style={{ width: '100%' }}
                        >
                          {article.title.length > 30 
                            ? `${article.title.substring(0, 30)}...` 
                            : article.title}
                        </Text>
                        <Text className="text-sm text-gray-600">Tekan untuk info lebih lanjut</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Lihat lebih lanjut button */}
        <TouchableOpacity
          onPress={() => router.push('/DeskIcon')}
          className="bg-white mx-4 my-3 p-3 rounded-xl flex-row justify-between items-center"
        >
          <Text className="text-sm font-semibold">Lihat lebih lanjut</Text>
          <Image 
            source={icons.rightArrow}
            className="w-5 h-5"
          />
        </TouchableOpacity>

        {/* Features Grid - In a white box container */}
        <View className="mx-4 mb-16 bg-white rounded-xl p-4">
          {/* Top Row - 2 icons */}
          <View className="flex-row justify-between mb-4">
            <TouchableOpacity 
              className="items-center"
              onPress={() => router.push('/recall')}
            >
              <View className="bg-[#dbe7e7] rounded-full w-16 h-16 items-center justify-center">
                <Image 
                  source={images.asupan}
                  className="size-12"
                />
              </View>
              <Text className="text-center mt-1 text-xs">Recall Asupan 24 Jam</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="items-center"
              onPress={() => router.push('/KalkulatorGizi')}
            >
              <View className="bg-[#dbe7e7] rounded-full w-16 h-16 items-center justify-center">
                <Image 
                  source={images.kalkulator}
                  className="size-12"
                />
              </View>
              <Text className="text-center mt-1 text-xs">Kalkulator Gizi</Text>
            </TouchableOpacity>
          </View>

          {/* Middle - 1 icon */}
          <View className="items-center mb-4">
            <TouchableOpacity 
              className="items-center"
              onPress={() => router.push('/artikel')}
            >
              <View className="bg-[#dbe7e7] rounded-full w-16 h-16 items-center justify-center">
                <Image 
                  source={images.artikel}
                  className="size-12"
                />
              </View>
              <Text className="text-center mt-1 text-xs">Artiket Gizi</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Row - 2 icons */}
          <View className="flex-row justify-between">
            <TouchableOpacity 
              className="items-center"
              onPress={() => router.push('/dietPlan')}
            >
              <View className="bg-[#dbe7e7] rounded-full w-16 h-16 items-center justify-center">
                <Image 
                  source={images.diet}
                  className="size-12"
                />
              </View>
              <Text className="text-center mt-1 text-xs">Diet Plan</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="items-center"
              onPress={() => router.push('/konsultasi')}
            >
              <View className="bg-[#dbe7e7] rounded-full w-16 h-16 items-center justify-center">
                <Image 
                  source={images.konsultasi}
                  className="size-12"
                />
              </View>
              <Text className="text-center mt-1 text-xs">Konsultasi Gizi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default Home;

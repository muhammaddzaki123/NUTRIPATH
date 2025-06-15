// app/(root)/(Artikel)/detail/[id].tsx

import { Article } from '@/constants/article';
import { getArticleById } from '@/lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ArticleDetail = () => {
  const { id } = useLocalSearchParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await getArticleById(id as string);
        setArticle(response as Article);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArticle();
    }
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-primary-500 justify-center items-center">
        <StatusBar backgroundColor="#0BBEBB" style="light" />
        <ActivityIndicator size="large" color="white" />
        <Text className="text-white mt-2 font-rubik">Memuat artikel...</Text>
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView className="flex-1 bg-primary-500 justify-center items-center">
        <StatusBar backgroundColor="#0BBEBB" style="light" />
        <Text className="text-white font-rubik">Artikel tidak ditemukan.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-white/20 px-4 py-2 rounded-full">
            <Text className="text-white">Kembali</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formattedDate = new Date(article.$createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    // PERBAIKAN 1: SafeAreaView memiliki warna latar putih, karena kontennya dominan putih
    <SafeAreaView className="flex-1 bg-white">
      {/* PERBAIKAN 2: StatusBar diatur menjadi 'dark' agar ikon terlihat di atas latar putih */}
      <StatusBar style="dark" />
      
      {/* PERBAIKAN 3: Header dibuat dengan layout yang lebih modern dan padding yang benar.
        Sekarang posisinya absolut agar bisa "melayang" di atas gambar.
      */}
      <View className="absolute top-0 left-0 right-0 z-10 pt-12">
          <View className="flex-row items-center justify-between px-4">
              <TouchableOpacity 
                onPress={() => router.back()} 
                className="bg-black/40 w-10 h-10 rounded-full justify-center items-center"
              >
                  <Ionicons name="arrow-back" size={24} color="white" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => router.replace('/')} 
                className="bg-black/40 w-10 h-10 rounded-full justify-center items-center"
              >
                  <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
          </View>
      </View>

      <ScrollView className="flex-1">
        {/* Article Image */}
        <Image 
          source={{ uri: article.image }}
          className="w-full h-80" // Gambar dibuat lebih tinggi
          resizeMode="cover"
        />
        
        <View className="p-5">
            {/* Category & Tags */}
            <View className="flex-row flex-wrap items-center gap-2 mb-4">
                <View className="bg-primary-200 px-3 py-1 rounded-full">
                    <Text className="text-primary-500 font-rubik-medium">
                    {article.category}
                    </Text>
                </View>
                {article.tags.map((tag, index) => (
                    <View key={index} className="bg-gray-100 px-3 py-1 rounded-full">
                    <Text className="text-gray-600 font-rubik">{tag}</Text>
                    </View>
                ))}
            </View>

            {/* Article Title */}
            <Text className="text-3xl font-rubik-bold text-black-300 mb-3 leading-tight">
                {article.title}
            </Text>

            {/* Author, Date, Views */}
            <View className="flex-row items-center justify-between mb-5 border-b border-gray-200 pb-3">
                <View className="flex-row items-center">
                    <Text className="text-sm font-rubik-medium text-gray-700">
                    Oleh {article.author}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <Ionicons name="eye-outline" size={14} color="#666" />
                    <Text className="text-sm font-rubik text-gray-500 ml-1 mr-3">
                        {article.viewCount} kali dilihat
                    </Text>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text className="text-sm font-rubik text-gray-500 ml-1">
                        {formattedDate}
                    </Text>
                </View>
            </View>
            
            {/* Article Content */}
            <Text className="text-base font-rubik text-black-200 leading-7 text-justify">
                {article.content}
            </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ArticleDetail;
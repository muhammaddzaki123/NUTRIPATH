import { Article } from '@/constants/article';
import { getArticleById } from '@/lib/appwrite';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ArticleDetail = () => {
    const { id } = useLocalSearchParams();
    const [article, setArticle] = useState<Article | null>(null);
    const [loading, setLoading] = useState(true);
    const [imageAspectRatio, setImageAspectRatio] = useState(1);
    const [isModalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        const fetchArticle = async () => {
            if (!id || typeof id !== 'string') {
                setLoading(false);
                return;
            }
            try {
                const response = await getArticleById(id);
                if (response) {
                    setArticle(response as Article);
                    if (response.image) {
                        Image.getSize(response.image, (width, height) => {
                            if (height > 0) {
                                setImageAspectRatio(width / height);
                            }
                        });
                    }
                } else {
                    setArticle(null);
                }
            } catch (error) {
                console.error('Error fetching article:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchArticle();
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

    const screenWidth = Dimensions.get('window').width;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <StatusBar style="dark" />
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
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Image
                        source={{ uri: article.image }}
                        style={{ width: screenWidth, height: screenWidth / imageAspectRatio }}
                        resizeMode="contain"
                    />
                </TouchableOpacity>

                <View className="p-5">
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

                    <Text className="text-3xl font-rubik-bold text-black-300 mb-3 leading-tight">
                        {article.title}
                    </Text>

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
                    
                    {/* --- PERUBAHAN: Menghapus text-justify --- */}
                    <Text className="text-base font-rubik text-black-200 leading-7">
                        {article.content}
                    </Text>
                </View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isModalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/90">
                    <TouchableOpacity
                        className="absolute top-12 right-5 z-10 bg-white/25 p-2 rounded-full"
                        onPress={() => setModalVisible(false)}
                    >
                        <Ionicons name="close" size={30} color="white" />
                    </TouchableOpacity>
                    <Image
                        source={{ uri: article.image }}
                        style={{ width: '100%', height: '80%' }}
                        resizeMode="contain"
                    />
                </View>
            </Modal>
        </SafeAreaView>
    );
};

export default ArticleDetail;
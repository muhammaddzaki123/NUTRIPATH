import { Artikel } from '@/components/Berita';
import Search from '@/components/Search';
import { Article } from '@/constants/article';
import { useArticles } from '@/constants/useArticles';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const categories = ['Semua','hipertensi', 'diabetes','kanker', 'nutrisi', 'diet', 'kesehatan'];

const ArtikelScreen = () => {
  // Ganti nama 'filteredArticles' dari useArticles menjadi 'searchedArticles' agar tidak membingungkan
  const { articles, loading, error, searchArticles, filteredArticles: searchedArticles } = useArticles();
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  // State baru untuk menampung hasil akhir setelah semua filter diterapkan
  const [finalFilteredArticles, setFinalFilteredArticles] = useState<Article[]>([]);
  const params = useLocalSearchParams<{ query?: string }>();

  // Efek untuk menangani pencarian teks dari komponen Search
  useEffect(() => {
    if (params.query) {
      searchArticles(params.query);
    } else {
      // Jika query kosong, reset pencarian untuk menampilkan semua artikel
      searchArticles('');
    }
  }, [params.query]);

  // Efek untuk memfilter berdasarkan KATEGORI dan TAG
  useEffect(() => {
    // Tentukan artikel mana yang akan difilter: hasil pencarian jika ada, jika tidak, semua artikel
    const articlesToFilter = params.query ? searchedArticles : articles;

    if (selectedCategory === 'Semua') {
      // Jika kategori 'Semua', tampilkan semua artikel (yang sudah melalui filter pencarian jika ada)
      setFinalFilteredArticles(articlesToFilter);
    } else {
      const lowercasedCategory = selectedCategory.toLowerCase();
      const filtered = articlesToFilter.filter(article => {
        // Kondisi 1: Kategori artikel cocok dengan kategori yang dipilih
        const categoryMatch = article.category.toLowerCase() === lowercasedCategory;
        
        // Kondisi 2: Salah satu tag di dalam artikel cocok dengan kategori yang dipilih
        const tagMatch = article.tags.some(tag => tag.toLowerCase() === lowercasedCategory);

        // Tampilkan artikel jika SALAH SATU kondisi terpenuhi (OR)
        return categoryMatch || tagMatch;
      });
      setFinalFilteredArticles(filtered);
    }
  }, [selectedCategory, articles, searchedArticles, params.query]); // Dijalankan saat filter berubah

  const handleArticlePress = (article: Article) => {
    router.push({
      pathname: `./detail/${article.$id}`,
      params: { id: article.$id }
    });
  };
  
  return (
    <SafeAreaView className='bg-primary-500 h-full p-2'>
      {/* Header */}
      <View className="flex-row items-center pt-2 border-b border-white ">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" className="ml-2" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-rubik-bold ml-4">ARTIKEL GIZI</Text>
        <TouchableOpacity onPress={() => router.replace('/')} className="ml-auto">
          <Text className="text-3xl text-white mr-4">×</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View className='flex flex-col '>
        <Search />
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="mt-3 mb-2"
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedCategory(category)}
            className={`flex flex-col items-start mr-4 px-4 py- rounded-full h-6 mb-3 ${
              selectedCategory === category 
                ? 'bg-white' 
                : 'bg-primary-400'
            }`}
          >
            <Text
              className={`text-sm  ${
                selectedCategory === category
                  ? 'text-primary-500'
                  : 'text-black-200'
              }`}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">Loading articles...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">{error}</Text>
        </View>
      ) : finalFilteredArticles.length === 0 ? (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white">No articles found</Text>
        </View>
      ) : (
        <FlatList
          data={finalFilteredArticles} // Menampilkan data dari hasil filter akhir
          renderItem={({item}) => (
            <Artikel 
              item={item} 
              onPress={() => handleArticlePress(item)}
            />
          )}
          numColumns={2}
          columnWrapperClassName="flex gap-5 px-5"
          contentContainerClassName="pb-32"
          showsHorizontalScrollIndicator={false}
          className='bg-primary-400 mt-4'
        />
      )}
    </SafeAreaView>
  );
};

export default ArtikelScreen;
import { getDiseaseInformation } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  View
} from "react-native";

// Definisikan tipe untuk data yang akan diterima dari Appwrite
interface ContentBlock {
  type: 'heading' | 'paragraph' | 'list' | 'table';
  data: any;
}

interface DiseaseInfo {
  title: string;
  content: ContentBlock[];
}

const Info = () => {
  const { user } = useGlobalContext();
  const [diseaseInfo, setDiseaseInfo] = useState<DiseaseInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fungsi untuk mengambil data dari Appwrite
    const fetchInfo = async () => {
      // Jika tidak ada user, hentikan loading
      if (!user) {
        setLoading(false);
        return;
      }
      
      // Tentukan kunci pencarian berdasarkan tipe user
      const diseaseKey = (user.userType === 'user' ? user.disease : user.specialization)?.toLowerCase();
      
      if (diseaseKey) {
        try {
          setLoading(true);
          const info = await getDiseaseInformation(diseaseKey);
          setDiseaseInfo(info);
        } catch (error) {
          console.error("Gagal mengambil informasi penyakit:", error);
          setDiseaseInfo(null); // Set info menjadi null jika terjadi error
        } finally {
          setLoading(false);
        }
      } else {
        // Jika tidak ada diseaseKey, hentikan loading
        setLoading(false);
      }
    };

    fetchInfo();
  }, [user]); // Jalankan efek ini setiap kali objek user berubah

  // Komponen untuk merender blok konten secara dinamis
  const renderContentComponent = (item: ContentBlock, index: number) => {
    switch (item.type) {
      case 'heading':
        return (
          <Text key={index} className="text-xl font-rubik-bold text-gray-900 mb-3 mt-4">
            {item.data}
          </Text>
        );

      case 'paragraph':
        return (
          <Text key={index} className="text-base text-gray-800 mb-4 leading-relaxed text-justify">
            {item.data}
          </Text>
        );

      case 'list':
        return (
          <View key={index} className="mb-4 ml-4">
            {(item.data as string[]).map((listItem, listIndex) => (
              <View key={listIndex} className="flex-row mb-2">
                <Text className="text-base text-gray-800 mr-2">•</Text>
                <Text className="flex-1 text-base text-gray-800 leading-relaxed text-justify">{listItem}</Text>
              </View>
            ))}
          </View>
        );
      
      case 'table':
        const { headers, rows } = item.data as { headers: string[], rows: string[][] };
        return (
          <View key={index} className="border border-gray-300 rounded-lg my-4 overflow-hidden">
            {/* Table Header */}
            <View className="flex-row bg-gray-100 p-2 border-b border-gray-300">
              {headers.map((header, headerIndex) => (
                <Text key={headerIndex} className={`flex-1 font-rubik-bold text-gray-900 ${headerIndex > 0 ? 'text-center' : ''}`}>
                  {header}
                </Text>
              ))}
            </View>
            {/* Table Rows */}
            {rows.map((row, rowIndex) => (
              <View key={rowIndex} className="flex-row p-2 border-t border-gray-200">
                {row.map((cell, cellIndex) => (
                  <Text key={cellIndex} className={`flex-1 text-gray-800 ${cellIndex > 0 ? 'text-center' : ''}`}>
                    {cell}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        );

      default:
        return null;
    }
  };

  // Tampilkan indikator loading saat data diambil
  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-primary-400">
        <ActivityIndicator size="large" color="#1CD6CE" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-400">
      <ScrollView contentContainerStyle={{ paddingBottom: 100, paddingTop: 24, paddingHorizontal: 16 }}>
        {user && diseaseInfo ? (
          <View className="bg-white rounded-2xl shadow-lg p-6">
            <Text className="text-3xl font-rubik-bold text-primary-500 mb-4 pb-2 border-b-2 border-primary-100">
              {user.userType === 'user' ? 'Informasi' : 'Spesialisasi'}: {diseaseInfo.title}
            </Text>
            {/* Merender konten dari state diseaseInfo */}
            {diseaseInfo.content.map((item, index) => renderContentComponent(item, index))}
          </View>
        ) : (
          <View className="flex-1 justify-center items-center p-4 mt-20">
            <View className="bg-white rounded-2xl shadow-lg p-6 w-full items-center">
                <Text className="text-lg text-gray-600 text-center">
                {user ? "Informasi tidak tersedia untuk profil Anda." : "Silakan login untuk melihat informasi."}
                </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Info;
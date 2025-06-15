import { DIET_PLANS } from '@/constants/diet-config'; // Mengambil data rencana diet
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const DietRecommendations = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  // 'calories' yang diterima di sini adalah string TEE dari Mifflin-St Jeor dari DietPlan.tsx.
  // Ini adalah nilai kalori hasil perhitungan yang akan digunakan untuk rekomendasi.
  const { disease, calories } = params; 
  
  // 1. Konversi nilai kalori dari string ke angka. 
  // Jika nilai tidak valid (misal: undefined, null, atau bukan angka), gunakan 0 sebagai default.
  const numericCalories = Number(calories) || 0; 
  
  // 2. Bulatkan kalori ke kelipatan terdekat dari 100.
  // Ini adalah langkah krusial untuk mencocokkan dengan standar kalori yang ada di DIET_PLANS.
  // Contoh: 1725 kcal akan menjadi 1700 kcal; 1780 kcal akan menjadi 1800 kcal.
  const roundedCalories = Math.round(numericCalories / 100) * 100; 
  
  // 3. Ambil objek rencana diet spesifik berdasarkan penyakit yang dipilih.
  // Menggunakan type assertion 'as keyof typeof DIET_PLANS' untuk TypeScript.
  // Optional chaining (?) digunakan untuk menghindari error jika 'disease' tidak ada di DIET_PLANS.
  const dietPlansForDisease = DIET_PLANS[disease as keyof typeof DIET_PLANS];

  // 4. Temukan nilai kalori terdekat yang tersedia dalam data DIET_PLANS untuk penyakit tersebut.
  let closestCalories = 0; // Inisialisasi dengan nilai default 0.
  
  if (dietPlansForDisease) {
    // Ambil semua kunci kalori yang tersedia untuk penyakit ini dan konversi ke angka.
    const availableCalories = Object.keys(dietPlansForDisease).map(Number); 
    
    if (availableCalories.length > 0) {
      // Gunakan metode 'reduce' untuk menemukan nilai kalori dalam 'availableCalories' 
      // yang paling dekat dengan 'roundedCalories'.
      closestCalories = availableCalories.reduce((prev, curr) => {
        const diffPrev = Math.abs(prev - roundedCalories); // Selisih dengan kalori sebelumnya
        const diffCurr = Math.abs(curr - roundedCalories); // Selisih dengan kalori saat ini
        return diffCurr < diffPrev ? curr : prev; // Pilih yang selisihnya lebih kecil
      }, availableCalories[0]); // Mulai perbandingan dari elemen pertama dalam array 'availableCalories'
    }
  }

  // Fungsi pembantu untuk merender bagian makanan (pagi, selingan, siang, malam).
  // Memastikan tampilan tabel rapi dan hanya merender bagian yang memiliki data.
  const renderMealSection = (title: string, meals: Array<{
    bahan: string;
    berat: string;
    urt: string;
    penukar: string;
    exmenu: string;
  }>) => {
    // Jika tidak ada data makanan untuk bagian ini, jangan render apa pun.
    if (!meals || meals.length === 0) {
      return null; 
    }

    return (
      <View className="mt-2">
        <Text className="text-gray-800 font-semibold text-base mb-2">{title}</Text>
        <View className="space-y-2">
          {meals.map((meal, index) => (
            <View key={`${title}-${index}`} className="flex-row items-center space-x-2 py-1">
              {/* Penyesuaian lebar kolom menggunakan Tailwind CSS untuk tampilan responsif. */}
              {/* Lebar disesuaikan agar semua kolom terlihat baik di layar. */}
              <Text className="w-[20%] flex text-gray-700">{meal.bahan}</Text>
              <Text className="w-[15%] text-center text-gray-700">{meal.berat}</Text>
              <Text className="w-[15%] text-center text-gray-700">{meal.urt}</Text>
              <Text className="w-[15%] text-center text-gray-700">{meal.penukar}</Text>
              <Text className="w-[35%] text-center text-gray-700">{meal.exmenu}</Text> 
            </View>
          ))}
        </View>
      </View>
    );
  };

  // Fungsi utama untuk merender keseluruhan rencana diet yang ditemukan.
  const renderDietPlan = () => {
    // Ambil rencana diet spesifik berdasarkan penyakit dan kalori terdekat yang telah diidentifikasi.
    const plan = dietPlansForDisease?.[closestCalories];
    
    // Jika tidak ada rencana diet yang ditemukan untuk kombinasi penyakit dan kalori terdekat.
    if (!plan) {
      return (
        <View className="bg-white rounded-2xl p-6 shadow-lg mb-3">
          <Text className="text-lg text-center text-gray-800">
            Maaf, tidak ada rekomendasi diet yang tersedia untuk penyakit "{disease}" dengan perkiraan kalori {numericCalories} kcal.
            {/* Tampilkan kalori terdekat yang dicari jika bukan 0, untuk informasi tambahan. */}
            {closestCalories !== 0 && ` (Mencari di sekitar ${closestCalories} kcal)`}
          </Text>
        </View>
      );
    }

    // Jika rencana diet ditemukan, tampilkan detailnya.
    return (
      <View className="bg-white rounded-2xl p-6 shadow-lg mb-3">
        <Text className="text-xl font-bold text-center text-gray-800 mb-6">
          {/* Gunakan judul dari data, atau judul default jika tidak ada. */}
          {plan.title || `Rencana Diet untuk ${disease}`} 
        </Text>
        
        {/* ScrollView horizontal untuk tabel agar bisa digeser jika lebar konten melebihi layar. */}
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true} className="mb-2">
          {/* min-w disesuaikan agar semua kolom header tabel terlihat. */}
          <View className="min-w-[700px]"> 
            {/* ScrollView vertikal untuk konten tabel jika melebihi tinggi yang ditentukan. */}
            <ScrollView showsVerticalScrollIndicator={true} className="max-h-[510px]">
              <View className="border-b border-gray-200 pb-2 mb-4">
                <View className="flex-row items-center space-x-2">
                  {/* Header kolom tabel, lebar disesuaikan agar konsisten dengan renderMealSection. */}
                  <Text className="w-[20%] flex font-bold text-gray-800">Bahan</Text>
                  <Text className="w-[15%] text-center font-bold text-gray-800">Berat</Text>
                  <Text className="w-[15%] text-center font-bold text-gray-800">URT</Text>
                  <Text className="w-[15%] text-center font-bold text-gray-800">Penukar</Text>
                  <Text className="w-[35%] text-center font-bold text-gray-800">Contoh Menu</Text>
                </View>
              </View>

              {/* Memanggil renderMealSection untuk setiap waktu makan, 
                  memastikan 'plan.meals' dan sub-propertinya ada. */}
              {plan.meals && plan.meals.pagi && renderMealSection("Pagi", plan.meals.pagi)}
              {plan.meals && plan.meals.selinganPagi && renderMealSection("Selingan Pagi", plan.meals.selinganPagi)}
              {plan.meals && plan.meals.siang && renderMealSection("Siang", plan.meals.siang)}
              {plan.meals && plan.meals.selinganSiang && renderMealSection("Selingan Siang", plan.meals.selinganSiang)}
              {plan.meals && plan.meals.malam && renderMealSection("Malam", plan.meals.malam)}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView className='bg-primary-400 h-full p-4'>
      <View className="flex-1 bg-primary-500 items-center-center rounded-xl mt-5">
        {/* Header Aplikasi */}
        <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-6">
          {/* Tombol Panah: Kembali ke halaman sebelumnya */}
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" className="ml-2" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-rubik-bold ml-4">DIET RECOMENDATIONS</Text>
          {/* Tombol Silang: Kembali ke halaman utama */}
          <TouchableOpacity onPress={() => router.replace('/')} className="ml-auto">
            <Text className="text-3xl text-white mr-4">×</Text>
          </TouchableOpacity>
        </View>

        {/* Konfigurasi Header Layar Expo Router */}
        <Stack.Screen
          options={{
            headerTitle: "DIET PLAN",
            headerStyle: { backgroundColor: '#40E0D0' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
            headerShadowVisible: false,
          }}
        />
        <View className="p-2">
          {/* Memanggil fungsi untuk merender rencana diet */}
          {renderDietPlan()}
          
          {/* Tombol untuk menghitung ulang diet plan */}
          <View className="flex-row justify-between space-x-4 mt-1 mb-6">
            <TouchableOpacity 
              className="flex-1 bg-white rounded-full py-4 items-center shadow-sm"
              onPress={() => router.back()} // Mengarahkan kembali ke halaman DietPlan.tsx untuk perhitungan ulang
            >
              <Text className="text-gray-800 font-semibold">HITUNG ULANG</Text>
            </TouchableOpacity>      
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DietRecommendations;

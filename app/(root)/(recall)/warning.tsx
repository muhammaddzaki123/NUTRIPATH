import { getNutritionists } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { saveFoodRecall, shareFoodRecallInChat } from '@/lib/recall-service';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type FoodWarning = {
  name: string;
  amount: string;
  unit: string;
  mealLabel: string;
  mealTime: string;
};

export default function WarningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useGlobalContext();
  
  let warningFoods: FoodWarning[] = [];
  let timeWarnings: string[] = [];
  try {
    if (params.warningFoods) {
      warningFoods = JSON.parse(params.warningFoods as string);
    }
    if (params.timeWarnings) {
      timeWarnings = JSON.parse(params.timeWarnings as string);
    }
  } catch (error) {
    console.error('Error parsing warning params:', error);
  }

  const handleSaveAndConsult = async () => {
    try {
      if (!user) {
        router.push('/sign-in');
        return;
      }

      // --- PERUBAHAN UTAMA: Tambahkan timeWarnings ke data yang akan disimpan ---
      const recallData = {
        userId: user.$id,
        name: params.name as string,
        age: params.age as string,
        gender: params.gender as string,
        disease: params.disease as string,
        breakfast: JSON.parse(params.breakfast as string),
        lunch: JSON.parse(params.lunch as string),
        dinner: JSON.parse(params.dinner as string),
        warningFoods,
        timeWarnings, // <-- TAMBAHKAN INI
        status: 'pending' as const
      };

      const savedRecall = await saveFoodRecall(recallData);

      const nutritionists = await getNutritionists();
      const matchingNutritionist = nutritionists.find(n => 
        n.specialization.toLowerCase() === (params.disease as string).toLowerCase()
      );

      if (matchingNutritionist) {
        const chatId = `${user.$id}-${matchingNutritionist.$id}`;
        
        // Fungsi ini sekarang akan memiliki akses ke data recall yang lengkap (termasuk timeWarnings)
        await shareFoodRecallInChat(
          savedRecall.$id, // Menggunakan ID dari data yang baru disimpan
          chatId,
          user.$id,
          matchingNutritionist.$id,
          user.name || user.email.split('@')[0]
        );

        router.push(`/chat/${matchingNutritionist.$id}`);
      } else {
        router.push('/konsultasi');
      }
    } catch (error) {
      console.error('Error saving Food Record data:', error);
      Alert.alert('Error', 'Gagal menyimpan data Food Record');
    }
  };

  return (
    <SafeAreaView className='bg-primary-400 h-full p-4'>
      <View className="flex-1 bg-primary-500 rounded-xl mt-5 mb-10" >
        <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" className="ml-2" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-rubik-bold ml-4">PERINGATAN ASUPAN</Text>
          <TouchableOpacity onPress={() => router.replace('/')} className="ml-auto">
            <Text className="text-3xl text-white mr-4">×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6">
          <View className="mb-8">
            <Text className="text-white text-2xl font-rubik-semibold mb-4">
              Data Pasien:
            </Text>
            <View className="bg-white/10 rounded-3xl p-6">
              <View className="space-y-3">
                <Text className="text-white text-lg font-rubik">
                  Nama: {params.name}
                </Text>
                <Text className="text-white text-lg font-rubik">
                  Usia: {params.age}
                </Text>
                <Text className="text-white text-lg font-rubik">
                  Jenis Kelamin: {params.gender}
                </Text>
                <Text className="text-white text-lg font-rubik">
                  Riwayat Penyakit: {params.disease}
                </Text>
              </View>
            </View>
          </View>
          
          {timeWarnings.length > 0 && (
            <View className="mb-8">
              <Text className="text-white text-2xl font-rubik-semibold mb-4">
                Peringatan Waktu Makan:
              </Text>
              <View className="bg-yellow-500/20 rounded-3xl p-6">
                  <View className="space-y-3">
                    {timeWarnings.map((warning, index) => (
                      <View key={`time-${index}`} className="flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-yellow-400 mr-3" />
                        <Text className="text-white text-lg font-rubik flex-1">
                          {warning}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
            </View>
          )}

          <View className="mb-8">
            <Text className="text-white text-2xl font-rubik-semibold mb-4">
              Makanan yang Melebihi Batas:
            </Text>
            {warningFoods.length > 0 ? (
              <View className="bg-red-500/20 rounded-3xl p-6">
                <View className="space-y-3">
                  {warningFoods.map((food, index) => (
                    <View key={`food-${index}`} className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-red-400 mr-3" />
                      <Text className="text-white text-lg font-rubik flex-1">
                        {food.name} ({food.mealLabel} - {food.mealTime}): {food.amount} {food.unit}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View className="bg-white/10 rounded-3xl p-6">
                <Text className="text-white text-lg font-rubik text-center">
                  Tidak ada makanan yang melebihi batas konsumsi.
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity 
            className="bg-white rounded-full py-4 px-6 mb-6 mx-4"
            onPress={handleSaveAndConsult}
          >
            <Text className="text-primary-500 text-xl font-rubik-bold text-center">
              KONSULTASI DENGAN AHLI GIZI
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

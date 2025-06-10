import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getNutritionists } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { saveFoodRecall, shareFoodRecallInChat } from '@/lib/recall-service';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type FoodWarning = {
  name: string;
  amount: string;
  unit: string;
};

export default function WarningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useGlobalContext();
  
  let warningFoods: FoodWarning[] = [];
  try {
    if (params.warningFoods) {
      warningFoods = JSON.parse(params.warningFoods as string);
    }
  } catch (error) {
    console.error('Error parsing warning foods:', error);
  }

  const handleSaveAndConsult = async () => {
    try {
      if (!user) {
        router.push('/sign-in');
        return;
      }

      // Save recall data
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
        status: 'pending' as const
      };

      const savedRecall = await saveFoodRecall(recallData);

      // Find available nutritionist based on disease
      const nutritionists = await getNutritionists();
      const matchingNutritionist = nutritionists.find(n => 
        n.specialization.toLowerCase() === params.disease
      );

      if (matchingNutritionist) {
        // Create chat ID
        const chatId = `${user.$id}-${matchingNutritionist.$id}`;
        
        // Share recall data in chat
        await shareFoodRecallInChat(
          savedRecall.$id,
          chatId,
          user.$id,
          matchingNutritionist.$id,
          user.name || user.email.split('@')[0]
        );

        // Navigate to chat
        router.push(`/chat/${matchingNutritionist.$id}`);
      } else {
        // If no matching nutritionist, go to nutritionist list
        router.push('/konsultasi');
      }
    } catch (error) {
      console.error('Error saving recall data:', error);
      Alert.alert('Error', 'Gagal menyimpan data recall');
    }
  };

  return (
    <SafeAreaView className='bg-primary-400 h-full p-4'>
      <View className="flex-1 bg-primary-500 rounded-xl mt-5 mb-10" >
        {/* Header */}
        <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" className="ml-2" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-rubik-bold ml-4">PERINGATAN ASUPAN</Text>
          <TouchableOpacity onPress={() => router.back()} className="ml-auto">
            <Text className="text-3xl text-white mr-4">×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6">
          {/* Patient Data Section */}
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

          {/* Warning Foods Section */}
          <View className="mb-8">
            <Text className="text-white text-2xl font-rubik-semibold mb-4">
              Makanan yang Melebihi Batas:
            </Text>
            {warningFoods.length > 0 ? (
              <View className="bg-white/10 rounded-3xl p-6">
                <View className="space-y-3">
                  {warningFoods.map((food, index) => (
                    <View key={index} className="flex-row items-center">
                      <View className="w-2 h-2 rounded-full bg-red-500 mr-3" />
                      <Text className="text-white text-lg font-rubik">
                        {food.name}: {food.amount} {food.unit}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              <View className="bg-white/10 rounded-3xl p-6">
                <Text className="text-white text-lg font-rubik text-center">
                  Tidak ada makanan yang melebihi batas konsumsi
                </Text>
              </View>
            )}
          </View>

          {/* Consultation Button */}
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

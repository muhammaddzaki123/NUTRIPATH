import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getNutritionists } from '../../../lib/appwrite';
import { useGlobalContext } from '../../../lib/global-provider';
import { saveFoodRecall, shareFoodRecallInChat } from '../../../lib/recall-service';

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
        warningFoods
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
          matchingNutritionist.$id
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
        <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={"white"} className='ml-2' />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">WARNING</Text>
          <TouchableOpacity onPress={() => router.back()} className="ml-auto">
            <Text className="text-3xl text-white mr-4">×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-4 py-2">
          <Text className="text-red-500 text-2xl font-bold text-center mb-6">
            WARNING
          </Text>

          {warningFoods.length > 0 ? (
            <View className="space-y-3">
              {warningFoods.map((food, index) => (
                <View key={index} className="bg-white rounded-xl p-4">
                  <Text className="text-red-500 text-base">
                    {`${food.name} ${food.amount} ${food.unit}`}
                  </Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-white rounded-xl p-4">
              <Text className="text-center text-gray-600">
                Tidak ada makanan yang melebihi batas konsumsi
              </Text>
            </View>
          )}

          <TouchableOpacity 
            className="bg-white rounded-full py-3 px-6 mt-6 mb-4 items-center"
            onPress={handleSaveAndConsult}
          >
            <Text className="text-[#40E0D0] font-semibold text-lg">
              YUK KONSUL
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

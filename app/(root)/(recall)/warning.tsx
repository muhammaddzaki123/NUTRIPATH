import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

type FoodWarning = {
  name: string;
  amount: string;
  unit: string;
};

export default function WarningScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  let warningFoods: FoodWarning[] = [];
  try {
    if (params.warningFoods) {
      warningFoods = JSON.parse(params.warningFoods as string);
    }
  } catch (error) {
    console.error('Error parsing warning foods:', error);
  }

  return (
  <SafeAreaView className='bg-primary-400 h-full p-4'>
    <View className="flex-1 bg-primary-500 rounded-xl mt-5 mb-10" >
      {/* Custom Header */}
       {/* Header */}
      <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={"white"} className='ml-2' />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold  ml-4 ">WARNING</Text>
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
          onPress={() => router.push('/konsultasi')}
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

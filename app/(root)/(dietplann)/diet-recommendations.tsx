import { DIET_PLANS } from '@/constants/diet-config';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const DietRecommendations = () => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { disease, calories } = params;
  
  // Round to nearest 100 calories
  const roundedCalories = Math.round(Number(calories) / 100) * 100;
  
  // Find closest available calorie plan
  const availableCalories = Object.keys(DIET_PLANS[disease as keyof typeof DIET_PLANS] || {}).map(Number);
  const closestCalories = availableCalories.reduce((prev, curr) => {
    return Math.abs(curr - roundedCalories) < Math.abs(prev - roundedCalories) ? curr : prev;
  }, availableCalories[0] || 1700);

  const renderMealSection = (title: string, meals: Array<{
    bahan: string;
    berat: string;
    urt: string;
    penukar: string;
    exmenu: string;
  }>) => (
    <View className="mt-2">
      <Text className="text-gray-800 font-semibold text-base mb-2">{title}</Text>
      <View className="space-y-2">
        {meals.map((meal, index) => (
          <View key={`${title}-${index}`} className="flex-row items-center space-x-2 py-1">
            <Text className="w-24 flex text-gray-700">{meal.bahan}</Text>
            <Text className="w-24 text-center text-gray-700">{meal.berat}</Text>
            <Text className="w-24 text-center text-gray-700">{meal.urt}</Text>
            <Text className="w-24 text-center text-gray-700">{meal.penukar}</Text>
            <Text className="w-30 text-center text-gray-700">{meal.exmenu}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderDietPlan = () => {
    const plan = DIET_PLANS[disease as keyof typeof DIET_PLANS]?.[closestCalories];
    
    if (!plan) {
      return (
        <View className="bg-white rounded-2xl p-6 shadow-lg">
          <Text className="text-lg text-center text-gray-800">
            Diet plan tidak tersedia untuk kondisi ini.
          </Text>
        </View>
      );
    }

    return (
      <View className="bg-white rounded-2xl p-6 shadow-lg mb-3">
        <Text className="text-xl font-bold text-center text-gray-800 mb-6">
          {plan.title}
        </Text>
        
        <ScrollView horizontal={true} showsHorizontalScrollIndicator={true} className="mb-2">
          <View className="min-w-[500px]">
            <ScrollView showsVerticalScrollIndicator={true} className="max-h-[510px]">
              <View className="border-b border-gray-200 pb-2 mb-4">
                <View className="flex-row items-center space-x-2">
                  <Text className="w-24 flex font-bold text-gray-800">Bahan</Text>
                  <Text className="w-24 text-center font-bold text-gray-800">Berat</Text>
                  <Text className="w-24 text-center font-bold text-gray-800">URT</Text>
                  <Text className="w-24 text-center font-bold text-gray-800">Penukar</Text>
                  <Text className="w-30 text-center font-bold text-gray-800">Contoh Menu</Text>
                </View>
              </View>

              {plan.meals.pagi && renderMealSection("Pagi", plan.meals.pagi)}
              {plan.meals.selinganPagi && renderMealSection("Selingan Pagi", plan.meals.selinganPagi)}
              {plan.meals.siang && renderMealSection("Siang", plan.meals.siang)}
              {plan.meals.selinganSiang && renderMealSection("Selingan Siang", plan.meals.selinganSiang)}
              {plan.meals.malam && renderMealSection("Malam", plan.meals.malam)}
            </ScrollView>
          </View>
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView className='bg-primary-400 h-full p-4'>
        {/* Header */}
        <View className="flex-1 bg-primary-500 items-center-center rounded-xl mt-5">
      {/* Header */}
      <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={"white"} className='ml-2' />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold  ml-4 ">DIET PLAN</Text>
        <TouchableOpacity onPress={() => router.back()} className="ml-auto">
          <Text className="text-3xl text-white mr-4">×</Text>
        </TouchableOpacity>
      </View>

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
        {renderDietPlan()}
        
        <View className="flex-row justify-between space-x-4 mt-1 mb-6">
          <TouchableOpacity 
            className="flex-1 bg-white rounded-full py-4 items-center shadow-sm"
            onPress={() => router.back()}
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

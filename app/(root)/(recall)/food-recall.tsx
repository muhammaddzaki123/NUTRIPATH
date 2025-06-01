import { foodRestrictions, urtOptions } from '@/constants/food-restrictions';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type FoodInput = {
  name: string;
  amount: string;
  unit: string;
};

type MealType = 'breakfast' | 'lunch' | 'dinner';

type MealData = {
  carbs: FoodInput;
  others: FoodInput[];
  snacks: FoodInput[];
};

type MealsState = {
  [key in MealType]: MealData;
};

const FoodInputRow = ({ 
  value,
  onChange,
  placeholder = "Nama makanan"
}: { 
  value: FoodInput;
  onChange: (data: FoodInput) => void;
  placeholder?: string;
}) => (
  <View className="mb-4">
    <View className="flex-row items-center space-x-2">
      <TextInput
        className="w-32 bg-white rounded-xl p-3 text-base"
        value={value.name}
        onChangeText={(text: string) => onChange({ ...value, name: text })}
        placeholder={placeholder}
      />
      <TextInput
        className="w-20 bg-white rounded-xl p-3 text-base ml-1"
        value={value.amount}
        onChangeText={(text: string) => onChange({ ...value, amount: text })}
        placeholder="Jumlah"
        keyboardType="numeric"
      />
      <View className="w-35 bg-white rounded-xl overflow-hidden ml-1">
        <Picker
          selectedValue={value.unit}
          onValueChange={(text: string) => onChange({ ...value, unit: text })}
          style={{ height: 48,
            paddingHorizontal: 10,
            minWidth: 100,
             backgroundColor: 'white' }}
        >
          <Picker.Item label="URT" value="" />
          {urtOptions.map((unit: string) => 
            <Picker.Item 
              key={unit} 
              label={unit} 
              value={unit}
            />
          )}
        </Picker>
      </View>
    </View>
  </View>
);

export default function FoodRecallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const disease = params.disease as string;
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [meals, setMeals] = useState<MealsState>({
    breakfast: {
      carbs: { name: '', amount: '', unit: '' },
      others: Array(4).fill({ name: '', amount: '', unit: '' }),
      snacks: Array(4).fill({ name: '', amount: '', unit: '' })
    },
    lunch: {
      carbs: { name: '', amount: '', unit: '' },
      others: Array(4).fill({ name: '', amount: '', unit: '' }),
      snacks: Array(4).fill({ name: '', amount: '', unit: '' })
    },
    dinner: {
      carbs: { name: '', amount: '', unit: '' },
      others: Array(4).fill({ name: '', amount: '', unit: '' }),
      snacks: Array(4).fill({ name: '', amount: '', unit: '' })
    }
  });

  const updateFood = (
    type: MealType,
    category: keyof MealData,
    index: number,
    data: FoodInput
  ) => {
    setMeals(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [category]: category === 'carbs' 
          ? data 
          : prev[type][category].map((item: FoodInput, i: number) => 
              i === index ? data : item
            )
      }
    }));
  };

  const handleNext = () => {
    if (mealType === 'breakfast') {
      setMealType('lunch');
    } else if (mealType === 'lunch') {
      setMealType('dinner');
    } else {
      const allFoods: FoodInput[] = [];
      ['breakfast', 'lunch', 'dinner'].forEach((mealTime) => {
        const meal = meals[mealTime as MealType];
        if (meal.carbs.name) {
          allFoods.push(meal.carbs);
        }
        meal.others.forEach(food => {
          if (food.name) {
            allFoods.push(food);
          }
        });
        meal.snacks.forEach(food => {
          if (food.name) {
            allFoods.push(food);
          }
        });
      });

      const restrictions = foodRestrictions[disease] || [];
      const warningFoods = allFoods.filter(food => {
        const restriction = restrictions.find(r => 
          r.name.toLowerCase() === food.name.toLowerCase()
        );
        return restriction && parseInt(food.amount) > restriction.maxAmount;
      });

      router.push({
        pathname: '/warning',
        params: { 
          warningFoods: JSON.stringify(warningFoods)
        }
      });
    }
  };

  const handleBack = () => {
    if (mealType === 'dinner') {
      setMealType('lunch');
    } else if (mealType === 'lunch') {
      setMealType('breakfast');
    } else {
      router.back();
    }
  };

  const currentMeal = meals[mealType];

  return (
  <SafeAreaView className='bg-primary-400 h-full p-4'>
    <View className="flex-1 bg-primary-500 rounded-xl mt-5 mb-10" >
      {/* Custom Header */}
       {/* Header */}
      <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={"white"} className='ml-2' />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold  ml-4 ">RECALL</Text>
        <TouchableOpacity onPress={() => router.back()} className="ml-auto">
          <Text className="text-3xl text-white mr-4">×</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6 pb-5 mb-5 " >
        <View className="space-y-8">
          <Text className="text-white text-2xl font-semibold">
            {mealType === 'breakfast' ? 'Makan Pagi' :
             mealType === 'lunch' ? 'Makan Siang' : 'Makan Malam'}
          </Text>

          <View className="space-y-8">
            <View>
              <Text className="text-white text-lg font-medium mb-2">Nasi/karbohidrat :</Text>
              <FoodInputRow
                value={currentMeal.carbs}
                onChange={(data) => updateFood(mealType, 'carbs', 0, data)}
              />
            </View>

            <View>
              <Text className="text-white text-lg font-medium mb-2">Lainnya :</Text>
              {currentMeal.others.map((food: FoodInput, index: number) => (
                <FoodInputRow
                  key={`other-${index}`}
                  value={food}
                  onChange={(data) => updateFood(mealType, 'others', index, data)}
                />
              ))}
            </View>

            <View>
              <Text className="text-white text-lg font-medium mb-2">Selingan :</Text>
              {currentMeal.snacks.map((food: FoodInput, index: number) => (
                <FoodInputRow
                  key={`snack-${index}`}
                  value={food}
                  onChange={(data) => updateFood(mealType, 'snacks', index, data)}
                />
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity 
          className="bg-white rounded-full py-4 px-6 mb-5  items-center shadow-lg"
          onPress={handleNext}
        >
          <Text className="text-[#40E0D0] font-semibold text-lg">
            {mealType === 'dinner' ? 'CEK ASUPAN' : 'NEXT'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
    </SafeAreaView>
  );
}

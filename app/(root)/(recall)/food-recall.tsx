import { foodRestrictions, urtOptions } from '@/constants/food-restrictions';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
    <View className="flex-row items-center space-x-3">
      {/* Nama Makanan */}
      <View className="flex-1 w-[96px]">
        <TextInput
          className="bg-white rounded-2xl px-4 py-3.5 text-base shadow-sm"
          style={{ elevation: 2 }}
          value={value.name}
          onChangeText={(text: string) => onChange({ ...value, name: text })}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Jumlah */}
      <View >
        <TextInput
          className="bg-white rounded-2xl px-4 py-3.5 text-base text-center shadow-sm ml-1"
          style={{ elevation: 2 }}
          value={value.amount}
          onChangeText={(text: string) => onChange({ ...value, amount: text })}
          placeholder="Jumlah"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />
      </View>

      {/* URT Picker */}
      <View className="w-[130px]">
        <View className="bg-white rounded-2xl shadow-sm overflow-hidden ml-1"
              style={{ elevation: 2 }}>
          <Picker
            selectedValue={value.unit}
            onValueChange={(text: string) => onChange({ ...value, unit: text })}
            style={{ 
              height: 48,
              width: '100%',
              backgroundColor: 'white',
            }}
          >
            <Picker.Item 
              label="Pilih URT" 
              value="" 
              style={{
                fontSize: 14,
                color: '#9CA3AF'
              }}
            />
            {urtOptions.map((unit: string) => 
              <Picker.Item 
                key={unit} 
                label={unit} 
                value={unit}
                style={{
                  fontSize: 14
                }}
              />
            )}
          </Picker>
        </View>
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

      // Get user data from previous screen params
      const { name, age, gender } = params;

      router.push({
        pathname: '/warning',
        params: { 
          warningFoods: JSON.stringify(warningFoods),
          name,
          age,
          gender,
          disease,
          breakfast: JSON.stringify(meals.breakfast),
          lunch: JSON.stringify(meals.lunch),
          dinner: JSON.stringify(meals.dinner)
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
        {/* Header */}
        <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-4">
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="arrow-back" size={24} color={"white"} className='ml-2' />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">FOOD RECORD</Text>
          <TouchableOpacity onPress={() => router.back()} className="ml-auto">
            <Text className="text-3xl text-white mr-4">×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 pb-5 mb-5">
          <View className="space-y-6">
            {/* Meal Type Header */}
            <View className="bg-white/10 rounded-2xl mb-4">
              <Text className="text-white text-2xl font-rubik-bold text-center">
                {mealType === 'breakfast' ? 'Makan Pagi' :
                 mealType === 'lunch' ? 'Makan Siang' : 'Makan Malam'}
              </Text>
            </View>

            <View className="space-y-6">
              {/* Carbs Section */}
              <View className="bg-white/10 rounded-2xl p-4 mb-2">
                <Text className="text-white text-lg font-rubik-semibold mb-4">
                  Nasi/Karbohidrat
                </Text>
                <FoodInputRow
                  value={currentMeal.carbs}
                  onChange={(data) => updateFood(mealType, 'carbs', 0, data)}
                  placeholder="Contoh: Nasi Putih"
                />
              </View>

              {/* Main Dishes Section */}
              <View className="bg-white/10 rounded-2xl p-4 mb-2">
                <Text className="text-white text-lg font-rubik-semibold mb-4">
                  Lauk Pauk
                </Text>
                {currentMeal.others.map((food: FoodInput, index: number) => (
                  <FoodInputRow
                    key={`other-${index}`}
                    value={food}
                    onChange={(data) => updateFood(mealType, 'others', index, data)}
                    placeholder="Contoh: Ayam Goreng"
                  />
                ))}
              </View>

              {/* Snacks Section */}
              <View className="bg-white/10 rounded-2xl p-4">
                <Text className="text-white text-lg font-rubik-semibold mb-4">
                  Makanan Selingan
                </Text>
                {currentMeal.snacks.map((food: FoodInput, index: number) => (
                  <FoodInputRow
                    key={`snack-${index}`}
                    value={food}
                    onChange={(data) => updateFood(mealType, 'snacks', index, data)}
                    placeholder="Contoh: Buah Apel"
                  />
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity 
            className="bg-white rounded-full py-4 px-6 mb-5 items-center shadow-lg"
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

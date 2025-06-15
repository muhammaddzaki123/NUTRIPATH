import { foodRestrictions, urtOptions } from '@/constants/food-restrictions';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Definisi tipe data tidak berubah
type FoodInput = {
  name: string;
  amount: string;
  unit: string;
};

type MealType = 'breakfast' | 'lunch' | 'dinner';

type MealData = {
  carbs: FoodInput[];
  others: FoodInput[];
  snacks: FoodInput[];
};

type MealsState = {
  [key in MealType]: MealData;
};

/**
 * Komponen untuk satu baris input makanan.
 * PERUBAHAN: Diterapkan style untuk memperbaiki teks yang terpotong pada Picker di Android.
 */
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
    <View className="flex-row items-center">
      {/* Nama Makanan */}
      <View className="flex-1">
        <TextInput
          className="bg-white rounded-2xl px-4 py-3.5 text-base shadow-sm text-black"
          style={{ elevation: 2 }}
          value={value.name}
          onChangeText={(text: string) => onChange({ ...value, name: text })}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
        />
      </View>

      {/* Jumlah (Dipersempit) */}
      <View className="w-16 ml-2">
        <TextInput
          className="bg-white rounded-2xl px-4 py-3.5 text-base text-center shadow-sm text-black"
          style={{ elevation: 2 }}
          value={value.amount}
          onChangeText={(text: string) => onChange({ ...value, amount: text })}
          placeholder="Jumlah"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
        />
      </View>

      {/* URT Picker */}
      <View className="w-[120px] ml-2">
        {/* WADAH PICKER */}
        <View 
          className="bg-white rounded-2xl shadow-sm overflow-hidden h-12 flex justify-center" 
          style={{ elevation: 2 }}
        >
          {/* PICKER: Diberi margin vertikal negatif untuk memperbaiki rendering di Android */}
          <Picker
            selectedValue={value.unit}
            onValueChange={(text: string) => onChange({ ...value, unit: text })}
            mode="dropdown" // Mode eksplisit untuk konsistensi
            style={{ 
              width: '100%', 
              backgroundColor: 'transparent', 
              color: 'black',
              marginVertical: -12, // Trik untuk memperbaiki pemotongan teks
            }}
            dropdownIconColor="black"
          >
            <Picker.Item label="Pilih URT" value="" style={{ fontSize: 14, color: 'black' }} />
            {urtOptions.map((unit: string) =>
              <Picker.Item key={unit} label={unit} value={unit} style={{ fontSize: 14, color: 'black' }} />
            )}
          </Picker>
        </View>
      </View>
    </View>
  </View>
);


/**
 * Komponen layar utama untuk mencatat makanan (Food Recall).
 */
export default function FoodRecallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const disease = params.disease as string;
  const [mealType, setMealType] = useState<MealType>('breakfast');

  const initialMealState: MealData = {
    carbs: [{ name: '', amount: '', unit: '' }],
    others: [{ name: '', amount: '', unit: '' }],
    snacks: [{ name: '', amount: '', unit: '' }]
  };

  const [meals, setMeals] = useState<MealsState>({
    breakfast: JSON.parse(JSON.stringify(initialMealState)),
    lunch: JSON.parse(JSON.stringify(initialMealState)),
    dinner: JSON.parse(JSON.stringify(initialMealState))
  });

  const updateFood = (type: MealType, category: keyof MealData, index: number, data: FoodInput) => {
    setMeals(prev => {
      const updatedCategory = [...prev[type][category]];
      updatedCategory[index] = data;

      return {
        ...prev,
        [type]: {
          ...prev[type],
          [category]: updatedCategory,
        }
      };
    });
  };
  
  const addRow = (type: MealType, category: keyof MealData) => {
    setMeals(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [category]: [...prev[type][category], { name: '', amount: '', unit: '' }]
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
        meal.carbs.forEach(food => { if (food.name) allFoods.push(food); });
        meal.others.forEach(food => { if (food.name) allFoods.push(food); });
        meal.snacks.forEach(food => { if (food.name) allFoods.push(food); });
      });

      const restrictions = foodRestrictions[disease] || [];
      const warningFoods = allFoods.filter(food => {
        const restriction = restrictions.find(r => r.name.toLowerCase() === food.name.toLowerCase());
        return restriction && parseInt(food.amount) > restriction.maxAmount;
      });

      const { name, age, gender } = params;

      router.push({
        pathname: '/warning',
        params: {
          warningFoods: JSON.stringify(warningFoods),
          name, age, gender, disease,
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

  const AddButton = ({ onPress, label }: { onPress: () => void; label: string }) => (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center justify-center bg-white/20 rounded-lg p-2 mt-2"
    >
      <Ionicons name="add-circle-outline" size={22} color="white" />
      <Text className="text-white ml-2 font-semibold">{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className='bg-primary-400 h-full p-4'>
      <View className="flex-1 bg-primary-500 rounded-xl mt-5 mb-10" >
        {/* Header */}
        <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-4">
          <TouchableOpacity onPress={handleBack} className="p-2">
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-2">FOOD RECORD</Text>
          <TouchableOpacity onPress={() => router.replace('/')} className="ml-auto p-2">
            <Text className="text-3xl text-white mr-2">×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1 px-6 pb-5 mb-5" showsVerticalScrollIndicator={false}>
          <View className="space-y-6">
            {/* Header Jenis Makanan */}
            <View className="bg-white/10 rounded-2xl mb-4 py-2">
              <Text className="text-white text-2xl font-rubik-bold text-center">
                {mealType === 'breakfast' ? 'Makan Pagi' :
                  mealType === 'lunch' ? 'Makan Siang' : 'Makan Malam'}
              </Text>
            </View>

            <View className="space-y-6">
              {/* Bagian Karbohidrat */}
              <View className="bg-white/10 rounded-2xl p-4 mb-2">
                <Text className="text-white text-lg font-rubik-semibold mb-4">Nasi/Karbohidrat</Text>
                {currentMeal.carbs.map((food, index) => (
                  <FoodInputRow
                    key={`carb-${index}`}
                    value={food}
                    onChange={(data) => updateFood(mealType, 'carbs', index, data)}
                    placeholder="Contoh: Nasi Putih"
                  />
                ))}
                <AddButton onPress={() => addRow(mealType, 'carbs')} label="Tambah Karbohidrat" />
              </View>

              {/* Bagian Lauk Pauk */}
              <View className="bg-white/10 rounded-2xl p-4 mb-2">
                <Text className="text-white text-lg font-rubik-semibold mb-4">Lauk Pauk</Text>
                {currentMeal.others.map((food, index) => (
                  <FoodInputRow
                    key={`other-${index}`}
                    value={food}
                    onChange={(data) => updateFood(mealType, 'others', index, data)}
                    placeholder="Contoh: Ayam Goreng"
                  />
                ))}
                <AddButton onPress={() => addRow(mealType, 'others')} label="Tambah Lauk Pauk" />
              </View>

              {/* Bagian Makanan Selingan */}
              <View className="bg-white/10 rounded-2xl p-4">
                <Text className="text-white text-lg font-rubik-semibold mb-4">Makanan Selingan</Text>
                {currentMeal.snacks.map((food, index) => (
                  <FoodInputRow
                    key={`snack-${index}`}
                    value={food}
                    onChange={(data) => updateFood(mealType, 'snacks', index, data)}
                    placeholder="Contoh: Buah Apel"
                  />
                ))}
                <AddButton onPress={() => addRow(mealType, 'snacks')} label="Tambah Selingan" />
              </View>
            </View>
          </View>

          {/* Tombol Aksi Utama */}
          <TouchableOpacity
            className="bg-white rounded-full py-4 px-6 my-5 items-center shadow-lg"
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

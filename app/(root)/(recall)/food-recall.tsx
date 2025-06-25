import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { foodRestrictions, urtOptions } from '../../../constants/food-restrictions';

// Update tipe data untuk menyertakan waktu makan
type FoodInput = {
  name: string;
  amount: string;
  unit: string;
};

// Types for meal data
type MealType = 'breakfast' | 'lunch' | 'dinner';
type MealLabel = 'Sarapan' | 'Makan Siang' | 'Makan Malam';

// Types for food data
interface EnhancedFoodInput extends FoodInput {
  mealType: MealType;
  mealLabel: MealLabel;
  mealTime: string;
}

interface WarningFoodInput extends EnhancedFoodInput {
  maxAllowed: number;
  warningMessage: string;
}

interface MealData {
  carbs: FoodInput[];
  others: FoodInput[];
  snacks: FoodInput[];
  mealTime: Date | null;
  snackTime: Date | null; // Penambahan untuk waktu selingan
}

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
    <View className="flex-row items-center">
      {/* Nama Makanan */}
      <View className="flex-1">
        <TextInput
          className="bg-white rounded-2xl px-4 h-12 text-base shadow-sm text-black"
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
          className="bg-white rounded-2xl px-4 h-12 text-base text-center shadow-sm text-black"
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
        <View 
          className="bg-white rounded-2xl shadow-sm overflow-hidden h-12 flex justify-center" 
          style={{ elevation: 2 }}
        >
          <Picker
            selectedValue={value.unit}
            onValueChange={(text: string) => onChange({ ...value, unit: text })}
            mode="dropdown"
            style={{ 
              width: '100%', 
              backgroundColor: 'transparent', 
              color: 'black',
              marginVertical: -12,
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

// Komponen TimePicker baru
const MealTimePicker = ({
  mealTime,
  onTimeChange,
  mealLabel,
}: {
  mealTime: Date | null;
  onTimeChange: (date: Date | null) => void;
  mealLabel: string;
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) {
      // Set only the time part, keep today's date
      const now = new Date();
      selectedDate.setFullYear(now.getFullYear());
      selectedDate.setMonth(now.getMonth());
      selectedDate.setDate(now.getDate());
      onTimeChange(selectedDate);
    }
  };

  const getTimeString = (date: Date | null) => {
    if (!date) return 'Pilih Waktu';
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <View className="mb-4">
      <Text className="text-white text-base mb-2 font-rubik-medium">
        Waktu {mealLabel}
      </Text>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="bg-white/20 rounded-xl p-3 flex-row items-center justify-between"
      >
        <Text className="text-white text-base">
          {getTimeString(mealTime)}
        </Text>
        <Ionicons name="time-outline" size={24} color="white" />
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={mealTime || new Date()}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
          minimumDate={new Date(0, 0, 0, 0, 0)} // Allow any time
          maximumDate={new Date(0, 0, 0, 23, 59)} // Allow any time
        />
      )}
    </View>
  );
};

export default function FoodRecallScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const disease = params.disease as string;
  const [mealType, setMealType] = useState<MealType>('breakfast');

  const initialMealState: MealData = {
    carbs: [{ name: '', amount: '', unit: '' }],
    others: [{ name: '', amount: '', unit: '' }],
    snacks: [{ name: '', amount: '', unit: '' }],
    mealTime: null,
    snackTime: null,
  };

  const [meals, setMeals] = useState<MealsState>({
    breakfast: JSON.parse(JSON.stringify(initialMealState)),
    lunch: JSON.parse(JSON.stringify(initialMealState)),
    dinner: JSON.parse(JSON.stringify(initialMealState))
  });

  const updateFood = (type: MealType, category: keyof Omit<MealData, 'mealTime' | 'snackTime'>, index: number, data: FoodInput) => {
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

  const updateMealTime = (type: MealType, time: Date | null) => {
    setMeals(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        mealTime: time
      }
    }));
  };
  
  const updateSnackTime = (type: MealType, time: Date | null) => {
    setMeals(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        snackTime: time,
      }
    }));
  };

  const addRow = (type: MealType, category: keyof Omit<MealData, 'mealTime' | 'snackTime'>) => {
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
      const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner'];
      const categories: Array<keyof Omit<MealData, 'mealTime' | 'snackTime'>> = ['carbs', 'others', 'snacks'];

      const restrictions = foodRestrictions[disease] || [];
      // First, associate each food with its meal type and time
      const foodsWithMealInfo: EnhancedFoodInput[] = mealTypes.flatMap(mealType => {
        const meal = meals[mealType];
        const mealLabel = mealType === 'breakfast' ? 'Sarapan' :
                         mealType === 'lunch' ? 'Makan Siang' : 'Makan Malam';
        return categories.flatMap(category => 
          meal[category]
            .filter(food => food.name.trim() !== '') // Only include foods with names
            .map(food => ({
              ...food,
              mealType,
              mealLabel,
              mealTime: meal.mealTime?.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }) || 'Waktu tidak diatur'
            }))
        );
      });

      // Then filter and transform warning foods
      const warningFoods: WarningFoodInput[] = foodsWithMealInfo
        .map(food => {
          const restriction = restrictions.find((r: { name: string; maxAmount: number; unit: string }) => 
            r.name.toLowerCase() === food.name.toLowerCase()
          );
          if (restriction && parseInt(food.amount) > restriction.maxAmount) {
            return {
              ...food,
              maxAllowed: restriction.maxAmount,
              warningMessage: `${food.name} (${food.mealLabel} - ${food.mealTime}): Melebihi batas ${restriction.maxAmount} ${restriction.unit}`
            };
          }
          return null;
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      const { name, age, gender } = params;

      const mealsWithTime = {
        breakfast: {
          ...meals.breakfast,
          mealTime: meals.breakfast.mealTime?.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) || null,
          snackTime: meals.breakfast.snackTime?.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) || null,
        },
        lunch: {
          ...meals.lunch,
          mealTime: meals.lunch.mealTime?.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) || null,
          snackTime: meals.lunch.snackTime?.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) || null,
        },
        dinner: {
          ...meals.dinner,
          mealTime: meals.dinner.mealTime?.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) || null,
          snackTime: meals.dinner.snackTime?.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }) || null,
        }
      };

      router.push({
        pathname: '/warning',
        params: {
          warningFoods: JSON.stringify(warningFoods),
          name, age, gender, disease,
          breakfast: JSON.stringify(mealsWithTime.breakfast),
          lunch: JSON.stringify(mealsWithTime.lunch),
          dinner: JSON.stringify(mealsWithTime.dinner)
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

            {/* Time Picker */}
            <MealTimePicker
              mealTime={currentMeal.mealTime}
              onTimeChange={(time) => updateMealTime(mealType, time)}
              mealLabel={mealType === 'breakfast' ? 'Sarapan' :
                        mealType === 'lunch' ? 'Makan Siang' : 'Makan Malam'}
            />

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
                <MealTimePicker
                  mealTime={currentMeal.snackTime}
                  onTimeChange={(time) => updateSnackTime(mealType, time)}
                  mealLabel={`Selingan ${
                    mealType === 'breakfast' ? 'Pagi' :
                    mealType === 'lunch' ? 'Siang' : 'Malam'
                  }`}
                />
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
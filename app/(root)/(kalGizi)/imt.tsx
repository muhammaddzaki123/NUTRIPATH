import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

const IMTCalculator = () => {
  const router = useRouter();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState('');

  const calculateIMT = () => {
    if (weight && height) {
      const weightInKg = parseFloat(weight);
      const heightInM = parseFloat(height) / 100; // Convert cm to m
      const imt = weightInKg / (heightInM * heightInM);
      let category = '';
      
      if (imt < 18.5) {
        category = 'Berat Badan Kurang';
      } else if (imt >= 18.5 && imt < 25) {
        category = 'Berat Badan Normal';
      } else if (imt >= 25 && imt < 30) {
        category = 'Berat Badan Berlebih';
      } else {
        category = 'Obesitas';
      }
      
      setResult(`IMT Anda: ${imt.toFixed(1)}\nKategori: ${category}`);
    }
  };

  return (
    <SafeAreaView className='bg-primary-400 h-full p-4'>
      <View className="flex-1 bg-primary-500 items-center-center rounded-xl mt-5">
        {/* Header */}
      <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={"white"} className='ml-2' />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold  ml-4 ">IMT KALKULATOR</Text>
        <TouchableOpacity onPress={() => router.back()} className="ml-auto">
          <Text className="text-3xl text-white mr-4">×</Text>
        </TouchableOpacity>
      </View>

        {/* Content */}
        <View className="flex-1 px-4">
          <View className="bg-[#5F9EA0] rounded-xl p-6 mt-4">
            <Text className="text-white text-lg mb-2">Berat Badan (kg) :</Text>
            <View className="bg-white rounded-xl flex-row items-center px-4 mb-4">
              <TextInput
                className="flex-1 py-3 text-lg"
                value={weight}
                onChangeText={setWeight}
                keyboardType="numeric"
                placeholder="Masukkan berat badan"
              />
              <Text className="text-gray-500">kg</Text>
            </View>

            <Text className="text-white text-lg mb-2">Tinggi Badan (cm) :</Text>
            <View className="bg-white rounded-xl flex-row items-center px-4 mb-4">
              <TextInput
                className="flex-1 py-3 text-lg"
                value={height}
                onChangeText={setHeight}
                keyboardType="numeric"
                placeholder="Masukkan tinggi badan"
              />
              <Text className="text-gray-500">cm</Text>
            </View>

            <Text className="text-white text-lg mb-2">Result :</Text>
            <View className="bg-white rounded-xl p-4 mb-4 min-h-[100]">
              <Text className="text-lg">{result}</Text>
            </View>

            <TouchableOpacity 
              className="bg-white rounded-xl p-4"
              onPress={calculateIMT}
            >
              <Text className="text-center text-lg font-semibold">HITUNG</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default IMTCalculator;

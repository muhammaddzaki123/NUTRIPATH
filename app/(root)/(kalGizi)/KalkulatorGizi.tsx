import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';

const KalkulatorGizi = () => {
  const router = useRouter();

  return (
    <SafeAreaView className='bg-primary-400 h-full p-4'>
      <View className="flex-1 bg-primary-500 items-center-center rounded-xl mt-5">
        {/* Header */}
      <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={"white"} className='ml-2' />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold  ml-4 ">KALKULATOR GIZI</Text>
        <TouchableOpacity onPress={() => router.back()} className="ml-auto">
          <Text className="text-3xl text-white mr-4">×</Text>
        </TouchableOpacity>
      </View>

        {/* Content */}
        <View className="flex-1 justify-center px-4">
          <View className="bg-[#5F9EA0] rounded-xl p-6">
            <TouchableOpacity 
              className="bg-white rounded-xl p-4 mb-4"
              onPress={() => router.push('/bbi')}
            >
              <Text className="text-center text-lg font-semibold">HITUNG BBI</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="bg-white rounded-xl p-4"
              onPress={() => router.push('/imt')}
            >
              <Text className="text-center text-lg font-semibold">HITUNG IMT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
  </SafeAreaView>
  );
};

export default KalkulatorGizi;

import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface UserData {
  name: string;
  age: string;
  gender: string;
  disease: string;
}

const diseases = [
  'Pilih penyakit',
  'Diabetes',
  'Hipertensi',
  'Kanker'
] as const;

export default function RecallScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData>({
    name: '',
    age: '',
    gender: '',
    disease: 'Pilih penyakit',
  });

  const handleNext = () => {
    if (!userData.name || !userData.age || !userData.gender || userData.disease === 'Pilih penyakit') {
      Alert.alert('Error', 'Mohon lengkapi semua data');
      return;
    }
    router.push({
      pathname: '/food-recall',
      params: { disease: userData.disease.toLowerCase() }
    });
  };

  return (
    <SafeAreaView className='bg-primary-400 h-full p-4 '>
      <View className="flex-1 bg-primary-500 rounded-xl mt-5" >
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

      {/* Form Content */}
      <View className="flex-1 px-6 pt-6 ">
        <View className="space-y-6">
          {/* Nama */}
          <View>
            <Text className="text-white text-xl font-rubik-semibold mb-2">Nama :</Text>
            <TextInput
              className="w-full bg-white rounded-3xl px-4 py-4 text-base min-h-[60px] font-rubik"
              placeholder="Masukkan nama"
              value={userData.name}
              onChangeText={(text) => setUserData({...userData, name: text})}
            />
          </View>

          {/* Row for Usia and Jenis Kelamin */}
          <View className="flex-row space-x-4">
            <View className="flex-[0.4]">
              <Text className="text-white text-xl font-rubik-semibold mb-2">Usia :</Text>
              <TextInput
                className="w-full bg-white rounded-3xl px-4 py-4 text-base min-h-[60px] font-rubik"
                placeholder="Usia"
                keyboardType="numeric"
                value={userData.age}
                onChangeText={(text) => setUserData({...userData, age: text})}
              />
            </View>
            <View className="flex-[0.6] ml-2">
              <Text className="text-white text-xl font-rubik-semibold mb-2">Jenis Kelamin :</Text>
              <View className="bg-white rounded-3xl overflow-hidden min-h-[60px] shadow-sm">
                <Picker
                  selectedValue={userData.gender}
                  onValueChange={(value) => setUserData({...userData, gender: value})}
                  className="h-[60px] bg-white font-rubik"
                >
                  <Picker.Item label="Pilih" value="" />
                  <Picker.Item label="Laki-laki" value="Laki-laki" />
                  <Picker.Item label="Perempuan" value="Perempuan" />
                </Picker>
              </View>
            </View>
          </View>

          {/* Riwayat Penyakit */}
          <View>
            <Text className="text-white text-xl font-rubik-semibold mb-2">Riwayat Penyakit :</Text>
            <View className="bg-white rounded-3xl overflow-hidden min-h-[60px] shadow-sm">
              <Picker
                selectedValue={userData.disease}
                onValueChange={(value) => setUserData({...userData, disease: value})}
                className="h-[60px] bg-white font-rubik"
              >
                {diseases.map((disease) => (
                  <Picker.Item 
                    key={disease} 
                    label={disease} 
                    value={disease}
                  />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Next Button */}
        <TouchableOpacity 
          className="bg-white rounded-full py-4 px-6 mt-5 mb-4 items-center shadow-lg active:opacity-80 hover:bg-opacity-90"
          onPress={handleNext}
        >
          <Text className="text-primary-500 font-rubik-bold text-lg">NEXT</Text>
        </TouchableOpacity>
      </View>

    </View>
  </SafeAreaView>
  );
}

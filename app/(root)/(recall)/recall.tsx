import { updateUserProfile } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const { user, refetch } = useGlobalContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    disease: user?.disease ? user.disease.charAt(0).toUpperCase() + user.disease.slice(1) : 'Pilih penyakit',
  });

  const handleUpdateProfile = async (newData: Partial<UserData>) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      await updateUserProfile(user.$id, newData);
      await refetch(); // Refresh global context
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Gagal menyimpan perubahan');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleNext = async () => {
    if (!userData.name || !userData.age || !userData.gender || userData.disease === 'Pilih penyakit') {
      Alert.alert('Error', 'Mohon lengkapi semua data');
      return;
    }

    try {
      setIsUpdating(true);

      // Update user profile in database
      if (user) {
        await updateUserProfile(user.$id, {
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          disease: userData.disease.toLowerCase()
        });
        await refetch(); // Refresh global context
      }

      // Navigate to food recall with user data
      router.push({
        pathname: '/food-recall',
        params: {
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          disease: userData.disease.toLowerCase()
        }
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Gagal menyimpan perubahan');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <SafeAreaView className='bg-primary-400 h-full p-4'>
      <View className="flex-1 bg-primary-500 rounded-xl mt-5">
        {/* Header */}
        <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-4">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={"white"} className='ml-2' />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold ml-4">FOOD RECORD</Text>
          <TouchableOpacity onPress={() => router.back()} className="ml-auto">
            <Text className="text-3xl text-white mr-4">×</Text>
          </TouchableOpacity>
        </View>

        {/* Form Content */}
        <View className="flex-1 px-6 pt-6">
          <View className="space-y-6">
            {isUpdating && (
              <View className="absolute inset-0 bg-black/30 items-center justify-center z-50">
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}

            {/* Nama */}
            <View>
              <Text className="text-white text-xl font-rubik-semibold mb-2">Nama :</Text>
              <TextInput
                className="w-full bg-white rounded-3xl px-4 py-4 text-base min-h-[60px] font-rubik text-black" // Tambahkan text-black
                placeholder="Masukkan nama"
                placeholderTextColor="#9CA3AF" // Warna placeholder bisa disesuaikan
                value={userData.name}
                onChangeText={(text) => {
                  setUserData({ ...userData, name: text });
                  handleUpdateProfile({ name: text });
                }}
              />
            </View>

            {/* Row for Usia and Jenis Kelamin */}
            <View className="flex-row space-x-4">
              <View className="flex-[0.4]">
                <Text className="text-white text-xl font-rubik-semibold mb-2">Usia :</Text>
                <TextInput
                  className="w-full bg-white rounded-3xl px-4 py-4 text-base min-h-[60px] font-rubik text-black" // Tambahkan text-black
                  placeholder="Usia"
                  placeholderTextColor="#9CA3AF" // Warna placeholder bisa disesuaikan
                  keyboardType="numeric"
                  value={userData.age}
                  onChangeText={(text) => {
                    setUserData({ ...userData, age: text });
                    handleUpdateProfile({ age: text });
                  }}
                />
              </View>
              <View className="flex-[0.6] ml-2">
                <Text className="text-white text-xl font-rubik-semibold mb-2">Jenis Kelamin :</Text>
                <View className="bg-white rounded-3xl overflow-hidden min-h-[60px] shadow-sm">
                  <Picker
                    selectedValue={userData.gender}
                    onValueChange={(value) => {
                      setUserData({ ...userData, gender: value });
                      handleUpdateProfile({ gender: value });
                    }}
                    style={{
                        height: 60,
                        width: '100%',
                        backgroundColor: 'white',
                        color: 'black', // Warna teks item terpilih
                    }}
                    dropdownIconColor="black" // Warna panah dropdown
                    className="font-rubik" // Jika className diperlukan untuk styling font
                  >
                    <Picker.Item label="Pilih" value="" style={{ color: 'black', fontSize: 16 }} />
                    <Picker.Item label="Laki-laki" value="Laki-laki" style={{ color: 'black', fontSize: 16 }} />
                    <Picker.Item label="Perempuan" value="Perempuan" style={{ color: 'black', fontSize: 16 }} />
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
                  onValueChange={(value) => {
                    setUserData({ ...userData, disease: value });
                    if (value !== 'Pilih penyakit') {
                      handleUpdateProfile({ disease: value.toLowerCase() });
                    }
                  }}
                  style={{
                      height: 60,
                      width: '100%',
                      backgroundColor: 'white',
                      color: 'black', // Warna teks item terpilih
                  }}
                  dropdownIconColor="black" // Warna panah dropdown
                  className="font-rubik" // Jika className diperlukan untuk styling font
                >
                  {diseases.map((disease) => (
                    <Picker.Item
                      key={disease}
                      label={disease}
                      value={disease}
                      style={{ color: 'black', fontSize: 16 }} // Warna teks setiap item
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
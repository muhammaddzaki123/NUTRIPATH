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

// PERUBAHAN 1: Mengubah array string menjadi array objek
const diseases = [
  { label: 'Pilih penyakit', value: '' },
  { label: 'Diabetes Melitus', value: 'diabetes_melitus' },
  { label: 'Hipertensi', value: 'hipertensi' },
  { label: 'Kanker', value: 'kanker' }
] as const;

export default function RecallScreen() {
  const router = useRouter();
  const { user, refetch } = useGlobalContext();
  const [isUpdating, setIsUpdating] = useState(false);

  // PERUBAHAN 2: Inisialisasi state disease langsung dari user.disease
  const [userData, setUserData] = useState<UserData>({
    name: user?.name || '',
    age: user?.age || '',
    gender: user?.gender || '',
    disease: user?.disease || '', // Tidak perlu kapitalisasi lagi
  });

  const handleUpdateProfile = async (newData: Partial<UserData>) => {
    if (!user) return;

    try {
      setIsUpdating(true);
      // PERUBAHAN 3: Hapus .toLowerCase() karena state sudah menyimpan nilai yang benar
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
    // Diganti menjadi pengecekan userData.disease
    if (!userData.name || !userData.age || !userData.gender || !userData.disease) {
      Alert.alert('Error', 'Mohon lengkapi semua data');
      return;
    }

    try {
      setIsUpdating(true);

      if (user) {
        // PERUBAHAN 4: Hapus .toLowerCase() saat mengirim data
        await updateUserProfile(user.$id, {
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          disease: userData.disease
        });
        await refetch(); // Refresh global context
      }

      // Kirim data yang benar ke halaman berikutnya
      router.push({
        pathname: '/food-recall',
        params: {
          name: userData.name,
          age: userData.age,
          gender: userData.gender,
          disease: userData.disease // userData.disease sudah 'diabetes_melitus'
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
        <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="white" className="ml-2" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-rubik-bold ml-4">FOOD RECORD</Text>
          <TouchableOpacity onPress={() => router.replace('/')} className="ml-auto">
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
                className="w-full bg-white rounded-3xl px-4 py-4 text-base min-h-[60px] font-rubik text-black"
                placeholder="Masukkan nama"
                placeholderTextColor="#9CA3AF"
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
                  className="w-full bg-white rounded-3xl px-4 py-4 text-base min-h-[60px] font-rubik text-black"
                  placeholder="Usia"
                  placeholderTextColor="#9CA3AF"
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
                        color: 'black',
                    }}
                    dropdownIconColor="black"
                    className="font-rubik"
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
                {/* PERUBAHAN 5: Render Picker dari array objek */}
                <Picker
                  selectedValue={userData.disease}
                  onValueChange={(value) => {
                    if (value) {
                      setUserData({ ...userData, disease: value });
                      handleUpdateProfile({ disease: value });
                    }
                  }}
                  style={{
                      height: 60,
                      width: '100%',
                      backgroundColor: 'white',
                      color: 'black',
                  }}
                  dropdownIconColor="black"
                  className="font-rubik"
                >
                  {diseases.map((disease) => (
                    <Picker.Item
                      key={disease.value}
                      label={disease.label}
                      value={disease.value}
                      style={{ color: 'black', fontSize: 16 }}
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
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import images from "@/constants/images";
import { loginNutritionist, loginUser } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Ionicons } from "@expo/vector-icons";

export default function SignIn() {
  const router = useRouter();
  const { refetch, loading, isLogged } = useGlobalContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");

  React.useEffect(() => {
    if (!loading && isLogged) {
      router.replace("/"); // Redirect ke halaman utama jika sudah login
    }
  }, [loading, isLogged]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi");
      return;
    }
    try {
      let result = false;
      if (userType === "user") {
        result = await loginUser(email, password);
      } else if (userType === "nutritionist") {
        const loginResult = await loginNutritionist(email, password);
        result = !!loginResult;
      }

      if (result) {
        refetch();
      } else {
        Alert.alert("Error", "Gagal login");
      }
    } catch (error) {
      Alert.alert("Error", "Gagal login");
      console.error("Login error:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Bagian header atas dengan tombol back dan close */}
      <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={"black"} className="ml-2" />
        </TouchableOpacity>
        {/* Tombol close di kanan atas, pastikan warnanya kontras jika ingin terlihat */}
        <TouchableOpacity onPress={() => router.back()} className="ml-auto">
          <Text className="text-3xl text-black mr-4">×</Text> 
          {/* Ganti text-white menjadi text-black atau warna kontras lain jika latar header tidak selalu putih */}
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-6">
          {/* Header with Logo */}
          <View className="flex-row items-center">
            <View className="items-center mb-8 flex-1">
              <Image
                source={images.logoawal}
                className="w-[250px] h-[250px]"
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Welcome Text */}
          <View className="mb-6">
            <Text className="text-base text-center uppercase font-rubik text-gray-600">
              Selamat datang Di
            </Text>
            <Text className="text-3xl font-rubik-bold text-gray-900 text-center mt-2">
              NUTRIPATH {"\n"}
            </Text>
          </View>

          {/* Login Form */}
          <View className="space-y-2">
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-md px-4 py-3 text-base bg-white"
              // --- TAMBAHAN UNTUK DEBUGGING ---
              placeholderTextColor="grey" // Warna placeholder eksplisit
              style={{ color: 'black' }}    // Warna teks input eksplisit
              // --- AKHIR TAMBAHAN ---
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 rounded-md px-4 py-3 text-base mt-3 bg-white"
              // --- TAMBAHAN UNTUK DEBUGGING ---
              placeholderTextColor="grey" // Warna placeholder eksplisit
              style={{ color: 'black' }}    // Warna teks input eksplisit (untuk titik-titik password)
              // --- AKHIR TAMBAHAN ---
            />
            <View className="mt-3">
              <Text className="text-gray-500 text-sm mb-1 ml-1">Tipe Pengguna</Text>
              <View 
                className="border border-gray-300 rounded-md bg-white"
                // --- TAMBAHAN UNTUK DEBUGGING ---
                // Anda bisa juga menambahkan style={{ borderColor: 'red', borderWidth: 1 }} di sini untuk memastikan View ini terlihat
                // --- AKHIR TAMBAHAN ---
              >
                <Picker
                  selectedValue={userType}
                  onValueChange={(itemValue: string) => setUserType(itemValue)}
                  style={{ 
                    height: 50, 
                    // --- TAMBAHAN UNTUK DEBUGGING ---
                    color: 'black', // Warna teks untuk item yang terpilih
                    // backgroundColor: 'lightyellow' // Opsional: Warna latar Picker untuk tes
                    // --- AKHIR TAMBAHAN ---
                  }}
                  // --- TAMBAHAN UNTUK DEBUGGING ---
                  dropdownIconColor="grey" // Warna panah dropdown
                  // --- AKHIR TAMBAHAN ---
                >
                  <Picker.Item 
                    label="User" 
                    value="user" 
                    // --- TAMBAHAN UNTUK DEBUGGING ---
                    color="black" // Warna teks item di dropdown
                    // --- AKHIR TAMBAHAN ---
                  />
                  <Picker.Item 
                    label="Ahli Gizi" 
                    value="nutritionist" 
                    // --- TAMBAHAN UNTUK DEBUGGING ---
                    color="black" // Warna teks item di dropdown
                    // --- AKHIR TAMBAHAN ---
                  />
                </Picker>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleLogin}
              className="bg-[#1CD6CE] rounded-full py-4 items-center mt-3"
            >
              <Text className="text-white text-lg font-rubik-medium">
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


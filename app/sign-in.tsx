import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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
// PERUBAHAN: Impor satu fungsi `signIn` yang aman
import { signIn } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Ionicons } from "@expo/vector-icons";

export default function SignIn() {
  const router = useRouter();
  const { refetch, loading, isLogged } = useGlobalContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Efek ini akan secara otomatis mengalihkan pengguna jika mereka sudah login.
  // Ini adalah praktik yang baik untuk ditempatkan di layout (seperti di _layout.tsx Anda).
  React.useEffect(() => {
    if (!loading && isLogged) {
      router.replace("/"); // Alihkan ke halaman utama
    }
  }, [loading, isLogged]);

  // PERUBAHAN: Logika handleLogin disederhanakan secara signifikan
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Panggil fungsi `signIn` yang baru. Fungsi ini menangani login untuk user dan ahli gizi.
      await signIn(email, password);
      
      // Jika berhasil, perbarui state global dan arahkan pengguna
      await refetch();
      router.replace("/");

    } catch (error: any) {
      // Tangkap dan tampilkan pesan error yang akurat dari Appwrite
      Alert.alert("Login Gagal", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header dengan tombol back */}
      <View className="flex-row items-center justify-between pt-5 px-4 pb-2 mb-4">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color={"black"} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="p-2">
           <Text className="text-3xl text-black">×</Text> 
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-6">
          <View className="items-center mb-8 flex-1">
            <Image
              source={images.logoawal}
              className="w-[200px] h-[200px]"
              resizeMode="contain"
            />
          </View>

          <View className="mb-6">
            <Text className="text-base text-center uppercase font-rubik text-gray-600">
              Selamat datang Di
            </Text>
            <Text className="text-3xl font-rubik-bold text-gray-900 text-center mt-2">
              NUTRIPATH
            </Text>
          </View>

          {/* Form Login */}
          <View className="space-y-4">
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-md px-4 py-3 text-base bg-white text-black mb-3"
              placeholderTextColor="grey"
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 rounded-md px-4 py-3 text-base bg-white text-black"
              placeholderTextColor="grey"
            />
            
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isSubmitting}
              className={`rounded-full py-4 items-center mt-4 ${isSubmitting ? 'bg-gray-400' : 'bg-[#1CD6CE]'}`}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text className="text-white text-lg font-rubik-medium">
                  Login
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

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
      <View className="flex-row items-center pt-5 border-b border-white pb-2 mb-4">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={"black"} className='ml-2' />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} className="ml-auto">
          <Text className="text-3xl text-white mr-4">×</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 px-6 py-6">
          {/* Header with Back Button */}
          <View className="flex-row items-center">
            {/* Logo */}
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
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 rounded-md px-4 py-3 text-base mt-3 bg-white"
            />
            <View className="mt-3">
              <Text className="text-gray-500 text-sm mb-1 ml-1">Tipe Pengguna</Text>
              <View className="border border-gray-300 rounded-md bg-white">
                <Picker
                  selectedValue={userType}
                  onValueChange={(itemValue: string) => setUserType(itemValue)}
                  style={{ height: 50 }}
                >
                  <Picker.Item label="User" value="user" />
                  <Picker.Item label="Ahli Gizi" value="nutritionist" />
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

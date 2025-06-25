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
import { signIn } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { Ionicons } from "@expo/vector-icons";

export default function SignIn() {
  const router = useRouter();
  const { refetch, loading, isLogged } = useGlobalContext();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!loading && isLogged) {
      router.replace("/");
    }
  }, [loading, isLogged]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email dan password harus diisi.");
      return;
    }
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      await refetch();
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Login Gagal", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header hanya dengan tombol back */}
      <View className="absolute top-14 left-4 z-10">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={28} color={"black"} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24, 
        }}
      >

        <View className="w-full items-center">
          {/* Logo */}
          <Image
            source={images.logoawal}
            className="w-[220px] h-[220px]" 
            resizeMode="contain"
          />

          <View className="mb-8">
            <Text className="text-lg text-center font-rubik text-gray-600">
              Selamat Datang Di
            </Text>
            <Text className="text-4xl font-rubik-bold text-gray-900 text-center mt-1">
              NUTRIPATH
            </Text>
          </View>

          <View className="w-full space-y-4">
            <TextInput
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-gray-300 rounded-lg px-4 py-4 text-base bg-white text-black mb-2"
              placeholderTextColor="grey"
            />
            <TextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="border border-gray-300 rounded-lg px-4 py-4 text-base bg-white text-black"
              placeholderTextColor="grey"
            />

            <TouchableOpacity
              onPress={handleLogin}
              disabled={isSubmitting}
              className={`rounded-full py-4 items-center mt-4 ${
                isSubmitting ? "bg-gray-400" : "bg-[#1CD6CE]"
              }`}
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
// app/(root)/(deksIcon)/DeskIcon.tsx

import { features } from "@/constants/data";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const DeskIcon = () => {
  return (
    <SafeAreaView className="flex-1 bg-primary-400">
      {/* Header
        PERBAIKAN DI SINI:
        - Mengubah 'p-4' menjadi 'px-4 pb-4 pt-12' untuk memberikan padding atas yang lebih banyak.
        - 'pt-12' (padding-top: 48px) akan mendorong header ke bawah agar tidak tertutup status bar atau notch.
      */}
      <View className="flex-row items-center px-4 pb-4 pt-12 bg-primary-500 shadow-md">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-white text-xl font-rubik-bold -ml-12">
          Deskripsi Fitur
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Judul Halaman */}
        <View className="mb-8">
          <Text className="text-2xl font-rubik-bold text-center text-primary-500">
            Jelajahi Fitur Unggulan Kami
          </Text>
          <Text className="text-base font-rubik text-center text-black-200 mt-2">
            Setiap fitur dirancang untuk membantu Anda mencapai tujuan kesehatan.
          </Text>
        </View>

        {/* Daftar Fitur */}
        <View>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => router.push(feature.route)}
              activeOpacity={0.7}
              className="bg-white rounded-2xl shadow-lg shadow-black/10 overflow-hidden mb-6"
            >
              <View className="p-5 flex-row items-center">
                {/* Icon Container */}
                <View className="w-20 h-20 rounded-2xl bg-cyan-100 justify-center items-center shadow-md shadow-cyan-500/20 mr-5">
                  <Image
                    source={feature.image}
                    className="w-14 h-14"
                    resizeMode="contain"
                  />
                </View>

                {/* Text Content */}
                <View className="flex-1">
                  <Text className="text-xl font-rubik-bold text-primary-500 mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-sm font-rubik text-gray-600 leading-5">
                    {feature.description}
                  </Text>
                </View>

                {/* Arrow Icon */}
                <View className="self-center ml-2">
                  <Ionicons
                    name="chevron-forward"
                    size={28}
                    color="#0BBEBB"
                  />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeskIcon;
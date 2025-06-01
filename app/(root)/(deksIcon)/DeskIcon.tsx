import { features } from "@/constants/data";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";


const DeskIcon = () => {
  return (
  <SafeAreaView className='bg-primary-400 h-full p-4 pb-2'>
      {/* Header */}
      <View className="flex-row items-center pt-5 border-b border-white mb-1 bg-primary-500">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={"white"} className='ml-2' />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold  ml-4 ">DIET PLAN</Text>
        <TouchableOpacity onPress={() => router.back()} className="ml-auto">
          <Text className="text-3xl text-white mr-4">×</Text>
        </TouchableOpacity>
      </View>

    <View className=" items-center-center rounded-xl mt-5">

      {features.map((feature, index) => (
        <View
          key={index}
          className="flex-row bg-white rounded-lg p-4 mb-4 shadow"
        >
          <View className="w-16 h-16 rounded-full bg-cyan-300 justify-center items-center mr-4">
            <Image source={feature.image} className="w-10 h-10" />
          </View>
          <View className="flex-1">
            <Text className="font-semibold mb-1">{feature.title}</Text>
            <Text className="text-sm text-gray-700">{feature.description}</Text>
          </View>
        </View>
      ))}
    </View>
  </SafeAreaView>
  );
};

export default DeskIcon;

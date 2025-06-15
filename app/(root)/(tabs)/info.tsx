import { diseaseInformation } from '@/constants/data';
import { useGlobalContext } from '@/lib/global-provider';
import React from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  View
} from "react-native";

const Info = () => {
  const { user } = useGlobalContext();

  const getDiseaseInfo = () => {
    if (!user) {
      return null;
    }
    
    const diseaseKey = (user.userType === 'user' ? user.disease : user.specialization)?.toLowerCase();
    
    if (diseaseKey && diseaseKey in diseaseInformation) {
      return diseaseInformation[diseaseKey];
    }
    
    return null;
  };

  const diseaseInfo = getDiseaseInfo();

  // Function to render description with styled paragraphs
  const renderDescription = (description: string) => {
    // Split the description into paragraphs based on one or more newlines
    const paragraphs = description.split(/\n\s*\n/);
    
    return paragraphs.map((paragraph, index) => {
      // Check if a paragraph is a list item (starts with a number or dash)
      const isListItem = /^\s*([-\d]+\.?\)\s*)/.test(paragraph);

      return (
        <Text 
          key={index} 
          className={`text-base text-gray-800 mb-4 leading-relaxed ${isListItem ? 'ml-4' : ''}`}
        >
          {paragraph.trim()}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-primary-400 mb-10 pb-10">
      <ScrollView contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 16 }}>
        {user && diseaseInfo ? (
          <View className="bg-white rounded-2xl shadow-lg p-6">
            <Text className="text-3xl font-rubik-bold text-primary-500 mb-2 pb-2 border-b-2 border-primary-400">
              {user.userType === 'user' ? 'Informasi' : 'Spesialisasi'}: {diseaseInfo.title}
            </Text>
            <View className="mt-4">
              {renderDescription(diseaseInfo.description)}
            </View>
          </View>
        ) : (
          <View className="flex-1 justify-center items-center p-4">
            <Text className="text-lg text-gray-600 text-center">
              {user ? "Informasi tidak tersedia untuk profil Anda." : "Silakan login untuk melihat informasi."}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Info;
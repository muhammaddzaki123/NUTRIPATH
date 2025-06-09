import { FontAwesome } from '@expo/vector-icons';
import { format } from 'date-fns';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export interface NotificationItemProps {
  id: string;
  type: 'chat' | 'article' | 'recall';
  title: string;
  description: string;
  timestamp: string;
  onPress: () => void;
}

const getIcon = (type: 'chat' | 'article' | 'recall'): { name: "comment" | "newspaper-o" | "bell"; color: string } => {
  switch (type) {
    case 'chat':
      return { name: "comment", color: '#1CD6CE' };
    case 'article':
      return { name: "newspaper-o", color: '#4B7BE5' };
    case 'recall':
      return { name: "bell", color: '#FFA41B' };
    default:
      return { name: "bell", color: '#1CD6CE' };
  }
};

const NotificationItem: React.FC<NotificationItemProps> = ({
  type,
  title,
  description,
  timestamp,
  onPress,
}) => {
  const formattedTime = format(new Date(timestamp), 'HH:mm, dd MMM yyyy');
  const icon = getIcon(type);

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-row items-center bg-white rounded-xl p-4 my-1 mx-2 shadow-sm border border-gray-100"
    >
      <View className="mr-4 w-10 h-10 rounded-full bg-gray-50 items-center justify-center">
        <FontAwesome 
          name={icon.name} 
          size={20} 
          color={icon.color}
        />
      </View>
      
      <View className="flex-1">
        <Text className="font-rubik-medium text-base text-gray-900">
          {title}
        </Text>
        <Text className="font-rubik text-sm text-gray-600 mt-1">
          {description}
        </Text>
        <Text className="font-rubik text-xs text-gray-400 mt-1">
          {formattedTime}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

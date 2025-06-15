import { diseaseInformation } from '@/constants/data';
import { useGlobalContext } from '@/lib/global-provider';
import { useState } from "react";
import {
    ImageSourcePropType,
    Text,
    TouchableOpacity,
    View
} from "react-native";

interface SettingsItemProp {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const info = () => {
  const { user, refetch } = useGlobalContext();
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const initialLinesToShow = 5;

    const toggleText = () => {
    setIsTextExpanded(!isTextExpanded);
  };

  const getDiseaseInfo = () => {
    if (!user) {
      return null;
    }
    
    if (user.userType === 'user' && user.disease && typeof user.disease === 'string' && user.disease.toLowerCase() in diseaseInformation) {
      return diseaseInformation[user.disease.toLowerCase()];
    }
    
    if (user.userType === 'nutritionist' && user.specialization && typeof user.specialization === 'string' && user.specialization.toLowerCase() in diseaseInformation) {
      return diseaseInformation[user.specialization.toLowerCase()];
    }
    
    return null;
  };

  const diseaseInfo = getDiseaseInfo();
  return (
    <View>
        {user && diseaseInfo && (
          <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
            <View className="bg-primary-200 rounded-2xl p-5">
              <Text className="text-lg font-rubik-bold">
                {user.userType === 'user' ? 'Informasi' : 'Spesialisasi'} {diseaseInfo.title}:
              </Text>
              <Text
                className="text-lg font-rubik-regular text-wrap text-justify"
                numberOfLines={isTextExpanded ? undefined : initialLinesToShow}
                ellipsizeMode="tail"
              >
                {diseaseInfo.description}
              </Text>
              <TouchableOpacity onPress={toggleText} className="mt-2 self-start">
                <Text className="text-lg font-rubik-medium text-secondary-200">
                  {isTextExpanded ? "Lihat Lebih Sedikit" : "Lihat Lebih Banyak"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
    </View>
  )
};


export default info;
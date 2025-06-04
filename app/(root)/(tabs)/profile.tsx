import { diseaseInformation } from "@/constants/data";
import icons from "@/constants/icons";
import { logout } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider"; // Pastikan path ini benar
import { router } from "expo-router";
import React, { useState } from "react"; // Impor React jika belum
import {
  Alert,
  Image,
  ImageSourcePropType,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface SettingsItemProp {
  icon: ImageSourcePropType;
  title: string;
  onPress?: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingsItem = ({
  icon,
  title,
  onPress,
  textStyle,
  showArrow = true,
}: SettingsItemProp) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex flex-row items-center justify-between py-3"
  >
    <View className="flex flex-row items-center gap-3">
      <Image source={icon} className="size-6" />
      <Text className={`text-lg font-rubik-medium text-black-300 ${textStyle}`}>
        {title}
      </Text>
    </View>
    {showArrow && <Image source={icons.rightArrow} className="size-5" />}
  </TouchableOpacity>
);

const Profile = () => {
  const { user, refetch } = useGlobalContext();
  const [isTextExpanded, setIsTextExpanded] = useState(false);
  const initialLinesToShow = 5;

  // --- TAMBAHKAN LOG DI SINI ---
  console.log("PROFILE SCREEN - Current user object:", JSON.stringify(user, null, 2));
  // ------------------------------

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      Alert.alert("Success", "Logged out successfully");
      refetch();
      router.push('/sign-in');
    } else {
      Alert.alert("Error", "Failed to logout");
    }
  };

  const toggleText = () => {
    setIsTextExpanded(!isTextExpanded);
  };

  const getDiseaseInfo = () => {
    if (!user) {
      console.log("PROFILE SCREEN - getDiseaseInfo: User is null or undefined.");
      return null;
    }
    
    console.log("PROFILE SCREEN - getDiseaseInfo: User type is", user.userType);

    if (user.userType === 'user') {
      console.log("PROFILE SCREEN - getDiseaseInfo: User disease is", user.disease);
      // Pengecekan lebih robust: pastikan user.disease ada dan berupa string sebelum .toLowerCase()
      if (user.disease && typeof user.disease === 'string' && user.disease.toLowerCase() in diseaseInformation) {
        console.log("PROFILE SCREEN - getDiseaseInfo: Found disease info for user:", user.disease.toLowerCase());
        return diseaseInformation[user.disease.toLowerCase()];
      } else {
        console.log("PROFILE SCREEN - getDiseaseInfo: No disease info found for user. Disease value:", user.disease, "Attempted key (lowercase):", user.disease ? (typeof user.disease === 'string' ? user.disease.toLowerCase() : 'Not a string') : 'N/A');
        console.log("PROFILE SCREEN - getDiseaseInfo: Available keys in diseaseInformation:", Object.keys(diseaseInformation));
      }
    }
    
    if (user.userType === 'nutritionist') {
      console.log("PROFILE SCREEN - getDiseaseInfo: Nutritionist specialization is", user.specialization);
      // Pengecekan lebih robust: pastikan user.specialization ada dan berupa string sebelum .toLowerCase()
      if (user.specialization && typeof user.specialization === 'string' && user.specialization.toLowerCase() in diseaseInformation) {
        console.log("PROFILE SCREEN - getDiseaseInfo: Found specialization info for nutritionist:", user.specialization.toLowerCase());
        return diseaseInformation[user.specialization.toLowerCase()];
      } else {
        console.log("PROFILE SCREEN - getDiseaseInfo: No specialization info found for nutritionist. Specialization value:", user.specialization, "Attempted key (lowercase):", user.specialization ? (typeof user.specialization === 'string' ? user.specialization.toLowerCase() : 'Not a string') : 'N/A');
        console.log("PROFILE SCREEN - getDiseaseInfo: Available keys in diseaseInformation:", Object.keys(diseaseInformation));
      }
    }
    
    console.log("PROFILE SCREEN - getDiseaseInfo: No matching condition or info found, returning null.");
    return null;
  };

  const diseaseInfo = getDiseaseInfo();

  // --- TAMBAHKAN LOG DI SINI ---
  console.log("PROFILE SCREEN - Value of diseaseInfo:", JSON.stringify(diseaseInfo, null, 2));
  console.log("PROFILE SCREEN - Condition for rendering disease block (user && diseaseInfo):", (user && diseaseInfo) ? "TRUE" : "FALSE");
  // ------------------------------

  return (
    <SafeAreaView className="h-full bg-primary-400">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7" // Anda mungkin ingin menyesuaikan pb-32 jika kontennya banyak
      >
        <View className="flex flex-row items-center justify-between mt-5">
          <Text className="text-xl font-rubik-bold">Profile</Text>
          <Image source={icons.bell} className="size-5" />
        </View>

        <View className="flex flex-row justify-center mt-5">
          <View className="flex flex-col items-center relative mt-5">
            <Image
              source={user && user.avatar ? { uri: user.avatar } : icons.profile2}
              className="size-44 relative rounded-full"
            />
            <TouchableOpacity className="absolute bottom-11 right-2">
              <Image source={icons.edit} className="size-9" />
            </TouchableOpacity>

            <Text className="text-2xl font-rubik-bold mt-2">{user?.name}</Text>
          </View>
        </View>

        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
          <View className="bg-primary-200 rounded-2xl p-5">
            <Text className="text-lg font-rubik-bold">ABOUT US: </Text>
            <Text className="text-lg font-rubik-regular text-wrap text-justify">
              Mynutripath hadir untuk mempermudah pencatatan dan pemantauan asupan gizi pasien secara real-time. Dengan sistem yang dirancang khusus, pasien dapat mencatat riwayat makan sehari-hari melalui fitur recall 24 jam, Aplikasi ini juga dilengkapi berbagai fitur seperti rencana diet yang didalamnya sudah terdapat contoh menu diet sehari yang dilengkapi juga dengan rekomendasi menu diet sehat yang disusun langsung oleh ahli gizi terpercaya, konsultasi langsung dengan ahli gizi, kalkulator indeks massa tubuh dan berat badan ideal yang sekaligus secara langsung anda dapat mengetahui status gizi anda, Serta artikel kesehatan terkini.
            </Text>
          </View>
        </View>

        {/* Bagian Informasi Penyakit/Spesialisasi */}
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

        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
          <View className="bg-primary-200 rounded-2xl p-5">
            <Text>
              <Text className="text-lg font-rubik-bold">Email: </Text>
              <Text className="text-lg font-rubik-regular">
                {user?.email}
              </Text>
            </Text>
          </View>

          <SettingsItem
            icon={icons.home} // Pertimbangkan mengganti ikon ini
            title="Berat Badan"
            onPress={() => { /* Navigasi atau modal untuk edit berat badan */ }}
          />
          <SettingsItem
            icon={icons.home} // Pertimbangkan mengganti ikon ini
            title="Tinggi Badan"
            onPress={() => { /* Navigasi atau modal untuk edit tinggi badan */ }}
          />
          <SettingsItem
            icon={icons.home} // Pertimbangkan mengganti ikon ini
            title="Penyakit Diderita"
            onPress={() => { /* Navigasi atau modal untuk edit penyakit */ }}
          />
        </View>

        <View className="flex flex-col border-t mt-5 pt-5 border-primary-200">
          {user ? (
            <SettingsItem
              icon={icons.logout}
              title="Logout"
              textStyle="text-danger"
              showArrow={false}
              onPress={handleLogout}
            />
          ) : (
            <SettingsItem
              icon={icons.login || icons.profile} // Fallback ikon jika login tidak ada
              title="Login"
              textStyle="text-warning"
              showArrow={false}
              onPress={() => router.push('/sign-in')}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
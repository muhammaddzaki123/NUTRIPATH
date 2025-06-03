import { useState } from "react"; // Import useState
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

import { logout } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";

import icons from "@/constants/icons";
import { router } from "expo-router";

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
  const [isHypertensionExpanded, setIsHypertensionExpanded] = useState(false); // State for hypertension text

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

  const toggleHypertensionText = () => {
    setIsHypertensionExpanded(!isHypertensionExpanded);
  };

  const hypertensionFullText = `Hipertensi adalah kondisi di mana tekanan darah seseorang meningkat melebihi batas normal secara konsisten. Ini berarti tekanan darah pada dinding arteri (pembuluh darah) terlalu tinggi. Hipertensi sering disebut sebagai "silent killer" karena sering tidak memiliki gejala yang jelas. 
Lebih Detail:
Tekanan Darah:
Tekanan darah adalah kekuatan yang dihasilkan oleh aliran darah ketika memompa melalui pembuluh darah. Ada dua jenis tekanan darah: 
Tekanan Sistolik: Tekanan saat jantung berkontraksi dan memompa darah. 
Tekanan Diastolik: Tekanan saat jantung beristirahat di antara detak jantung. 
Hipertensi:
Hipertensi adalah kondisi ketika tekanan sistolik lebih dari atau sama dengan 140 mmHg, dan/atau tekanan diastolik lebih dari atau sama dengan 90 mmHg. 
Gejala:
Hipertensi sering tidak memiliki gejala yang jelas, sehingga sering disebut sebagai "silent killer". Namun, beberapa gejala hipertensi yang mungkin muncul antara lain: sakit kepala, pusing, pendarahan hidung, mual, muntah, kelelahan, dan pandangan kabur. 
Bahaya:
Hipertensi yang tidak terkontrol dapat menyebabkan komplikasi serius seperti penyakit jantung koroner dan stroke, gagal jantung, gagal ginjal, penyakit vaskular perifer, dan kerusakan pembuluh darah retina. 
Penyebab:
Hipertensi dapat disebabkan oleh berbagai faktor, termasuk faktor genetik, obesitas, kurangnya aktivitas fisik, konsumsi garam berlebihan, stres, dan usia. 
Pencegahan:
Hipertensi dapat dicegah dengan menjaga berat badan ideal, mengurangi konsumsi garam, berolahraga secara teratur, mengelola stres, dan tidak merokok.`;

  const initialLinesToShow = 5; // Number of lines to show initially

  return (
    <SafeAreaView className="h-full bg-primary-400">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
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

        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
          <View className="bg-primary-200 rounded-2xl p-5">
            <Text className="text-lg font-rubik-bold">HIpertensi:</Text>
            <Text
              className="text-lg font-rubik-regular text-wrap text-justify"
              numberOfLines={isHypertensionExpanded ? undefined : initialLinesToShow}
              ellipsizeMode="tail" // Optional: adds "..." at the end of truncated text
            >
              {hypertensionFullText}
            </Text>
            <TouchableOpacity onPress={toggleHypertensionText} className="mt-2 self-start">
              <Text className="text-lg font-rubik-medium text-secondary-200">
                {isHypertensionExpanded ? "Lihat Lebih Sedikit" : "Lihat Lebih Banyak"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
            icon={icons.home} // Consider a more relevant icon
            title="Berat Badan" // Changed from "berat"
            onPress={() => { /* Navigate to edit weight screen or show modal */ }}
          />
          <SettingsItem
            icon={icons.home} // Consider a more relevant icon
            title="Tinggi Badan"
            onPress={() => { /* Navigate to edit height screen or show modal */ }}
          />
          <SettingsItem
            icon={icons.home} // Consider a more relevant icon like a medical cross or clipboard
            title="Penyakit Diderita"
            onPress={() => { /* Navigate to edit conditions screen or show modal */ }}
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
              icon={icons.login || icons.profile}
              title="Login"
              textStyle="text-warning" // Assuming you have a warning color, or use another appropriate one
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
import icons from "@/constants/icons";
import { logout } from "@/lib/appwrite";
import { useGlobalContext } from "@/lib/global-provider";
import { router } from "expo-router";
import { useState } from "react";
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

// Define disease information type
interface DiseaseInfo {
  title: string;
  description: string;
}

interface DiseaseInformation {
  [key: string]: DiseaseInfo;
}

const diseaseInformation: DiseaseInformation = {
  hipertensi: {
    title: "Hipertensi",
    description: `Hipertensi adalah kondisi di mana tekanan darah seseorang meningkat melebihi batas normal secara konsisten. Ini berarti tekanan darah pada dinding arteri (pembuluh darah) terlalu tinggi. Hipertensi sering disebut sebagai "silent killer" karena sering tidak memiliki gejala yang jelas. 

Lebih Detail:
Tekanan Darah:
- Tekanan darah adalah kekuatan yang dihasilkan oleh aliran darah ketika memompa melalui pembuluh darah. 
- Ada dua jenis tekanan darah: 
  * Tekanan Sistolik: Tekanan saat jantung berkontraksi dan memompa darah. 
  * Tekanan Diastolik: Tekanan saat jantung beristirahat di antara detak jantung. 

Gejala:
- Sakit kepala
- Pusing
- Pendarahan hidung
- Mual dan muntah
- Kelelahan
- Pandangan kabur

Pencegahan:
- Kurangi konsumsi garam
- Olahraga teratur
- Hindari stres
- Jaga berat badan ideal
- Hindari rokok dan alkohol`
  },
  diabetes: {
    title: "Diabetes",
    description: `Diabetes adalah penyakit kronis yang terjadi ketika tubuh tidak dapat menghasilkan insulin yang cukup atau tidak dapat menggunakan insulin secara efektif. Insulin adalah hormon yang mengatur kadar gula darah.

Lebih Detail:
Tipe Diabetes:
- Diabetes Tipe 1: Sistem kekebalan tubuh menyerang sel penghasil insulin
- Diabetes Tipe 2: Tubuh tidak dapat menggunakan insulin dengan baik
- Diabetes Gestasional: Terjadi selama kehamilan

Gejala:
- Sering haus dan buang air kecil
- Mudah lelah
- Penurunan berat badan
- Luka yang sulit sembuh
- Penglihatan kabur

Pencegahan:
- Makan makanan sehat
- Kontrol berat badan
- Olahraga teratur
- Pantau kadar gula darah
- Hindari makanan tinggi gula`
  },
  kanker: {
    title: "Kanker",
    description: `Kanker adalah penyakit yang terjadi ketika sel-sel abnormal dalam tubuh tumbuh tidak terkendali. Sel-sel ini dapat menyebar ke bagian tubuh lainnya melalui darah dan sistem limfatik.

Lebih Detail:
Jenis Kanker:
- Karsinoma: Kanker yang dimulai di kulit atau jaringan
- Sarkoma: Kanker di jaringan ikat
- Leukemia: Kanker darah
- Limfoma: Kanker sistem limfatik

Gejala Umum:
- Benjolan atau pertumbuhan tidak normal
- Perubahan pada kulit
- Perubahan kebiasaan buang air
- Penurunan berat badan tidak wajar
- Kelelahan berkepanjangan

Pencegahan:
- Hindari merokok
- Makan makanan sehat
- Olahraga teratur
- Hindari paparan sinar UV berlebihan
- Pemeriksaan rutin`
  }
};

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

  // Function to determine which disease information to show
  const getDiseaseInfo = () => {
    if (!user) return null;
    
    if (user.userType === 'user' && user.disease && user.disease.toLowerCase() in diseaseInformation) {
      return diseaseInformation[user.disease.toLowerCase()];
    }
    
    if (user.userType === 'nutritionist' && user.specialization && user.specialization.toLowerCase() in diseaseInformation) {
      return diseaseInformation[user.specialization.toLowerCase()];
    }
    
    return null;
  };

  const diseaseInfo = getDiseaseInfo();

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

        {user && diseaseInfo && (
          <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
            <View className="bg-primary-200 rounded-2xl p-5">
              <Text className="text-lg font-rubik-bold">{diseaseInfo.title}:</Text>
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
            icon={icons.home}
            title="Berat Badan"
            onPress={() => { /* Navigate to edit weight screen or show modal */ }}
          />
          <SettingsItem
            icon={icons.home}
            title="Tinggi Badan"
            onPress={() => { /* Navigate to edit height screen or show modal */ }}
          />
          <SettingsItem
            icon={icons.home}
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

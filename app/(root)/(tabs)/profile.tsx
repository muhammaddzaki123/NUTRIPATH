import icons from '@/constants/icons';
import { config, databases, logout, storage } from '@/lib/appwrite';
import { useGlobalContext } from '@/lib/global-provider';
import * as ImagePicker from 'expo-image-picker';
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

const ProfileDetailItem = ({ label, value }: { label: string; value: string | number | undefined }) => (
  <View className="flex-row items-center py-2">
    <Text className="text-lg font-rubik-bold w-32">{label}:</Text>
    <Text className="text-lg font-rubik-regular">{value ?? 'Tidak ada'}</Text>
  </View>
);

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

  const handleImagePick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert("Permission Required", "You need to grant access to your photos to change profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        Alert.alert("Uploading...", "Please wait while we update your profile picture.");

        const file = {
          name: `avatar-${user?.$id}-${Date.now()}.jpg`,
          type: 'image/jpeg',
          uri: result.assets[0].uri,
          size: await new Promise<number>((resolve) => {
            fetch(result.assets[0].uri)
              .then((response) => response.blob())
              .then((blob) => resolve(blob.size))
          })
        };

        const uploadedFile = await storage.createFile(
          config.storageBucketId,
          'unique()',
          file
        );

        const fileUrl = storage.getFileView(config.storageBucketId, uploadedFile.$id);
        console.log('Generated avatar URL:', fileUrl.href);

        try {
          if (user?.userType === 'nutritionist') {
            console.log('Updating nutritionist profile:', user.$id);
            const updated = await databases.updateDocument(
              config.databaseId!,
              config.ahligiziCollectionId!,
              user.$id,
              { avatar: fileUrl.href }
            );
            console.log('Nutritionist profile updated:', updated);
          } else {
            console.log('Updating user profile:', user!.$id);
            const updated = await databases.updateDocument(
              config.databaseId!,
              config.usersProfileCollectionId!,
              user!.$id,
              { avatar: fileUrl.href }
            );
            console.log('User profile updated:', updated);
          }

          console.log('Refreshing user data...');
          await refetch();
          console.log('User data refreshed');
        } catch (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }

        Alert.alert("Success", "Profile picture updated successfully!");
      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert("Error", "Failed to update profile picture. Please try again.");
    }
  };

  return (
    <SafeAreaView className="h-full bg-primary-400 pt-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-32 px-7"
      >
        <View className="flex flex-row items-center justify-between mt-5">
          <Text className="text-xl font-rubik-bold">Profile</Text>
          <TouchableOpacity onPress={() => router.push('/notification')}>
            <Image source={icons.bell} className="size-5" />
          </TouchableOpacity>
        </View>

        <View className="flex flex-row justify-center mt-5">
          <View className="flex flex-col items-center relative mt-5">
            <Image
              source={user && user.avatar ? { uri: user.avatar } : icons.profile2}
              className="size-44 relative rounded-full"
            />
            <TouchableOpacity 
              className="absolute bottom-11 right-2"
              onPress={handleImagePick}
            >
              <Image source={icons.edit} className="size-9" />
            </TouchableOpacity>

            <Text className="text-2xl font-rubik-bold mt-2">{user?.name}</Text>
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
        </View>

        {user && (
          <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
            <View className="bg-primary-200 rounded-2xl p-5">
              {user.userType === 'user' ? (
                <>
                  <ProfileDetailItem label="Umur" value={user.age} />
                  <ProfileDetailItem label="Jenis Kelamin" value={user.gender} />
                  <ProfileDetailItem label="Penyakit" value={user.disease} />
                </>
              ) : (
                <>
                  <ProfileDetailItem label="Spesialisasi" value={user.specialization} />
                  <ProfileDetailItem label="Jenis Kelamin" value={user.gender} />
                </>
              )}
            </View>
          </View>
        )}

        <View className="flex flex-col mt-5 border-t pt-5 border-primary-200">
          <View className="bg-primary-200 rounded-2xl p-5">
            <Text className="text-lg font-rubik-bold">ABOUT US: </Text>
            <Text className="text-lg font-rubik-regular text-wrap text-justify">
              Mynutripath hadir untuk mempermudah pencatatan dan pemantauan asupan gizi pasien secara real-time. Dengan sistem yang dirancang khusus, pasien dapat mencatat riwayat makan sehari-hari melalui fitur recall 24 jam, Aplikasi ini juga dilengkapi berbagai fitur seperti rencana diet yang didalamnya sudah terdapat contoh menu diet sehari yang dilengkapi juga dengan rekomendasi menu diet sehat yang disusun langsung oleh ahli gizi terpercaya, konsultasi langsung dengan ahli gizi, kalkulator indeks massa tubuh dan berat badan ideal yang sekaligus secara langsung anda dapat mengetahui status gizi anda, Serta artikel kesehatan terkini.
            </Text>
          </View>
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


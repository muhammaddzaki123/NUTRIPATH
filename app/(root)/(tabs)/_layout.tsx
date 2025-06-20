import { Tabs } from 'expo-router'
import { Image, Text, View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

import icons from '@/constants/icons'

const TabIcon = ({ focused, icon, title }: { focused: boolean; icon: any; title: string }) => (
    <View className="flex-1 mt-3 flex flex-col items-center">
        <Image
            source={icon}
            tintColor={focused ? "#0061ff" : "#666876"}
            resizeMode="contain"
            className="size-6"
        />
        <Text className={`${focused ? "text-primary-300 font-rubik-medium" : "text-black-200 font-rubik"} text-xs w-full text-center mt-1`}>
            {title}
        </Text>
    </View>
)

const TabsLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
            tabBarShowLabel: false,
            tabBarStyle: {
                backgroundColor: 'white',
                position : 'absolute',
                borderTopColor : '#0061FF1A',
                borderTopWidth : 1,
                minHeight : 70,
            }
        }}>

    <Tabs.Screen
            name='index'
            options={{
                title: 'Home',
                headerShown : false,
                tabBarIcon:({ focused })=> (
                    <TabIcon icon={icons.home} focused={focused} title={'Home'}/>
                )
            }}
        />
        <Tabs.Screen
        name='notification'
        options={{
            title: 'Notification',
            headerShown : false,
            tabBarIcon:({ focused })=> (
                <TabIcon icon={icons.bell} focused={focused} title={'Notification'}/>
            )
        }}
    /><Tabs.Screen
    name='info'
    options={{
        title: "info",
        headerShown : false,
        tabBarIcon:({ focused })=> (
            <TabIcon icon={icons.search} focused={focused} title={'info'}/>
        )
    }}
/><Tabs.Screen
    name='profile'
    options={{
        title: "Profile",
        headerShown : false,
        tabBarIcon:({ focused })=> (
            <TabIcon icon={icons.person} focused={focused} title={'Profile'}/>
        )
    }}
/>
      </Tabs>
    </GestureHandlerRootView>
  )
}

export default TabsLayout
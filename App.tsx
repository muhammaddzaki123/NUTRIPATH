import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatProvider } from './components/ChatContext';
import { GlobalProvider } from './lib/global-provider';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <GlobalProvider>
          <ChatProvider>
            <Stack
              screenOptions={{
                headerShown: false,
              }}
            />
          </ChatProvider>
        </GlobalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

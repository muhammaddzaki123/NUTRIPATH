import { Stack } from 'expo-router';

export default function AhliGiziLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="login"
        options={{
          title: 'Login Ahli Gizi',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Dashboard Ahli Gizi',
          headerShown: false,
        }}
      />
    </Stack>
  );
}
import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="goal" />
      <Stack.Screen name="personal-info" />
      <Stack.Screen name="activity" />
      <Stack.Screen name="summary" />
    </Stack>
  );
}
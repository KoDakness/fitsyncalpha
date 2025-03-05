import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/context/AuthContext';
import { CalorieProvider } from '@/context/CalorieContext';
import { WeightProvider } from '@/context/WeightContext';
import { WorkoutProvider } from '@/context/WorkoutContext';
import { OnboardingProvider } from '@/context/OnboardingContext';

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export default function RootLayout() {
  useEffect(() => {
    window.frameworkReady?.();
  }, []);

  return (
    <AuthProvider>
      <OnboardingProvider>
        <CalorieProvider>
          <WeightProvider>
            <WorkoutProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="light" />
            </WorkoutProvider>
          </WeightProvider>
        </CalorieProvider>
      </OnboardingProvider>
    </AuthProvider>
  );
}
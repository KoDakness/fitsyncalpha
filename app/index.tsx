import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { useOnboarding } from '@/context/OnboardingContext';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors';

export default function Index() {
  const { user, isLoading: authLoading } = useAuth();
  const { isOnboarded } = useOnboarding();

  // If still loading, show a loading indicator
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  // If the user is logged in but not onboarded, redirect to onboarding
  if (user && !isOnboarded) {
    return <Redirect href="/onboarding/welcome" />;
  }

  // If the user is logged in and onboarded, redirect to the home page
  // Otherwise, redirect to the login page
  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.primary,
  },
});
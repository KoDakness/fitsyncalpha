import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { useAuth } from './AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define the onboarding data type
type OnboardingData = {
  goal?: 'lose' | 'gain' | 'maintain';
  height?: number;
  currentWeight?: number;
  goalWeight?: number;
  age?: number;
  gender?: 'male' | 'female';
  activityLevel?: 'sedentary' | 'light' | 'moderate' | 'active' | 'very';
  isMetric?: boolean;
};

// Define the OnboardingContext type
type OnboardingContextType = {
  isOnboarded: boolean;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
};

// Create the OnboardingContext
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Create the OnboardingProvider component
export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [isOnboarded, setIsOnboarded] = useState(true); // Default to true to prevent flashing
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user has completed onboarding
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user && session) {
        try {
          // Check if onboarding is completed
          const onboardedStatus = await AsyncStorage.getItem(`@FitSync:onboarded:${user.id}`);
          const isUserOnboarded = onboardedStatus === 'true' || !!user.goal_calories;
          setIsOnboarded(isUserOnboarded);
          
          // Load onboarding data
          const savedData = await AsyncStorage.getItem(`@FitSync:onboardingData:${user.id}`);
          if (savedData) {
            setOnboardingData(JSON.parse(savedData));
          } else if (user.goal_calories) {
            // Initialize from user profile if available
            setOnboardingData({
              currentWeight: user.current_weight,
              goalWeight: user.goal_weight,
              height: user.height,
              // Default values for other fields
              isMetric: true,
              gender: 'male',
              goal: 'lose',
              activityLevel: 'moderate'
            });
          }
          
          // If not onboarded and on the main app, redirect to onboarding
          if (!isUserOnboarded && router.pathname && !router.pathname.includes('/onboarding')) {
            router.replace('/onboarding/welcome');
          }
        } catch (error) {
          console.error('Error checking onboarding status:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    checkOnboardingStatus();
  }, [user, session]);

  // Update onboarding data
  const updateOnboardingData = async (data: Partial<OnboardingData>) => {
    if (!user) return;
    
    try {
      const updatedData = { ...onboardingData, ...data };
      setOnboardingData(updatedData);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(`@FitSync:onboardingData:${user.id}`, JSON.stringify(updatedData));
    } catch (error) {
      console.error('Error updating onboarding data:', error);
    }
  };

  // Mark onboarding as complete
  const completeOnboarding = async () => {
    if (!user) return;
    
    try {
      await AsyncStorage.setItem(`@FitSync:onboarded:${user.id}`, 'true');
      setIsOnboarded(true);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  // Reset onboarding
  const resetOnboarding = async () => {
    if (!user) return;
    
    try {
      await AsyncStorage.removeItem(`@FitSync:onboarded:${user.id}`);
      await AsyncStorage.removeItem(`@FitSync:onboardingData:${user.id}`);
      setIsOnboarded(false);
      setOnboardingData({});
    } catch (error) {
      console.error('Error resetting onboarding:', error);
    }
  };

  return (
    <OnboardingContext.Provider 
      value={{ 
        isOnboarded, 
        onboardingData, 
        updateOnboardingData, 
        completeOnboarding,
        resetOnboarding
      }}
    >
      {!isLoading && children}
    </OnboardingContext.Provider>
  );
}

// Create a hook to use the OnboardingContext
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
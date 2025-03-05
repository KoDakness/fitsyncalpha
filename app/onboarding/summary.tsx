import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Flame, Dumbbell } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useOnboarding } from '@/context/OnboardingContext';
import { useAuth } from '@/context/AuthContext';
import { useCalories } from '@/context/CalorieContext';
import { useWeight } from '@/context/WeightContext';
import { db } from '@/lib/supabase';

export default function SummaryScreen() {
  const { onboardingData, completeOnboarding } = useOnboarding();
  const { user } = useAuth();
  const { updateCalorieData } = useCalories();
  const { updateWeightData } = useWeight();
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedCalories, setCalculatedCalories] = useState(0);
  const [proteinTarget, setProteinTarget] = useState(0);

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    very: 1.9 // Very hard exercise & physical job
  };

  // Goal type adjustments
  const goalAdjustments = {
    lose: -500, // Deficit for weight loss (about 1lb/week)
    maintain: 0, // No adjustment
    gain: 500 // Surplus for weight gain (about 1lb/week)
  };

  useEffect(() => {
    calculateNutrition();
  }, [onboardingData]);

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    const { height, currentWeight, age, gender, isMetric } = onboardingData;
    
    if (!height || !currentWeight || !age || !gender) return 0;
    
    let weightKg = currentWeight;
    let heightCm = height;

    // Convert to metric if using imperial
    if (!isMetric) {
      weightKg = currentWeight / 2.20462; // Convert lbs to kg
      heightCm = height * 2.54; // Convert inches to cm
    }

    if (gender === 'male') {
      return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
    } else {
      return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
    }
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = () => {
    const bmr = calculateBMR();
    const { activityLevel } = onboardingData;
    
    if (!activityLevel || !bmr) return 0;
    
    return Math.round(bmr * activityMultipliers[activityLevel as keyof typeof activityMultipliers]);
  };

  // Calculate calorie goal based on TDEE and goal type
  const calculateCalorieGoal = () => {
    const tdee = calculateTDEE();
    const { goal } = onboardingData;
    
    if (!goal || !tdee) return 0;
    
    return Math.max(1200, Math.round(tdee + goalAdjustments[goal as keyof typeof goalAdjustments]));
  };

  // Calculate protein target (1g per pound of goal weight)
  const calculateProteinTarget = () => {
    const { goalWeight, isMetric } = onboardingData;
    
    if (!goalWeight) return 0;
    
    // If using metric, convert kg to lbs for protein calculation
    const goalWeightLbs = isMetric ? goalWeight * 2.20462 : goalWeight;
    
    return Math.round(goalWeightLbs);
  };

  const calculateNutrition = () => {
    const calories = calculateCalorieGoal();
    const protein = calculateProteinTarget();
    
    setCalculatedCalories(calories);
    setProteinTarget(protein);
  };

  const handleFinish = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Save user data to database
      await db.users.update(user.id, {
        goal_calories: calculatedCalories,
        goal_weight: onboardingData.goalWeight,
        current_weight: onboardingData.currentWeight,
        height: onboardingData.height
      });
      
      // Add weight entry
      await db.weightEntries.add({
        user_id: user.id,
        weight: onboardingData.currentWeight,
        date: new Date().toISOString().split('T')[0]
      });
      
      // Update contexts
      updateCalorieData({
        goal: calculatedCalories
      });
      
      updateWeightData(onboardingData.currentWeight, onboardingData.goalWeight);
      
      // Mark onboarding as complete
      completeOnboarding();
      
      // Navigate to home screen
      router.replace('/(tabs)');
    } catch (error) {
      console.error('Error saving onboarding data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={Colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Your Plan</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Your Personalized Plan</Text>
        <Text style={styles.subtitle}>Based on your goals and information, here's your recommended daily nutrition:</Text>

        <View style={styles.summaryCard}>
          <View style={styles.calorieSection}>
            <Flame size={32} color={Colors.brand.primary} style={styles.calorieIcon} />
            <Text style={styles.calorieValue}>{calculatedCalories}</Text>
            <Text style={styles.calorieLabel}>Calories per day</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.proteinSection}>
            <Dumbbell size={32} color={Colors.brand.primary} style={styles.proteinIcon} />
            <Text style={styles.proteinValue}>{proteinTarget}g</Text>
            <Text style={styles.proteinLabel}>Protein per day</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How We Calculated This</Text>
          <Text style={styles.infoText}>
            Your calorie goal is based on your basal metabolic rate (BMR), activity level, and fitness goal.
          </Text>
          <Text style={styles.infoText}>
            For {onboardingData.goal === 'lose' ? 'weight loss' : onboardingData.goal === 'gain' ? 'muscle gain' : 'weight maintenance'}, 
            we've {onboardingData.goal === 'lose' ? 'reduced' : onboardingData.goal === 'gain' ? 'increased' : 'maintained'} your daily calories 
            from your maintenance level.
          </Text>
          <Text style={styles.infoText}>
            Your protein target is set at approximately 1g per pound of goal weight to support muscle preservation and recovery.
          </Text>
        </View>

        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips for Success</Text>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>1</Text>
            <Text style={styles.tipText}>Log your food daily to stay on track with your calorie goal</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>2</Text>
            <Text style={styles.tipText}>Prioritize protein with each meal to reach your daily target</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>3</Text>
            <Text style={styles.tipText}>Stay hydrated by drinking at least 8 glasses of water daily</Text>
          </View>
          <View style={styles.tipItem}>
            <Text style={styles.tipNumber}>4</Text>
            <Text style={styles.tipText}>Track your workouts to monitor progress and stay motivated</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.button}
          onPress={handleFinish}
          disabled={isLoading}
        >
          <LinearGradient
            colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
            style={styles.gradientButton}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.text.primary} />
            ) : (
              <Text style={styles.buttonText}>Get Started</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 30,
    lineHeight: 22,
  },
  summaryCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  calorieSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  calorieIcon: {
    marginBottom: 8,
  },
  calorieValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  calorieLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.ui.divider,
    marginVertical: 16,
  },
  proteinSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  proteinIcon: {
    marginBottom: 8,
  },
  proteinValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  proteinLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  infoCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  tipsCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.brand.primary,
    textAlign: 'center',
    lineHeight: 24,
    color: Colors.text.primary,
    fontWeight: 'bold',
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 'auto',
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: '600',
  },
});
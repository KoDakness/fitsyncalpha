import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, TrendingDown, TrendingUp, Scale } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useOnboarding } from '@/context/OnboardingContext';

export default function GoalScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [selectedGoal, setSelectedGoal] = useState(onboardingData.goal || '');

  const handleGoalSelect = (goal: string) => {
    setSelectedGoal(goal);
    updateOnboardingData({ goal });
  };

  const handleNext = () => {
    if (selectedGoal) {
      router.push('/onboarding/personal-info');
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
          <Text style={styles.headerTitle}>Set Your Goal</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <Text style={styles.title}>What's your primary fitness goal?</Text>
        <Text style={styles.subtitle}>This will help us personalize your experience and calorie recommendations.</Text>

        <View style={styles.goalsContainer}>
          <TouchableOpacity 
            style={[
              styles.goalCard,
              selectedGoal === 'lose' && styles.selectedGoalCard
            ]}
            onPress={() => handleGoalSelect('lose')}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
              <TrendingDown size={32} color="#EF4444" />
            </View>
            <Text style={styles.goalTitle}>Lose Weight</Text>
            <Text style={styles.goalDescription}>Reduce body fat while maintaining muscle mass</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.goalCard,
              selectedGoal === 'gain' && styles.selectedGoalCard
            ]}
            onPress={() => handleGoalSelect('gain')}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
              <TrendingUp size={32} color="#3B82F6" />
            </View>
            <Text style={styles.goalTitle}>Gain Muscle</Text>
            <Text style={styles.goalDescription}>Build strength and increase muscle mass</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.goalCard,
              selectedGoal === 'maintain' && styles.selectedGoalCard
            ]}
            onPress={() => handleGoalSelect('maintain')}
          >
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
              <Scale size={32} color="#10B981" />
            </View>
            <Text style={styles.goalTitle}>Maintain Weight</Text>
            <Text style={styles.goalDescription}>Keep your current weight while improving fitness</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.button,
            !selectedGoal && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={!selectedGoal}
        >
          <LinearGradient
            colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Continue</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    padding: 24,
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
  goalsContainer: {
    marginBottom: 40,
  },
  goalCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedGoalCard: {
    borderColor: Colors.brand.primary,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  goalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  goalDescription: {
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
  buttonDisabled: {
    opacity: 0.6,
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
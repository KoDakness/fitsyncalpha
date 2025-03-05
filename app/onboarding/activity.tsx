import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Activity, Dumbbell, Bike, FileWarning as Running, Flame } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useOnboarding } from '@/context/OnboardingContext';

export default function ActivityScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [activityLevel, setActivityLevel] = useState(onboardingData.activityLevel || '');

  const handleActivitySelect = (level: string) => {
    setActivityLevel(level);
    updateOnboardingData({ activityLevel: level });
  };

  const handleNext = () => {
    if (activityLevel) {
      router.push('/onboarding/summary');
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
          <Text style={styles.headerTitle}>Activity Level</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>How active are you?</Text>
        <Text style={styles.subtitle}>Your activity level helps us calculate your daily calorie needs.</Text>

        <View style={styles.activitiesContainer}>
          <TouchableOpacity 
            style={[
              styles.activityCard,
              activityLevel === 'sedentary' && styles.selectedActivityCard
            ]}
            onPress={() => handleActivitySelect('sedentary')}
          >
            <View style={styles.activityIconContainer}>
              <Activity size={28} color={Colors.text.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Sedentary</Text>
              <Text style={styles.activityDescription}>Little or no exercise, desk job</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.activityCard,
              activityLevel === 'light' && styles.selectedActivityCard
            ]}
            onPress={() => handleActivitySelect('light')}
          >
            <View style={styles.activityIconContainer}>
              <Dumbbell size={28} color={Colors.text.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Lightly Active</Text>
              <Text style={styles.activityDescription}>Light exercise 1-3 days/week</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.activityCard,
              activityLevel === 'moderate' && styles.selectedActivityCard
            ]}
            onPress={() => handleActivitySelect('moderate')}
          >
            <View style={styles.activityIconContainer}>
              <Bike size={28} color={Colors.text.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Moderately Active</Text>
              <Text style={styles.activityDescription}>Moderate exercise 3-5 days/week</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.activityCard,
              activityLevel === 'active' && styles.selectedActivityCard
            ]}
            onPress={() => handleActivitySelect('active')}
          >
            <View style={styles.activityIconContainer}>
              <Running size={28} color={Colors.text.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Very Active</Text>
              <Text style={styles.activityDescription}>Hard exercise 6-7 days/week</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.activityCard,
              activityLevel === 'very' && styles.selectedActivityCard
            ]}
            onPress={() => handleActivitySelect('very')}
          >
            <View style={ styles.activityIconContainer}>
              <Flame size={28} color={Colors.text.primary} />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Super Active</Text>
              <Text style={styles.activityDescription}>Very hard exercise & physical job or training twice a day</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[
            styles.button,
            !activityLevel && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={!activityLevel}
        >
          <LinearGradient
            colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
            style={styles.gradientButton}
          >
            <Text style={styles.buttonText}>Continue</Text>
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
  activitiesContainer: {
    marginBottom: 30,
  },
  activityCard: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedActivityCard: {
    borderColor: Colors.brand.primary,
  },
  activityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.brand.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  activityDescription: {
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
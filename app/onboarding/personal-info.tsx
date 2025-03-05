import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useOnboarding } from '@/context/OnboardingContext';
import HeightInput from '@/components/HeightInput';

export default function PersonalInfoScreen() {
  const { onboardingData, updateOnboardingData } = useOnboarding();
  const [isMetric, setIsMetric] = useState(onboardingData.isMetric ?? true);
  const [height, setHeight] = useState(onboardingData.height?.toString() || '');
  const [currentWeight, setCurrentWeight] = useState(onboardingData.currentWeight?.toString() || '');
  const [goalWeight, setGoalWeight] = useState(onboardingData.goalWeight?.toString() || '');
  const [age, setAge] = useState(onboardingData.age?.toString() || '');
  const [gender, setGender] = useState(onboardingData.gender || 'male');

  const toggleUnitSystem = () => {
    setIsMetric(!isMetric);
    
    // Convert weight between kg and lbs
    if (currentWeight) {
      const weightValue = parseFloat(currentWeight);
      if (!isNaN(weightValue)) {
        if (isMetric) {
          // Convert kg to lbs
          setCurrentWeight((weightValue * 2.20462).toFixed(1));
        } else {
          // Convert lbs to kg
          setCurrentWeight((weightValue / 2.20462).toFixed(1));
        }
      }
    }
    
    if (goalWeight) {
      const weightValue = parseFloat(goalWeight);
      if (!isNaN(weightValue)) {
        if (isMetric) {
          // Convert kg to lbs
          setGoalWeight((weightValue * 2.20462).toFixed(1));
        } else {
          // Convert lbs to kg
          setGoalWeight((weightValue / 2.20462).toFixed(1));
        }
      }
    }
  };

  const handleNext = () => {
    if (height && currentWeight && goalWeight && age) {
      updateOnboardingData({
        height: parseFloat(height),
        currentWeight: parseFloat(currentWeight),
        goalWeight: parseFloat(goalWeight),
        age: parseInt(age),
        gender,
        isMetric
      });
      router.push('/onboarding/activity');
    }
  };

  const isFormValid = height && currentWeight && goalWeight && age;

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
          <Text style={styles.headerTitle}>Personal Information</Text>
          <View style={{ width: 24 }} />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Tell us about yourself</Text>
        <Text style={styles.subtitle}>This information helps us calculate your calorie needs accurately.</Text>

        <View style={styles.unitToggleContainer}>
          <Text style={styles.label}>Unit System</Text>
          <View style={styles.unitToggle}>
            <Text style={[
              styles.unitLabel, 
              isMetric ? styles.activeUnitLabel : styles.inactiveUnitLabel
            ]}>
              Metric (cm/kg)
            </Text>
            <Switch
              trackColor={{ false: Colors.background.tertiary, true: Colors.background.tertiary }}
              thumbColor={Colors.brand.primary}
              onValueChange={toggleUnitSystem}
              value={!isMetric}
            />
            <Text style={[
              styles.unitLabel, 
              !isMetric ? styles.activeUnitLabel : styles.inactiveUnitLabel
            ]}>
              Imperial (in/lb)
            </Text>
          </View>
        </View>

        <View style={styles.genderContainer}>
          <Text style={styles.label}>Gender</Text>
          <View style={styles.genderButtons}>
            <TouchableOpacity 
              style={[
                styles.genderButton, 
                gender === 'male' && styles.genderButtonActive
              ]}
              onPress={() => setGender('male')}
            >
              <Text 
                style={[
                  styles.genderButtonText,
                  gender === 'male' && styles.genderButtonTextActive
                ]}
              >
                Male
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.genderButton, 
                gender === 'female' && styles.genderButtonActive
              ]}
              onPress={() => setGender('female')}
            >
              <Text 
                style={[
                  styles.genderButtonText,
                  gender === 'female' && styles.genderButtonTextActive
                ]}
              >
                Female
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Age (years)</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholder="e.g., 30"
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>

        <HeightInput 
          value={height}
          isMetric={isMetric}
          onChangeHeight={setHeight}
        />

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Current Weight {isMetric ? '(kg)' : '(lbs)'}
          </Text>
          <TextInput
            style={styles.input}
            value={currentWeight}
            onChangeText={setCurrentWeight}
            keyboardType="numeric"
            placeholder={isMetric ? "e.g., 70" : "e.g., 154"}
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Goal Weight {isMetric ? '(kg)' : '(lbs)'}
          </Text>
          <TextInput
            style={styles.input}
            value={goalWeight}
            onChangeText={setGoalWeight}
            keyboardType="numeric"
            placeholder={isMetric ? "e.g., 65" : "e.g., 143"}
            placeholderTextColor={Colors.text.tertiary}
          />
        </View>

        <TouchableOpacity 
          style={[
            styles.button,
            !isFormValid && styles.buttonDisabled
          ]}
          onPress={handleNext}
          disabled={!isFormValid}
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
  unitToggleContainer: {
    marginBottom: 20,
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeUnitLabel: {
    color: Colors.brand.primary,
  },
  inactiveUnitLabel: {
    color: Colors.text.secondary,
  },
  genderContainer: {
    marginBottom: 20,
  },
  genderButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  genderButton: {
    flex: 1,
    backgroundColor: Colors.background.tertiary,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  genderButtonActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  genderButtonText: {
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  genderButtonTextActive: {
    color: Colors.text.primary,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
  },
  button: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
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
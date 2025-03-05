import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

interface CalorieCalculatorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (calorieGoal: number) => void;
  initialCalorieGoal: number;
}

export default function CalorieCalculator({
  visible,
  onClose,
  onSave,
  initialCalorieGoal
}: CalorieCalculatorProps) {
  const { user } = useAuth();
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'light' | 'moderate' | 'active' | 'very'>('moderate');
  const [goalType, setGoalType] = useState<'lose' | 'maintain' | 'gain'>('lose');
  const [calculatedCalories, setCalculatedCalories] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualCalories, setManualCalories] = useState(initialCalorieGoal.toString());
  const [useManual, setUseManual] = useState(false);
  const [isMetric, setIsMetric] = useState(true);

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

  // Load user data when modal opens
  useEffect(() => {
    if (visible && user) {
      loadUserData();
    }
  }, [visible, user]);

  // Load user data from database
  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get user data
      const userData = await db.users.getById(user.id);
      
      if (userData) {
        // Set height if available
        if (userData.height) {
          setHeight(userData.height.toString());
        }
        
        // Set weight if available
        if (userData.current_weight) {
          setWeight(userData.current_weight.toString());
        }
      }
      
      // Get latest weight entry
      const latestWeightEntry = await db.weightEntries.getLatest(user.id);
      if (latestWeightEntry) {
        setWeight(latestWeightEntry.weight.toString());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    let weightKg = parseFloat(weight);
    let heightCm = parseFloat(height);
    const ageYears = parseFloat(age);

    // Convert to metric if using imperial
    if (!isMetric) {
      weightKg = weightKg / 2.20462; // Convert lbs to kg
      heightCm = heightCm * 2.54; // Convert inches to cm
    }

    if (isNaN(weightKg) || isNaN(heightCm) || isNaN(ageYears)) {
      return null;
    }

    if (gender === 'male') {
      return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) + 5;
    } else {
      return (10 * weightKg) + (6.25 * heightCm) - (5 * ageYears) - 161;
    }
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = () => {
    const bmr = calculateBMR();
    if (bmr === null) return null;
    
    return Math.round(bmr * activityMultipliers[activityLevel]);
  };

  // Calculate calorie goal based on TDEE and goal type
  const calculateCalorieGoal = () => {
    const tdee = calculateTDEE();
    if (tdee === null) return null;
    
    return Math.max(1200, Math.round(tdee + goalAdjustments[goalType]));
  };

  // Handle calculation
  const handleCalculate = () => {
    const calorieGoal = calculateCalorieGoal();
    setCalculatedCalories(calorieGoal);
  };

  // Toggle between metric and imperial units
  const toggleUnitSystem = () => {
    setIsMetric(!isMetric);
    
    // Convert height between cm and inches
    if (height) {
      const heightValue = parseFloat(height);
      if (!isNaN(heightValue)) {
        if (isMetric) {
          // Convert cm to inches
          setHeight((heightValue / 2.54).toFixed(1));
        } else {
          // Convert inches to cm
          setHeight((heightValue * 2.54).toFixed(1));
        }
      }
    }
    
    // Convert weight between kg and lbs
    if (weight) {
      const weightValue = parseFloat(weight);
      if (!isNaN(weightValue)) {
        if (isMetric) {
          // Convert kg to lbs
          setWeight((weightValue * 2.20462).toFixed(1));
        } else {
          // Convert lbs to kg
          setWeight((weightValue / 2.20462).toFixed(1));
        }
      }
    }
  };

  // Handle saving the calorie goal
  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Determine which calorie goal to use
      const finalCalorieGoal = useManual 
        ? parseInt(manualCalories) || initialCalorieGoal
        : calculatedCalories || initialCalorieGoal;
      
      // Save to database
      await db.users.update(user.id, {
        goal_calories: finalCalorieGoal
      });
      
      // Call the onSave callback
      onSave(finalCalorieGoal);
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error saving calorie goal:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>FitSync Calorie Calculator</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  !useManual && styles.toggleButtonActive
                ]}
                onPress={() => setUseManual(false)}
              >
                <Text 
                  style={[
                    styles.toggleButtonText,
                    !useManual && styles.toggleButtonTextActive
                  ]}
                >
                  Calculator
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  useManual && styles.toggleButtonActive
                ]}
                onPress={() => setUseManual(true)}
              >
                <Text 
                  style={[
                    styles.toggleButtonText,
                    useManual && styles.toggleButtonTextActive
                  ]}
                >
                  Manual Entry
                </Text>
              </TouchableOpacity>
            </View>

            {useManual ? (
              <View style={styles.manualContainer}>
                <Text style={styles.sectionTitle}>Enter Your Daily Calorie Goal</Text>
                <TextInput
                  style={styles.input}
                  value={manualCalories}
                  onChangeText={setManualCalories}
                  keyboardType="numeric"
                  placeholder="e.g., 2000"
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
            ) : (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Personal Information</Text>
                  
                  <View style={styles.unitToggleContainer}>
                    <Text style={styles.label}>Unit System</Text>
                    <View style={styles.unitToggle}>
                      <Text style={[
                        styles.unitLabel, 
                        isMetric ? styles.activeUnitLabel : styles.inactiveUnitLabel
                      ]}>
                        Metric (cm/kg)
                      </Text>
                      <TouchableOpacity 
                        style={styles.unitToggleButton}
                        onPress={toggleUnitSystem}
                      >
                        <View style={[
                          styles.unitToggleIndicator,
                          isMetric ? styles.unitToggleLeft : styles.unitToggleRight
                        ]} />
                      </TouchableOpacity>
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
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                      Height {isMetric ? '(cm)' : '(inches)'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={height}
                      onChangeText={setHeight}
                      keyboardType="numeric"
                      placeholder={isMetric ? "e.g., 170" : "e.g., 67"}
                      placeholderTextColor={Colors.text.tertiary}
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>
                      Weight {isMetric ? '(kg)' : '(lbs)'}
                    </Text>
                    <TextInput
                      style={styles.input}
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                      placeholder={isMetric ? "e.g., 70" : "e.g., 154"}
                      placeholderTextColor={Colors.text.tertiary}
                    />
                  </View>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Activity Level</Text>
                  
                  <TouchableOpacity 
                    style={[
                      styles.activityButton, 
                      activityLevel === 'sedentary' && styles.activityButtonActive
                    ]}
                    onPress={() => setActivityLevel('sedentary')}
                  >
                    <Text style={styles.activityButtonTitle}>Sedentary</Text>
                    <Text style={styles.activityButtonDescription}>
                      Little or no exercise, desk job
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.activityButton, 
                      activityLevel === 'light' && styles.activityButtonActive
                    ]}
                    onPress={() => setActivityLevel('light')}
                  >
                    <Text style={styles.activityButtonTitle}>Lightly Active</Text>
                    <Text style={styles.activityButtonDescription}>
                      Light exercise 1-3 days/week
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.activityButton, 
                      activityLevel === 'moderate' && styles.activityButtonActive
                    ]}
                    onPress={() => setActivityLevel('moderate')}
                  >
                    <Text style={styles.activityButtonTitle}>Moderately Active</Text>
                    <Text style={styles.activityButtonDescription}>
                      Moderate exercise 3-5 days/week
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.activityButton, 
                      activityLevel === 'active' && styles.activityButtonActive
                    ]}
                    onPress={() => setActivityLevel('active')}
                  >
                    <Text style={styles.activityButtonTitle}>Very Active</Text>
                    <Text style={styles.activityButtonDescription}>
                      Hard exercise 6-7 days/week
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.activityButton, 
                      activityLevel === 'very' && styles.activityButtonActive
                    ]}
                    onPress={() => setActivityLevel('very')}
                  >
                    <Text style={styles.activityButtonTitle}>Extremely Active</Text>
                    <Text style={styles.activityButtonDescription}>
                      Very hard exercise & physical job or training twice a day
                    </Text>
                  </TouchableOpacity>
                </View>
                
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Weight Goal</Text>
                  
                  <View style={styles.goalContainer}>
                    <TouchableOpacity 
                      style={[
                        styles.goalButton, 
                        goalType === 'lose' && styles.goalButtonActive
                      ]}
                      onPress={() => setGoalType('lose')}
                    >
                      <Text 
                        style={[
                          styles.goalButtonText,
                          goalType === 'lose' && styles.goalButtonTextActive
                        ]}
                      >
                        Lose
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.goalButton, 
                        goalType === 'maintain' && styles.goalButtonActive
                      ]}
                      onPress={() => setGoalType('maintain')}
                    >
                      <Text 
                        style={[
                          styles.goalButtonText,
                          goalType === 'maintain' && styles.goalButtonTextActive
                        ]}
                      >
                        Maintain
                      </Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[
                        styles.goalButton, 
                        goalType === 'gain' && styles.goalButtonActive
                      ]}
                      onPress={() => setGoalType('gain')}
                    >
                      <Text 
                        style={[
                          styles.goalButtonText,
                          goalType === 'gain' && styles.goalButtonTextActive
                        ]}
                      >
                        Gain
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
                
                <TouchableOpacity 
                  style={styles.calculateButton}
                  onPress={handleCalculate}
                >
                  <LinearGradient
                    colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
                    style={styles.gradientButton}
                  >
                    <Text style={styles.calculateButtonText}>Calculate</Text>
                  </LinearGradient>
                </TouchableOpacity>
                
                {calculatedCalories !== null && (
                  <View style={styles.resultContainer}>
                    <Text style={styles.resultLabel}>Recommended Daily Calories:</Text>
                    <Text style={styles.resultValue}>{calculatedCalories}</Text>
                    <Text style={styles.resultNote}>
                      This is an estimate based on the Mifflin-St Jeor equation and your activity level.
                    </Text>
                  </View>
                )}
              </>
            )}

            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
                style={styles.gradientButton}
              >
                {isLoading ? (
                  <ActivityIndicator color={Colors.text.primary} />
                ) : (
                  <Text style={styles.saveButtonText}>Save Calorie Goal</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalView: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    maxHeight: '100%',
    padding: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
  },
  toggleButtonActive: {
    backgroundColor: Colors.brand.primary,
  },
  toggleButtonText: {
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  toggleButtonTextActive: {
    color: Colors.text.primary,
  },
  manualContainer: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  unitToggleContainer: {
    marginBottom: 16,
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
  unitToggleButton: {
    width: 50,
    height: 24,
    backgroundColor: Colors.background.secondary,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  unitToggleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.brand.primary,
    position: 'absolute',
  },
  unitToggleLeft: {
    left: 2,
  },
  unitToggleRight: {
    right: 2,
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
    marginBottom: 16,
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
    marginBottom: 16,
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
  activityButton: {
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  activityButtonActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  activityButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  activityButtonDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  goalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalButton: {
    flex: 1,
    backgroundColor: Colors.background.tertiary,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  goalButtonActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  goalButtonText: {
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  goalButtonTextActive: {
    color: Colors.text.primary,
  },
  calculateButton: {
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  calculateButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    alignItems: 'center',
  },
  resultLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.brand.primary,
    marginBottom: 8,
  },
  resultNote: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  saveButton: {
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
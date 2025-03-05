import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import { useWorkouts } from '@/context/WorkoutContext';
import { useAuth } from '@/context/AuthContext';
import { X } from 'lucide-react-native';

interface WorkoutLogFormProps {
  onSuccess?: () => void;
  initialExerciseType?: string;
}

export default function WorkoutLogForm({ onSuccess, initialExerciseType = '' }: WorkoutLogFormProps) {
  const { user } = useAuth();
  const { addWorkout } = useWorkouts();
  
  const [exerciseType, setExerciseType] = useState(initialExerciseType);
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('miles'); // 'miles' or 'km'
  const [intensity, setIntensity] = useState('Moderate');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [isLogging, setIsLogging] = useState(false);
  const [logType, setLogType] = useState('duration'); // 'duration' or 'distance'

  // Calculate calories based on exercise type, duration/distance, and intensity
  const calculateCalories = () => {
    if (logType === 'duration' && duration) {
      const durationMinutes = parseInt(duration);
      let caloriesPerMinute = 0;
      
      // Very rough estimates
      if (intensity === 'Low') {
        caloriesPerMinute = 5;
      } else if (intensity === 'Moderate') {
        caloriesPerMinute = 8;
      } else if (intensity === 'High') {
        caloriesPerMinute = 12;
      }
      
      const estimatedCalories = durationMinutes * caloriesPerMinute;
      setCaloriesBurned(estimatedCalories.toString());
    } else if (logType === 'distance' && distance) {
      const distanceValue = parseFloat(distance);
      let caloriesPerUnit = 0;
      
      // Convert to miles if needed
      const distanceMiles = distanceUnit === 'km' ? distanceValue * 0.621371 : distanceValue;
      
      // Very rough estimates for running
      if (exerciseType.toLowerCase().includes('run') || exerciseType.toLowerCase().includes('jog')) {
        if (intensity === 'Low') {
          caloriesPerUnit = 80;
        } else if (intensity === 'Moderate') {
          caloriesPerUnit = 100;
        } else if (intensity === 'High') {
          caloriesPerUnit = 120;
        }
      } 
      // Cycling
      else if (exerciseType.toLowerCase().includes('cycl') || exerciseType.toLowerCase().includes('bik')) {
        if (intensity === 'Low') {
          caloriesPerUnit = 40;
        } else if (intensity === 'Moderate') {
          caloriesPerUnit = 60;
        } else if (intensity === 'High') {
          caloriesPerUnit = 80;
        }
      }
      // Walking
      else if (exerciseType.toLowerCase().includes('walk')) {
        if (intensity === 'Low') {
          caloriesPerUnit = 60;
        } else if (intensity === 'Moderate') {
          caloriesPerUnit = 70;
        } else if (intensity === 'High') {
          caloriesPerUnit = 80;
        }
      }
      // Default
      else {
        if (intensity === 'Low') {
          caloriesPerUnit = 70;
        } else if (intensity === 'Moderate') {
          caloriesPerUnit = 90;
        } else if (intensity === 'High') {
          caloriesPerUnit = 110;
        }
      }
      
      const estimatedCalories = Math.round(distanceMiles * caloriesPerUnit);
      setCaloriesBurned(estimatedCalories.toString());
    }
  };

  const handleLogWorkout = async () => {
    if (!user) return;
    
    // Validate inputs
    if (!exerciseType) {
      Alert.alert('Missing Information', 'Please enter an exercise type.');
      return;
    }
    
    if (logType === 'duration' && !duration) {
      Alert.alert('Missing Information', 'Please enter the workout duration.');
      return;
    }
    
    if (logType === 'distance' && !distance) {
      Alert.alert('Missing Information', 'Please enter the distance.');
      return;
    }
    
    if (!caloriesBurned) {
      Alert.alert('Missing Information', 'Please enter calories burned or use the calculate button.');
      return;
    }
    
    try {
      setIsLogging(true);
      
      // Convert distance to duration if needed (rough estimate)
      let durationValue = parseInt(duration);
      if (logType === 'distance') {
        // Rough conversion: assume 10 min/mile or 6 min/km pace
        const distanceValue = parseFloat(distance);
        if (distanceUnit === 'miles') {
          durationValue = Math.round(distanceValue * 10);
        } else {
          durationValue = Math.round(distanceValue * 6);
        }
      }
      
      // Add workout
      await addWorkout({
        exerciseType,
        duration: durationValue,
        intensity: intensity as 'Low' | 'Medium' | 'High',
        caloriesBurned: parseInt(caloriesBurned)
      });
      
      // Reset form
      setExerciseType('');
      setDuration('');
      setDistance('');
      setCaloriesBurned('');
      
      // Show success message
      Alert.alert('Success', 'Workout logged successfully!');
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error logging workout:', error);
      Alert.alert('Error', 'Failed to log workout. Please try again.');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Log Custom Workout</Text>
        <TouchableOpacity onPress={onSuccess} style={styles.closeButton}>
          <X size={24} color={Colors.text.secondary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Exercise Type</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Running, Cycling, Weightlifting"
          placeholderTextColor={Colors.text.tertiary}
          value={exerciseType}
          onChangeText={setExerciseType}
        />
      </View>

      <View style={styles.logTypeContainer}>
        <Text style={styles.label}>Log by</Text>
        <View style={styles.logTypeButtons}>
          <TouchableOpacity
            style={[
              styles.logTypeButton,
              logType === 'duration' && styles.logTypeButtonActive
            ]}
            onPress={() => setLogType('duration')}
          >
            <Text
              style={[
                styles.logTypeButtonText,
                logType === 'duration' && styles.logTypeButtonTextActive
              ]}
            >
              Duration
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.logTypeButton,
              logType === 'distance' && styles.logTypeButtonActive
            ]}
            onPress={() => setLogType('distance')}
          >
            <Text
              style={[
                styles.logTypeButtonText,
                logType === 'distance' && styles.logTypeButtonTextActive
              ]}
            >
              Distance
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {logType === 'duration' ? (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 30"
            placeholderTextColor={Colors.text.tertiary}
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
          />
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Distance</Text>
          <View style={styles.distanceContainer}>
            <TextInput
              style={styles.distanceInput}
              placeholder="e.g., 3.1"
              placeholderTextColor={Colors.text.tertiary}
              value={distance}
              onChangeText={setDistance}
              keyboardType="numeric"
            />
            <View style={styles.unitSelector}>
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  distanceUnit === 'miles' && styles.unitButtonActive
                ]}
                onPress={() => setDistanceUnit('miles')}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    distanceUnit === 'miles' && styles.unitButtonTextActive
                  ]}
                >
                  miles
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.unitButton,
                  distanceUnit === 'km' && styles.unitButtonActive
                ]}
                onPress={() => setDistanceUnit('km')}
              >
                <Text
                  style={[
                    styles.unitButtonText,
                    distanceUnit === 'km' && styles.unitButtonTextActive
                  ]}
                >
                  km
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Intensity</Text>
        <View style={styles.intensityButtons}>
          {['Low', 'Moderate', 'High'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.intensityButton,
                intensity === level && styles.intensityButtonActive
              ]}
              onPress={() => {
                setIntensity(level);
                // Recalculate calories when intensity changes
                setTimeout(calculateCalories, 100);
              }}
            >
              <Text
                style={[
                  styles.intensityButtonText,
                  intensity === level && styles.intensityButtonTextActive
                ]}
              >
                {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.caloriesContainer}>
        <View style={styles.caloriesInputContainer}>
          <Text style={styles.label}>Calories Burned</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 250"
            placeholderTextColor={Colors.text.tertiary}
            value={caloriesBurned}
            onChangeText={setCaloriesBurned}
            keyboardType="numeric"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.calculateButton}
          onPress={calculateCalories}
        >
          <Text style={styles.calculateButtonText}>Calculate</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={styles.logButton}
        onPress={handleLogWorkout}
        disabled={isLogging}
      >
        <LinearGradient
          colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
          style={styles.gradientButton}
        >
          <Text style={styles.logButtonText}>Log Workout</Text>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.card
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary
  },
  closeButton: {
    padding: 8
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
  logTypeContainer: {
    marginBottom: 16,
  },
  logTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  logTypeButton: {
    flex: 1,
    backgroundColor: Colors.background.tertiary,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  logTypeButtonActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  logTypeButtonText: {
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  logTypeButtonTextActive: {
    color: Colors.text.primary,
  },
  distanceContainer: {
    flexDirection: 'row',
  },
  distanceInput: {
    flex: 2,
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.text.primary,
    marginRight: 8,
  },
  unitSelector: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  unitButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitButtonActive: {
    backgroundColor: Colors.brand.primary,
  },
  unitButtonText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  unitButtonTextActive: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  intensityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityButton: {
    flex: 1,
    backgroundColor: Colors.background.tertiary,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  intensityButtonActive: {
    backgroundColor: Colors.brand.primary,
    borderColor: Colors.brand.primary,
  },
  intensityButtonText: {
    color: Colors.text.secondary,
    fontWeight: '600',
  },
  intensityButtonTextActive: {
    color: Colors.text.primary,
  },
  caloriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  caloriesInputContainer: {
    flex: 2,
    marginRight: 8,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: Colors.brand.secondary,
    borderRadius: 8,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 12,
  },
  calculateButtonText: {
    color: Colors.text.primary,
    fontWeight: '600',
  },
  logButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 16,
    marginBottom: 24,
  },
  gradientButton: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  logButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
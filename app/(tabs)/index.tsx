import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useCalories } from '@/context/CalorieContext';
import { useWeight } from '@/context/WeightContext';
import { useWorkouts } from '@/context/WorkoutContext';
import { ChartBar as BarChart2, Activity, Droplet, TrendingUp } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { router } from 'expo-router';
import WeightUpdateModal from '@/components/WeightUpdateModal';
import { db, formatDate } from '@/lib/supabase';
import StepCounter from '@/components/StepCounter';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { user } = useAuth();
  const { calorieData } = useCalories();
  const { weightData, updateWeightData } = useWeight();
  const { workouts } = useWorkouts();
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [waterIntake, setWaterIntake] = useState(0);
  const [isLoadingWater, setIsLoadingWater] = useState(false);
  const [nutritionData, setNutritionData] = useState({
    protein: 0,
    carbs: 0,
    fat: 0
  });
  
  // Get data from CalorieContext
  const caloriesConsumed = calorieData.consumed;
  const caloriesGoal = calorieData.goal;
  const caloriesBurned = calorieData.exercise;
  
  // Calculate workout duration from the most recent workout
  const recentWorkouts = [...workouts].sort((a, b) => b.date.getTime() - a.date.getTime());
  const workoutDuration = recentWorkouts.length > 0 ? recentWorkouts[0].duration : 0;
  
  // Default water goal to 8 glasses
  const waterGoal = 8;
  
  // Get data from WeightContext
  const { currentWeight, targetWeight, weightToLose } = weightData;

  // Fetch water intake when component mounts or when the date changes
  useEffect(() => {
    if (user) {
      fetchWaterIntake();
      fetchNutritionData();
      
      // Set up an interval to check for date changes and refresh data
      const intervalId = setInterval(() => {
        const today = formatDate(new Date());
        if (today !== calorieData.date) {
          fetchWaterIntake();
          fetchNutritionData();
        }
      }, 60000); // Check every minute
      
      return () => clearInterval(intervalId);
    }
  }, [user, calorieData.date]);

  // Fetch water intake from database
  const fetchWaterIntake = async () => {
    if (!user) return;
    
    try {
      setIsLoadingWater(true);
      const today = formatDate(new Date());
      
      // Get water entries for today
      const waterEntries = await db.waterEntries.getByDate(user.id, today);
      
      // Calculate total water intake
      const total = waterEntries.reduce((sum, entry) => sum + entry.amount, 0);
      
      console.log('Water entries:', waterEntries);
      console.log('Total water intake:', total);
      
      setWaterIntake(total);
    } catch (error) {
      console.error('Error fetching water intake:', error);
    } finally {
      setIsLoadingWater(false);
    }
  };

  // Fetch nutrition data (protein, carbs, fat) from food entries
  const fetchNutritionData = async () => {
    if (!user) return;
    
    try {
      const today = formatDate(new Date());
      
      // Get food entries for today
      const foodEntries = await db.foodEntries.getByDate(user.id, today);
      
      // Calculate total macros
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      
      foodEntries.forEach(entry => {
        if (entry.protein) totalProtein += (entry.protein * entry.quantity);
        if (entry.carbs) totalCarbs += (entry.carbs * entry.quantity);
        if (entry.fat) totalFat += (entry.fat * entry.quantity);
      });
      
      setNutritionData({
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat)
      });
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
    }
  };

  // Navigation handlers
  const navigateToLogMeal = () => {
    router.push('/(tabs)/log');
  };

  const navigateToLogWorkout = () => {
    router.push({
      pathname: '/(tabs)/log',
      params: { tab: 'workout' }
    });
  };

  const navigateToLogWater = () => {
    router.push({
      pathname: '/(tabs)/log',
      params: { tab: 'water' }
    });
  };

  const handleUpdateWeight = () => {
    setWeightModalVisible(true);
  };

  const handleSaveWeight = (newCurrentWeight: number, newTargetWeight: number) => {
    updateWeightData(newCurrentWeight, newTargetWeight);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Welcome Back!</Text>
            <Text style={styles.name}>{user?.name || 'Fitness Enthusiast'}</Text>
          </View>
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' }} 
              style={styles.logo}
            />
            <Text style={styles.logoText}>FitSync</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BarChart2 size={24} color={Colors.brand.primary} />
            <Text style={styles.cardTitle}>Daily Calorie Intake</Text>
          </View>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${(caloriesConsumed / caloriesGoal) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {caloriesConsumed} / {caloriesGoal} kcal
          </Text>
          
          <View style={styles.macroContainer}>
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{nutritionData.protein}g</Text>
              <Text style={styles.macroLabel}>Protein</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{nutritionData.carbs}g</Text>
              <Text style={styles.macroLabel}>Carbs</Text>
            </View>
            <View style={styles.macroDivider} />
            <View style={styles.macroItem}>
              <Text style={styles.macroValue}>{nutritionData.fat}g</Text>
              <Text style={styles.macroLabel}>Fat</Text>
            </View>
          </View>
          
          <Text style={styles.cardDescription}>
            You've consumed {caloriesConsumed} kcal today
          </Text>
          <TouchableOpacity 
            style={styles.cardButton} 
            onPress={() => router.push('/(tabs)/diary')}
          >
            <Text style={styles.cardButtonText}>View Diary</Text>
          </TouchableOpacity>
        </View>

        <StepCounter />

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Activity size={24} color={Colors.brand.primary} />
            <Text style={styles.cardTitle}>Workout Summary</Text>
          </View>
          <View style={styles.workoutSummary}>
            <View style={styles.workoutStat}>
              <Text style={styles.workoutStatValue}>{workoutDuration}</Text>
              <Text style={styles.workoutStatLabel}>minutes</Text>
            </View>
            <View style={styles.workoutDivider} />
            <View style={styles.workoutStat}>
              <Text style={styles.workoutStatValue}>{caloriesBurned}</Text>
              <Text style={styles.workoutStatLabel}>calories</Text>
            </View>
          </View>
          <Text style={styles.cardDescription}>
            {workouts.length > 0 
              ? `${workoutDuration} mins of activity completed, burning ${caloriesBurned} calories`
              : 'Zero minutes of activity today. Start your fitness journey!'}
          </Text>
          <TouchableOpacity style={styles.cardButton} onPress={navigateToLogWorkout}>
            <Text style={styles.cardButtonText}>Log Workout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <TrendingUp size={24} color={Colors.brand.primary} />
            <Text style={styles.cardTitle}>Progress Overview</Text>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current Weight</Text>
              <Text style={styles.statValue}>{currentWeight} lbs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Target Weight</Text>
              <Text style={styles.statValue}>{targetWeight} lbs</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>To Go</Text>
              <Text style={styles.statValue}>{weightToLose} lbs</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.cardButton} onPress={handleUpdateWeight}>
            <Text style={styles.cardButtonText}>Update Weight</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Droplet size={24} color={Colors.brand.primary} />
            <Text style={styles.cardTitle}>Water Intake</Text>
          </View>
          <View style={styles.waterContainer}>
            {Array.from({ length: waterGoal }).map((_, index) => (
              <View 
                key={index} 
                style={[
                  styles.waterDrop, 
                  index < waterIntake ? styles.waterDropFilled : styles.waterDropEmpty
                ]} 
              />
            ))}
          </View>
          <Text style={styles.progressText}>
            {waterIntake} / {waterGoal} glasses
          </Text>
          <TouchableOpacity style={styles.cardButton} onPress={navigateToLogWater}>
            <Text style={styles.cardButtonText}>Add Water</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <WeightUpdateModal
        visible={weightModalVisible}
        onClose={() => setWeightModalVisible(false)}
        onSave={handleSaveWeight}
        initialCurrentWeight={currentWeight}
        initialTargetWeight={targetWeight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 15,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    height: 100,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 8,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  greeting: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 10,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  progressContainer: {
    height: 8,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.brand.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  macroContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  macroLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  macroDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.ui.divider,
  },
  workoutSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  workoutStat: {
    alignItems: 'center',
    flex: 1,
  },
  workoutStatValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  workoutStatLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  workoutDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.ui.divider,
  },
  waterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  waterDrop: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  waterDropFilled: {
    backgroundColor: Colors.brand.primary,
  },
  waterDropEmpty: {
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  cardButton: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  cardButtonText: {
    color: Colors.brand.primary,
    fontWeight: '600',
  },
});
import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Switch, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Settings, Bell, Shield, CircleHelp as HelpCircle, LogOut, Calculator } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import CalorieCalculator from '@/components/CalorieCalculator';
import { useCalories } from '@/context/CalorieContext';
import AppSettingsModal from '@/components/AppSettingsModal';
import { useWorkouts } from '@/context/WorkoutContext';
import { useWeight } from '@/context/WeightContext';
import { db, formatDate } from '@/lib/supabase';
import EditProfileModal from '@/components/EditProfileModal';
import { LinearGradient } from 'expo-linear-gradient';
import { useOnboarding } from '@/context/OnboardingContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { calorieData, updateCalorieData } = useCalories();
  const { workouts } = useWorkouts();
  const { weightData } = useWeight();
  const { resetOnboarding } = useOnboarding();
  const [showCalorieCalculator, setShowCalorieCalculator] = useState(false);
  const [showAppSettings, setShowAppSettings] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  
  // Profile state
  const [profilePicture, setProfilePicture] = useState('https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80');
  
  // Stats state
  const [workoutCount, setWorkoutCount] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [weightLost, setWeightLost] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user stats when component mounts or when workouts change
  useEffect(() => {
    if (user) {
      fetchUserStats();
      loadProfilePicture();
    }
  }, [user, workouts]);

  const handleSignOut = () => {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Sign Out",
          onPress: () => {
            signOut();
          },
          style: "destructive"
        }
      ]
    );
  };

  const handleSaveCalorieGoal = (newGoal: number) => {
    // Update the calorie data in the context
    updateCalorieData({
      goal: newGoal
    });
  };

  // Load profile picture
  const loadProfilePicture = async () => {
    if (!user) return;
    
    try {
      // Get user data
      const userData = await db.users.getById(user.id);
      
      if (userData && userData.profile_picture) {
        setProfilePicture(userData.profile_picture);
      }
    } catch (error) {
      console.error('Error loading profile picture:', error);
    }
  };

  // Fetch user statistics
  const fetchUserStats = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // 1. Get total workout count from all time
      const allWorkoutEntries = await db.workoutEntries.getAllForUser(user.id);
      setWorkoutCount(allWorkoutEntries.length);
      
      // 2. Calculate streak (consecutive days with any activity)
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      
      const startDate = formatDate(oneYearAgo);
      const endDate = formatDate(today);
      
      // Get all entries for the last year
      const foodEntries = await db.foodEntries.getByDateRange(user.id, startDate, endDate);
      const waterEntries = await db.waterEntries.getByDateRange(user.id, startDate, endDate);
      const workoutEntries = await db.workoutEntries.getByDateRange(user.id, startDate, endDate);
      
      // Combine all entries and extract unique dates
      const allDates = new Set();
      
      foodEntries.forEach(entry => allDates.add(entry.date));
      waterEntries.forEach(entry => allDates.add(entry.date));
      workoutEntries.forEach(entry => allDates.add(entry.date));
      
      // Convert to array and sort dates (newest first)
      const sortedDates = Array.from(allDates).sort((a, b) => 
        new Date(b as string).getTime() - new Date(a as string).getTime()
      );
      
      // Calculate streak (consecutive days)
      let streak = 0;
      const todayStr = formatDate(today);
      
      // Check if there's an entry for today
      const hasEntryToday = sortedDates.includes(todayStr);
      
      if (hasEntryToday) {
        streak = 1; // Start with 1 for today
        
        // Check previous days
        let currentDate = new Date(today);
        currentDate.setDate(currentDate.getDate() - 1); // Start with yesterday
        
        while (true) {
          const dateStr = formatDate(currentDate);
          if (sortedDates.includes(dateStr)) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
      
      setStreakDays(streak);
      
      // 3. Calculate weight lost
      // Get the earliest weight entry in the last 30 days
      const weightEntries = await db.weightEntries.getHistory(user.id, 30);
      
      if (weightEntries.length >= 2) {
        // Sort by date (oldest first)
        weightEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        // Calculate weight difference between oldest and newest entry
        const oldestWeight = weightEntries[0].weight;
        const newestWeight = weightEntries[weightEntries.length - 1].weight;
        
        // Weight lost (positive value means weight was lost)
        const lost = oldestWeight - newestWeight;
        setWeightLost(Math.max(0, parseFloat(lost.toFixed(1))));
      } else {
        setWeightLost(0);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle profile update
  const handleProfileUpdated = () => {
    // Refresh profile picture
    loadProfilePicture();
  };

  // Handle restart onboarding
  const handleRestartOnboarding = () => {
    Alert.alert(
      "Restart Onboarding",
      "Are you sure you want to restart the onboarding process? This will reset your goals and preferences.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Restart",
          onPress: () => {
            resetOnboarding();
            router.replace('/onboarding/welcome');
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Your Account</Text>
            <Text style={styles.headerTitle}>Profile</Text>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' }} 
            style={styles.logo}
          />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: profilePicture }}
            style={styles.profileImage}
          />
          <Text style={styles.profileName}>{user?.name || 'Fitness Enthusiast'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'user@example.com'}</Text>
          <TouchableOpacity 
            style={styles.editButton}
            onPress={() => setShowEditProfile(true)}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.calorieGoalSection}>
          <View style={styles.calorieGoalHeader}>
            <Text style={styles.sectionTitle}>Daily Calorie Goal</Text>
            <TouchableOpacity 
              style={styles.calculateButton}
              onPress={() => setShowCalorieCalculator(true)}
            >
              <Calculator size={20} color={Colors.brand.primary} />
              <Text style={styles.calculateButtonText}>Calculate</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.calorieGoalValue}>
            <Text style={styles.calorieValue}>{calorieData.goal}</Text>
            <Text style={styles.calorieUnit}>calories</Text>
          </View>
          
          <Text style={styles.calorieDescription}>
            This is your daily calorie target based on your height, weight, and activity level.
            Adjust this goal to match your weight management objectives.
          </Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{workoutCount}</Text>
            <Text style={styles.statLabel}>Workouts</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{streakDays}</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{weightLost}</Text>
            <Text style={styles.statLabel}>lbs Lost</Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={() => setShowAppSettings(true)}
          >
            <View style={styles.settingsItemLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: Colors.background.tertiary }]}>
                <Settings size={20} color={Colors.brand.primary} />
              </View>
              <Text style={styles.settingsItemText}>App Settings</Text>
            </View>
            <Text style={styles.settingsItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: Colors.background.tertiary }]}>
                <Bell size={20} color={Colors.functional.warning} />
              </View>
              <Text style={styles.settingsItemText}>Notifications</Text>
            </View>
            <Switch
              trackColor={{ false: Colors.background.tertiary, true: Colors.brand.secondary }}
              thumbColor={Colors.brand.primary}
              value={true}
            />
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: Colors.background.tertiary }]}>
                <Shield size={20} color={Colors.functional.success} />
              </View>
              <Text style={styles.settingsItemText}>Privacy</Text>
            </View>
            <Text style={styles.settingsItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: Colors.background.tertiary }]}>
                <HelpCircle size={20} color={Colors.functional.info} />
              </View>
              <Text style={styles.settingsItemText}>Help & Support</Text>
            </View>
            <Text style={styles.settingsItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.settingsItem}
            onPress={handleRestartOnboarding}
          >
            <View style={styles.settingsItemLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: 'rgba(79, 209, 197, 0.1)' }]}>
                <Settings size={20} color={Colors.brand.gradient.start} />
              </View>
              <Text style={styles.settingsItemText}>Restart Onboarding</Text>
            </View>
            <Text style={styles.settingsItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <LogOut size={20} color={Colors.functional.error} />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CalorieCalculator
        visible={showCalorieCalculator}
        onClose={() => setShowCalorieCalculator(false)}
        onSave={handleSaveCalorieGoal}
        initialCalorieGoal={calorieData.goal}
      />

      <AppSettingsModal
        visible={showAppSettings}
        onClose={() => setShowAppSettings(false)}
      />

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        onProfileUpdated={handleProfileUpdated}
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
    paddingTop: 60,
    paddingBottom: 15,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: {
    fontSize: 14,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileSection: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: Colors.brand.primary,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  editButtonText: {
    color: Colors.brand.primary,
    fontWeight: '600',
  },
  calorieGoalSection: {
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
  calorieGoalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  calculateButtonText: {
    color: Colors.brand.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  calorieGoalValue: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calorieValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.brand.primary,
  },
  calorieUnit: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  calorieDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  statsSection: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.ui.divider,
  },
  settingsSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  settingsItemText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  settingsItemArrow: {
    fontSize: 20,
    color: Colors.text.tertiary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderWidth: 1,
    borderColor: Colors.functional.error,
  },
  signOutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.functional.error,
  },
});
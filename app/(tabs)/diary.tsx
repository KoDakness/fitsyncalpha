import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Animated, Modal, ActivityIndicator, Image } from 'react-native';
import { Book, Plus, MoveHorizontal as MoreHorizontal, ArrowLeft, CreditCard as Edit2, Trash2, Calendar } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { router, useLocalSearchParams } from 'expo-router';
import { useCalories } from '@/context/CalorieContext';
import { useAuth } from '@/context/AuthContext';
import { db, formatDate, FoodEntry } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export default function DiaryScreen() {
  const params = useLocalSearchParams();
  const { user, session } = useAuth();
  const { calorieData, updateCalorieData, fetchCalorieData } = useCalories();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Meals state
  const [meals, setMeals] = useState([
    { id: 1, type: 'Breakfast', foods: [], totalCalories: 0 },
    { id: 2, type: 'Lunch', foods: [], totalCalories: 0 },
    { id: 3, type: 'Dinner', foods: [], totalCalories: 0 },
    { id: 4, type: 'Snacks', foods: [], totalCalories: 0 }
  ]);

  // Fetch food entries when date changes or user logs in
  useEffect(() => {
    if (user && session) {
      fetchFoodEntries(date);
      fetchCalorieData(date);
    }
  }, [date, user, session]);

  // Check for new food item from params
  useEffect(() => {
    if (params.addFood && params.mealType && user) {
      try {
        const newFood = JSON.parse(params.addFood as string);
        const mealType = params.mealType as string;
        const isEditMode = params.editMode === 'true';
        
        // Add the food to the database
        addFoodToDatabase(newFood, mealType, isEditMode);
      } catch (error) {
        console.error('Error parsing food data:', error);
      }
    }
  }, [params.addFood, params.mealType, params.editMode, user]);

  // Fetch food entries from the database
  const fetchFoodEntries = async (date: Date) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const dateStr = formatDate(date);
      
      // Get food entries for the date
      const foodEntries = await db.foodEntries.getByDate(user.id, dateStr);
      
      // Group food entries by meal type
      const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];
      const groupedMeals = mealTypes.map((type, index) => {
        const mealFoods = foodEntries.filter(entry => entry.meal_type === type);
        
        // Convert to app food format
        const foods = mealFoods.map(entry => ({
          id: entry.id,
          name: entry.food_name,
          brand: entry.brand || 'Unknown',
          portion: entry.portion || '1 serving',
          calories: entry.calories,
          quantity: entry.quantity || 1
        }));
        
        // Calculate total calories
        const totalCalories = foods.reduce((sum, food) => sum + (food.calories * food.quantity), 0);
        
        return {
          id: index + 1,
          type,
          foods,
          totalCalories
        };
      });
      
      setMeals(groupedMeals);
    } catch (error) {
      console.error('Error fetching food entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add food to database
  const addFoodToDatabase = async (food: any, mealType: string, isEditMode: boolean) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      if (isEditMode) {
        // Update existing food entry
        await db.foodEntries.update(food.id, {
          food_name: food.name,
          brand: food.brand,
          portion: food.portion,
          calories: food.calories,
          quantity: food.quantity || 1
        });
      } else {
        // Add new food entry
        await db.foodEntries.add({
          user_id: user.id,
          meal_type: mealType,
          food_name: food.name,
          brand: food.brand || 'Unknown',
          portion: food.portion || '1 serving',
          calories: food.calories,
          quantity: food.quantity || 1,
          date: formatDate(date)
        });
      }
      
      // Refresh food entries and calorie data
      await fetchFoodEntries(date);
      await fetchCalorieData(date);
    } catch (error) {
      console.error('Error adding food to database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete food from database
  const deleteFoodFromDatabase = async (foodId: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Delete food entry
      await db.foodEntries.delete(foodId);
      
      // Refresh food entries and calorie data
      await fetchFoodEntries(date);
      await fetchCalorieData(date);
    } catch (error) {
      console.error('Error deleting food from database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format date as "Today, Monday, June 10"
  const formatDateDisplay = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    const dayName = days[date.getDay()];
    const monthName = months[date.getMonth()];
    const day = date.getDate();
    
    // Check if the date is today
    if (date.toDateString() === today.toDateString()) {
      return `Today, ${dayName}, ${monthName} ${day}`;
    }
    
    // Check if the date is yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${dayName}, ${monthName} ${day}`;
    }
    
    // Otherwise, return the full date
    return `${dayName}, ${monthName} ${day}`;
  };

  const navigateToAddFood = (mealType) => {
    router.push({
      pathname: '/(tabs)/log',
      params: { tab: 'meal', mealType }
    });
  };

  const handleEditFood = (mealType, food) => {
    router.push({
      pathname: '/(tabs)/log',
      params: { 
        tab: 'meal', 
        mealType,
        editFood: JSON.stringify(food)
      }
    });
  };

  const handleDeleteFood = (mealType, foodId) => {
    // Delete food from database
    deleteFoodFromDatabase(foodId);
  };

  // Handle date change
  const handleDateChange = (newDate) => {
    setDate(newDate);
    setShowDatePicker(false);
  };

  // Go to previous day
  const goToPreviousDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() - 1);
    handleDateChange(newDate);
  };

  // Go to next day
  const goToNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(newDate.getDate() + 1);
    
    // Allow going to future dates up to 7 days ahead
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    
    if (newDate <= maxDate) {
      handleDateChange(newDate);
    }
  };

  // Food item component with long press to reveal delete button
  const FoodItemWithDelete = ({ food, mealType }) => {
    const [showDelete, setShowDelete] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    
    // When showDelete changes, animate the opacity
    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: showDelete ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [showDelete, fadeAnim]);
    
    // Handle long press to toggle delete button
    const handleLongPress = () => {
      setShowDelete(prevState => !prevState);
    };
    
    // Handle tap to edit or hide delete button
    const handlePress = () => {
      if (showDelete) {
        setShowDelete(false);
      } else {
        handleEditFood(mealType, food);
      }
    };

    return (
      <View style={styles.foodItemContainer}>
        <TouchableOpacity 
          style={styles.foodItem}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={500} // 500ms long press to reveal/hide delete
        >
          <View style={styles.foodInfo}>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodBrand}>
              {food.brand}, {food.portion}
              {food.quantity > 1 ? ` (${food.quantity}x)` : ''}
            </Text>
          </View>
          <Text style={styles.foodCalories}>{food.calories * (food.quantity || 1)}</Text>
          
          {/* Delete button that fades in when revealed */}
          <Animated.View 
            style={[
              styles.deleteButtonContainer,
              { opacity: fadeAnim }
            ]}
          >
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => handleDeleteFood(mealType, food.id)}
            >
              <Trash2 size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </View>
    );
  };

  // Generate calendar days for date picker
  const generateCalendarDays = () => {
    const today = new Date();
    const days = [];
    
    // Generate days for the past 30 days and future 7 days
    for (let i = -30; i <= 7; i++) {
      const day = new Date(today);
      day.setDate(today.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Calendar days for the date picker
  const calendarDays = generateCalendarDays();

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
        style={styles.header}
      > 
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Track Your Meals</Text>
            <Text style={styles.headerTitle}>Food Diary</Text>
          </View>
          <Image 
            source={{ uri: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' }} 
            style={styles.logo}
          />
        </View>
      </LinearGradient>

      <View style={styles.dateContainer}>
        <TouchableOpacity style={styles.dateArrow} onPress={goToPreviousDay}>
          <ArrowLeft size={20} color={Colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.dateTextContainer}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatDateDisplay(date)}</Text>
          <Calendar size={16} color={Colors.text.secondary} style={styles.calendarIcon} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.dateArrow} 
          onPress={goToNextDay}
        >
          <ArrowLeft 
            size={20} 
            color={Colors.text.primary} 
            style={{ transform: [{ scaleX: -1 }] }} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.caloriesSummary}>
        <View style={styles.caloriesItem}>
          <Text style={styles.caloriesValue}>{calorieData.consumed}</Text>
          <Text style={styles.caloriesLabel}>Food</Text>
        </View>
        <Text style={styles.caloriesOperator}>-</Text>
        <View style={styles.caloriesItem}>
          <Text style={styles.caloriesValue}>{calorieData.exercise}</Text>
          <Text style={styles.caloriesLabel}>Exercise</Text>
        </View>
        <Text style={styles.caloriesOperator}>=</Text>
        <View style={styles.caloriesItem}>
          <Text style={[styles.caloriesValue, { color: Colors.functional.success }]}>{calorieData.remaining}</Text>
          <Text style={styles.caloriesLabel}>Remaining</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.brand.primary} />
          <Text style={styles.loadingText}>Loading food diary...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {meals.map((meal) => (
            <View key={meal.id} style={styles.mealSection}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>{meal.type}</Text>
                <Text style={styles.mealCalories}>{meal.totalCalories} cal</Text>
              </View>
              
              {meal.foods.length > 0 ? (
                meal.foods.map((food) => (
                  <FoodItemWithDelete 
                    key={food.id} 
                    food={food} 
                    mealType={meal.type} 
                  />
                ))
              ) : (
                <View style={styles.emptyMealContainer}>
                  <Text style={styles.emptyMealText}>No foods logged for {meal.type.toLowerCase()}</Text>
                </View> )}
              
              <View style={styles.mealActions}>
                <TouchableOpacity 
                  style={styles.addFoodButton}
                  onPress={() => navigateToAddFood(meal.type)}
                >
                  <Plus size={16} color={Colors.brand.primary} />
                  <Text style={styles.addFoodText}>Add Food</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.moreButton}>
                  <MoreHorizontal size={20} color={Colors.text.tertiary} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => router.push('/(tabs)/log')}
      >
        <Edit2 size={24} color={Colors.text.primary} />
      </TouchableOpacity>

      {/* Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.datePickerContainer}>
            <View style={styles.datePickerHeader}>
              <Text style={styles.datePickerTitle}>Select Date</Text>
              <TouchableOpacity 
                style={styles.datePickerCloseButton}
                onPress={() => setShowDatePicker(false)}
              >
                <Text style={styles.datePickerCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.calendarContainer}>
              {calendarDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.calendarDay,
                    day.toDateString() === date.toDateString() && styles.calendarDaySelected
                  ]}
                  onPress={() => handleDateChange(day)}
                >
                  <Text 
                    style={[
                      styles.calendarDayText,
                      day.toDateString() === date.toDateString() && styles.calendarDayTextSelected
                    ]}
                  >
                    {day.toDateString() === new Date().toDateString() 
                      ? 'Today' 
                      : day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginRight: 8,
  },
  calendarIcon: {
    marginLeft: 4,
  },
  dateArrow: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  caloriesSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.brand.primary,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  caloriesItem: {
    alignItems: 'center',
    flex: 1,
  },
  caloriesValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  caloriesLabel: {
    fontSize: 12,
    color: Colors.text.primary,
    opacity: 0.8,
  },
  caloriesOperator: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: Colors.text.secondary,
  },
  mealSection: {
    backgroundColor: Colors.background.card,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.brand.primary,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  foodItemContainer: {
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 70,
    position: 'relative',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  foodBrand: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  foodCalories: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text.primary,
    marginLeft: 8,
    marginRight: 40, // Make space for the delete button
  },
  deleteButtonContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    marginTop: -20, // Half the height of the button
    width: 40,
    height: 40,
  },
  deleteButton: {
    backgroundColor: Colors.functional.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    borderRadius: 20, // Make it circular
  },
  emptyMealContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  emptyMealText: {
    color: Colors.text.tertiary,
    fontStyle: 'italic',
  },
  mealActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addFoodText: {
    color: Colors.brand.primary,
    fontWeight: '600',
    marginLeft: 6,
  },
  moreButton: {
    padding: 4,
  },
  editButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    backgroundColor: Colors.brand.primary,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  // Date picker modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  datePickerContainer: {
    width: '90%',
    maxHeight: '70%',
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  datePickerCloseButton: {
    padding: 8,
  },
  datePickerCloseButtonText: {
    color: Colors.brand.primary,
    fontWeight: '600',
  },
  calendarContainer: {
    padding: 16,
    maxHeight: '90%',
  },
  calendarDay: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  calendarDaySelected: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 8,
    marginVertical: 2,
    borderBottomWidth: 0,
  },
  calendarDayText: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  calendarDayTextSelected: {
    color: Colors.text.primary,
    fontWeight: 'bold',
  }
});
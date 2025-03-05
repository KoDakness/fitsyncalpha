import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, formatDate } from '@/lib/supabase';

// Define the CalorieData type
type CalorieData = {
  consumed: number;
  goal: number;
  exercise: number;
  remaining: number;
  date: string; // Add date to track which day the data is for
};

// Define the CalorieContext type
type CalorieContextType = {
  calorieData: CalorieData;
  updateCalorieData: (data: Partial<CalorieData> | ((currentData: CalorieData) => Partial<CalorieData>)) => void;
  addCalories: (amount: number) => void;
  subtractCalories: (amount: number) => void;
  addExerciseCalories: (amount: number) => void;
  resetDailyData: () => void;
  fetchCalorieData: (date: Date) => Promise<void>;
  isLoading: boolean;
};

// Create the CalorieContext
const CalorieContext = createContext<CalorieContextType | undefined>(undefined);

// Create the CalorieProvider component
export function CalorieProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [calorieData, setCalorieData] = useState<CalorieData>({
    consumed: 0,
    goal: 2000,
    exercise: 0,
    remaining: 2000,
    date: formatDate(new Date())
  });

  // Check if we need to reset data for a new day
  useEffect(() => {
    const checkForNewDay = () => {
      const today = formatDate(new Date());
      if (calorieData.date !== today) {
        // It's a new day, reset the data
        setCalorieData(prev => ({
          ...prev,
          consumed: 0,
          exercise: 0,
          remaining: prev.goal,
          date: today
        }));
      }
    };

    // Check when component mounts
    checkForNewDay();

    // Set up interval to check periodically (every minute)
    const intervalId = setInterval(checkForNewDay, 60000);

    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [calorieData.date]);

  // Fetch calorie data when user logs in
  useEffect(() => {
    if (user && session) {
      fetchCalorieData(new Date());
    }
  }, [user, session]);

  // Fetch calorie data for a specific date
  const fetchCalorieData = async (date: Date) => {
    if (!user || !session) return;
    
    try {
      setIsLoading(true);
      const dateStr = formatDate(date);
      
      // Get user's calorie goal
      const goalCalories = user.goal_calories || 2000;
      
      // Get food entries for the date
      const foodEntries = await db.foodEntries.getByDate(user.id, dateStr);
      const consumedCalories = foodEntries.reduce((total, entry) => {
        return total + (entry.calories * entry.quantity);
      }, 0);
      
      // Get workout entries for the date
      const workoutEntries = await db.workoutEntries.getByDate(user.id, dateStr);
      const exerciseCalories = workoutEntries.reduce((total, entry) => {
        return total + entry.calories_burned;
      }, 0);
      
      // Calculate remaining calories
      const remainingCalories = goalCalories - consumedCalories + exerciseCalories;
      
      // Update calorie data
      setCalorieData({
        consumed: consumedCalories,
        goal: goalCalories,
        exercise: exerciseCalories,
        remaining: remainingCalories,
        date: dateStr
      });
    } catch (error) {
      console.error('Error fetching calorie data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update calorie data
  const updateCalorieData = (data: Partial<CalorieData> | ((currentData: CalorieData) => Partial<CalorieData>)) => {
    setCalorieData(prev => {
      const newData = typeof data === 'function' ? { ...prev, ...data(prev) } : { ...prev, ...data };
      // Recalculate remaining calories
      newData.remaining = newData.goal - newData.consumed + newData.exercise;
      return newData;
    });
  };

  // Add calories (food)
  const addCalories = (amount: number) => {
    updateCalorieData({
      consumed: calorieData.consumed + amount
    });
  };

  // Subtract calories (food)
  const subtractCalories = (amount: number) => {
    updateCalorieData({
      consumed: Math.max(0, calorieData.consumed - amount)
    });
  };

  // Add exercise calories
  const addExerciseCalories = (amount: number) => {
    updateCalorieData({
      exercise: calorieData.exercise + amount
    });
  };

  // Reset daily data
  const resetDailyData = () => {
    updateCalorieData({
      consumed: 0,
      exercise: 0
    });
  };

  return (
    <CalorieContext.Provider 
      value={{ 
        calorieData, 
        updateCalorieData, 
        addCalories, 
        subtractCalories, 
        addExerciseCalories,
        resetDailyData,
        fetchCalorieData,
        isLoading
      }}
    >
      {children}
    </CalorieContext.Provider>
  );
}

// Create a hook to use the CalorieContext
export function useCalories() {
  const context = useContext(CalorieContext);
  if (context === undefined) {
    throw new Error('useCalories must be used within a CalorieProvider');
  }
  return context;
}
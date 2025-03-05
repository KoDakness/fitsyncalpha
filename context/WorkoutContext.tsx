import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCalories } from './CalorieContext';
import { useAuth } from './AuthContext';
import { db, formatDate, WorkoutEntry } from '@/lib/supabase';

// Define the Workout type for the app
export type Workout = {
  id: string;
  exerciseType: string;
  duration: number;
  intensity: 'Low' | 'Medium' | 'High';
  caloriesBurned: number;
  date: Date;
};

// Define the WorkoutContext type
type WorkoutContextType = {
  workouts: Workout[];
  addWorkout: (workout: Omit<Workout, 'id' | 'date'>) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  getWorkoutById: (id: string) => Workout | undefined;
  fetchWorkouts: (date?: Date) => Promise<void>;
  isLoading: boolean;
};

// Create the WorkoutContext
const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

// Create the WorkoutProvider component
export function WorkoutProvider({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuth();
  const { addExerciseCalories, updateCalorieData, fetchCalorieData } = useCalories();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch workouts when user logs in
  useEffect(() => {
    if (user && session) {
      fetchWorkouts();
    }
  }, [user, session]);

  // Fetch workouts for a specific date
  const fetchWorkouts = async (date: Date = new Date()) => {
    if (!user || !session) return;
    
    try {
      setIsLoading(true);
      const dateStr = formatDate(date);
      
      // Get workout entries for the date
      const workoutEntries = await db.workoutEntries.getByDate(user.id, dateStr);
      
      // Convert to app Workout type
      const fetchedWorkouts: Workout[] = workoutEntries.map(entry => ({
        id: entry.id,
        exerciseType: entry.exercise_type,
        duration: entry.duration,
        intensity: entry.intensity as 'Low' | 'Medium' | 'High',
        caloriesBurned: entry.calories_burned,
        date: new Date(entry.date)
      }));
      
      setWorkouts(fetchedWorkouts);
    } catch (error) {
      console.error('Error fetching workouts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add a new workout
  const addWorkout = async (workout: Omit<Workout, 'id' | 'date'>) => {
    if (!user || !session) return;
    
    try {
      setIsLoading(true);
      
      // Create workout entry in database
      const workoutEntry = await db.workoutEntries.add({
        user_id: user.id,
        exercise_type: workout.exerciseType,
        duration: workout.duration,
        intensity: workout.intensity,
        calories_burned: workout.caloriesBurned,
        date: formatDate(new Date())
      });
      
      // Convert to app Workout type
      const newWorkout: Workout = {
        id: workoutEntry.id,
        exerciseType: workoutEntry.exercise_type,
        duration: workoutEntry.duration,
        intensity: workoutEntry.intensity as 'Low' | 'Medium' | 'High',
        caloriesBurned: workoutEntry.calories_burned,
        date: new Date(workoutEntry.date)
      };
      
      // Update workouts state
      setWorkouts(prev => [newWorkout, ...prev]);
      
      // Update calories burned in CalorieContext
      addExerciseCalories(workout.caloriesBurned);
      
      // Refresh calorie data
      await fetchCalorieData(new Date());
    } catch (error) {
      console.error('Error adding workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a workout
  const deleteWorkout = async (id: string) => {
    if (!user || !session) return;
    
    try {
      setIsLoading(true);
      
      // Find the workout to delete
      const workoutToDelete = workouts.find(w => w.id === id);
      
      if (!workoutToDelete) return;
      
      // Delete workout from database
      await db.workoutEntries.delete(id);
      
      // Update workouts state
      setWorkouts(prev => prev.filter(w => w.id !== id));
      
      // Update calories in CalorieContext
      updateCalorieData(currentData => ({
        exercise: currentData.exercise - workoutToDelete.caloriesBurned
      }));
      
      // Refresh calorie data
      await fetchCalorieData(new Date());
    } catch (error) {
      console.error('Error deleting workout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get a workout by ID
  const getWorkoutById = (id: string) => {
    return workouts.find(w => w.id === id);
  };

  return (
    <WorkoutContext.Provider 
      value={{ 
        workouts, 
        addWorkout, 
        deleteWorkout,
        getWorkoutById,
        fetchWorkouts,
        isLoading
      }}
    >
      {children}
    </WorkoutContext.Provider>
  );
}

// Create a hook to use the WorkoutContext
export function useWorkouts() {
  const context = useContext(WorkoutContext);
  if (context === undefined) {
    throw new Error('useWorkouts must be used within a WorkoutProvider');
  }
  return context;
}
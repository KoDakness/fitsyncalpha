import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// SecureStore is not available on web, so we need to use localStorage
const ExpoSecureStoreAdapter = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return SecureStore.deleteItemAsync(key);
  },
};

// Initialize Supabase
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

// Validate Supabase credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for database tables
export type User = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  goal_calories: number; 
  goal_water: number;
  goal_weight: number;
  current_weight: number;
  height?: number;
  profile_picture?: string;
};

export type FoodEntry = {
  id: string;
  user_id: string;
  meal_type: string;
  food_name: string;
  brand: string;
  portion: string;
  calories: number;
  quantity: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  date: string;
  created_at: string;
};

export type WaterEntry = {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  created_at: string;
};

export type WorkoutEntry = {
  id: string;
  user_id: string;
  exercise_type: string;
  duration: number;
  intensity: 'Low' | 'Medium' | 'High';
  calories_burned: number;
  date: string;
  created_at: string;
};

export type WeightEntry = {
  id: string;
  user_id: string;
  weight: number;
  date: string;
  created_at: string;
};

// Database API functions
export const db = {
  // User functions
  users: {
    getById: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        return data as User;
      } catch (error) {
        console.error('Error fetching user by ID:', error);
        throw error;
      }
    },
    
    update: async (userId: string, updates: Partial<User>) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .update(updates)
          .eq('id', userId)
          .select()
          .single();
        
        if (error) throw error;
        return data as User;
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },
    
    create: async (user: Partial<User>) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .insert([user])
          .select()
          .single();
        
        if (error) throw error;
        return data as User;
      } catch (error) {
        console.error('Error creating user:', error);
        throw error;
      }
    }
  },
  
  // Food entries functions
  foodEntries: {
    getByDate: async (userId: string, date: string) => {
      try {
        const { data, error } = await supabase
          .from('food_entries')
          .select('*')
          .eq('user_id', userId)
          .eq('date', date)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        return data as FoodEntry[];
      } catch (error) {
        console.error('Error fetching food entries by date:', error);
        return [];
      }
    },
    
    getByDateRange: async (userId: string, startDate: string, endDate: string) => {
      try {
        const { data, error } = await supabase
          .from('food_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });
        
        if (error) throw error;
        return data as FoodEntry[];
      } catch (error) {
        console.error('Error fetching food entries by date range:', error);
        return [];
      }
    },
    
    add: async (entry: Omit<FoodEntry, 'id' | 'created_at'>) => {
      try {
        const { data, error } = await supabase
          .from('food_entries')
          .insert([entry])
          .select()
          .single();
        
        if (error) throw error;
        return data as FoodEntry;
      } catch (error) {
        console.error('Error adding food entry:', error);
        throw error;
      }
    },
    
    update: async (entryId: string, updates: Partial<FoodEntry>) => {
      try {
        const { data, error } = await supabase
          .from('food_entries')
          .update(updates)
          .eq('id', entryId)
          .select()
          .single();
        
        if (error) throw error;
        return data as FoodEntry;
      } catch (error) {
        console.error('Error updating food entry:', error);
        throw error;
      }
    },
    
    delete: async (entryId: string) => {
      try {
        const { error } = await supabase
          .from('food_entries')
          .delete()
          .eq('id', entryId);
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error deleting food entry:', error);
        throw error;
      }
    }
  },
  
  // Water entries functions
  waterEntries: {
    getByDate: async (userId: string, date: string) => {
      try {
        const { data, error } = await supabase
          .from('water_entries')
          .select('*')
          .eq('user_id', userId)
          .eq('date', date)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        return data as WaterEntry[];
      } catch (error) {
        console.error('Error fetching water entries by date:', error);
        return [];
      }
    },
    
    getByDateRange: async (userId: string, startDate: string, endDate: string) => {
      try {
        const { data, error } = await supabase
          .from('water_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });
        
        if (error) throw error;
        return data as WaterEntry[];
      } catch (error) {
        console.error('Error fetching water entries by date range:', error);
        return [];
      }
    },
    
    getTotalByDate: async (userId: string, date: string) => {
      try {
        // Get all water entries for the date
        const { data, error } = await supabase
          .from('water_entries')
          .select('amount')
          .eq('user_id', userId)
          .eq('date', date);
        
        if (error) throw error;
        
        // Calculate total water intake for the day
        const total = (data as WaterEntry[]).reduce((sum, entry) => sum + entry.amount, 0);
        console.log(`Total water for ${date}:`, total, 'entries:', data.length);
        return total;
      } catch (error) {
        console.error('Error fetching total water intake:', error);
        return 0;
      }
    },
    
    add: async (entry: Omit<WaterEntry, 'id' | 'created_at'>) => {
      try {
        console.log('Adding water entry:', entry);
        const { data, error } = await supabase
          .from('water_entries')
          .insert([entry])
          .select()
          .single();
        
        if (error) {
          console.error('Supabase error adding water entry:', error);
          throw error;
        }
        
        console.log('Water entry added successfully:', data);
        return data as WaterEntry;
      } catch (error) {
        console.error('Error adding water entry:', error);
        throw error;
      }
    }
  },
  
  // Workout entries functions
  workoutEntries: {
    getByDate: async (userId: string, date: string) => {
      try {
        const { data, error } = await supabase
          .from('workout_entries')
          .select('*')
          .eq('user_id', userId)
          .eq('date', date)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as WorkoutEntry[];
      } catch (error) {
        console.error('Error fetching workout entries by date:', error);
        return [];
      }
    },
    
    getByDateRange: async (userId: string, startDate: string, endDate: string) => {
      try {
        const { data, error } = await supabase
          .from('workout_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: false });
        
        if (error) throw error;
        return data as WorkoutEntry[];
      } catch (error) {
        console.error('Error fetching workout entries by date range:', error);
        return [];
      }
    },
    
    getRecent: async (userId: string, limit: number = 5) => {
      try {
        const { data, error } = await supabase
          .from('workout_entries')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return data as WorkoutEntry[];
      } catch (error) {
        console.error('Error fetching recent workout entries:', error);
        return [];
      }
    },
    
    getAllForUser: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('workout_entries')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false });
        
        if (error) throw error;
        return data as WorkoutEntry[];
      } catch (error) {
        console.error('Error fetching all workout entries:', error);
        return [];
      }
    },
    
    add: async (entry: Omit<WorkoutEntry, 'id' | 'created_at'>) => {
      try {
        const { data, error } = await supabase
          .from('workout_entries')
          .insert([entry])
          .select()
          .single();
        
        if (error) throw error;
        return data as WorkoutEntry;
      } catch (error) {
        console.error('Error adding workout entry:', error);
        throw error;
      }
    },
    
    delete: async (entryId: string) => {
      try {
        const { error } = await supabase
          .from('workout_entries')
          .delete()
          .eq('id', entryId);
        
        if (error) throw error;
        return true;
      } catch (error) {
        console.error('Error deleting workout entry:', error);
        throw error;
      }
    }
  },
  
  // Weight entries functions
  weightEntries: {
    getLatest: async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('weight_entries')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(1)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows returned" error
        return data as WeightEntry | null;
      } catch ( error) {
        if ((error as any)?.code === 'PGRST116') {
          return null; // No weight entries found
        }
        console.error('Error fetching latest weight entry:', error);
        return null;
      }
    },
    
    getHistory: async (userId: string, limit: number = 10) => {
      try {
        const { data, error } = await supabase
          .from('weight_entries')
          .select('*')
          .eq('user_id', userId)
          .order('date', { ascending: false })
          .limit(limit);
        
        if (error) throw error;
        return data as WeightEntry[];
      } catch (error) {
        console.error('Error fetching weight history:', error);
        return [];
      }
    },
    
    add: async (entry: Omit<WeightEntry, 'id' | 'created_at'>) => {
      try {
        const { data, error } = await supabase
          .from('weight_entries')
          .insert([entry])
          .select()
          .single();
        
        if (error) throw error;
        return data as WeightEntry;
      } catch (error) {
        console.error('Error adding weight entry:', error);
        throw error;
      }
    }
  }
};

// Helper functions
export const formatDate = (date: Date): string => {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
};

export const getCurrentDate = (): string => {
  return formatDate(new Date());
};

// Check if a date is today
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

// Check if a date is in the future
export const isFutureDate = (date: Date): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to beginning of day for comparison
  date.setHours(0, 0, 0, 0);
  return date > today;
};

// Get the start of the day (midnight)
export const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

// Get the end of the day (23:59:59.999)
export const getEndOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};
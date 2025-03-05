import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db, formatDate } from '@/lib/supabase';

// Define the WeightData type
type WeightData = {
  currentWeight: number;
  targetWeight: number;
  weightToLose: number;
};

// Define the WeightContext type
type WeightContextType = {
  weightData: WeightData;
  updateWeightData: (currentWeight: number, targetWeight: number) => Promise<void>;
  fetchWeightData: () => Promise<void>;
  isLoading: boolean;
};

// Create the WeightContext
const WeightContext = createContext<WeightContextType | undefined>(undefined);

// Create the WeightProvider component
export function WeightProvider({ children }: { children: React.ReactNode }) {
  const { user, session, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [weightData, setWeightData] = useState<WeightData>({
    currentWeight: 165,
    targetWeight: 155,
    weightToLose: 10
  });

  // Fetch weight data when user logs in
  useEffect(() => {
    if (user && session) {
      fetchWeightData();
    }
  }, [user, session]);

  // Fetch weight data
  const fetchWeightData = async () => {
    if (!user || !session) return;
    
    try {
      setIsLoading(true);
      
      // Get user's target weight
      const targetWeight = user.goal_weight || 155;
      
      // Get user's current weight
      let currentWeight = user.current_weight || 165;
      
      // Get latest weight entry
      const latestWeightEntry = await db.weightEntries.getLatest(user.id);
      if (latestWeightEntry) {
        currentWeight = latestWeightEntry.weight;
      }
      
      // Calculate weight to lose
      const weightToLose = Math.max(0, currentWeight - targetWeight);
      
      // Update weight data
      setWeightData({
        currentWeight,
        targetWeight,
        weightToLose
      });
    } catch (error) {
      console.error('Error fetching weight data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update weight data
  const updateWeightData = async (currentWeight: number, targetWeight: number) => {
    if (!user || !session) return;
    
    try {
      setIsLoading(true);
      
      // Calculate weight to lose
      const weightToLose = Math.max(0, currentWeight - targetWeight);
      
      // Update user profile with target weight
      await db.users.update(user.id, {
        goal_weight: targetWeight,
        current_weight: currentWeight
      });
      
      // Add new weight entry
      await db.weightEntries.add({
        user_id: user.id,
        weight: currentWeight,
        date: formatDate(new Date())
      });
      
      // Update weight data state
      setWeightData({
        currentWeight,
        targetWeight,
        weightToLose
      });
      
      // Refresh user data
      await refreshUser();
    } catch (error) {
      console.error('Error updating weight data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WeightContext.Provider 
      value={{ 
        weightData, 
        updateWeightData,
        fetchWeightData,
        isLoading
      }}
    >
      {children}
    </WeightContext.Provider>
  );
}

// Create a hook to use the WeightContext
export function useWeight() {
  const context = useContext(WeightContext);
  if (context === undefined) {
    throw new Error('useWeight must be used within a WeightProvider');
  }
  return context;
}
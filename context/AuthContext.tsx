import React, { createContext, useContext, useState, useEffect } from 'react';
import { router } from 'expo-router';
import { supabase, db } from '@/lib/supabase';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/lib/supabase';
import { Alert, Platform } from 'react-native';

// Define the AuthContext type
type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create the AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if the user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        // Get the current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession?.user) {
          // Fetch user profile from the database
          try {
            const userData = await db.users.getById(currentSession.user.id);
            setUser(userData);
          } catch (error) {
            console.error('Error fetching user data:', error);
            // If we can't fetch the user data, we'll still keep the session
            // but set the user to null
          }
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession?.user) {
          try {
            // Fetch user profile from the database
            const userData = await db.users.getById(newSession.user.id);
            setUser(userData);
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setSession(null);
          router.replace('/login');
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Refresh user data
  const refreshUser = async () => {
    if (!session?.user) return;
    
    try {
      const userData = await db.users.getById(session.user.id);
      setUser(userData);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!email || !password) {
        throw new Error('Email and password are required');
      }
      
      // Check network connectivity first
      if (Platform.OS !== 'web') {
        try {
          const response = await fetch('https://www.google.com', { method: 'HEAD', timeout: 5000 });
          if (!response.ok) {
            throw new Error('Network connectivity issue detected');
          }
        } catch (networkError) {
          console.error('Network check failed:', networkError);
          throw new Error('Please check your internet connection and try again');
        }
      }
      
      // Attempt to sign in
      const { error, data } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        console.error('Sign in error:', error);
        
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email address before logging in.');
        } else {
          throw error;
        }
      }
      
      console.log('Sign in successful:', data.session ? 'Session exists' : 'No session');
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Validate inputs
      if (!email || !password || !name) {
        throw new Error('Email, password, and name are required');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      // Check network connectivity first
      if (Platform.OS !== 'web') {
        try {
          const response = await fetch('https://www.google.com', { method: 'HEAD', timeout: 5000 });
          if (!response.ok) {
            throw new Error('Network connectivity issue detected');
          }
        } catch (networkError) {
          console.error('Network check failed:', networkError);
          throw new Error('Please check your internet connection and try again');
        }
      }
      
      // First, check if the Supabase connection is working
      try {
        const { error: pingError } = await supabase.from('users').select('count').limit(1);
        if (pingError) {
          console.error('Supabase connection test failed:', pingError);
          throw new Error('Unable to connect to the database. Please try again later.');
        }
      } catch (pingError: any) {
        console.error('Supabase ping test error:', pingError);
        throw new Error('Connection test failed. Please check your internet connection.');
      }
      
      // Proceed with signup
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        
        // Provide more user-friendly error messages
        if (error.message.includes('already registered')) {
          throw new Error('This email is already registered. Please try logging in instead.');
        } else {
          throw error;
        }
      }
      
      console.log('Sign up successful:', data.user ? 'User created' : 'No user');
      
      // If we have a user but no session, it might mean email confirmation is required
      if (data.user && !data.session) {
        Alert.alert(
          'Verification Required',
          'Please check your email to verify your account before logging in.',
          [{ text: 'OK', onPress: () => router.replace('/login') }]
        );
      }
      
      // Note: The user will be created in the database via a trigger
    } catch (error: any) {
      console.error('Error signing up:', error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error);
        throw error;
      }
      
      // Clear user and session state
      setUser(null);
      setSession(null);
      
      // Navigate to login screen
      router.replace('/login');
    } catch (error: any) {
      console.error('Error signing out:', error.message);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        session,
        isLoading, 
        signIn, 
        signUp, 
        signOut,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Create a hook to use the AuthContext
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
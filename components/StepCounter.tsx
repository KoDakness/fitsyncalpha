import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Footprints } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

export default function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [goal] = useState(10000); // Default daily goal
  const [isConnected, setIsConnected] = useState(false);

  // Platform-specific step counting implementation
  useEffect(() => {
    if (Platform.OS === 'web') {
      // For web, we'll use mock data
      const mockSteps = Math.floor(Math.random() * 10000);
      setSteps(mockSteps);
    } else {
      // For mobile, we would implement native health tracking
      // This would use Expo's health APIs in a real implementation
      setSteps(0);
    }
  }, []);

  const handleConnect = () => {
    if (Platform.OS === 'web') {
      // Show connection status for demo
      setIsConnected(true);
    } else {
      // Would implement native health permissions request
      setIsConnected(true);
    }
  };

  const progress = Math.min((steps / goal) * 100, 100);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
        style={styles.header}
      >
        <Footprints size={24} color={Colors.text.primary} />
        <Text style={styles.title}>Daily Steps</Text>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${progress}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>{Math.round(progress)}%</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{steps.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Steps</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>{goal.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Goal</Text>
          </View>
        </View>

        {!isConnected && (
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={handleConnect}
          >
            <Text style={styles.connectButtonText}>
              Connect Health App
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginLeft: 12,
  },
  content: {
    padding: 16,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.background.tertiary,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.brand.primary,
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    width: 40,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.ui.divider,
  },
  connectButton: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  connectButtonText: {
    color: Colors.brand.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
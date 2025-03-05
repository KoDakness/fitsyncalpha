import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Switch
} from 'react-native';
import { X, Save } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/supabase';
import { useWeight } from '@/context/WeightContext';
import HeightInput from '@/components/HeightInput';

interface AppSettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function AppSettingsModal({
  visible,
  onClose
}: AppSettingsModalProps) {
  const { user } = useAuth();
  const { weightData, updateWeightData } = useWeight();
  
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [isMetric, setIsMetric] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load user data when modal opens
  useEffect(() => {
    if (visible && user) {
      loadUserData();
    }
  }, [visible, user]);

  // Load user data from database
  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Get user's height from user metadata
      const userData = await db.users.getById(user.id);
      
      if (userData) {
        // Set height if available
        if (userData.height) {
          setHeight(userData.height.toString());
        }
        
        // Set weight from weight context
        setWeight(weightData.currentWeight.toString());
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving settings
  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Parse height and weight
      const heightValue = parseFloat(height) || 0;
      const weightValue = parseFloat(weight) || 0;
      
      // Update user profile with height
      await db.users.update(user.id, {
        height: heightValue
      });
      
      // Update weight if changed
      if (weightValue !== weightData.currentWeight) {
        await updateWeightData(weightValue, weightData.targetWeight);
      }
      
      // Show saved indicator
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert between metric and imperial
  const toggleUnitSystem = () => {
    setIsMetric(!isMetric);
    
    // Weight conversion is handled in the HeightInput component
    
    // Convert weight between kg and lbs
    if (weight) {
      const weightValue = parseFloat(weight);
      if (!isNaN(weightValue)) {
        if (isMetric) {
          // Convert kg to lbs
          setWeight((weightValue * 2.20462).toFixed(1));
        } else {
          // Convert lbs to kg
          setWeight((weightValue / 2.20462).toFixed(1));
        }
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.centeredView}
      >
        <View style={styles.modalView}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>App Settings</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Body Measurements</Text>
              
              <View style={styles.unitToggleContainer}>
                <Text style={styles.label}>Unit System</Text>
                <View style={styles.unitToggle}>
                  <Text style={[
                    styles.unitLabel, 
                    isMetric ? styles.activeUnitLabel : styles.inactiveUnitLabel
                  ]}>
                    Metric (cm/kg)
                  </Text>
                  <Switch
                    trackColor={{ false: Colors.background.tertiary, true: Colors.background.tertiary }}
                    thumbColor={isMetric ? Colors.brand.primary : Colors.brand.primary}
                    onValueChange={toggleUnitSystem}
                    value={!isMetric}
                  />
                  <Text style={[
                    styles.unitLabel, 
                    !isMetric ? styles.activeUnitLabel : styles.inactiveUnitLabel
                  ]}>
                    Imperial (in/lb)
                  </Text>
                </View>
              </View>
              
              <HeightInput
                value={height}
                isMetric={isMetric}
                onChangeHeight={setHeight}
              />
              
              <View style={styles.inputContainer}>
                <Text style={styles.label}>
                  Weight {isMetric ? '(kg)' : '(lbs)'}
                </Text>
                <TextInput
                  style={styles.input}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  placeholder={isMetric ? "e.g., 70" : "e.g., 154"}
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>App Preferences</Text>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Switch
                  trackColor={{ false: Colors.background.tertiary, true: Colors.brand.secondary }}
                  thumbColor={darkMode ? Colors.brand.primary : Colors.text.tertiary}
                  onValueChange={setDarkMode}
                  value={darkMode}
                />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Switch
                  trackColor={{ false: Colors.background.tertiary, true: Colors.brand.secondary }}
                  thumbColor={notifications ? Colors.brand.primary : Colors.text.tertiary}
                  onValueChange={setNotifications}
                  value={notifications}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.text.primary} />
              ) : (
                <>
                  <Save size={20} color={Colors.text.primary} style={styles.saveIcon} />
                  <Text style={styles.saveButtonText}>
                    {isSaved ? 'Saved!' : 'Save Settings'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalView: {
    width: '100%',
    maxHeight: '90%',
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.divider,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  closeButton: {
    padding: 5,
  },
  scrollContent: {
    maxHeight: '100%',
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 16,
  },
  unitToggleContainer: {
    marginBottom: 16,
  },
  unitToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  unitLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  activeUnitLabel: {
    color: Colors.brand.primary,
  },
  inactiveUnitLabel: {
    color: Colors.text.secondary,
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
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  settingLabel: {
    fontSize: 16,
    color: Colors.text.primary,
  },
  saveButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveIcon: {
    marginRight: 8,
  },
  saveButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
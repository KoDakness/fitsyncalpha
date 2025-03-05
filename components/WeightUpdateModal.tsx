import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

interface WeightUpdateModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (currentWeight: number, targetWeight: number) => void;
  initialCurrentWeight: number;
  initialTargetWeight: number;
}

export default function WeightUpdateModal({
  visible,
  onClose,
  onSave,
  initialCurrentWeight,
  initialTargetWeight
}: WeightUpdateModalProps) {
  const [currentWeight, setCurrentWeight] = useState(initialCurrentWeight.toString());
  const [targetWeight, setTargetWeight] = useState(initialTargetWeight.toString());
  const [toGo, setToGo] = useState('0');

  // Update the "to go" value whenever current or target weight changes
  useEffect(() => {
    const current = parseFloat(currentWeight) || 0;
    const target = parseFloat(targetWeight) || 0;
    const difference = Math.max(0, current - target).toFixed(1);
    setToGo(difference);
  }, [currentWeight, targetWeight]);

  const handleSave = () => {
    const current = parseFloat(currentWeight) || initialCurrentWeight;
    const target = parseFloat(targetWeight) || initialTargetWeight;
    onSave(current, target);
    onClose();
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
            <Text style={styles.modalTitle}>Update Weight</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              value={currentWeight}
              onChangeText={setCurrentWeight}
              keyboardType="numeric"
              placeholder="Enter your current weight"
              placeholderTextColor={Colors.text.tertiary}
              selectionColor={Colors.brand.primary}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Target Weight (lbs)</Text>
            <TextInput
              style={styles.input}
              value={targetWeight}
              onChangeText={setTargetWeight}
              keyboardType="numeric"
              placeholder="Enter your target weight"
              placeholderTextColor={Colors.text.tertiary}
              selectionColor={Colors.brand.primary}
            />
          </View>

          <View style={styles.summaryContainer}>
            <Text style={styles.summaryLabel}>Weight to Lose:</Text>
            <Text style={styles.summaryValue}>{toGo} lbs</Text>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <LinearGradient
              colors={[Colors.brand.gradient.start, Colors.brand.gradient.end]}
              style={styles.gradientButton}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
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
    backgroundColor: Colors.background.card,
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 20,
    paddingBottom: 15,
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
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  summaryLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.brand.primary,
  },
  saveButton: {
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 10,
  },
  gradientButton: {
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
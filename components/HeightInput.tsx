import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Colors from '@/constants/Colors';

interface HeightInputProps {
  value: string;
  isMetric: boolean;
  onChangeHeight: (height: string) => void;
}

export default function HeightInput({ value, isMetric, onChangeHeight }: HeightInputProps) {
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [centimeters, setCentimeters] = useState(value);

  // When the metric system changes or value changes externally
  useEffect(() => {
    if (isMetric) {
      setCentimeters(value);
    } else {
      // If we have a value and switching to imperial, convert from cm to ft/in
      if (value) {
        // Check if the value is already in feet'inches format
        if (value.includes("'")) {
          const parts = value.split("'");
          setFeet(parts[0]);
          setInches(parts[1].replace('"', ''));
        } else {
          const totalInches = parseFloat(value) / 2.54;
          const ft = Math.floor(totalInches / 12);
          const inch = Math.round(totalInches % 12);
          setFeet(ft.toString());
          setInches(inch.toString());
        }
      }
    }
  }, [isMetric, value]);

  // When feet or inches change, calculate the height in cm
  useEffect(() => {
    if (!isMetric && (feet || inches)) {
      const ft = parseInt(feet) || 0;
      const inch = parseInt(inches) || 0;
      
      // Store both the imperial format and the cm value
      const imperialFormat = `${ft}'${inch}"`;
      const totalInches = (ft * 12) + inch;
      const cm = Math.round(totalInches * 2.54);
      
      // Pass the appropriate format based on the current unit system
      onChangeHeight(isMetric ? cm.toString() : imperialFormat);
    }
  }, [feet, inches, isMetric]);

  // When centimeters change, update the value
  const handleCentimetersChange = (cm: string) => {
    setCentimeters(cm);
    onChangeHeight(cm);
  };

  if (isMetric) {
    return (
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Height (cm)</Text>
        <TextInput
          style={styles.input}
          value={centimeters}
          onChangeText={handleCentimetersChange}
          keyboardType="numeric"
          placeholder="e.g., 175"
          placeholderTextColor={Colors.text.tertiary}
        />
      </View>
    );
  }

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>Height (ft/in)</Text>
      <View style={styles.imperialContainer}>
        <View style={styles.feetContainer}>
          <TextInput
            style={styles.imperialInput}
            value={feet}
            onChangeText={setFeet}
            keyboardType="numeric"
            placeholder="ft"
            placeholderTextColor={Colors.text.tertiary}
          />
          <Text style={styles.imperialLabel}>ft</Text>
        </View>
        <View style={styles.inchesContainer}>
          <TextInput
            style={styles.imperialInput}
            value={inches}
            onChangeText={setInches}
            keyboardType="numeric"
            placeholder="in"
            placeholderTextColor={Colors.text.tertiary}
          />
          <Text style={styles.imperialLabel}>in</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: 20,
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
  imperialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feetContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
  },
  inchesContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 8,
    padding: 12,
  },
  imperialInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },
  imperialLabel: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
});
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Platform, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/Colors';

// Only import the BarCodeScanner on non-web platforms
let BarCodeScanner: any = null;
if (Platform.OS !== 'web') {
  try {
    // Dynamic import to prevent errors on web
    const ExpoBarCodeScanner = require('expo-barcode-scanner');
    BarCodeScanner = ExpoBarCodeScanner?.BarCodeScanner;
  } catch (error) {
    console.log('BarCodeScanner not available:', error);
  }
}

interface BarcodeScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export default function BarcodeScanner({ onScan, onClose }: BarcodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [isBarcodeScannerAvailable, setIsBarcodeScannerAvailable] = useState(false);

  useEffect(() => {
    // Always use the fallback on web
    if (Platform.OS === 'web') {
      setIsBarcodeScannerAvailable(false);
      setHasPermission(false);
      return;
    }
    
    // Check if BarCodeScanner is available
    const checkBarcodeScannerAvailability = async () => {
      if (!BarCodeScanner) {
        console.log('BarCodeScanner module not found');
        setIsBarcodeScannerAvailable(false);
        setHasPermission(false);
        return;
      }
      
      try {
        // Check if the device has a camera
        const { status } = await BarCodeScanner.requestPermissionsAsync();
        console.log('Camera permission status:', status);
        
        if (status === 'granted') {
          setHasPermission(true);
          setIsBarcodeScannerAvailable(true);
        } else {
          console.log('Camera permission denied');
          setHasPermission(false);
          setIsBarcodeScannerAvailable(false);
          
          // Show alert to user about permission
          if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Alert.alert(
              'Camera Permission Required',
              'Please enable camera permissions in your device settings to use the barcode scanner.',
              [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );
          }
        }
      } catch (error) {
        console.log('Error checking barcode scanner availability:', error);
        setIsBarcodeScannerAvailable(false);
        setHasPermission(false);
      }
    };

    checkBarcodeScannerAvailability();
  }, []);

  const handleBarCodeScanned = ({ type, data }: { type: string, data: string }) => {
    console.log(`Bar code with type ${type} and data ${data} has been scanned!`);
    setScanned(true);
    onScan(data);
  };

  // For web platform or when scanner is not available, simulate a scan with a mock barcode
  const simulateScan = () => {
    // Use a real UPC code for a common food item
    onScan('021130126026'); // Example UPC for a food product
  };

  // Always show the fallback UI on web or when scanner is not available
  return (
    <View style={styles.container}>
      <View style={styles.webFallback}>
        <Text style={styles.webFallbackText}>
          Barcode scanning is not available in this environment.
        </Text>
        <Text style={styles.webFallbackSubtext}>
          {Platform.OS === 'web' 
            ? 'Please use a mobile device with the Expo Go app or a native build.'
            : 'Your device may not support barcode scanning or the necessary permissions were not granted.'}
        </Text>
        <TouchableOpacity 
          style={styles.simulateButton} 
          onPress={simulateScan}
        >
          <Text style={styles.simulateButtonText}>Simulate Scan</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={onClose}>
          <Text style={styles.buttonText}>Close</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <X size={24} color={Colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: Colors.brand.primary,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: 20,
  },
  instructionsText: {
    color: Colors.text.primary,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
  },
  scanAgainButton: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  scanAgainButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  text: {
    color: Colors.text.primary,
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  subtext: {
    color: Colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    marginHorizontal: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  webFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.background.secondary,
  },
  webFallbackText: {
    color: Colors.text.primary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  webFallbackSubtext: {
    color: Colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  simulateButton: {
    backgroundColor: Colors.brand.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  simulateButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
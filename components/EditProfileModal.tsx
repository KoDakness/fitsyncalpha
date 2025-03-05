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
  Image,
  Alert
} from 'react-native';
import { X, Camera, Check, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/supabase';

// List of profile picture options from Unsplash
const profilePictureOptions = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=928&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=928&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=776&q=80'
];

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onProfileUpdated: () => void;
}

export default function EditProfileModal({
  visible,
  onClose,
  onProfileUpdated
}: EditProfileModalProps) {
  const { user, refreshUser } = useAuth();
  
  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  const [showPictureSelector, setShowPictureSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Load user data when modal opens
  useEffect(() => {
    if (visible && user) {
      loadUserData();
    }
  }, [visible, user]);

  // Load user data
  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Set name from user object
      setName(user.name || '');
      
      // Get profile picture from user metadata
      const userData = await db.users.getById(user.id);
      
      if (userData && userData.profile_picture) {
        setProfilePicture(userData.profile_picture);
      } else {
        // Default profile picture
        setProfilePicture(profilePictureOptions[0]);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle saving profile
  const handleSave = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Validate name
      if (!name.trim()) {
        Alert.alert('Error', 'Please enter your name');
        setIsLoading(false);
        return;
      }
      
      // Update user profile
      await db.users.update(user.id, {
        name: name.trim(),
        profile_picture: profilePicture
      });
      
      // Refresh user data in context
      await refreshUser();
      
      // Show saved indicator
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
        onProfileUpdated();
      }, 1000);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle picture selector
  const togglePictureSelector = () => {
    setShowPictureSelector(!showPictureSelector);
  };

  // Select profile picture
  const selectProfilePicture = (pictureUrl: string) => {
    setProfilePicture(pictureUrl);
    setShowPictureSelector(false);
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
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <View style={styles.profilePictureContainer}>
              <Image
                source={{ uri: profilePicture }}
                style={styles.profilePicture}
              />
              <TouchableOpacity 
                style={styles.changePictureButton}
                onPress={togglePictureSelector}
              >
                <Camera size={20} color={Colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>

            {showPictureSelector && (
              <View style={styles.pictureSelector}>
                <Text style={styles.pictureSelectorTitle}>Choose a Profile Picture</Text>
                <View style={styles.pictureGrid}>
                  {profilePictureOptions.map((pictureUrl, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.pictureOption,
                        profilePicture === pictureUrl && styles.selectedPictureOption
                      ]}
                      onPress={() => selectProfilePicture(pictureUrl)}
                    >
                      <Image
                        source={{ uri: pictureUrl }}
                        style={styles.pictureOptionImage}
                      />
                      {profilePicture === pictureUrl && (
                        <View style={styles.selectedPictureOverlay}>
                          <Check size={24} color={Colors.text.primary} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.text.primary} />
              ) : (
                <Text style={styles.saveButtonText}>
                  {isSaved ? 'Saved!' : 'Save Profile'}
                </Text>
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
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.brand.primary,
  },
  changePictureButton: {
    position: 'absolute',
    bottom: 0,
    right: '30%',
    backgroundColor: Colors.brand.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.background.card,
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
  pictureSelector: {
    marginBottom: 24,
  },
  pictureSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  pictureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  pictureOption: {
    width: '30%',
    aspectRatio: 1,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPictureOption: {
    borderColor: Colors.brand.primary,
  },
  pictureOptionImage: {
    width: '100%',
    height: '100%',
  },
  selectedPictureOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: Colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});
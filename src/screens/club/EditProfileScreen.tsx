import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useAuth } from '../../hooks/useAuth';
import { Input, Button } from '../../components/common';
import { theme } from '../../utils/theme';
import { AuthService } from '../../services/auth';
import { useCustomAlert } from '../../contexts/AlertContext';
import type { ClubStackParamList } from '../../types';

type EditProfileNavigationProp = StackNavigationProp<ClubStackParamList, 'EditProfile'>;

interface EditProfileFormData {
  name: string;
  email: string;
  phone: string;
  bio: string;
}

export default function EditProfileScreen() {
  const navigation = useNavigation<EditProfileNavigationProp>();
  const { currentUser, updateProfile } = useAuth();
  const { alert } = useCustomAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<EditProfileFormData>({
    name: '',
    email: '',
    phone: '',
    bio: '',
  });
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          // Get full user data including phone and bio from Firestore
          const userData = await AuthService.getUserData(currentUser.uid);
          if (userData) {
            setFormData({
              name: userData.name || currentUser.displayName || '',
              email: userData.email || currentUser.email || '',
              phone: userData.phone || '',
              bio: userData.bio || '',
            });
          }
        } catch (error) {
          console.error("Error loading user data:", error);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  const updateField = (field: keyof EditProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      alert({
        title: 'Error',
        message: 'Please enter your name',
        type: 'error'
      });
      return false;
    }
    if (!formData.email.trim()) {
      alert({
        title: 'Error',
        message: 'Please enter your email',
        type: 'error'
      });
      return false;
    }
    if (!formData.email.includes('@')) {
      alert({
        title: 'Error',
        message: 'Please enter a valid email address',
        type: 'error'
      });
      return false;
    }    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Update user profile data in Firestore
      await updateProfile(currentUser.uid, {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
      });
      
      alert({
        title: 'Success',
        message: 'Profile updated successfully!',
        type: 'success',
        buttons: [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      });
    } catch (error: any) {
      alert({
        title: 'Error',
        message: error.message || 'Failed to update profile. Please try again.',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Edit Profile</Text>
          <Text style={styles.subtitle}>Update your personal information</Text>
        </View>

        <View style={styles.formContainer}>
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            leftIcon="person-outline"
            autoCapitalize="words"
          />

          <Input
            label="Email Address"
            placeholder="Enter your email address"
            value={formData.email}
            onChangeText={(text) => updateField('email', text)}
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            leftIcon="call-outline"
            keyboardType="phone-pad"
          />

          <Input
            label="Bio"
            placeholder="Tell us about yourself"
            value={formData.bio}
            onChangeText={(text) => updateField('bio', text)}
            leftIcon="document-text-outline"
            multiline
            numberOfLines={4}
            style={styles.bioInput}
          />

          <View style={styles.buttonContainer}>
            <Button
              title="Save Changes"
              onPress={handleSave}
              loading={isLoading}
              style={styles.saveButton}
            />
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              variant="outline"
              style={styles.cancelButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
  },
  formContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  bioInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  saveButton: {
    marginBottom: theme.spacing.sm,
  },
  cancelButton: {
    borderColor: theme.colors.textSecondary,
  },
});

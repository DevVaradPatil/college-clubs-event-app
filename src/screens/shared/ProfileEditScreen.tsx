import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

import { Input, Button, ImageUpload } from '../../components/common';
import { theme } from '../../utils/theme';
import { RootState } from '../../store';
import { updateUserProfile } from '../../store/slices/authSlice';

interface ProfileEditScreenProps {
  navigation: any;
}

export default function ProfileEditScreen({ navigation }: ProfileEditScreenProps) {
  const dispatch = useDispatch();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    major: user?.major || '',
    graduationYear: user?.graduationYear || new Date().getFullYear(),
    profileImage: user?.profileImage || '',
  });
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        bio: user.bio || '',
        phone: user.phone || '',
        major: user.major || '',
        graduationYear: user.graduationYear || new Date().getFullYear(),
        profileImage: user.profileImage || '',
      });
    }
  }, [user]);

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      setIsSaving(true);
      
      // Here you would typically call an API to update the user profile
      // For now, we'll just dispatch to the Redux store
      await dispatch(updateUserProfile(formData) as any);
      
      Alert.alert(
        'Success', 
        'Profile updated successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Image Section */}
        <View style={styles.imageSection}>
          <Text style={styles.sectionTitle}>Profile Photo</Text>
          <ImageUpload
            currentImageUrl={formData.profileImage}
            onImageUpload={(url) => updateField('profileImage', url)}
            placeholder="Upload Photo"
            size="large"
            shape="circle"
            folder="profile_images"
          />
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={formData.name}
            onChangeText={(text) => updateField('name', text)}
            leftIcon="person-outline"
            autoCapitalize="words"
          />

          <Input
            label="Bio"
            placeholder="Tell us about yourself"
            value={formData.bio}
            onChangeText={(text) => updateField('bio', text)}
            leftIcon="document-text-outline"
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          <Input
            label="Phone Number"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChangeText={(text) => updateField('phone', text)}
            leftIcon="call-outline"
            keyboardType="phone-pad"
          />
        </View>

        {/* Academic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Academic Information</Text>
          
          <Input
            label="Major"
            placeholder="Enter your major"
            value={formData.major}
            onChangeText={(text) => updateField('major', text)}
            leftIcon="school-outline"
            autoCapitalize="words"
          />

          <Input
            label="Graduation Year"
            placeholder="Enter graduation year"
            value={formData.graduationYear.toString()}
            onChangeText={(text) => updateField('graduationYear', parseInt(text) || new Date().getFullYear())}
            leftIcon="calendar-outline"
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={isSaving}
          style={styles.saveButton}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    paddingTop: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    padding: theme.spacing.sm,
    marginLeft: -theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  imageSection: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  saveButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
});

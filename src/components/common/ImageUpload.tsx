import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../utils/theme';
import CloudinaryService from '../../services/cloudinary';

interface ImageUploadProps {
  currentImageUrl?: string;
  onImageUpload: (imageUrl: string) => void;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large';
  shape?: 'circle' | 'square' | 'rectangle';
  folder?: 'profile_images' | 'club_logos' | 'club_covers' | 'event_images';
  disabled?: boolean;
}

export default function ImageUpload({
  currentImageUrl,
  onImageUpload,
  placeholder = 'Upload Image',
  size = 'medium',
  shape = 'circle',
  folder = 'profile_images',
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);

  const getDimensions = () => {
    switch (size) {
      case 'small':
        return { width: 60, height: 60 };
      case 'medium':
        return { width: 100, height: 100 };
      case 'large':
        return shape === 'rectangle' ? { width: 200, height: 120 } : { width: 150, height: 150 };
      default:
        return { width: 100, height: 100 };
    }
  };

  const getBorderRadius = () => {
    const dimensions = getDimensions();
    switch (shape) {
      case 'circle':
        return dimensions.width / 2;
      case 'square':
        return theme.borderRadius.lg;
      case 'rectangle':
        return theme.borderRadius.xl;
      default:
        return dimensions.width / 2;
    }
  };

  const getAspectRatio = (): [number, number] => {
    switch (folder) {
      case 'club_covers':
      case 'event_images':
        return [16, 9]; // Widescreen ratio for cover images
      case 'profile_images':
      case 'club_logos':
      default:
        return [1, 1]; // Square ratio for profiles and logos
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      'Select Image',
      'Choose how you want to select an image',
      [
        {
          text: 'Camera',
          onPress: () => handleImageSelection('camera'),
        },
        {
          text: 'Gallery',
          onPress: () => handleImageSelection('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleImageSelection = async (source: 'camera' | 'gallery') => {
    try {
      setIsUploading(true);
      
      let imageUri: string | null = null;
      const aspectRatio = getAspectRatio();
      
      if (source === 'camera') {
        imageUri = await CloudinaryService.takePhoto(aspectRatio);
      } else {
        imageUri = await CloudinaryService.pickImageFromGallery(aspectRatio);
      }

      if (imageUri) {
        const uploadResult = await CloudinaryService.uploadImage(imageUri, folder);
        onImageUpload(uploadResult.secure_url);
      }
    } catch (error: any) {
      Alert.alert(
        'Upload Error',
        error.message || 'Failed to upload image. Please try again.'
      );
    } finally {
      setIsUploading(false);
    }
  };

  const dimensions = getDimensions();
  const borderRadius = getBorderRadius();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.imageContainer,
          {
            width: dimensions.width,
            height: dimensions.height,
            borderRadius,
          },
          disabled && styles.disabled,
        ]}
        onPress={!disabled ? showImagePickerOptions : undefined}
        disabled={disabled || isUploading}
      >
        {isUploading ? (
          <View style={[styles.uploadingContainer, { borderRadius }]}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
            <Text style={styles.uploadingText}>Uploading...</Text>
          </View>
        ) : currentImageUrl ? (
          <>
            <Image
              source={{ uri: currentImageUrl }}
              style={[
                styles.image,
                {
                  width: dimensions.width,
                  height: dimensions.height,
                  borderRadius,
                },
              ]}
              resizeMode="cover"
            />
            <View style={styles.editOverlay}>
              <Ionicons name="camera" size={16} color={theme.colors.textInverse} />
            </View>
          </>
        ) : (
          <View style={[styles.placeholder, { borderRadius }]}>
            <Ionicons
              name="camera"
              size={size === 'small' ? 20 : size === 'medium' ? 24 : 32}
              color={theme.colors.textSecondary}
            />
            <Text
              style={[
                styles.placeholderText,
                { fontSize: size === 'small' ? 10 : size === 'medium' ? 12 : 14 },
              ]}
            >
              {placeholder}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  image: {
    backgroundColor: theme.colors.surface,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.medium,
  },
  uploadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    gap: theme.spacing.xs,
  },
  uploadingText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  editOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
});

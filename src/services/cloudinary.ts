import * as ImagePicker from 'expo-image-picker';
import { CLOUDINARY_CONFIG, isCloudinaryConfigured } from '../config/cloudinary';

// Cloudinary configuration - imported from config file

export interface CloudinaryUploadResult {
  url: string;
  public_id: string;
  secure_url: string;
}

export class CloudinaryService {
  /**
   * Request permissions for camera and media library
   */
  static async requestPermissions(): Promise<boolean> {
    try {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaLibraryStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      return cameraStatus === 'granted' && mediaLibraryStatus === 'granted';
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * Pick an image from the device gallery
   */
  static async pickImageFromGallery(aspectRatio: [number, number] = [1, 1]): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera and media library permissions are required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      throw error;
    }
  }

  /**
   * Take a photo with the device camera
   */
  static async takePhoto(aspectRatio: [number, number] = [1, 1]): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        throw new Error('Camera and media library permissions are required');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: aspectRatio,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return result.assets[0].uri;
      }
      
      return null;
    } catch (error) {
      console.error('Error taking photo:', error);
      throw error;
    }
  }

  /**
   * Upload image to Cloudinary
   */
  static async uploadImage(
    imageUri: string, 
    folder: 'profile_images' | 'club_logos' | 'club_covers' | 'event_images' = 'profile_images'
  ): Promise<CloudinaryUploadResult> {
    try {
      if (!isCloudinaryConfigured()) {
        throw new Error('Cloudinary is not configured. Please update the configuration in src/config/cloudinary.ts');
      }

      const formData = new FormData();
      
      // Create file object from URI
      const fileExtension = imageUri.split('.').pop() || 'jpg';
      const fileName = `${Date.now()}.${fileExtension}`;
      
      formData.append('file', {
        uri: imageUri,
        type: `image/${fileExtension}`,
        name: fileName,
      } as any);
      
      formData.append('upload_preset', CLOUDINARY_CONFIG.UPLOAD_PRESET);
      formData.append('folder', folder);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
          // Don't set Content-Type header - let React Native handle it automatically
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorData}`);
      }

      const result = await response.json();
      
      return {
        url: result.url,
        public_id: result.public_id,
        secure_url: result.secure_url,
      };
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      // Note: Deleting images requires server-side implementation with API secret
      // For now, we'll just return true. In production, you should implement
      // a server endpoint to handle image deletion
      console.log(`Image deletion requested for public_id: ${publicId}`);
      return true;
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Get optimized image URL with transformations
   */
  static getOptimizedImageUrl(
    originalUrl: string,
    width: number = 300,
    height: number = 300,
    quality: 'auto' | number = 'auto'
  ): string {
    try {
      console.log('CloudinaryService.getOptimizedImageUrl called with:', { originalUrl, width, height, quality });
      
      if (!originalUrl || !originalUrl.includes('cloudinary.com')) {
        console.log('URL is not a Cloudinary URL, returning original:', originalUrl);
        return originalUrl;
      }

      // Extract the public ID from the URL
      const urlParts = originalUrl.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      console.log('URL parts:', urlParts);
      console.log('Upload index:', uploadIndex);
      
      if (uploadIndex === -1) {
        console.log('No upload part found, returning original URL');
        return originalUrl;
      }

      // Insert transformation parameters
      const beforeUpload = urlParts.slice(0, uploadIndex + 1);
      const afterUpload = urlParts.slice(uploadIndex + 1);
      
      const transformations = `w_${width},h_${height},c_fill,q_${quality},f_auto`;
      
      const optimizedUrl = [...beforeUpload, transformations, ...afterUpload].join('/');
      console.log('Generated optimized URL:', optimizedUrl);
      
      return optimizedUrl;
    } catch (error) {
      console.error('Error creating optimized image URL:', error);
      return originalUrl;
    }
  }
}

export default CloudinaryService;

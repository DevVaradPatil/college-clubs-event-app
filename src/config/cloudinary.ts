export const CLOUDINARY_CONFIG = {
  // Replace with your actual Cloudinary cloud name
  CLOUD_NAME: 'da6mvlyll',
  
  // Replace with your actual upload preset name
  UPLOAD_PRESET: 'clubApp',
  
  // Default transformations for different image types
  TRANSFORMATIONS: {
    PROFILE_IMAGE: 'w_300,h_300,c_fill,q_auto,f_auto',
    CLUB_LOGO: 'w_200,h_200,c_fill,q_auto,f_auto',
    CLUB_COVER: 'w_800,h_400,c_fill,q_auto,f_auto',
    EVENT_IMAGE: 'w_600,h_400,c_fill,q_auto,f_auto',
  },
  
  // Maximum file size in bytes (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
};

// Helper function to check if Cloudinary is configured
export const isCloudinaryConfigured = (): boolean => {
  return (
    CLOUDINARY_CONFIG.CLOUD_NAME !== 'your_cloud_name' &&
    CLOUDINARY_CONFIG.UPLOAD_PRESET !== 'your_upload_preset' &&
    CLOUDINARY_CONFIG.CLOUD_NAME.length > 0 &&
    CLOUDINARY_CONFIG.UPLOAD_PRESET.length > 0
  );
};

export default CLOUDINARY_CONFIG;

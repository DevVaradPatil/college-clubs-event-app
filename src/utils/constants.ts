export const APP_NAME = 'ClubEvents';
export const VERSION = '1.0.0';

// API endpoints
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : 'https://your-production-api.com/api';

// Storage keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@clubevents:auth_token',
  USER_DATA: '@clubevents:user_data',
  ONBOARDING_COMPLETE: '@clubevents:onboarding_complete',
} as const;

// Event categories
export const EVENT_CATEGORIES = [
  { value: 'academic', label: 'Academic' },
  { value: 'social', label: 'Social' },
  { value: 'sports', label: 'Sports' },
  { value: 'cultural', label: 'Cultural' },
  { value: 'workshop', label: 'Workshop' },
  { value: 'other', label: 'Other' },
] as const;

// Date and time formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  API: 'yyyy-MM-dd',
  TIME: 'h:mm a',
  FULL: 'MMM dd, yyyy h:mm a',
} as const;
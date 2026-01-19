// Firebase configuration for Expo Go compatibility
import { initializeApp, getApps } from "firebase/app";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDH328VefPquU3kvigrWnRLp-4t6rhNSJk",
  authDomain: "codesnap-32dcf.firebaseapp.com",
  projectId: "codesnap-32dcf",
  storageBucket: "codesnap-32dcf.firebasestorage.app",
  messagingSenderId: "187907832697",
  appId: "1:187907832697:web:efc76de9cca78fdc04cda8",
  measurementId: "G-9CJH6PBQMN",
};

// Initialize Firebase App only once
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Lazy initialize Firebase services to avoid initialization race conditions
let _auth: any = null;
let _db: any = null;
let _storage: any = null;

// Auth getter with lazy initialization and AsyncStorage persistence
export const getAuthInstance = () => {
  if (!_auth) {
    const { initializeAuth, getReactNativePersistence } = require("firebase/auth");
    const AsyncStorage = require("@react-native-async-storage/async-storage").default;
    
    try {
      _auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
      });
    } catch (error) {
      // If already initialized, get the existing auth instance
      const { getAuth } = require("firebase/auth");
      _auth = getAuth(app);
    }
  }
  return _auth;
};

// Firestore getter with lazy initialization
export const getFirestoreInstance = () => {
  if (!_db) {
    const { getFirestore } = require("firebase/firestore");
    _db = getFirestore(app);
  }
  return _db;
};

// Storage getter with lazy initialization
export const getStorageInstance = () => {
  if (!_storage) {
    const { getStorage } = require("firebase/storage");
    _storage = getStorage(app);
  }
  return _storage;
};

// Export services using getters
export const auth = getAuthInstance();
export const db = getFirestoreInstance();
export const storage = getStorageInstance();

export default app;

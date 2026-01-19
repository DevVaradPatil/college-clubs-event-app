import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuthInstance, getFirestoreInstance } from "./firebase";
import { User, LoginCredentials, RegisterCredentials } from "../types/auth";

export interface AuthResult {
  user: User;
  token: string;
}

export class AuthService {  // Register new user
  static async register(credentials: RegisterCredentials): Promise<AuthResult> {
    try {
      const auth = getAuthInstance();
      const db = getFirestoreInstance();

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Update the user's display name
      await updateProfile(firebaseUser, {
        displayName: credentials.name,
      });

      // Create user document in Firestore (all users are students now)
      const userData: User = {
        id: firebaseUser.uid,
        email: credentials.email,
        name: credentials.name,
        role: "student",
        joinedClubs: [],
        managedClubs: credentials.createClub ? [firebaseUser.uid] : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Only add profileImage if it has a value
      if (credentials.profileImage && credentials.profileImage.trim()) {
        userData.profileImage = credentials.profileImage.trim();
      }

      // Save user data to Firestore
      await setDoc(doc(db, "users", firebaseUser.uid), userData);      // If user wants to create a club, create club document
      if (credentials.createClub) {
        const clubData: any = {
          id: firebaseUser.uid,
          name: credentials.createClub.clubName,
          description: credentials.createClub.clubDescription,
          founderId: firebaseUser.uid,
          currentLeaderId: firebaseUser.uid,
          memberCount: 1, // Starting with the founder
          category: credentials.createClub.clubCategory,
          isActive: true,
          isPublic: true, // Default to public
          contactEmail: credentials.email,
          foundedDate: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Only add optional fields if they have values
        if (credentials.createClub.clubWebsite && credentials.createClub.clubWebsite.trim()) {
          clubData.website = credentials.createClub.clubWebsite.trim();
        }
        
        if (credentials.createClub.clubLogo && credentials.createClub.clubLogo.trim()) {
          clubData.logo = credentials.createClub.clubLogo.trim();
        }
        
        if (credentials.createClub.clubCoverImage && credentials.createClub.clubCoverImage.trim()) {
          clubData.coverImage = credentials.createClub.clubCoverImage.trim();
        }
        
        await setDoc(doc(db, "clubs", firebaseUser.uid), clubData);
        
        // Create the first club member (the founder as president)
        await setDoc(doc(db, "clubMembers", `${firebaseUser.uid}_${firebaseUser.uid}`), {
          id: `${firebaseUser.uid}_${firebaseUser.uid}`,
          userId: firebaseUser.uid,
          clubId: firebaseUser.uid,
          name: credentials.name,
          email: credentials.email,
          role: "president",
          joinedAt: new Date().toISOString(),
          status: "active",
        });

        // Update user's joinedClubs to include their own club
        userData.joinedClubs = [firebaseUser.uid];
        await setDoc(doc(db, "users", firebaseUser.uid), userData);
      }

      // Get the authentication token
      const token = await firebaseUser.getIdToken();

      return {
        user: userData,
        token,
      };
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Login user
  static async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const auth = getAuthInstance();
      const db = getFirestoreInstance();

      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );

      const firebaseUser = userCredential.user;

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));

      if (!userDoc.exists()) {
        throw new Error("User data not found. Please contact support.");
      }

      const userData = userDoc.data() as User;

      // Get the authentication token
      const token = await firebaseUser.getIdToken();

      return {
        user: userData,
        token,
      };
    } catch (error: any) {
      console.error("Login error:", error);
      throw new Error(this.getAuthErrorMessage(error.code));
    }
  }

  // Logout user
  static async logout(): Promise<void> {
    try {
      const auth = getAuthInstance();
      await signOut(auth);
    } catch (error: any) {
      console.error("Logout error:", error);
      throw new Error("Failed to logout. Please try again.");
    }
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    const auth = getAuthInstance();
    return auth.currentUser;
  }

  // Get user data from Firestore
  static async getUserData(uid: string): Promise<User | null> {
    try {
      const db = getFirestoreInstance();
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.exists() ? (userDoc.data() as User) : null;
    } catch (error) {
      console.error("Error fetching user data:", error);
      return null;
    }
  }
  // Update user profile
  static async updateUserProfile(
    userId: string,
    profileData: Partial<User>
  ): Promise<User> {
    try {
      const db = getFirestoreInstance();
      const auth = getAuthInstance();
      const currentUser = auth.currentUser;

      // If name is being updated, also update it in Firebase Auth
      profileData.name
        ? currentUser
          ? await updateProfile(currentUser, { displayName: profileData.name })
          : null
        : null;

      // Update in Firestore
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        throw new Error("User data not found.");
      }

      const userData = userDoc.data() as User;

      // Prepare updated user data
      const updatedUserData = {
        ...userData,
        ...profileData,
        updatedAt: new Date().toISOString(),
      };

      // Save to Firestore
      await setDoc(userRef, updatedUserData);

      return updatedUserData;
    } catch (error: any) {
      console.error("Profile update error:", error);
      throw new Error("Failed to update profile. Please try again.");
    }
  }

  // Helper method to convert Firebase auth error codes to user-friendly messages
  private static getAuthErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "This email address is already registered. Please use a different email or try logging in.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/operation-not-allowed":
        return "Email/password accounts are not enabled. Please contact support.";
      case "auth/weak-password":
        return "Password is too weak. Please choose a stronger password.";
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support.";
      case "auth/user-not-found":
        return "No account found with this email address. Please check your email or create a new account.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-credential":
        return "Invalid email or password. Please check your credentials and try again.";
      case "auth/too-many-requests":
        return "Too many failed login attempts. Please try again later.";
      case "auth/network-request-failed":
        return "Network error. Please check your internet connection and try again.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'student'; // All users are students now
  profileImage?: string;
  phone?: string;
  bio?: string;
  // Student-specific fields
  studentId?: string; // Optional student ID
  major?: string;
  graduationYear?: number;
  joinedClubs?: string[]; // Clubs the student is a member of
  managedClubs?: string[]; // Clubs the student manages as leader/president
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'student'; // All registrations are student registrations now
  profileImage?: string; // Profile image URL
  // Optional club creation during registration
  createClub?: {
    clubName: string;
    clubDescription: string;
    clubCategory: string;
    clubWebsite?: string;
    clubLogo?: string; // Club logo URL
    clubCoverImage?: string; // Club cover image URL
  };
}
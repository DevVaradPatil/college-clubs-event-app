export interface Club {
  id: string;
  name: string;
  description: string;
  logo?: string;
  coverImage?: string;
  // Leadership information
  founderId: string; // The student who created the club
  currentLeaderId: string; // Current president/leader (can be transferred)
  leadershipHistory?: {
    studentId: string;
    studentName: string;
    role: 'president' | 'vice-president' | 'secretary' | 'treasurer';
    startDate: string;
    endDate?: string;
  }[];
  // Club details
  memberCount: number;
  category: string;
  tags?: string[]; // Tags for better categorization
  isActive: boolean;
  isPublic: boolean; // Whether the club accepts open registration
  // Contact information
  contactEmail: string;
  contactPhone?: string;
  website?: string;
  location?: string; // Meeting location or headquarters
  socialLinks?: {
    instagram?: string;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    discord?: string;
  };
  // Operational details
  meetingSchedule?: {
    day: string;
    time: string;
    location: string;
    frequency: 'weekly' | 'biweekly' | 'monthly';
  };
  membershipFee?: number;
  requirements?: string; // Requirements to join
  // Timestamps
  foundedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClubMember {
  id: string;
  userId: string;
  clubId: string;
  name: string;
  email: string;
  role: 'member' | 'moderator' | 'officer' | 'president' | 'vice-president' | 'secretary' | 'treasurer';
  joinedAt: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  permissions?: string[]; // Specific permissions for the member
  notes?: string; // Admin notes about the member
}

export interface ClubMembership {
  id: string;
  userId: string;
  clubId: string;
  role: 'member' | 'moderator' | 'officer' | 'president' | 'vice-president' | 'secretary' | 'treasurer';
  joinedAt: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

// New interface for club applications
export interface ClubApplication {
  id: string;
  applicantId: string;
  applicantName: string;
  applicantEmail: string;
  clubId: string;
  clubName: string;
  applicationDate: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string; // Application message from student
  responseMessage?: string; // Response from club admin
  reviewedBy?: string;
  reviewedAt?: string;
}
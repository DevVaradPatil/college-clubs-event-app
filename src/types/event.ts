export interface Event {
  id: string;
  title: string;
  description: string;
  clubId: string;
  clubName: string;
  startDate: string;
  endDate: string;
  location: string;
  category: 'academic' | 'social' | 'sports' | 'cultural' | 'workshop' | 'other';
  maxParticipants?: number;
  currentParticipants: number;
  isPublic: boolean;
  registrationRequired: boolean;
  registrationDeadline?: string;
  imageUrl?: string;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: string;
  status: 'registered' | 'attended' | 'cancelled';
}
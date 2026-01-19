export * from './auth';
export * from './club';
export * from './event';

// Redux types
export type { RootState, AppDispatch } from '../store';

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Student: undefined;
  Club: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type StudentStackParamList = {
  StudentTabs: undefined;
  Home: undefined;
  Search: undefined;
  Calendar: undefined;
  Profile: undefined;
  EditProfile: undefined;
  EventDetails: { eventId: string };
  ClubDetails: { clubId: string };
  EventHistory: undefined;
};

export type ClubStackParamList = {
  ClubTabs: undefined;
  Dashboard: undefined;
  CreateEvent: undefined;
  Profile: undefined;
  ManageClub: undefined;
  EditProfile: undefined;
  EventDetails: { eventId: string };
  EventsManagement: undefined;
  EditEvent: { eventId: string };
};
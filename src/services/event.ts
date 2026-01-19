import { 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  increment, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { getFirestoreInstance } from './firebase';
import { store } from '../store';
import { 
  fetchEventsStart,
  fetchEventsSuccess,
  fetchEventsFailure,
  createEventSuccess,
  updateEventSuccess
} from '../store/slices/eventsSlice';
import type { Event, EventRegistration } from '../types/event';
import { ClubService } from './club';

/**
 * IMPORTANT: Firebase Indexes Required
 * 
 * This service requires composite indexes to be created in Firestore.
 * 
 * For full details on required indexes, please see the firebase-indexes.md file
 * in the root of the project.
 * 
 * Quick setup:
 * 1. When you see an index error, check the console log for a direct URL
 * 2. Follow that URL to create the index automatically
 * 3. While waiting for index creation (which may take a few minutes), 
 *    the app will use fallback queries that still work
 * 
 * Required indexes:
 * 1. events collection: status (asc), endDate (asc), startDate (asc)
 * 2. events collection: clubId (asc), startDate (desc)
 */

export class EventService {
  // Create a new event
  static async createEvent(eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants'>): Promise<Event> {
    try {
      store.dispatch(fetchEventsStart());
      
      const db = getFirestoreInstance();
        // Get club name if not provided
      if (!eventData.clubName && eventData.clubId) {
        const clubData = await ClubService.getClubById(eventData.clubId);
        if (clubData) {
          eventData.clubName = clubData.name;
        }
      }
      
      // Clean up event data to remove undefined values (Firestore doesn't accept undefined)
      const cleanEventData = Object.entries(eventData).reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);
      
      const newEvent = {
        ...cleanEventData,
        currentParticipants: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const eventRef = await addDoc(collection(db, 'events'), newEvent);
      
      // Get the created event with ID
      const createdEvent = {
        id: eventRef.id,
        ...newEvent
      } as Event;
      
      // Update the Redux store
      store.dispatch(createEventSuccess(createdEvent));
      
      // If the event is published, update the club's event count
      if (eventData.status === 'published') {
        await this.updateClubEventCount(eventData.clubId, 1);
      }
      
      return createdEvent;
    } catch (error: any) {
      console.error('Error creating event:', error);
      store.dispatch(fetchEventsFailure(error.message || 'Failed to create event'));
      throw error;
    }
  }

  // Get a single event by ID
  static async getEventById(eventId: string): Promise<Event | null> {
    try {
      const db = getFirestoreInstance();
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      
      if (!eventDoc.exists()) {
        return null;
      }
      
      return { 
        id: eventDoc.id, 
        ...eventDoc.data() 
      } as Event;
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }
  // Get events by club ID
  static async getEventsByClubId(clubId: string): Promise<Event[]> {
    try {
      store.dispatch(fetchEventsStart());
      
      const db = getFirestoreInstance();
      
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('clubId', '==', clubId),
          orderBy('startDate', 'desc')
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        const events: Event[] = [];
        
        eventsSnapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() } as Event);
        });
        
        store.dispatch(fetchEventsSuccess(events));
        return events;
      } catch (indexError: any) {
        // Extract the index creation URL if available
        console.error('Index error in getEventsByClubId, using fallback query:', indexError);
        console.log('Index creation URL:', indexError.code === 'failed-precondition' ? indexError.message : 'No direct URL available');
        
        // Fallback to a simpler query without ordering
        const fallbackQuery = query(
          collection(db, 'events'),
          where('clubId', '==', clubId)
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackEvents: Event[] = [];
        
        fallbackSnapshot.forEach((doc) => {
          fallbackEvents.push({ id: doc.id, ...doc.data() } as Event);
        });
        
        // Sort in memory instead of using Firestore ordering
        fallbackEvents.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        
        store.dispatch(fetchEventsSuccess(fallbackEvents));
        return fallbackEvents;
      }
    } catch (error: any) {
      console.error('Error fetching club events:', error);
      store.dispatch(fetchEventsFailure(error.message || 'Failed to fetch events'));
      throw error;
    }
  }
  // Get published events
  static async getPublishedEvents(): Promise<Event[]> {
    try {
      store.dispatch(fetchEventsStart());
      
      const db = getFirestoreInstance();
      const now = new Date().toISOString();
      
      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('status', '==', 'published'),
          where('endDate', '>=', now),
          orderBy('endDate', 'asc'),
          orderBy('startDate', 'asc')
        );
        
        const eventsSnapshot = await getDocs(eventsQuery);
        const events: Event[] = [];
        
        eventsSnapshot.forEach((doc) => {
          events.push({ id: doc.id, ...doc.data() } as Event);
        });
        
        store.dispatch(fetchEventsSuccess(events));
        return events;
      } catch (indexError: any) {
        // If this is an index error, use a simpler query as fallback temporarily
        console.error('Index error, using fallback query:', indexError);
        console.log('Index creation URL:', indexError.code === 'failed-precondition' ? indexError.message : 'No direct URL available');
        
        // Fallback to a simpler query that doesn't require an index
        const fallbackQuery = query(
          collection(db, 'events'),
          where('status', '==', 'published'),
          orderBy('startDate', 'asc')
        );
        
        const fallbackSnapshot = await getDocs(fallbackQuery);
        const fallbackEvents: Event[] = [];
        
        // Filter the events manually in code (not ideal but works temporarily)
        const filteredEvents = fallbackSnapshot.docs
          .filter(doc => {
            const data = doc.data();
            return data.endDate >= now;
          })
          .map(doc => ({ id: doc.id, ...doc.data() } as Event));
        
        store.dispatch(fetchEventsSuccess(filteredEvents));
        return filteredEvents;
      }
    } catch (error: any) {
      console.error('Error fetching published events:', error);
      store.dispatch(fetchEventsFailure(error.message || 'Failed to fetch events'));
      throw error;
    }
  }

  // Update an event
  static async updateEvent(eventId: string, updateData: Partial<Event>): Promise<Event> {
    try {
      store.dispatch(fetchEventsStart());
      
      const db = getFirestoreInstance();
      const eventRef = doc(db, 'events', eventId);
      
      // Get current event data
      const eventDoc = await getDoc(eventRef);
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }
      
      const currentEvent = eventDoc.data() as Event;
      
      // If status is changing from draft to published, update club event count
      if (currentEvent.status === 'draft' && updateData.status === 'published') {
        await this.updateClubEventCount(currentEvent.clubId, 1);
      } else if (currentEvent.status === 'published' && updateData.status === 'draft') {
        await this.updateClubEventCount(currentEvent.clubId, -1);
      }
      
      // Update the event
      const eventUpdate = {
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(eventRef, eventUpdate);
      
      // Get updated event data
      const updatedEventDoc = await getDoc(eventRef);
      if (!updatedEventDoc.exists()) {
        throw new Error('Event not found after update');
      }
      
      const updatedEvent = {
        id: updatedEventDoc.id,
        ...updatedEventDoc.data()
      } as Event;
      
      store.dispatch(updateEventSuccess(updatedEvent));
      return updatedEvent;
    } catch (error: any) {
      console.error('Error updating event:', error);
      store.dispatch(fetchEventsFailure(error.message || 'Failed to update event'));
      throw error;
    }
  }

  // Register for an event
  static async registerForEvent(eventId: string, userId: string): Promise<EventRegistration> {
    try {
      const db = getFirestoreInstance();
      
      // Check if the user is already registered
      const registrationsQuery = query(
        collection(db, 'eventRegistrations'),
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      );
      
      const existingRegistrations = await getDocs(registrationsQuery);
      if (!existingRegistrations.empty) {
        throw new Error('You are already registered for this event');
      }
      
      // Check if the event exists and has space
      const eventDoc = await getDoc(doc(db, 'events', eventId));
      
      if (!eventDoc.exists()) {
        throw new Error('Event not found');
      }
      
      const eventData = eventDoc.data() as Event;
      
      if (eventData.status !== 'published') {
        throw new Error('This event is not open for registration');
      }
      
      if (eventData.maxParticipants && eventData.currentParticipants >= eventData.maxParticipants) {
        throw new Error('This event is full');
      }
      
      if (eventData.registrationDeadline && new Date(eventData.registrationDeadline) < new Date()) {
        throw new Error('Registration for this event has closed');
      }
      
      // Create registration
      const registrationData: Omit<EventRegistration, 'id'> = {
        eventId,
        userId,
        registeredAt: new Date().toISOString(),
        status: 'registered'
      };
      
      const registrationRef = await addDoc(
        collection(db, 'eventRegistrations'), 
        registrationData
      );
      
      // Update participant count
      await updateDoc(doc(db, 'events', eventId), {
        currentParticipants: increment(1)
      });
      
      return {
        id: registrationRef.id,
        ...registrationData
      };
    } catch (error) {
      console.error('Error registering for event:', error);
      throw error;
    }
  }

  // Cancel registration
  static async cancelRegistration(eventId: string, userId: string): Promise<void> {
    try {
      const db = getFirestoreInstance();
      
      // Find the user's registration
      const registrationsQuery = query(
        collection(db, 'eventRegistrations'),
        where('eventId', '==', eventId),
        where('userId', '==', userId)
      );
      
      const registrationsSnapshot = await getDocs(registrationsQuery);
      
      if (registrationsSnapshot.empty) {
        throw new Error('You are not registered for this event');
      }
      
      // Update the registration status
      const registrationDoc = registrationsSnapshot.docs[0];
      await updateDoc(doc(db, 'eventRegistrations', registrationDoc.id), {
        status: 'cancelled'
      });
      
      // Update participant count
      await updateDoc(doc(db, 'events', eventId), {
        currentParticipants: increment(-1)
      });
    } catch (error) {
      console.error('Error cancelling registration:', error);
      throw error;
    }
  }

  // Get registrations for an event
  static async getEventRegistrations(eventId: string): Promise<EventRegistration[]> {
    try {
      const db = getFirestoreInstance();
      
      const registrationsQuery = query(
        collection(db, 'eventRegistrations'),
        where('eventId', '==', eventId),
        where('status', '==', 'registered')
      );
      
      const registrationsSnapshot = await getDocs(registrationsQuery);
      const registrations: EventRegistration[] = [];
      
      registrationsSnapshot.forEach((doc) => {
        registrations.push({ 
          id: doc.id, 
          ...doc.data() 
        } as EventRegistration);
      });
      
      return registrations;
    } catch (error) {
      console.error('Error getting event registrations:', error);
      throw error;
    }
  }

  // Get user's event registrations
  static async getUserRegistrations(userId: string): Promise<EventRegistration[]> {
    try {
      const db = getFirestoreInstance();
      
      const registrationsQuery = query(
        collection(db, 'eventRegistrations'),
        where('userId', '==', userId),
        where('status', '==', 'registered')
      );
      
      const registrationsSnapshot = await getDocs(registrationsQuery);
      const registrations: EventRegistration[] = [];
      
      registrationsSnapshot.forEach((doc) => {
        registrations.push({ 
          id: doc.id, 
          ...doc.data() 
        } as EventRegistration);
      });
      
      return registrations;
    } catch (error) {
      console.error('Error getting user registrations:', error);
      throw error;
    }
  }

  // Update club event count (private helper)
  private static async updateClubEventCount(clubId: string, change: number): Promise<void> {
    try {
      const db = getFirestoreInstance();
      const clubRef = doc(db, 'clubs', clubId);
      
      await updateDoc(clubRef, { 
        eventCount: increment(change),
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating club event count:', error);
      // Don't throw, just log
    }
  }
}

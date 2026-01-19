import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from './useAuth';
import { EventService } from '../services/event';
import type { Event, EventRegistration } from '../types/event';
import type { RootState } from '../store';
import {
  registerForEventSuccess,
  cancelRegistrationSuccess,
  fetchUserRegistrationsSuccess
} from '../store/slices/eventsSlice';

export const useEvents = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { events, currentEvent, userRegistrations, isLoading, error } = useSelector(
    (state: RootState) => state.events
  );

  const fetchEvents = useCallback(async () => {
    if (!user) return;

    try {
      if (user.role === 'club') {
        // Club admin sees events created by their club
        const clubId = user.clubId || user.id;
        await EventService.getEventsByClubId(clubId);
      } else {
        // Students see all published events
        await EventService.getPublishedEvents();
      }
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  }, [user?.role, user?.clubId, user?.id]);

  const fetchEventById = async (eventId: string): Promise<Event | null> => {
    try {
      return await EventService.getEventById(eventId);
    } catch (err) {
      console.error('Error fetching event details:', err);
      return null;
    }
  };

  const fetchUserRegistrations = useCallback(async () => {
    if (!user) return;

    try {
      const registrations = await EventService.getUserRegistrations(user.id);
      dispatch(fetchUserRegistrationsSuccess(registrations));
    } catch (err) {
      console.error('Error fetching user registrations:', err);
    }
  }, [user?.id, dispatch]);

  const registerForEvent = async (eventId: string) => {
    if (!user) return null;

    try {
      const registration = await EventService.registerForEvent(eventId, user.id);
      dispatch(registerForEventSuccess(registration));
      return registration;
    } catch (err) {
      console.error('Error registering for event:', err);
      return null;
    }
  };

  const cancelRegistration = async (eventId: string) => {
    if (!user) return false;

    try {
      await EventService.cancelRegistration(eventId, user.id);
      dispatch(cancelRegistrationSuccess({ eventId, userId: user.id }));
      return true;
    } catch (err) {
      console.error('Error cancelling registration:', err);
      return false;
    }
  };

  const createEvent = async (eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'currentParticipants'>) => {
    try {
      return await EventService.createEvent(eventData);
    } catch (err) {
      console.error('Error creating event:', err);
      return null;
    }
  };

  const updateEvent = async (eventId: string, updateData: Partial<Event>) => {
    try {
      return await EventService.updateEvent(eventId, updateData);
    } catch (err) {
      console.error('Error updating event:', err);
      return null;
    }
  };

  useEffect(() => {
    if (user) {
      fetchEvents();
      fetchUserRegistrations();
    }
  }, [user, fetchEvents, fetchUserRegistrations]);

  return {
    events,
    currentEvent,
    userRegistrations,
    isLoading,
    error,
    fetchEvents,
    fetchEventById,
    registerForEvent,
    cancelRegistration,
    createEvent,
    updateEvent,
    isRegistered: (eventId: string) =>
      userRegistrations.some(reg =>
        reg.eventId === eventId
          ? reg.status === 'registered'
          : false
      )
  };
};

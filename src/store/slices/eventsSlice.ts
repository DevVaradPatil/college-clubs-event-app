import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Event, EventRegistration } from '../../types/event';

interface EventsState {
  events: Event[];
  currentEvent: Event | null;
  userRegistrations: EventRegistration[];
  isLoading: boolean;
  error: string | null;
}

const initialState: EventsState = {
  events: [],
  currentEvent: null,
  userRegistrations: [],
  isLoading: false,
  error: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    fetchEventsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchEventsSuccess: (state, action: PayloadAction<Event[]>) => {
      state.isLoading = false;
      state.events = action.payload;
      state.error = null;
    },
    fetchEventsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchEventStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchEventSuccess: (state, action: PayloadAction<Event>) => {
      state.isLoading = false;
      state.currentEvent = action.payload;
      state.error = null;
    },
    createEventSuccess: (state, action: PayloadAction<Event>) => {
      state.isLoading = false;
      state.events = [action.payload, ...state.events];
      state.currentEvent = action.payload;
      state.error = null;
    },
    updateEventSuccess: (state, action: PayloadAction<Event>) => {
      state.isLoading = false;
      state.currentEvent = action.payload;
      state.events = state.events.map(event => 
        event.id === action.payload.id ? action.payload : event
      );
      state.error = null;
    },
    deleteEventSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.events = state.events.filter(event => event.id !== action.payload);
      if (state.currentEvent && state.currentEvent.id === action.payload) {
        state.currentEvent = null;
      }
      state.error = null;
    },
    fetchUserRegistrationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchUserRegistrationsSuccess: (state, action: PayloadAction<EventRegistration[]>) => {
      state.isLoading = false;
      state.userRegistrations = action.payload;
      state.error = null;
    },
    registerForEventSuccess: (state, action: PayloadAction<EventRegistration>) => {
      state.isLoading = false;
      state.userRegistrations = [...state.userRegistrations, action.payload];
      
      // Update the current event's participant count if it's the one being registered for
      if (state.currentEvent && state.currentEvent.id === action.payload.eventId) {
        state.currentEvent = {
          ...state.currentEvent,
          currentParticipants: state.currentEvent.currentParticipants + 1
        };
      }
      
      // Update the event in the events list
      state.events = state.events.map(event => {
        if (event.id === action.payload.eventId) {
          return {
            ...event,
            currentParticipants: event.currentParticipants + 1
          };
        }
        return event;
      });
      
      state.error = null;
    },
    cancelRegistrationSuccess: (state, action: PayloadAction<{ eventId: string, userId: string }>) => {
      state.isLoading = false;
      
      // Remove from user registrations
      state.userRegistrations = state.userRegistrations.filter(
        reg => !(reg.eventId === action.payload.eventId && reg.userId === action.payload.userId)
      );
      
      // Update the current event's participant count if it's the one being unregistered from
      if (state.currentEvent && state.currentEvent.id === action.payload.eventId) {
        state.currentEvent = {
          ...state.currentEvent,
          currentParticipants: Math.max(0, state.currentEvent.currentParticipants - 1)
        };
      }
      
      // Update the event in the events list
      state.events = state.events.map(event => {
        if (event.id === action.payload.eventId) {
          return {
            ...event,
            currentParticipants: Math.max(0, event.currentParticipants - 1)
          };
        }
        return event;
      });
      
      state.error = null;
    },
  },
});

export const {
  fetchEventsStart,
  fetchEventsSuccess,
  fetchEventsFailure,
  fetchEventStart,
  fetchEventSuccess,
  createEventSuccess,
  updateEventSuccess,
  deleteEventSuccess,
  fetchUserRegistrationsStart,
  fetchUserRegistrationsSuccess,
  registerForEventSuccess,
  cancelRegistrationSuccess,
} = eventsSlice.actions;

export default eventsSlice.reducer;
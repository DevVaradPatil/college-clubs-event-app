import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Club, ClubMember } from '../../types/club';

interface ClubsState {
  currentClub: Club | null;
  clubs: Club[];
  members: ClubMember[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ClubsState = {
  currentClub: null,
  clubs: [],
  members: [],
  isLoading: false,
  error: null,
};

const clubsSlice = createSlice({
  name: 'clubs',
  initialState,
  reducers: {
    fetchClubStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchClubSuccess: (state, action: PayloadAction<Club>) => {
      state.isLoading = false;
      state.currentClub = action.payload;
      state.error = null;
    },
    fetchClubsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchClubsSuccess: (state, action: PayloadAction<Club[]>) => {
      state.isLoading = false;
      state.clubs = action.payload;
      state.error = null;
    },
    fetchMembersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMembersSuccess: (state, action: PayloadAction<ClubMember[]>) => {
      state.isLoading = false;
      state.members = action.payload;
      state.error = null;
    },
    updateClubStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    updateClubSuccess: (state, action: PayloadAction<Club>) => {
      state.isLoading = false;
      state.currentClub = action.payload;
      // Also update in the clubs array if it exists there
      const index = state.clubs.findIndex(club => club.id === action.payload.id);
      if (index !== -1) {
        state.clubs[index] = action.payload;
      }
      state.error = null;
    },
    clubFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
});

export const {
  fetchClubStart,
  fetchClubSuccess,
  fetchClubsStart,
  fetchClubsSuccess,
  fetchMembersStart,
  fetchMembersSuccess,
  updateClubStart,
  updateClubSuccess,
  clubFailure,
} = clubsSlice.actions;

export default clubsSlice.reducer;
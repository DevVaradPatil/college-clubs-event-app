import { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../types';
import { ClubService } from '../services/club';
import { fetchClubsStart, fetchClubsSuccess, clubFailure } from '../store/slices/clubsSlice';
import type { Club } from '../types/club';

export const useClubs = () => {
  const dispatch = useDispatch();
  const { clubs, isLoading, error } = useSelector((state: RootState) => state.clubs);
  const [localLoading, setLocalLoading] = useState(false);

  const fetchClubs = useCallback(async () => {
    try {
      dispatch(fetchClubsStart());
      setLocalLoading(true);
      
      const clubsData = await ClubService.getAllClubs();
      dispatch(fetchClubsSuccess(clubsData));
      
      return clubsData;
    } catch (err: any) {
      console.error('Error fetching clubs:', err);
      dispatch(clubFailure(err.message || 'Failed to fetch clubs'));
      throw err;
    } finally {
      setLocalLoading(false);
    }
  }, [dispatch]);

  const fetchClubById = async (clubId: string): Promise<Club | null> => {
    try {
      return await ClubService.getClubById(clubId);
    } catch (err) {
      console.error('Error fetching club details:', err);
      return null;
    }
  };

  return {
    clubs,
    isLoading: isLoading || localLoading,
    error,
    fetchClubs,
    fetchClubById,
  };
};

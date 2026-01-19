import { useSelector, useDispatch } from 'react-redux';
import { AuthService } from '../services/auth';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '../store/slices/authSlice';
import type { RootState } from '../store';
import type { LoginCredentials, RegisterCredentials } from '../types/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  const authState = useSelector((state: RootState) => state.auth);

  const login = async (credentials: LoginCredentials) => {
    dispatch(loginStart());
    try {
      const result = await AuthService.login(credentials);
      dispatch(loginSuccess(result));
      return result;
    } catch (error: any) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      const result = await AuthService.register(credentials);
      return result;
    } catch (error) {
      throw error;
    }
  };
  const logout = async () => {
    try {
      await AuthService.logout();
      dispatch(logoutAction());
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (userId: string, profileData: Partial<any>) => {
    try {
      const updatedUser = await AuthService.updateUserProfile(userId, profileData);
      dispatch(loginSuccess({ user: updatedUser, token: authState.token || '' }));
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    currentUser: AuthService.getCurrentUser(),
  };
};

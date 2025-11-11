import { User } from '@/types/user';
import { api, ApiError } from './api';
import { LoginRequest, RegisterRequest } from '@/types/auth';
import { extractUser } from './errorHandler';

/**
 * Register user
 */
export const register = async (data: RegisterRequest) => {
  const res = await api.post<User>('/auth/register', data);
  const user = extractUser(res.data) as User | null;
  return user;
};

/**
 * Login user
 */
export const login = async (data: LoginRequest) => {
  const res = await api.post<User>('/auth/login', data);
  const user = extractUser(res.data) as User | null;
  return user;
};

/**
 * Get current user
 */
export const getMe = async () => {
  const { data } = await api.get<User>('/users/me');
  const user = extractUser(data) as User | null;
  return user;
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await api.post('/auth/logout');
  } catch {
    // Ignore errors on logout
  }
};

/**
 * Check if session is valid (lightweight check)
 */
export const checkSession = async (): Promise<boolean> => {
  try {
    await api.get('/users/me');
    return true;
  } catch (error) {
    const axiosError = error as ApiError;
    return axiosError?.response?.status !== 401;
  }
};

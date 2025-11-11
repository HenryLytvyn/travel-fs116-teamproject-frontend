'use client';
import { getMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect, useRef } from 'react';

type Props = {
  children: React.ReactNode;
};

const AuthProvider = ({ children }: Props) => {
  const { setUser, clearIsAuthenticated, setLoading } = useAuthStore();
  const effectRunRef = useRef(false);

  useEffect(() => {
    if (effectRunRef.current) return;
    effectRunRef.current = true;

    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const pathname = window.location.pathname;
    const isAuthPage = pathname.startsWith('/auth/');
    const isProtectedRoute = pathname.startsWith('/profile');

    // Get persisted user from store
    const persistedUser = useAuthStore.getState().user;

    if (isAuthPage) {
      setLoading(false);
      return;
    }

    if (persistedUser) {
      setLoading(false);
      getMe()
        .then(currentUser => {
          if (currentUser) {
            setUser(currentUser);
          }
        })
        .catch((error: unknown) => {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError?.response?.status === 401) {
            clearIsAuthenticated();
          }
        });
      return;
    }

    if (isProtectedRoute) {
      setLoading(true);
      getMe()
        .then(fetchedUser => {
          if (fetchedUser) {
            setUser(fetchedUser);
          } else {
            clearIsAuthenticated();
          }
        })
        .catch((error: unknown) => {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError?.response?.status === 401) {
            clearIsAuthenticated();
          }
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [setUser, clearIsAuthenticated, setLoading]);

  return <>{children}</>;
};

export default AuthProvider;

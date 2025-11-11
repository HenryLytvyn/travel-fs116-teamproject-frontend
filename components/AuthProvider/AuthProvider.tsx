'use client';
import { getMe } from '@/lib/api/clientApi';
import { useAuthStore } from '@/lib/store/authStore';
import { useEffect, useRef } from 'react';

type Props = {
  children: React.ReactNode;
};

let hasInitialized = false;

const AuthProvider = ({ children }: Props) => {
  const { setUser, clearIsAuthenticated, setLoading } = useAuthStore();
  const effectRunRef = useRef(false);

  useEffect(() => {
    if (effectRunRef.current) return;
    effectRunRef.current = true;

    if (hasInitialized) return;
    hasInitialized = true;

    if (typeof window !== 'undefined') {
      const isAuthPage = window.location.pathname.startsWith('/auth/');
      if (isAuthPage) {
        // On auth pages, just clear loading and don't check auth
        setLoading(false);
        return;
      }
    }

    const persistedUser = useAuthStore.getState().user;

    if (persistedUser) {
      setLoading(false);

      getMe()
        .then(currentUser => {
          if (currentUser) {
            setUser(currentUser);
          } else {
          }
        })
        .catch((error: unknown) => {
          // Only clear auth on 401 (unauthorized)
          const axiosError = error as { response?: { status?: number } };
          const status = axiosError?.response?.status;
          if (status === 401) {
            clearIsAuthenticated();
          }
        });
      return;
    }

    // No user in store - try to fetch from server
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
        const status = axiosError?.response?.status;
        if (status === 401) {
          clearIsAuthenticated();
        } else {
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return <>{children}</>;
};

export default AuthProvider;

import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../types/index';
import { getAccessToken, clearTokens } from '../utils/authFetch';
import { getCurrentUserApi, loginApi, logoutApi, registerApi } from '../api/auth';

const STORAGE_KEY = 'collabboard.session';

function normalizeUser(rawUser: any): User {
  return {
    id: String(rawUser?.id ?? rawUser?._id ?? 'user-unknown'),
    name: rawUser?.fullName ?? rawUser?.name ?? rawUser?.email ?? 'User',
    email: rawUser?.email ?? '',
    avatarColor: rawUser?.avatarColor ?? 'bg-[#00A884]',
  };
}

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (rawUser: unknown) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.user ? normalizeUser(parsed.user) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;

    async function initAuth() {
      const token = getAccessToken();
      if (!token) {
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        const meUser = await getCurrentUserApi();
        if (!cancelled && meUser) {
          setUser(meUser);
        }
      } catch (err) {
        console.warn('Failed to validate session token:', err);
        if (!cancelled) {
          setUser(null);
          clearTokens();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    initAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login: AuthContextValue['login'] = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Enter both an email and a password.' };
    }

    try {
      const responseData = await loginApi({ email: email.trim(), password });
      const sessionUser = responseData?.data?.user ?? responseData?.user;

      if (sessionUser) {
        setUser(normalizeUser(sessionUser));
      } else {
        // Fallback: try calling getCurrentUserApi if user not directly in response
        const meUser = await getCurrentUserApi();
        setUser(meUser);
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to connect to the backend server.',
      };
    }
  };

  const register: AuthContextValue['register'] = async (name, email, password) => {
    if (!name || !email || !password) {
      return { success: false, error: 'Fill in every field to create an account.' };
    }

    try {
      await registerApi({
        fullName: name.trim(),
        email: email.trim(),
        password,
        bio: '',
      });
      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unable to connect to the backend server.',
      };
    }
  };

  const updateUser = useCallback((rawUser: unknown) => {
    setUser(normalizeUser(rawUser));
  }, []);

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, isLoading, login, register, updateUser, logout }),
    [user, isLoading, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

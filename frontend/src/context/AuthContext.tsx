import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../types/index';
import { clearAccessToken, setAccessToken } from '../utils/authFetch';

const STORAGE_KEY = 'collabboard.session';
const ACCESS_TOKEN_KEY = 'collabboard.accessToken';
const apiBaseUrl = import.meta.env.VITE_BACKEND_URL;

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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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

  useEffect(() => {
    if (user) {
      const session = {
        user,
        accessToken: localStorage.getItem(ACCESS_TOKEN_KEY),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }, [user]);

  const login: AuthContextValue['login'] = async (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Enter both an email and a password.' };
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: payload?.message || 'Login failed. Please try again.',
        };
      }

      const sessionUser = payload?.data?.user;
      const accessToken = payload?.data?.accessToken;

      if (!sessionUser) {
        return { success: false, error: 'No user data returned from the server.' };
      }

      const normalizedUser = normalizeUser(sessionUser);
      setUser(normalizedUser);

      if (accessToken) {
        setAccessToken(accessToken);
      }

      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Unable to connect to the backend server.' };
    }
  };

  const register: AuthContextValue['register'] = async (name, email, password) => {
    if (!name || !email || !password) {
      return { success: false, error: 'Fill in every field to create an account.' };
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          fullName: name.trim(),
          email: email.trim(),
          password,
          bio: '',
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          error: payload?.message || 'Registration failed. Please try again.',
        };
      }

      return { success: true };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, error: 'Unable to connect to the backend server.' };
    }
  };

  const logout = () => {
    clearAccessToken();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, login, register, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

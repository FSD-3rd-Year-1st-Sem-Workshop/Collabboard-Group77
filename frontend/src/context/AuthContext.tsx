import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { User } from '../types/index';
import { getAccessToken, clearTokens, setTokens } from '../utils/authFetch';
import { getCurrentUserApi, loginApi, logoutApi, registerApi } from '../api/auth';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

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
  login: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
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
        // No access token in storage – try silent refresh via httpOnly cookie
        // (cookie is not readable from JS, so we must attempt refresh)
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
          });
          if (refreshRes.ok) {
            const refreshData = await refreshRes.json().catch(() => ({} as any));
            const newToken = refreshData?.data?.accessToken ?? refreshData?.accessToken;
            if (newToken) {
              setTokens({ accessToken: newToken });
              try {
                const meUser = await getCurrentUserApi();
                if (!cancelled && meUser) {
                  setUser(meUser);
                }
              } catch {
                // me failed even after refresh – will be handled below
              } finally {
                if (!cancelled) setIsLoading(false);
              }
              return;
            }
          }
        } catch {
          // silent refresh failed – fall through to unauthenticated
        }
        // Ensure stale localStorage user is cleared when no token and refresh failed
        if (!cancelled) {
          setUser(null);
          clearTokens();
          setIsLoading(false);
        }
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

  const login: AuthContextValue['login'] = async (email, password, rememberMe = true) => {
    if (!email || !password) {
      return { success: false, error: 'Enter both an email and a password.' };
    }

    try {
      const responseData = await loginApi({ email: email.trim(), password }, rememberMe);
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

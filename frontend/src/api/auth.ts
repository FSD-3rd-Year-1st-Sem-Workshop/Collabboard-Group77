import { authFetch, authFetchWithRefresh, clearTokens, setTokens } from '../utils/authFetch';
import type { User } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

export async function registerApi(payload: { fullName: string; email: string; password: string; bio?: string }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Registration failed.');
  }

  return data;
}

export async function loginApi(credentials: { email: string; password: string }) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(credentials),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.message || 'Login failed.');
  }

  const accessToken = data?.data?.accessToken ?? data?.accessToken;
  const refreshToken = data?.data?.refreshToken ?? data?.refreshToken;

  if (accessToken) {
    setTokens({ accessToken, refreshToken });
  }

  return data;
}

export async function getCurrentUserApi(): Promise<User> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/auth/me`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Authentication required');
  }

  const rawUser = data?.data?.user ?? data?.data ?? data?.user ?? data;
  return {
    id: String(rawUser?.id ?? rawUser?._id ?? 'user-unknown'),
    name: rawUser?.fullName ?? rawUser?.name ?? rawUser?.email ?? 'User',
    email: rawUser?.email ?? '',
    avatarColor: rawUser?.avatarColor ?? 'bg-[#00A884]',
  };
}

export interface ProfileUser {
  id: string;
  fullName: string;
  email: string;
  bio: string;
  avatar: string | null;
}

function readProfile(data: any): ProfileUser {
  const rawUser = data?.data?.user ?? data?.data ?? data?.user ?? data;
  return {
    id: String(rawUser?.id ?? rawUser?._id ?? ''),
    fullName: rawUser?.fullName ?? rawUser?.name ?? '',
    email: rawUser?.email ?? '',
    bio: rawUser?.bio ?? '',
    avatar: rawUser?.avatar ?? null,
  };
}

export async function getProfileApi(): Promise<ProfileUser> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/auth/me`);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Unable to load profile.');
  return readProfile(data);
}

export async function updateProfileApi(payload: { fullName: string; bio: string; avatar: string | null }): Promise<ProfileUser> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/auth/me`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Unable to update profile.');
  return readProfile(data);
}

export async function changePasswordApi(payload: { currentPassword: string; newPassword: string }): Promise<ProfileUser> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/auth/me/password`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.message || 'Unable to change password.');

  const accessToken = data?.data?.accessToken ?? data?.accessToken;
  if (accessToken) setTokens({ accessToken });
  return readProfile(data);
}

export async function logoutApi() {
  try {
    await authFetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
  }
}

import { authFetchWithRefresh } from '../utils/authFetch';
import type { DashboardData } from '../types';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

export async function getDashboardApi(): Promise<DashboardData> {
  const response = await authFetchWithRefresh(`${API_BASE_URL}/api/dashboard`);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data?.message || 'Failed to retrieve dashboard metrics.');
  }

  return data?.data;
}

const ACCESS_TOKEN_KEY = 'collabboard.accessToken';
const REFRESH_TOKEN_KEY = 'collabboard.refreshToken';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string) {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function setTokens(tokens: { accessToken?: string; refreshToken?: string }) {
  if (tokens.accessToken) {
    setAccessToken(tokens.accessToken);
  }
  if (tokens.refreshToken) {
    setRefreshToken(tokens.refreshToken);
  }
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function authFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const token = getAccessToken();
  const headers = new Headers(init.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
}

let isRefreshing = false;

export async function authFetchWithRefresh(input: RequestInfo | URL, init: RequestInit = {}) {
  let response = await authFetch(input, init);

  if (response.status !== 401) {
    return response;
  }

  if (isRefreshing) {
    return response;
  }

  isRefreshing = true;

  try {
    const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';
    const refreshToken = getRefreshToken();

    const refreshResponse = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        refreshToken: refreshToken || '',
      }),
    });

    if (!refreshResponse.ok) {
      clearTokens();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
      return response;
    }

    const refreshData = await refreshResponse.json().catch(() => ({}));
    const newToken = refreshData?.data?.accessToken ?? refreshData?.accessToken;
    const newRefreshToken = refreshData?.data?.refreshToken ?? refreshData?.refreshToken;

    if (newToken) {
      setTokens({ accessToken: newToken, refreshToken: newRefreshToken });
      return authFetch(input, init);
    }

    clearTokens();
    if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
      window.location.href = '/login';
    }
    return response;
  } catch (error) {
    console.error('Failed to refresh authentication token:', error);
    clearTokens();
    return response;
  } finally {
    isRefreshing = false;
  }
}
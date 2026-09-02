const ACCESS_TOKEN_KEY = 'collabboard.accessToken';
const REFRESH_TOKEN_KEY = 'collabboard.refreshToken';
const REMEMBER_ME_KEY = 'collabboard.rememberMe';
const SESSION_KEY = 'collabboard.session';

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function isRememberMe(): boolean {
  // default to true (persistent) if not set, to keep backward compat
  const v = localStorage.getItem(REMEMBER_ME_KEY);
  if (v === 'false') return false;
  if (v === 'true') return true;
  // if token exists only in sessionStorage, treat as not remembered
  if (sessionStorage.getItem(ACCESS_TOKEN_KEY) && !localStorage.getItem(ACCESS_TOKEN_KEY)) return false;
  return true;
}

export function setRememberMe(value: boolean) {
  localStorage.setItem(REMEMBER_ME_KEY, String(value));
}

export function setAccessToken(token: string, rememberMe?: boolean) {
  const persist = rememberMe ?? isRememberMe();
  if (persist) {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  } else {
    sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setRefreshToken(token: string, rememberMe?: boolean) {
  const persist = rememberMe ?? isRememberMe();
  if (persist) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function setTokens(tokens: { accessToken?: string; refreshToken?: string }, rememberMe?: boolean) {
  const persist = rememberMe ?? isRememberMe();
  if (tokens.accessToken) {
    setAccessToken(tokens.accessToken, persist);
  }
  if (tokens.refreshToken) {
    setRefreshToken(tokens.refreshToken, persist);
  }
  if (rememberMe !== undefined) setRememberMe(rememberMe);
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
  localStorage.removeItem(REMEMBER_ME_KEY);
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
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

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';
  const refreshToken = getRefreshToken();

  // Backend reads refreshToken from httpOnly cookie (Path=/api/auth) when
  // credentials: 'include' is used. Only send body refreshToken if we have one
  // stored client-side; otherwise send empty object so backend falls back to cookie.
  const body = refreshToken ? JSON.stringify({ refreshToken }) : JSON.stringify({});

  const refreshResponse = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!refreshResponse.ok) {
    return null;
  }

  const refreshData = await refreshResponse.json().catch(() => ({} as any));
  const newToken = refreshData?.data?.accessToken ?? refreshData?.accessToken;
  const newRefreshToken = refreshData?.data?.refreshToken ?? refreshData?.refreshToken;

  if (newToken) {
    setTokens({ accessToken: newToken, refreshToken: newRefreshToken ?? undefined });
    return newToken;
  }

  return null;
}

export async function authFetchWithRefresh(input: RequestInfo | URL, init: RequestInit = {}) {
  let response = await authFetch(input, init);

  if (response.status !== 401) {
    return response;
  }

  // If another refresh is already in flight, wait for it then retry with new token
  if (refreshPromise) {
    try {
      const newToken = await refreshPromise;
      if (newToken) return authFetch(input, init);
    } catch {
      // fall through to return original 401
    }
    return response;
  }

  refreshPromise = doRefresh();

  try {
    const newToken = await refreshPromise;
    if (newToken) {
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
    refreshPromise = null;
  }
}

const ACCESS_TOKEN_KEY = 'collabboard.accessToken';

export function getAccessToken(): string | null {
  const stored = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (stored) return stored;
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  sessionStorage.removeItem(ACCESS_TOKEN_KEY);
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

export async function authFetchWithRefresh(input: RequestInfo | URL, init: RequestInit = {}) {
  let response = await authFetch(input, init);

  if (response.status !== 401) {
    return response;
  }

  const apiBaseUrl = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:5000';

  const refreshResponse = await fetch(`${apiBaseUrl}/api/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!refreshResponse.ok) {
    clearAccessToken();
    window.location.href = '/login';
    return response;
  }

  const refreshData = await refreshResponse.json();
  const newToken = refreshData?.data?.accessToken;

  if (newToken) {
    setAccessToken(newToken);
    return authFetch(input, init);
  }

  clearAccessToken();
  window.location.href = '/login';
  return response;
}
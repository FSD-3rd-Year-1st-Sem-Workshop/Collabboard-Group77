const ACCESS_TOKEN_KEY = 'collabboard.accessToken';

export function getAccessToken(): string | null {
  return sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string) {
  sessionStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken() {
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

  const refreshResponse = await fetch('http://localhost:5000/api/auth/refresh', {
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
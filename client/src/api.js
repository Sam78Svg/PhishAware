const configuredApiUrl = import.meta.env.VITE_BACKEND_URL || '';
const API_URL = (configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/+$/, '');
const AUTH_TOKEN_KEY = 'phishaware_auth_token';

export async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});
    const token = sessionStorage.getItem(AUTH_TOKEN_KEY);

    if (token && !headers.has('Authorization')) {
        headers.set('Authorization', `Bearer ${token}`);
    }

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (response.status === 401) {
        sessionStorage.removeItem(AUTH_TOKEN_KEY);
        window.dispatchEvent(new Event('auth:expired'));
    }

    return response;
}

export async function readJson(response) {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        return {};
    }

    return response.json();
}

export async function getCurrentUser() {
    const response = await apiFetch('/api/auth/me');
    if (!response.ok) return null;
    const data = await readJson(response);
    return data.success ? data : null;
}

export async function logout() {
    await apiFetch('/api/auth/logout', { method: 'POST' });
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token) {
    if (token) sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export { API_URL };

const configuredApiUrl = import.meta.env.VITE_BACKEND_URL || '';
const API_URL = (configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000' : '')).replace(/\/+$/, '');

export async function apiFetch(path, options = {}) {
    const headers = new Headers(options.headers || {});

    if (options.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
    });

    if (response.status === 401) {
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
}

export { API_URL };

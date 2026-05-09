const BASE_URL = 'http://localhost:3000';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class ApiError extends Error {
    status: number;
    body: unknown;

    constructor(status: number, body: unknown) {
        super(`API error ${status}`);
        this.status = status;
        this.body = body;
    }
}

async function request<T = unknown>(
    method: Method,
    path: string,
    body?: unknown,
): Promise<T> {
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new ApiError(res.status, data);

    return data as T;
}

const apiClient = {
    get:    <T = unknown>(path: string) => request<T>('GET', path),
    post:   <T = unknown>(path: string, body?: unknown) => request<T>('POST', path, body),
    patch:  <T = unknown>(path: string, body?: unknown) => request<T>('PATCH', path, body),
    put:    <T = unknown>(path: string, body?: unknown) => request<T>('PUT', path, body),
    delete: <T = unknown>(path: string) => request<T>('DELETE', path),
};

export default apiClient;

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

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

// ---------------------------------------------------------------------------
// Global in-flight tracking. Every request increments a counter on start and
// decrements on settle; subscribers (e.g. the top progress bar) are notified
// when the app transitions between idle and loading. Covers every flow without
// touching individual call sites.
// ---------------------------------------------------------------------------
let activeRequests = 0;
const loadingListeners = new Set<(loading: boolean) => void>();

function notifyLoading() {
    const loading = activeRequests > 0;
    loadingListeners.forEach((fn) => fn(loading));
}

function startRequest() {
    activeRequests += 1;
    if (activeRequests === 1) notifyLoading();
}

function endRequest() {
    activeRequests = Math.max(0, activeRequests - 1);
    if (activeRequests === 0) notifyLoading();
}

export function isLoading(): boolean {
    return activeRequests > 0;
}

export function subscribeLoading(fn: (loading: boolean) => void): () => void {
    loadingListeners.add(fn);
    return () => loadingListeners.delete(fn);
}

async function request<T = unknown>(
    method: Method,
    path: string,
    body?: unknown,
): Promise<T> {
    startRequest();
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method,
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new ApiError(res.status, data);

        return data as T;
    } finally {
        endRequest();
    }
}

async function postFile<T = unknown>(path: string, formData: FormData): Promise<T> {
    startRequest();
    try {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new ApiError(res.status, data);
        return data as T;
    } finally {
        endRequest();
    }
}

// Upload a file directly to an external (S3-compatible) presigned URL.
// This bypasses our API entirely — no credentials, no JSON envelope. The
// Content-Type must match what was signed server-side.
async function uploadToUrl(url: string, file: File): Promise<void> {
    startRequest();
    try {
        const res = await fetch(url, {
            method: 'PUT',
            body: file,
            headers: { 'Content-Type': file.type || 'application/octet-stream' },
        });
        if (!res.ok) throw new ApiError(res.status, await res.text().catch(() => ''));
    } finally {
        endRequest();
    }
}

const apiClient = {
    get:      <T = unknown>(path: string) => request<T>('GET', path),
    post:     <T = unknown>(path: string, body?: unknown) => request<T>('POST', path, body),
    patch:    <T = unknown>(path: string, body?: unknown) => request<T>('PATCH', path, body),
    put:      <T = unknown>(path: string, body?: unknown) => request<T>('PUT', path, body),
    delete:   <T = unknown>(path: string) => request<T>('DELETE', path),
    postFile: <T = unknown>(path: string, formData: FormData) => postFile<T>(path, formData),
    uploadToUrl: (url: string, file: File) => uploadToUrl(url, file),
};

export default apiClient;

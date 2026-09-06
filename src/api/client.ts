import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly payload: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  /** True when the request never reached the server. */
  get isOffline(): boolean {
    return this.status === 0;
  }

  /** class-validator returns an array of messages; forms show them per field. */
  get fieldErrors(): string[] {
    const message = (this.payload as { message?: unknown } | null)?.message;
    return Array.isArray(message) ? message.filter((m): m is string => typeof m === 'string') : [];
  }
}

/**
 * Called when the API says the session is gone. Registered by the session store
 * rather than imported from it, so this module stays free of a cycle through
 * the store whose own calls come back through here.
 */
let onSessionLost: () => void = () => {};

export function setSessionLostHandler(handler: () => void): void {
  onSessionLost = handler;
}

function messageFrom(payload: unknown, status: number): string {
  const raw = (payload as { message?: unknown } | null)?.message;

  if (Array.isArray(raw) && typeof raw[0] === 'string') {
    return raw[0];
  }
  if (typeof raw === 'string' && raw.trim()) {
    return raw;
  }
  return `Request failed with status ${status}.`;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skips the session-lost callback for calls that are *expected* to 401,
   *  such as the launch-time session probe. */
  tolerate401?: boolean;
}

/**
 * The session is an HttpOnly cookie, exactly as on the website.
 *
 * React Native keeps cookies in the platform's own store — OkHttp's CookieJar
 * on Android, NSHTTPCookieStorage on iOS — so they are attached and persisted
 * across app restarts without any token handling here. That is why this client
 * has no Authorization header and no refresh logic: there is nothing for it to
 * carry. If the API later grows Bearer support, it is added here and nowhere
 * else.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, tolerate401, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set('Accept', 'application/json');

  const isFormData = body instanceof FormData;
  if (body !== undefined && !isFormData && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...rest,
      headers: finalHeaders,
      signal: controller.signal,
      credentials: 'include',
      body: isFormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('No connection. Check your network and try again.', 0, null);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401 && !tolerate401) {
    onSessionLost();
  }

  // 204 carries no body; parsing it would throw on a valid response.
  const payload: unknown = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(messageFrom(payload, response.status), response.status, payload);
  }

  return payload as T;
}

/** Every success is wrapped as { success, message, data }. */
export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

export async function apiData<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const envelope = await apiRequest<ApiEnvelope<T>>(path, options);
  return envelope.data;
}

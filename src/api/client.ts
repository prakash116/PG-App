import { API_BASE_URL, REQUEST_TIMEOUT_MS } from './config';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from './tokens';

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

  /** Field errors from class-validator, keyed by field where the API gives them. */
  get fieldErrors(): string[] {
    const message = (this.payload as { message?: unknown } | null)?.message;
    return Array.isArray(message) ? message.filter((m): m is string => typeof m === 'string') : [];
  }
}

/**
 * Called when the session is definitively gone: the refresh token was rejected,
 * or there was never one. Registered by the session store rather than imported
 * from it, so this module stays free of a cycle through the store.
 */
type SessionLostHandler = () => void;
let onSessionLost: SessionLostHandler = () => {};

export function setSessionLostHandler(handler: SessionLostHandler): void {
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

/**
 * The in-flight refresh, if there is one.
 *
 * This single promise is the whole point. An app resuming from background fires
 * every screen's query at once; without it, each 401 starts its own refresh, and
 * with rotation on the server that means the first one succeeds and the rest are
 * replaying an already-rotated token — which a correct server treats as theft
 * and responds to by revoking the entire device chain. Everyone waits on one.
 */
let refreshInFlight: Promise<string | null> | null = null;

async function performRefresh(): Promise<string | null> {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/v1/auth/token/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as {
      data?: { accessToken?: string; refreshToken?: string };
    };
    const next = body.data;

    if (!next?.accessToken || !next.refreshToken) {
      return null;
    }

    setAccessToken(next.accessToken);
    await setRefreshToken(next.refreshToken);
    return next.accessToken;
  } catch {
    // A network failure during refresh is not proof the session is invalid, so
    // the caller surfaces it as an offline error and the tokens are left alone.
    return null;
  }
}

function refreshSession(): Promise<string | null> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Set for endpoints that must not carry a token, such as the OTP routes. */
  anonymous?: boolean;
  /** Internal: stops a replayed request from retrying forever. */
  _isRetry?: boolean;
}

async function rawRequest(path: string, options: RequestOptions): Promise<Response> {
  const { body, anonymous, _isRetry, headers, ...rest } = options;

  const finalHeaders = new Headers(headers);
  finalHeaders.set('Accept', 'application/json');

  const isFormData = body instanceof FormData;
  if (body !== undefined && !isFormData && !finalHeaders.has('Content-Type')) {
    finalHeaders.set('Content-Type', 'application/json');
  }

  if (!anonymous) {
    const token = getAccessToken();
    if (token) {
      finalHeaders.set('Authorization', `Bearer ${token}`);
    }
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(`${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...rest,
      headers: finalHeaders,
      signal: controller.signal,
      body: isFormData ? body : body === undefined ? undefined : JSON.stringify(body),
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await rawRequest(path, options);
  } catch {
    throw new ApiError('No connection. Check your network and try again.', 0, null);
  }

  if (response.status === 401 && !options.anonymous && !options._isRetry) {
    const token = await refreshSession();

    if (token) {
      return apiRequest<T>(path, { ...options, _isRetry: true });
    }

    await clearTokens();
    onSessionLost();
    throw new ApiError('Your session has ended. Please sign in again.', 401, null);
  }

  // 204 and friends carry no body; parsing them would throw on valid responses.
  const payload: unknown =
    response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(messageFrom(payload, response.status), response.status, payload);
  }

  return payload as T;
}

/** The API wraps every success as { success, message, data }. */
export interface ApiEnvelope<T> {
  success: true;
  message: string;
  data: T;
}

export async function apiData<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const envelope = await apiRequest<ApiEnvelope<T>>(path, options);
  return envelope.data;
}

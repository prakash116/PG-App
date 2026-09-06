/**
 * The refresh path, which is the part of the client most likely to break
 * silently: it only misbehaves under concurrency, and when it does the symptom
 * is a user being signed out at random.
 */
import { ApiError, apiRequest, setSessionLostHandler } from '../src/api/client';
import { setAccessToken } from '../src/api/tokens';

let mockRefreshToken: string | null = 'refresh-token-1';

jest.mock('react-native-keychain', () => ({
  ACCESSIBLE: { WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'whenUnlocked' },
  getGenericPassword: jest.fn(async () =>
    mockRefreshToken ? { username: 'refresh', password: mockRefreshToken } : false,
  ),
  setGenericPassword: jest.fn(async () => true),
  resetGenericPassword: jest.fn(async () => true),
}));

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('apiRequest', () => {
  beforeEach(() => {
    mockRefreshToken = 'refresh-token-1';
    setAccessToken('expired-access-token');
    setSessionLostHandler(() => {});
    jest.restoreAllMocks();
  });

  it('refreshes once when several requests get a 401 at the same time', async () => {
    let refreshCalls = 0;
    const seenAuthHeaders: string[] = [];

    globalThis.fetch = jest.fn(async (url: string, init?: RequestInit) => {
      if (String(url).includes('/v1/auth/token/refresh')) {
        refreshCalls += 1;
        return jsonResponse(200, {
          data: { accessToken: 'fresh-access-token', refreshToken: 'refresh-token-2' },
        });
      }

      const auth = new Headers(init?.headers).get('Authorization') ?? '';
      seenAuthHeaders.push(auth);

      return auth.includes('fresh-access-token')
        ? jsonResponse(200, { success: true, message: 'ok', data: { id: '1' } })
        : jsonResponse(401, { message: 'Unauthorized' });
    }) as unknown as typeof fetch;

    // Three screens waking at once is the real-world trigger for this.
    const results = await Promise.all([
      apiRequest('/v1/users/me'),
      apiRequest('/v1/visits/me'),
      apiRequest('/v1/pg/me'),
    ]);

    expect(results).toHaveLength(3);
    // The whole point: one refresh, not three. Three would be reuse-detection
    // on a rotating server, which revokes the device.
    expect(refreshCalls).toBe(1);
    expect(seenAuthHeaders.filter(h => h.includes('fresh-access-token'))).toHaveLength(3);
  });

  it('gives up and reports the session lost when the refresh token is rejected', async () => {
    let sessionLost = false;
    setSessionLostHandler(() => {
      sessionLost = true;
    });

    globalThis.fetch = jest.fn(async (url: string) =>
      String(url).includes('/v1/auth/token/refresh')
        ? jsonResponse(401, { message: 'Invalid refresh token' })
        : jsonResponse(401, { message: 'Unauthorized' }),
    ) as unknown as typeof fetch;

    await expect(apiRequest('/v1/users/me')).rejects.toBeInstanceOf(ApiError);
    expect(sessionLost).toBe(true);
  });

  it('does not retry a 4xx that is not a 401', async () => {
    let calls = 0;

    globalThis.fetch = jest.fn(async () => {
      calls += 1;
      return jsonResponse(422, { message: ['phone must be a valid number'] });
    }) as unknown as typeof fetch;

    await expect(apiRequest('/v1/visits', { method: 'POST', body: {} })).rejects.toMatchObject({
      status: 422,
    });
    expect(calls).toBe(1);
  });

  it('surfaces a transport failure as an offline error rather than a crash', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;

    const error = await apiRequest('/v1/pg/public').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).isOffline).toBe(true);
  });
});

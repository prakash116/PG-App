/**
 * The client's job is to make failure legible. These cover the three ways a
 * request goes wrong, because each one has a different correct response and
 * getting them confused is what produces "something went wrong" screens.
 */
import { ApiError, apiRequest, setSessionLostHandler } from '../src/api/client';

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

describe('apiRequest', () => {
  beforeEach(() => {
    setSessionLostHandler(() => {});
  });

  it('reports the session lost on a 401 so the app can drop to guest', async () => {
    let sessionLost = false;
    setSessionLostHandler(() => {
      sessionLost = true;
    });

    globalThis.fetch = jest.fn(async () =>
      jsonResponse(401, { message: 'Session expired.' }),
    ) as unknown as typeof fetch;

    await expect(apiRequest('/v1/visits/me')).rejects.toBeInstanceOf(ApiError);
    expect(sessionLost).toBe(true);
  });

  it('leaves the session alone when a 401 is expected, as on the launch probe', async () => {
    let sessionLost = false;
    setSessionLostHandler(() => {
      sessionLost = true;
    });

    globalThis.fetch = jest.fn(async () =>
      jsonResponse(401, { message: 'Authentication required.' }),
    ) as unknown as typeof fetch;

    await expect(apiRequest('/v1/auth/me', { tolerate401: true })).rejects.toBeInstanceOf(ApiError);
    // Signing out someone who was never signed in would clear a cookie that a
    // parallel request may have just established.
    expect(sessionLost).toBe(false);
  });

  it('surfaces a transport failure as an offline error rather than a crash', async () => {
    globalThis.fetch = jest.fn(async () => {
      throw new TypeError('Network request failed');
    }) as unknown as typeof fetch;

    const error = await apiRequest('/v1/pg/public/PZ-1').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).isOffline).toBe(true);
  });

  it('keeps class-validator field messages reachable for forms', async () => {
    globalThis.fetch = jest.fn(async () =>
      jsonResponse(422, { message: ['Identifier must be a valid email address or phone number.'] }),
    ) as unknown as typeof fetch;

    const error = (await apiRequest('/v1/auth/login', {
      method: 'POST',
      body: {},
    }).catch((e: unknown) => e)) as ApiError;

    expect(error.status).toBe(422);
    expect(error.fieldErrors).toHaveLength(1);
    // The first message is what the UI shows, so it has to be the useful one.
    expect(error.message).toContain('valid email address');
  });
});

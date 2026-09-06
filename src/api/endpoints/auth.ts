import { apiData } from '../client';
import { setAccessToken, setRefreshToken } from '../tokens';
import type { AuthTokens, SessionUser, UserRole } from '../types';

interface PhoneWidgetConfig {
  widgetId: string;
  tokenAuth: string;
  /** False when a Super Admin has turned phone verification off. */
  required: boolean;
}

/** The MSG91 widget credentials are client-side by MSG91's own design. */
export function getPhoneWidgetConfig(): Promise<PhoneWidgetConfig> {
  return apiData<PhoneWidgetConfig>('/v1/phone/widget-config', { anonymous: true });
}

interface VerifyPhoneResult extends AuthTokens {
  user: SessionUser | null;
  /** False when this number has no account yet and profile capture is needed. */
  isExistingUser: boolean;
}

/**
 * Exchanges the MSG91 access token for a Pzee session.
 *
 * The widget proves the number; the server re-checks that token against MSG91
 * before trusting it, so a forged token from a patched client gets nowhere.
 */
export async function verifyPhoneToken(msg91Token: string): Promise<VerifyPhoneResult> {
  const result = await apiData<VerifyPhoneResult>('/v1/phone/verify-token', {
    method: 'POST',
    body: { accessToken: msg91Token },
    anonymous: true,
  });

  await persist(result);
  return result;
}

export interface CompleteProfileInput {
  role: Extract<UserRole, 'USER' | 'PG_OWNER'>;
  firstName: string;
  lastName?: string;
  email: string;
  /** Owners only. */
  pgName?: string;
  pgLocation?: string;
  /** Seekers only: someone else's referral code. */
  referralCode?: string;
}

export async function completeProfile(
  input: CompleteProfileInput,
): Promise<{ user: SessionUser } & AuthTokens> {
  const result = await apiData<{ user: SessionUser } & AuthTokens>('/v1/auth/profile/complete', {
    method: 'POST',
    body: input,
  });

  await persist(result);
  return result;
}

export function getMe(): Promise<SessionUser> {
  return apiData<SessionUser>('/v1/users/me');
}

export async function revokeSession(refreshToken: string): Promise<void> {
  await apiData('/v1/auth/token/revoke', { method: 'POST', body: { refreshToken } });
}

async function persist(tokens: AuthTokens): Promise<void> {
  setAccessToken(tokens.accessToken);
  await setRefreshToken(tokens.refreshToken);
}

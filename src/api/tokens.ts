import * as Keychain from 'react-native-keychain';

/**
 * Token storage.
 *
 * The refresh token is long-lived and therefore the valuable one: it goes in
 * the Keychain/Keystore, which is hardware-backed on most devices. The access
 * token is short-lived and is held in memory only — writing it to disk would
 * widen the attack surface for no benefit, since a cold start can always mint
 * a new one from the refresh token.
 */
const SERVICE = 'in.pzee.auth';
const ACCOUNT = 'refresh';

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export async function getRefreshToken(): Promise<string | null> {
  try {
    const stored = await Keychain.getGenericPassword({ service: SERVICE });
    return stored ? stored.password : null;
  } catch {
    // A locked or unavailable Keystore must read as "signed out", never crash
    // the launch path.
    return null;
  }
}

export async function setRefreshToken(token: string): Promise<void> {
  await Keychain.setGenericPassword(ACCOUNT, token, {
    service: SERVICE,
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function clearTokens(): Promise<void> {
  accessToken = null;
  try {
    await Keychain.resetGenericPassword({ service: SERVICE });
  } catch {
    // Nothing to clear is a success, not a failure.
  }
}

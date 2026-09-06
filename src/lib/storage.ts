import { createMMKV } from 'react-native-mmkv';

/**
 * Two stores, deliberately separate.
 *
 * `cache` is disposable: wiping it costs a refetch. `prefs` is not — it holds
 * the onboarding flag and the last-used city. Keeping them apart means the
 * offline query cache can be cleared on a version bump without also throwing
 * away the user's preferences.
 *
 * Nothing secret goes in either. The refresh token lives in the Keychain —
 * see src/api/tokens.ts.
 */
export const cache = createMMKV({ id: 'pzee.cache' });
export const prefs = createMMKV({ id: 'pzee.prefs' });

/** Storage adapter shaped for the TanStack Query persister. */
export const queryStorage = {
  getItem: (key: string): string | null => cache.getString(key) ?? null,
  setItem: (key: string, value: string): void => cache.set(key, value),
  removeItem: (key: string): void => {
    cache.remove(key);
  },
};

export const PREF_KEYS = {
  onboardingSeen: 'onboarding.seen',
  lastCity: 'search.lastCity',
} as const;

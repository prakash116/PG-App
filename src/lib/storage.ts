import { createMMKV } from 'react-native-mmkv';

/**
 * Two stores, deliberately separate.
 *
 * `cache` is disposable: wiping it costs a refetch. `prefs` is not — it holds
 * saved PGs and the last search. Keeping them apart means the cache can be
 * cleared on a version bump without throwing away what the user chose to keep.
 *
 * Nothing secret goes in either. The session is an HttpOnly cookie held by the
 * platform's own cookie store, never by this app.
 */
export const cache = createMMKV({ id: 'pzee.cache' });
export const prefs = createMMKV({ id: 'pzee.prefs' });

export const PREF_KEYS = {
  savedPgs: 'saved.pgCodes',
  lastQuery: 'search.lastQuery',
  city: 'search.city',
} as const;

import { create } from 'zustand';
import { PREF_KEYS, prefs } from '@/lib/storage';

/**
 * The city the header shows and discovery filters by.
 *
 * Persisted, because a PG search is almost always about one city and being
 * asked again on every launch is the kind of friction that makes an app feel
 * like a website. Null means "everywhere", which is a real choice rather than
 * an unset state.
 */
interface LocationState {
  city: string | null;
  setCity: (city: string | null) => void;
}

export const useLocation = create<LocationState>()(set => ({
  city: prefs.getString(PREF_KEYS.city) ?? null,

  setCity: city => {
    if (city) {
      prefs.set(PREF_KEYS.city, city);
    } else {
      prefs.remove(PREF_KEYS.city);
    }
    set({ city });
  },
}));

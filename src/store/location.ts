import { create } from 'zustand';
import { PREF_KEYS, prefs } from '@/lib/storage';

/**
 * The city the header shows and discovery filters by, plus whether the picker
 * sheet is open.
 *
 * The city is persisted: a PG search is almost always about one city, and
 * being asked again on every launch is the friction that makes an app feel
 * like a website. Null means "everywhere" — a real choice, not an unset state.
 *
 * The sheet's open flag lives here rather than in a screen so that one sheet,
 * mounted once at the app root, can be opened from any header.
 */
interface LocationState {
  city: string | null;
  isPickerOpen: boolean;
  setCity: (city: string | null) => void;
  openPicker: () => void;
  closePicker: () => void;
}

export const useLocation = create<LocationState>()(set => ({
  city: prefs.getString(PREF_KEYS.city) ?? null,
  isPickerOpen: false,

  setCity: city => {
    if (city) {
      prefs.set(PREF_KEYS.city, city);
    } else {
      prefs.remove(PREF_KEYS.city);
    }
    set({ city });
  },

  openPicker: () => set({ isPickerOpen: true }),
  closePicker: () => set({ isPickerOpen: false }),
}));

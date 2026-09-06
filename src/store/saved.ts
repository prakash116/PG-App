import { create } from 'zustand';
import { PREF_KEYS, prefs } from '@/lib/storage';

/**
 * Saved PGs live on the device.
 *
 * The API has no favourites endpoint, and inventing one client-side that
 * pretends to sync would be worse than being plainly local: this list survives
 * restarts, and does not follow the user to another phone. When the API grows
 * a SavedPg resource, this store keeps its shape and gains a sync call.
 */
interface SavedState {
  codes: string[];
  isSaved: (pgCode: string) => boolean;
  toggle: (pgCode: string) => void;
}

function read(): string[] {
  const raw = prefs.getString(PREF_KEYS.savedPgs);

  if (!raw) {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((c): c is string => typeof c === 'string') : [];
  } catch {
    // Corrupt storage is not worth crashing a launch over.
    return [];
  }
}

export const useSaved = create<SavedState>()((set, get) => ({
  codes: read(),

  isSaved: pgCode => get().codes.includes(pgCode),

  toggle: pgCode => {
    const current = get().codes;
    const next = current.includes(pgCode)
      ? current.filter(code => code !== pgCode)
      : [pgCode, ...current];

    prefs.set(PREF_KEYS.savedPgs, JSON.stringify(next));
    set({ codes: next });
  },
}));

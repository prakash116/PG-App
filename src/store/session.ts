import { create } from 'zustand';
import { getMe } from '@/api/endpoints/auth';
import { setSessionLostHandler } from '@/api/client';
import { clearTokens, getRefreshToken, setAccessToken } from '@/api/tokens';
import type { SessionUser, UserRole } from '@/api/types';

/**
 * `bootstrapping` is the only state that blocks the UI, and only until the
 * stored token is resolved. Everything after that renders something real:
 * a failed restore lands on `guest`, which is a fully usable app, not a wall.
 */
type Status = 'bootstrapping' | 'guest' | 'authenticated';

interface SessionState {
  status: Status;
  user: SessionUser | null;
  /** Set the moment a session is established, so navigation never reads a stale role. */
  role: UserRole | null;
  bootstrap: () => Promise<void>;
  adopt: (user: SessionUser) => void;
  signOut: () => Promise<void>;
}

export const useSession = create<SessionState>()(set => ({
  status: 'bootstrapping',
  user: null,
  role: null,

  /**
   * Runs once on launch. Note what it does NOT do: fail loudly. A missing token,
   * a rejected refresh and a dead network all land in the same place — guest —
   * because none of them is a reason to stop someone browsing PGs.
   */
  bootstrap: async () => {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
      set({ status: 'guest', user: null, role: null });
      return;
    }

    try {
      // The client refreshes on its own when this 401s, so a single call both
      // proves the token and hydrates the user.
      const user = await getMe();
      set({ status: 'authenticated', user, role: user.role });
    } catch {
      await clearTokens();
      set({ status: 'guest', user: null, role: null });
    }
  },

  adopt: user => set({ status: 'authenticated', user, role: user.role }),

  signOut: async () => {
    setAccessToken(null);
    await clearTokens();
    set({ status: 'guest', user: null, role: null });
  },
}));

// Registered here rather than inside the client, which must not import the
// store: the client is what the store's own calls go through.
setSessionLostHandler(() => {
  useSession.setState({ status: 'guest', user: null, role: null });
});

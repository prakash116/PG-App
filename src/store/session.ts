import { create } from 'zustand';
import { ApiError, setSessionLostHandler } from '@/api/client';
import { fetchSession, login as loginRequest, logout as logoutRequest } from '@/api/endpoints';
import type { LoginPayload, SessionUser, UserRole } from '@/api/types';

/**
 * bootstrapping is the only state that blocks the UI, and only until the
 * session cookie is resolved. Everything after that renders something real: a
 * failed probe lands on guest, which is a fully usable app, not a wall.
 */
type Status = 'bootstrapping' | 'guest' | 'authenticated';

interface SessionState {
  status: Status;
  user: SessionUser | null;
  role: UserRole | null;
  isSigningIn: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  signIn: (payload: LoginPayload) => Promise<SessionUser>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useSession = create<SessionState>()(set => ({
  status: 'bootstrapping',
  user: null,
  role: null,
  isSigningIn: false,
  error: null,

  /**
   * Runs once on launch. Note what it does not do: fail loudly. No cookie, an
   * expired one and a dead network all land in the same place — guest —
   * because none of them is a reason to stop someone browsing PGs.
   */
  bootstrap: async () => {
    try {
      const user = await fetchSession();
      set({ status: 'authenticated', user, role: user.role, error: null });
    } catch {
      set({ status: 'guest', user: null, role: null });
    }
  },

  signIn: async payload => {
    set({ isSigningIn: true, error: null });

    try {
      const user = await loginRequest(payload);
      set({ status: 'authenticated', user, role: user.role, isSigningIn: false });
      return user;
    } catch (error) {
      const message =
        error instanceof ApiError ? error.message : 'Could not sign in. Please try again.';
      set({ isSigningIn: false, error: message });
      throw error;
    }
  },

  signOut: async () => {
    // The cookie is cleared by the server, but a failed call still signs the
    // user out locally: refusing to would strand them in a broken session.
    try {
      await logoutRequest();
    } catch {
      // Intentionally ignored.
    }
    set({ status: 'guest', user: null, role: null, error: null });
  },

  clearError: () => set({ error: null }),
}));

// Registered here rather than inside the client, which must not import the
// store: the store's own calls go through the client.
setSessionLostHandler(() => {
  useSession.setState({ status: 'guest', user: null, role: null });
});

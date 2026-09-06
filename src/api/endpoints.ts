import { apiData } from './client';
import type {
  CreateVisitPayload,
  LoginPayload,
  PublicPgDetail,
  SessionUser,
  VisitRequest,
  VisitStatus,
} from './types';
import type { BannerSlide } from '@/lib/banners';

/* ---------------------------------------------------------------- auth ---- */

export function login(payload: LoginPayload): Promise<SessionUser> {
  return apiData<SessionUser>('/v1/auth/login', { method: 'POST', body: payload });
}

/** The launch probe. A 401 here is the ordinary signed-out case, not a fault,
 *  so it must not trip the session-lost handler. */
export function fetchSession(): Promise<SessionUser> {
  return apiData<SessionUser>('/v1/auth/me', { tolerate401: true });
}

export async function logout(): Promise<void> {
  await apiData('/v1/auth/logout', { method: 'POST' });
}

/* ------------------------------------------------------------------ pg ---- */

/** The only public PG route the API has today: lookup by shareable code. */
export function fetchPublicPg(pgCode: string): Promise<PublicPgDetail> {
  return apiData<PublicPgDetail>(`/v1/pg/public/${encodeURIComponent(pgCode.trim())}`);
}

/* -------------------------------------------------------------- visits ---- */

export function createVisit(payload: CreateVisitPayload): Promise<VisitRequest> {
  return apiData<VisitRequest>('/v1/visits', { method: 'POST', body: payload });
}

/** Seeker: everything I have asked to see. */
export function fetchMyVisits(): Promise<VisitRequest[]> {
  return apiData<VisitRequest[]>('/v1/visits/me');
}

/** Owner: the inbox. */
export function fetchVisitInbox(status?: VisitStatus): Promise<VisitRequest[]> {
  return apiData<VisitRequest[]>(`/v1/visits/me/visits${status ? `?status=${status}` : ''}`);
}

/** Owner: move a request along. */
export function updateVisitStatus(id: string, status: VisitStatus): Promise<VisitRequest> {
  return apiData<VisitRequest>(`/v1/visits/me/visits/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { status },
  });
}

/* ------------------------------------------------------------- banners ---- */

/** Not built on the API yet; see src/lib/banners.ts for the expected shape. */
export function fetchBanners(): Promise<BannerSlide[]> {
  return apiData<BannerSlide[]>('/v1/banners');
}

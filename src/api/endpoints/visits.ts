import { apiData } from '../client';
import type { CreateVisitInput, VisitRequest, VisitStatus } from '../types';

/** Seeker: ask to see a PG. Requires a session — the owner gets real contact details. */
export function createVisit(input: CreateVisitInput): Promise<VisitRequest> {
  return apiData<VisitRequest>('/v1/visits', { method: 'POST', body: input });
}

/** Seeker: everything I have asked to visit. */
export function getMyVisits(): Promise<VisitRequest[]> {
  return apiData<VisitRequest[]>('/v1/visits/me');
}

/** Owner: the inbox. */
export function getVisitInbox(status?: VisitStatus): Promise<VisitRequest[]> {
  const query = status ? `?status=${status}` : '';
  return apiData<VisitRequest[]>(`/v1/visits/me/visits${query}`);
}

/** Owner: move a request along. */
export function updateVisitStatus(id: string, status: VisitStatus): Promise<VisitRequest> {
  return apiData<VisitRequest>(`/v1/visits/me/visits/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: { status },
  });
}

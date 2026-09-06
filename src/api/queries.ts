import { useQuery } from '@tanstack/react-query';
import { fetchMyVisits, fetchPublicPg, fetchVisitInbox } from './endpoints';
import { USE_FIXTURES } from './config';
import { fixturePgs } from '@/lib/fixtures';
import type { PgSearchParams, PgSummary } from './types';

export const queryKeys = {
  pgSearch: (params: PgSearchParams) => ['pg', 'search', params] as const,
  pgDetail: (pgCode: string) => ['pg', 'detail', pgCode] as const,
  myVisits: () => ['visits', 'mine'] as const,
  visitInbox: () => ['visits', 'inbox'] as const,
};

/**
 * Filtering runs on the client while fixtures are in play. When the real
 * endpoint arrives these same params go to the server instead, and this
 * function is deleted rather than rewritten.
 */
export function applyFilters(pgs: PgSummary[], params: PgSearchParams): PgSummary[] {
  return pgs.filter(pg => {
    if (params.q) {
      const needle = params.q.trim().toLowerCase();
      const haystack = (pg.name + ' ' + pg.location + ' ' + (pg.city ?? '')).toLowerCase();
      if (!haystack.includes(needle)) {
        return false;
      }
    }
    if (params.city && pg.city !== params.city) {
      return false;
    }
    if (params.gender && pg.gender !== params.gender) {
      return false;
    }
    if (params.foodIncluded && !pg.foodIncluded) {
      return false;
    }
    if (params.verifiedOnly && !pg.verified) {
      return false;
    }
    // A PG with no starting price cannot satisfy a price filter, so leaving it
    // out is the honest result rather than a surprise inclusion.
    if (params.minPrice !== undefined && (pg.price ?? -1) < params.minPrice) {
      return false;
    }
    if (params.maxPrice !== undefined && (pg.price ?? Number.MAX_SAFE_INTEGER) > params.maxPrice) {
      return false;
    }
    return true;
  });
}

export function usePgSearch(params: PgSearchParams = {}) {
  return useQuery({
    queryKey: queryKeys.pgSearch(params),
    queryFn: async (): Promise<PgSummary[]> => {
      if (USE_FIXTURES) {
        return applyFilters(fixturePgs, params);
      }
      throw new Error('The catalogue endpoint is not available yet.');
    },
  });
}

export function usePgDetail(pgCode: string) {
  return useQuery({
    queryKey: queryKeys.pgDetail(pgCode),
    queryFn: () => fetchPublicPg(pgCode),
    enabled: Boolean(pgCode),
  });
}

export function useMyVisits(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.myVisits(), queryFn: fetchMyVisits, enabled });
}

export function useVisitInbox(enabled: boolean) {
  return useQuery({ queryKey: queryKeys.visitInbox(), queryFn: () => fetchVisitInbox(), enabled });
}

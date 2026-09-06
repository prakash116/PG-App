import { useQuery } from '@tanstack/react-query';
import { searchPgs } from './endpoints/pg';
import { USE_FIXTURES } from './config';
import { fixturePgs } from '@/lib/fixtures';
import type { Page, PgSearchParams, PgSummary } from './types';

export const queryKeys = {
  pgSearch: (params: PgSearchParams) => ['pg', 'search', params] as const,
  pgDetail: (pgCode: string) => ['pg', 'detail', pgCode] as const,
  myVisits: () => ['visits', 'mine'] as const,
  visitInbox: () => ['visits', 'inbox'] as const,
};

export function usePgSearch(params: PgSearchParams = {}) {
  return useQuery({
    queryKey: queryKeys.pgSearch(params),
    queryFn: async (): Promise<Page<PgSummary>> => {
      if (USE_FIXTURES) {
        return { items: fixturePgs, nextCursor: null };
      }
      return searchPgs(params);
    },
  });
}

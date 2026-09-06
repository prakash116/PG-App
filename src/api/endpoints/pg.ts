import { apiData } from '../client';
import type { Page, PgDetail, PgFilterFacets, PgSearchParams, PgSummary } from '../types';

function toQuery(params: PgSearchParams): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    // Amenities repeat the key rather than joining with commas, so an amenity
    // containing a comma can never be split into two bogus filters.
    if (Array.isArray(value)) {
      value.forEach(entry => search.append(key, String(entry)));
    } else {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : '';
}

export function searchPgs(params: PgSearchParams = {}): Promise<Page<PgSummary>> {
  return apiData<Page<PgSummary>>(`/v1/pg/public${toQuery(params)}`, { anonymous: true });
}

export function getPgByCode(pgCode: string): Promise<PgDetail> {
  return apiData<PgDetail>(`/v1/pg/public/${encodeURIComponent(pgCode)}`, { anonymous: true });
}

export function getFilterFacets(): Promise<PgFilterFacets> {
  return apiData<PgFilterFacets>('/v1/pg/public/filters', { anonymous: true });
}

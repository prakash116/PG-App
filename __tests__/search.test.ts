/**
 * Filtering and money formatting — the two places where a quiet bug is
 * invisible in review but obvious to a user.
 */
import { applyFilters } from '../src/api/queries';
import { formatINR } from '../src/lib/format';
import type { PgSummary } from '../src/api/types';

function pg(overrides: Partial<PgSummary>): PgSummary {
  return {
    id: 'id',
    pgCode: 'PZ-TEST',
    name: 'Test PG',
    location: 'Somewhere',
    city: 'Pune',
    price: 8000,
    gender: 'BOYS',
    cooling: 'AC',
    foodIncluded: true,
    amenities: [],
    coverImage: null,
    logo: null,
    verification: 'VERIFIED',
    verified: true,
    rating: 4,
    reviewCount: 10,
    roomTypes: ['SINGLE', 'DOUBLE'],
    ...overrides,
  };
}

describe('applyFilters', () => {
  it('matches the search text against name, area and city', () => {
    const list = [
      pg({ id: '1', name: 'Urban Nest', location: 'Sector 14', city: 'Gurugram' }),
      pg({ id: '2', name: 'Lotus', location: 'Koramangala', city: 'Bengaluru' }),
    ];

    expect(applyFilters(list, { q: 'koramangala' }).map(p => p.id)).toEqual(['2']);
    expect(applyFilters(list, { q: 'GURUGRAM' }).map(p => p.id)).toEqual(['1']);
    expect(applyFilters(list, { q: 'urban' }).map(p => p.id)).toEqual(['1']);
  });

  it('excludes a PG with no price from a price filter rather than guessing', () => {
    const list = [pg({ id: 'priced', price: 8000 }), pg({ id: 'unpriced', price: null })];

    // Including it would put a PG of unknown cost inside a budget the user set,
    // which is worse than showing them one listing fewer.
    expect(applyFilters(list, { maxPrice: 10000 }).map(p => p.id)).toEqual(['priced']);
    expect(applyFilters(list, { minPrice: 5000 }).map(p => p.id)).toEqual(['priced']);
  });

  it('treats price bounds as inclusive', () => {
    const list = [pg({ id: 'exact', price: 8000 })];

    expect(applyFilters(list, { minPrice: 8000, maxPrice: 8000 })).toHaveLength(1);
  });

  it('combines filters as AND, not OR', () => {
    const list = [
      pg({ id: 'both', gender: 'GIRLS', verified: true }),
      pg({ id: 'one', gender: 'GIRLS', verified: false }),
    ];

    expect(applyFilters(list, { gender: 'GIRLS', verifiedOnly: true }).map(p => p.id)).toEqual([
      'both',
    ]);
  });

  it('keeps only PGs that offer the chosen sharing type', () => {
    const list = [
      pg({ id: 'has-triple', roomTypes: ['DOUBLE', 'TRIPLE'] }),
      pg({ id: 'no-triple', roomTypes: ['SINGLE'] }),
    ];

    expect(applyFilters(list, { roomType: 'TRIPLE' }).map(p => p.id)).toEqual(['has-triple']);
  });

  it('returns everything when nothing is asked for', () => {
    const list = [pg({ id: '1' }), pg({ id: '2' })];

    expect(applyFilters(list, {})).toHaveLength(2);
  });
});

describe('formatINR', () => {
  it('groups digits the Indian way, not the western way', () => {
    // 1,20,000 — a lakh reads wrong to an Indian user as 120,000.
    expect(formatINR(120000).replace(/\s/g, '')).toBe('₹1,20,000');
  });

  it('shows a dash rather than zero for a missing price', () => {
    expect(formatINR(null)).toBe('—');
    expect(formatINR(undefined)).toBe('—');
  });
});

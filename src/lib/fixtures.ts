import type { PgSummary } from '@/api/types';

/**
 * Development fixtures, typed as the real contract.
 *
 * The catalogue endpoints (GET /v1/pg/public) do not exist yet — they are
 * Milestone 0 backend work. These exist so the UI can be built and reviewed in
 * the meantime, and they are typed as `PgSummary` precisely so that the moment
 * the endpoint lands, any mismatch is a compile error rather than a blank list.
 *
 * Delete this file when USE_FIXTURES goes.
 */
export const fixturePgs: PgSummary[] = [
  {
    id: 'pg-01',
    pgCode: 'PZ-4F7K2A',
    name: 'Urban Nest PG',
    location: 'Sector 14',
    city: 'Gurugram',
    price: 8500,
    gender: 'BOYS',
    cooling: 'AC',
    foodIncluded: true,
    amenities: ['WiFi', 'AC', 'Food', 'Laundry', 'Power Backup', 'CCTV'],
    coverImage: null,
    logo: null,
    verification: 'VERIFIED',
    rating: 4.6,
    reviewCount: 132,
    distanceKm: 1.2,
  },
  {
    id: 'pg-02',
    pgCode: 'PZ-9M2X5B',
    name: 'Lotus Residency',
    location: 'Koramangala 5th Block',
    city: 'Bengaluru',
    price: 11000,
    gender: 'GIRLS',
    cooling: 'BOTH',
    foodIncluded: true,
    amenities: ['WiFi', 'Food', 'Housekeeping', 'Attached Bathroom'],
    coverImage: null,
    logo: null,
    verification: 'VERIFIED',
    rating: 4.8,
    reviewCount: 87,
    distanceKm: 3.4,
  },
  {
    id: 'pg-03',
    pgCode: 'PZ-1T8W3C',
    name: 'Sunrise Co-Living',
    location: 'Hinjewadi Phase 2',
    city: 'Pune',
    price: 7200,
    gender: 'CO_LIVING',
    cooling: 'NON_AC',
    foodIncluded: false,
    amenities: ['WiFi', 'Power Backup', 'Parking'],
    coverImage: null,
    logo: null,
    verification: 'PENDING',
    rating: 4.1,
    reviewCount: 24,
    distanceKm: 8.9,
  },
];

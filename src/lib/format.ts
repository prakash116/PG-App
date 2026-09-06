import type { Cooling, PgGender, RoomType } from '@/api/types';

/**
 * Rupees, in the Indian digit grouping (1,20,000 — not 120,000).
 * `Intl` with the en-IN locale gets this right on both platforms; hand-rolled
 * grouping does not, which is why this is not a regex.
 */
const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(amount: number | null | undefined): string {
  return amount === null || amount === undefined ? '—' : rupees.format(amount);
}

export function formatDistance(km: number | null): string | null {
  if (km === null) {
    return null;
  }
  return km < 1 ? `${Math.round(km * 1000)} m away` : `${km.toFixed(1)} km away`;
}

export const GENDER_LABEL: Record<PgGender, string> = {
  BOYS: 'Boys',
  GIRLS: 'Girls',
  CO_LIVING: 'Co-living',
};

export const COOLING_LABEL: Record<Cooling, string> = {
  AC: 'AC',
  NON_AC: 'Non-AC',
  BOTH: 'AC & Non-AC',
};

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  SINGLE: 'Single',
  DOUBLE: 'Double',
  TRIPLE: 'Triple',
  PREMIUM: 'Premium',
};

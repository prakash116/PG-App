import type { Cooling, PgGender, RoomType, VisitStatus } from '@/api/types';

/**
 * Rupees in Indian digit grouping (1,20,000 — not 120,000). `Intl` with en-IN
 * gets this right on both platforms; hand-rolled grouping does not, which is
 * why this is not a regex.
 */
const rupees = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatINR(amount: number | null | undefined): string {
  return amount === null || amount === undefined ? '—' : rupees.format(amount);
}

export function formatDate(iso: string | null): string {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
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

export const VISIT_STATUS_LABEL: Record<VisitStatus, string> = {
  PENDING: 'Awaiting reply',
  CONFIRMED: 'Confirmed',
  COMPLETED: 'Visited',
  CANCELLED: 'Cancelled',
};

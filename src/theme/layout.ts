/** 4pt scale. Every margin and padding comes from here, so nothing ends up
 *  13px from an edge because someone eyeballed it. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

/** Generous radii are load-bearing for the warm register: 20-24pt on cards is
 *  what stops a photo grid reading as a spreadsheet. */
export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  card: 24,
  sheet: 28,
  pill: 999,
} as const;

/** Minimum tappable square. Anything smaller needs a hitSlop. */
export const HIT_TARGET = 44;

export const shadows = {
  card: {
    shadowColor: '#3A2A18',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
} as const;

export const motion = {
  duration: { fast: 180, base: 260, slow: 420 },
  spring: {
    /** Default for anything the finger let go of. */
    responsive: { damping: 18, stiffness: 220, mass: 0.9 },
    /** Sheets and large surfaces: heavier, no overshoot. */
    heavy: { damping: 24, stiffness: 140, mass: 1.1 },
  },
  /** Per-item delay for staggered list entrances. */
  stagger: 40,
} as const;

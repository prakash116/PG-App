/**
 * Spacing is a 4pt scale. Every margin and padding in the app comes from here,
 * so a screen never ends up 13px from an edge because someone eyeballed it.
 */
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 48,
} as const;

/**
 * Generous radii are load-bearing for the warm register: 20-24pt on cards is
 * what stops a photo grid reading as a spreadsheet.
 */
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
  raised: {
    shadowColor: '#3A2A18',
    shadowOpacity: 0.14,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
} as const;

/**
 * Motion. Durations are paired with the spring configs so a fade and the
 * transform it accompanies finish together instead of drifting apart.
 */
export const motion = {
  duration: { instant: 120, fast: 180, base: 260, slow: 420, deliberate: 640 },
  spring: {
    /** Default for anything the finger let go of. */
    responsive: { damping: 18, stiffness: 220, mass: 0.9 },
    /** Sheets and large surfaces: slower, heavier, no overshoot. */
    heavy: { damping: 24, stiffness: 140, mass: 1.1 },
    /** Celebratory moments only. Overshoots on purpose. */
    bouncy: { damping: 12, stiffness: 260, mass: 0.8 },
  },
  /** Per-item delay for staggered list entrances. */
  stagger: 40,
} as const;

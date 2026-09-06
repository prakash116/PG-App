/**
 * Colour tokens for both schemes.
 *
 * Saffron is the brand anchor, taken from the API's startup banner. It is
 * deliberately scarce: actions, verification and focus only. The moment it
 * decorates a card border or an icon that does nothing, it stops reading as
 * "this is tappable" and the whole hierarchy flattens.
 *
 * The ground is a warm off-white rather than pure white. PG listings are
 * photo-heavy, and #FFFFFF next to a photograph reads as a hole in the page.
 */

const saffron = {
  50: '#FFF4E6',
  100: '#FFE3BF',
  200: '#FFCF94',
  300: '#FFBA69',
  400: '#FFA648',
  500: '#FF9933', // brand
  600: '#F08420',
  700: '#CC6A14',
  800: '#A3520D',
  900: '#7A3C08',
} as const;

/** Reserved for "verified" and successful outcomes, never for brand accent. */
const jade = {
  100: '#D6F3E4',
  300: '#7ED9AC',
  500: '#1FA971',
  700: '#137A50',
} as const;

const danger = {
  100: '#FDE0DC',
  300: '#F5998C',
  500: '#E1503A',
  700: '#A63324',
} as const;

const warn = {
  100: '#FEF0CE',
  300: '#F7CF71',
  500: '#E3A008',
  700: '#A5720A',
} as const;

export interface ColorScheme {
  /** Page background. */
  ground: string;
  /** Cards, sheets and anything raised off the ground. */
  surface: string;
  /** A second raised level: nested cards, pressed states. */
  surfaceRaised: string;
  /** Hairlines and dividers. */
  border: string;
  borderStrong: string;

  textPrimary: string;
  textSecondary: string;
  /** Captions, timestamps, disabled labels. */
  textMuted: string;
  /** Text drawn on top of `accent`. */
  textOnAccent: string;

  accent: string;
  accentPressed: string;
  accentSubtle: string;

  verified: string;
  verifiedSubtle: string;
  danger: string;
  dangerSubtle: string;
  warning: string;
  warningSubtle: string;

  /** Scrims behind modals and over gallery images. */
  scrim: string;
  /** Skeleton base and its moving highlight. */
  skeleton: string;
  skeletonSheen: string;
}

export const lightColors: ColorScheme = {
  ground: '#FFFBF7',
  surface: '#FFFFFF',
  surfaceRaised: '#FBF6F0',
  border: '#EDE4DA',
  borderStrong: '#DCCFC1',

  textPrimary: '#1C1714',
  textSecondary: '#5A5048',
  textMuted: '#8C8079',
  textOnAccent: '#2A1705',

  accent: saffron[500],
  accentPressed: saffron[600],
  accentSubtle: saffron[50],

  verified: jade[500],
  verifiedSubtle: jade[100],
  danger: danger[500],
  dangerSubtle: danger[100],
  warning: warn[500],
  warningSubtle: warn[100],

  scrim: 'rgba(28, 23, 20, 0.55)',
  skeleton: '#F0E8DF',
  skeletonSheen: '#FCF8F4',
};

export const darkColors: ColorScheme = {
  ground: '#14100D',
  surface: '#1E1815',
  surfaceRaised: '#2A221D',
  border: '#332A24',
  borderStrong: '#4A3E35',

  textPrimary: '#F7F1EB',
  textSecondary: '#BCAFA4',
  textMuted: '#8A7C71',
  textOnAccent: '#2A1705',

  accent: saffron[400],
  accentPressed: saffron[300],
  accentSubtle: 'rgba(255, 153, 51, 0.14)',

  verified: jade[300],
  verifiedSubtle: 'rgba(31, 169, 113, 0.18)',
  danger: danger[300],
  dangerSubtle: 'rgba(225, 80, 58, 0.18)',
  warning: warn[300],
  warningSubtle: 'rgba(227, 160, 8, 0.18)',

  scrim: 'rgba(0, 0, 0, 0.66)',
  skeleton: '#251E1A',
  skeletonSheen: '#332A24',
};

export const palette = { saffron, jade, danger, warn } as const;

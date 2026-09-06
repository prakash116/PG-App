import { Platform, type TextStyle } from 'react-native';

/**
 * One family, wide weight contrast. Hierarchy comes from weight and size, never
 * from colour alone — colour has to stay free to mean something (accent =
 * actionable, jade = verified).
 *
 * System fonts for now. Satoshi/General Sans is the intended upgrade and only
 * needs the font files plus `family` repointed; every call site reads these
 * tokens, so nothing else changes.
 */
const family = Platform.select({ ios: 'System', default: 'sans-serif' });
const familyMedium = Platform.select({ ios: 'System', default: 'sans-serif-medium' });

type Variant =
  | 'display'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'body'
  | 'bodyStrong'
  | 'callout'
  | 'caption'
  | 'overline';

export const typography: Record<Variant, TextStyle> = {
  display: { fontFamily: familyMedium, fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.8 },
  title1: { fontFamily: familyMedium, fontSize: 26, lineHeight: 32, fontWeight: '700', letterSpacing: -0.5 },
  title2: { fontFamily: familyMedium, fontSize: 20, lineHeight: 26, fontWeight: '700', letterSpacing: -0.3 },
  title3: { fontFamily: familyMedium, fontSize: 17, lineHeight: 22, fontWeight: '600', letterSpacing: -0.2 },
  body: { fontFamily: family, fontSize: 15, lineHeight: 22, fontWeight: '400' },
  bodyStrong: { fontFamily: familyMedium, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  callout: { fontFamily: family, fontSize: 13, lineHeight: 18, fontWeight: '400' },
  caption: { fontFamily: family, fontSize: 12, lineHeight: 16, fontWeight: '400' },
  overline: {
    fontFamily: familyMedium,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
};

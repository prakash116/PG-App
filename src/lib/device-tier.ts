import { PixelRatio, Platform } from 'react-native';

/**
 * How much motion this device can afford.
 *
 * Section 4 of the design commits the app to 60fps on a 4GB Android, and the
 * only way to keep that promise is to decide up front what gets dropped rather
 * than discovering the jank on a user's phone. Tiering exists from day one
 * because retrofitting it means auditing every animation in the app.
 *
 *  - `full`    — Skia shaders, blur, the 3D onboarding scene, everything.
 *  - `reduced` — Skia still on, but no blur and no 3D. Shorter durations.
 *  - `minimal` — opacity and translate only. No Skia, no shadows on lists.
 *
 * This is a heuristic on API level and pixel density, deliberately kept free of
 * native dependencies. Swapping in `react-native-device-info` for real RAM and
 * core counts is a single-function change and worth doing before launch.
 */
export type DeviceTier = 'full' | 'reduced' | 'minimal';

function detectTier(): DeviceTier {
  if (Platform.OS === 'ios') {
    // Every iOS device still receiving updates handles the full treatment.
    return 'full';
  }

  const apiLevel = typeof Platform.Version === 'number' ? Platform.Version : 0;

  // Android 9 and below in 2026 means genuinely old silicon, not a new budget
  // phone: those ship with a current API level even at the bottom of the range.
  if (apiLevel > 0 && apiLevel <= 28) {
    return 'minimal';
  }

  // A low density panel on a modern API level is the budget-phone signature.
  // These run fine, they just cannot also composite shaders every frame.
  if (PixelRatio.get() < 2.5) {
    return 'reduced';
  }

  return 'full';
}

export const deviceTier: DeviceTier = detectTier();

export const canRenderSkia = deviceTier !== 'minimal';
export const canRenderBlur = deviceTier === 'full';
export const canRender3D = deviceTier === 'full';

/** Scales a duration so weaker devices finish sooner instead of dropping frames. */
export function tierDuration(ms: number): number {
  switch (deviceTier) {
    case 'full':
      return ms;
    case 'reduced':
      return Math.round(ms * 0.8);
    case 'minimal':
      return Math.round(ms * 0.6);
  }
}

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { darkColors, lightColors, type ColorScheme } from './colors';
import { HIT_TARGET, motion, radii, shadows, spacing } from './layout';
import { typography } from './typography';

export interface Theme {
  colors: ColorScheme;
  typography: typeof typography;
  spacing: typeof spacing;
  radii: typeof radii;
  shadows: typeof shadows;
  motion: typeof motion;
  isDark: boolean;
}

function buildTheme(isDark: boolean): Theme {
  return {
    colors: isDark ? darkColors : lightColors,
    typography,
    spacing,
    radii,
    shadows,
    motion,
    isDark,
  };
}

export const lightTheme = buildTheme(false);
export const darkTheme = buildTheme(true);

const ThemeContext = createContext<Theme>(lightTheme);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const theme = useMemo(() => (scheme === 'dark' ? darkTheme : lightTheme), [scheme]);
  return React.createElement(ThemeContext.Provider, { value: theme }, children);
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export { HIT_TARGET, motion, radii, shadows, spacing, typography };
export type { ColorScheme };

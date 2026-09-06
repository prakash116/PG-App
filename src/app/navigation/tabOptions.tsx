import { StyleSheet } from 'react-native';
import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import { useTheme } from '@/theme';

/** Shared, so the two shells cannot drift into looking like different apps. */
export function useTabScreenOptions(): BottomTabNavigationOptions {
  const theme = useTheme();

  return {
    headerShown: false,
    tabBarActiveTintColor: theme.colors.accent,
    tabBarInactiveTintColor: theme.colors.textMuted,
    tabBarStyle: {
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      height: 62,
      paddingTop: 6,
    },
    tabBarLabelStyle: { ...theme.typography.caption, fontWeight: '600' },
  };
}

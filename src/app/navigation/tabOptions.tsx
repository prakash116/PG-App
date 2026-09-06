import type { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';

/**
 * Shared by both shells. The bar itself is custom (see TabBar.tsx), so the
 * only things left to set here are the ones it reads back from the options.
 */
export function useTabScreenOptions(): BottomTabNavigationOptions {
  return {
    headerShown: false,
  };
}

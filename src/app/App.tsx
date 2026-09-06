import React, { useMemo } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RootNavigator } from './navigation/RootNavigator';
import { ThemeProvider, darkTheme, lightTheme } from '@/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Listings do not change minute to minute, and someone walking around a
      // neighbourhood on patchy 4G should not pay for a refetch on every
      // screen focus.
      staleTime: 60_000,
      retry: (failureCount, error) => {
        // A 4xx will not become a 2xx by asking again.
        const status = (error as { status?: number } | null)?.status;
        if (typeof status === 'number' && status >= 400 && status < 500) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export default function App() {
  const isDark = useColorScheme() === 'dark';

  // Navigation paints its own screen background behind ours, so its theme has
  // to agree with the tokens or every transition flashes the wrong colour.
  const navTheme = useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    const tokens = isDark ? darkTheme : lightTheme;

    return {
      ...base,
      colors: {
        ...base.colors,
        background: tokens.colors.ground,
        card: tokens.colors.surface,
        text: tokens.colors.textPrimary,
        border: tokens.colors.border,
        primary: tokens.colors.accent,
      },
    };
  }, [isDark]);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            {/* React Native 0.87 makes Android edge-to-edge the default, so
                backgroundColor and translucent are gone: the bar is always
                transparent and only its content colour is ours to set. */}
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <NavigationContainer theme={navTheme}>
              <RootNavigator />
            </NavigationContainer>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = { root: { flex: 1 } } as const;

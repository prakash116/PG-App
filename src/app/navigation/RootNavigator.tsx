import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GuestTabs } from './GuestTabs';
import { OwnerTabs } from './OwnerTabs';
import { PgDetailScreen } from '@/screens/PgDetailScreen';
import { SignInScreen } from '@/screens/auth/SignInScreen';
import { AdminNoticeScreen } from '@/screens/AdminNoticeScreen';
import { CityPickerScreen } from '@/screens/CityPickerScreen';
import { useSession } from '@/store/session';
import { useTheme } from '@/theme';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const theme = useTheme();
  const status = useSession(state => state.status);
  const role = useSession(state => state.role);
  const bootstrap = useSession(state => state.bootstrap);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (status === 'bootstrapping') {
    return (
      <View style={[styles.splash, { backgroundColor: theme.colors.ground }]}>
        <ActivityIndicator color={theme.colors.accent} size="large" />
      </View>
    );
  }

  /**
   * The role picks the shell, not the screen.
   *
   * Mounting only one of these means an owner screen is unreachable by any
   * route — including a deep link — because it is not in the navigator at all.
   * That is a stronger guarantee than a per-screen guard, which has to be
   * remembered again on every screen someone adds later.
   */
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {role === 'SUPER_ADMIN' ? (
        <Stack.Screen name="AdminNotice" component={AdminNoticeScreen} />
      ) : role === 'PG_OWNER' ? (
        <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
      ) : (
        <Stack.Screen name="GuestTabs" component={GuestTabs} />
      )}

      <Stack.Screen
        name="PgDetail"
        component={PgDetailScreen}
        options={{ headerShown: true, headerTitle: '', headerTransparent: true }}
      />
      <Stack.Screen
        name="CityPicker"
        component={CityPickerScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="SignIn"
        component={SignInScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

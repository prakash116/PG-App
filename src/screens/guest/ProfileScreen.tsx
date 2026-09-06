import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@/components/common/Text';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';
import { Header, useHeaderHeight } from '@/components/common/Header';
import { StateView } from '@/components/common/StateView';
import { useSession } from '@/store/session';
import { formatDate } from '@/lib/format';
import { useTheme } from '@/theme';
import type { RootStackParamList } from '@/app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProfileScreen() {
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<Nav>();
  const user = useSession(state => state.user);
  const signOut = useSession(state => state.signOut);

  const onSignIn = useCallback(() => navigation.navigate('SignIn'), [navigation]);
  // Search belongs to discovery, so the control takes you there rather than
  // duplicating a filter on a screen that cannot use it.
  const onSearchPress = useCallback(
    () => navigation.navigate('GuestTabs', { screen: 'Discover' }),
    [navigation],
  );
  const onWishlistPress = useCallback(
    () => navigation.navigate('GuestTabs', { screen: 'Saved' }),
    [navigation],
  );
  const onNotificationsPress = useCallback(
    () => navigation.navigate('GuestTabs', { screen: 'Visits' }),
    [navigation],
  );
  const onSignOut = useCallback(() => {
    void signOut();
  }, [signOut]);

  if (!user) {
    return (
      <Screen>
        <Header
          solid
          onSearchPress={onSearchPress}
          onWishlistPress={onWishlistPress}
          onNotificationsPress={onNotificationsPress}
        />
        <StateView
          title="You are browsing as a guest"
          description="Sign in to book visits, and to keep your shortlist with your account."
          actionLabel="Sign in"
          onAction={onSignIn}
        />
      </Screen>
    );
  }

  const fullName = user.lastName ? user.firstName + ' ' + user.lastName : user.firstName;

  return (
    <Screen>
      <Header
        solid
        onSearchPress={onSearchPress}
        onWishlistPress={onWishlistPress}
        onNotificationsPress={onNotificationsPress}
      />
      <ScrollView contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.lg, paddingTop: headerHeight + theme.spacing.md }}>
        <View>
          <Text variant="overline" tone="muted">
            Signed in
          </Text>
          <Text variant="title1">{fullName}</Text>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.lg,
              padding: theme.spacing.lg,
              gap: theme.spacing.sm,
            },
          ]}
        >
          <Row label="Email" value={user.email} />
          <Row label="Phone" value={user.phone} />
          <Row label="Role" value={user.role.replace('_', ' ').toLowerCase()} />
          <Row label="Last sign in" value={formatDate(user.lastLogin)} />
        </View>

        <Button label="Sign out" variant="secondary" onPress={onSignOut} />
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text variant="callout" tone="muted">
        {label}
      </Text>
      <Text variant="callout" style={styles.shrink} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth * 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  shrink: { flexShrink: 1, textAlign: 'right' },
});

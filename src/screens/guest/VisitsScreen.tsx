import React, { useCallback } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@/components/common/Text';
import { Screen } from '@/components/common/Screen';
import { Header, useHeaderHeight } from '@/components/common/Header';
import { StateView } from '@/components/common/StateView';
import { Skeleton } from '@/components/common/Skeleton';
import { useMyVisits } from '@/api/queries';
import { useSession } from '@/store/session';
import { VISIT_STATUS_LABEL, formatDate } from '@/lib/format';
import { useTheme } from '@/theme';
import type { VisitStatus } from '@/api/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function VisitsScreen() {
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<Nav>();
  const isAuthenticated = useSession(state => state.status === 'authenticated');
  const { data, isLoading, error } = useMyVisits(isAuthenticated);

  // Search belongs to discovery, so the control takes you there rather than
  // duplicating a filter on a screen that cannot use it.
  const onWishlistPress = useCallback(
    () => navigation.navigate('GuestTabs', { screen: 'Saved' }),
    [navigation],
  );
  const onNotificationsPress = useCallback(
    () => navigation.navigate('GuestTabs', { screen: 'Visits' }),
    [navigation],
  );
  const onSearchPress = useCallback(
    () => navigation.navigate('GuestTabs', { screen: 'Discover' }),
    [navigation],
  );

  const onSignIn = useCallback(() => navigation.navigate('SignIn'), [navigation]);

  return (
    <Screen>
      <Header
        solid
        onSearchPress={onSearchPress}
        onWishlistPress={onWishlistPress}
        onNotificationsPress={onNotificationsPress}
      />

      {!isAuthenticated ? (
        <StateView
          title="Sign in to see your visits"
          description="Visit requests are tied to your account, so the owner knows who is coming."
          actionLabel="Sign in"
          onAction={onSignIn}
        />
      ) : isLoading ? (
        <View style={{ padding: theme.spacing.xl, gap: theme.spacing.md, paddingTop: headerHeight + theme.spacing.md }}>
          <Skeleton height={84} />
          <Skeleton height={84} />
        </View>
      ) : error ? (
        <StateView
          tone="error"
          title="Could not load your visits"
          description={error instanceof Error ? error.message : 'Something went wrong.'}
        />
      ) : !data || data.length === 0 ? (
        <StateView
          title="No visits yet"
          description="Find a PG you like and ask to see it. Requests show up here."
        />
      ) : (
        <ScrollView contentContainerStyle={{ padding: theme.spacing.xl, gap: theme.spacing.md, paddingTop: headerHeight + theme.spacing.md }}>
          {data.map(visit => (
            <View
              key={visit.id}
              style={[
                styles.card,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radii.lg,
                  padding: theme.spacing.lg,
                  gap: theme.spacing.xs,
                },
              ]}
            >
              <View style={styles.row}>
                <Text variant="bodyStrong">{visit.fullName}</Text>
                <StatusPill status={visit.status} />
              </View>
              <Text variant="callout" tone="muted">
                Preferred date: {formatDate(visit.preferredDate)}
              </Text>
              {visit.message ? (
                <Text variant="callout" tone="secondary">
                  {visit.message}
                </Text>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

function StatusPill({ status }: { status: VisitStatus }) {
  const theme = useTheme();

  const background =
    status === 'CONFIRMED'
      ? theme.colors.verifiedSubtle
      : status === 'CANCELLED'
        ? theme.colors.dangerSubtle
        : theme.colors.warningSubtle;

  const tone = status === 'CONFIRMED' ? 'verified' : status === 'CANCELLED' ? 'danger' : 'secondary';

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: background, borderRadius: theme.radii.pill, paddingHorizontal: 10 },
      ]}
    >
      <Text variant="caption" tone={tone}>
        {VISIT_STATUS_LABEL[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth * 2 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  pill: { paddingVertical: 4 },
});

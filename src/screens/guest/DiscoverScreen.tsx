import React, { useCallback } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Text } from '@/components/common/Text';
import { Button } from '@/components/common/Button';
import { Screen } from '@/components/common/Screen';
import { PgCard } from '@/components/pg/PgCard';
import { usePgSearch } from '@/api/queries';
import { USE_FIXTURES } from '@/api/config';
import { useTheme } from '@/theme';
import type { PgSummary } from '@/api/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DiscoverScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { data, isLoading, isRefetching, refetch, error } = usePgSearch();

  const openPg = useCallback(
    (pg: PgSummary) => navigation.navigate('PgDetail', { pgCode: pg.pgCode, name: pg.name }),
    [navigation],
  );

  // RefreshControl wants a void-returning handler; refetch resolves with the
  // query result, which would otherwise be an overload mismatch.
  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const renderItem = useCallback(
    ({ item, index }: { item: PgSummary; index: number }) => (
      <PgCard pg={item} index={index} onPress={openPg} />
    ),
    [openPg],
  );

  return (
    <Screen>
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md }}>
        <Text variant="overline" tone="muted">
          Find your place
        </Text>
        <Text variant="title1">Discover PGs</Text>
      </View>

      {USE_FIXTURES ? (
        <View
          style={[
            styles.devBanner,
            {
              backgroundColor: theme.colors.warningSubtle,
              margin: theme.spacing.xl,
              marginBottom: 0,
              borderRadius: theme.radii.md,
              padding: theme.spacing.md,
            },
          ]}
        >
          <Text variant="caption" tone="secondary">
            Sample data — GET /v1/pg/public is not built yet (Milestone 0).
          </Text>
        </View>
      ) : null}

      {error && !data ? (
        <View style={styles.centered}>
          <Text variant="title3">Could not load PGs</Text>
          <Text variant="body" tone="secondary" style={styles.centerText}>
            {error instanceof Error ? error.message : 'Something went wrong.'}
          </Text>
          <Button label="Try again" onPress={onRefresh} variant="secondary" />
        </View>
      ) : (
        <FlashList
          data={data?.items ?? []}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: theme.spacing.xl }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={theme.colors.accent}
            />
          }
          ListEmptyComponent={
            isLoading ? null : (
              <View style={styles.centered}>
                <Text variant="title3">Nothing here yet</Text>
                <Text variant="body" tone="secondary" style={styles.centerText}>
                  No PGs match this search. Try widening your filters.
                </Text>
              </View>
            )
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  centerText: { textAlign: 'center' },
  devBanner: { alignItems: 'center' },
});

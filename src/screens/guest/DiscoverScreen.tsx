import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search } from 'lucide-react-native';
import { Text } from '@/components/common/Text';
import { Screen } from '@/components/common/Screen';
import { StateView } from '@/components/common/StateView';
import { PgCard, PgCardSkeleton } from '@/components/pg/PgCard';
import { usePgSearch } from '@/api/queries';
import { USE_FIXTURES } from '@/api/config';
import { useTheme } from '@/theme';
import type { PgSummary } from '@/api/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DiscoverScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const [rawQuery, setRawQuery] = useState('');

  // The query object is the cache key, so it has to be stable across renders
  // or every keystroke would start a fresh entry.
  const params = useMemo(() => ({ q: rawQuery.trim() || undefined }), [rawQuery]);
  const { data, isLoading, isRefetching, refetch, error } = usePgSearch(params);

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

  const gutter = { paddingHorizontal: theme.spacing.xl };

  return (
    <Screen>
      <View style={[gutter, { paddingTop: theme.spacing.md, paddingBottom: theme.spacing.md }]}>
        <Text variant="overline" tone="muted">
          Find your place
        </Text>
        <Text variant="title1">Discover PGs</Text>

        <View
          style={[
            styles.search,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.pill,
              paddingHorizontal: theme.spacing.lg,
              marginTop: theme.spacing.lg,
            },
          ]}
        >
          <Search size={17} color={theme.colors.textMuted} />
          <TextInput
            value={rawQuery}
            onChangeText={setRawQuery}
            placeholder="Search by name, area or city"
            placeholderTextColor={theme.colors.textMuted}
            returnKeyType="search"
            autoCorrect={false}
            style={[
              styles.searchInput,
              { color: theme.colors.textPrimary, ...theme.typography.body },
            ]}
          />
        </View>
      </View>

      {USE_FIXTURES ? (
        <View
          style={[
            gutter,
            styles.banner,
            { backgroundColor: theme.colors.warningSubtle, paddingVertical: theme.spacing.sm },
          ]}
        >
          <Text variant="caption" tone="secondary">
            Sample listings — the catalogue endpoint is not built yet.
          </Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={[gutter, { paddingTop: theme.spacing.lg }]}>
          <PgCardSkeleton />
          <PgCardSkeleton />
        </View>
      ) : error ? (
        <StateView
          tone="error"
          title="Could not load PGs"
          description={error instanceof Error ? error.message : 'Something went wrong.'}
          actionLabel="Try again"
          onAction={onRefresh}
        />
      ) : (
        <FlashList
          data={data ?? []}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: theme.spacing.xl }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              tintColor={theme.colors.accent}
            />
          }
          ListEmptyComponent={
            <StateView
              title="Nothing matches that"
              description="Try a different area, or clear the search to see everything."
            />
          }
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  searchInput: { flex: 1, padding: 0 },
  banner: { alignItems: 'center' },
});

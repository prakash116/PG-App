import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, StyleSheet, TextInput, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { Search } from 'lucide-react-native';
import { Screen } from '@/components/common/Screen';
import { Header } from '@/components/common/Header';
import { StateView } from '@/components/common/StateView';
import { PgCard, PgCardSkeleton } from '@/components/pg/PgCard';
import { usePgSearch } from '@/api/queries';
import { USE_FIXTURES } from '@/api/config';
import { Text } from '@/components/common/Text';
import { useLocation } from '@/store/location';
import { tierDuration } from '@/lib/device-tier';
import { useTheme } from '@/theme';
import type { PgSummary } from '@/api/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function DiscoverScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const city = useLocation(state => state.city);

  const [isSearchOpen, setSearchOpen] = useState(false);
  const [rawQuery, setRawQuery] = useState('');

  // The params object is the cache key, so it has to be stable across renders
  // or every keystroke would start a fresh cache entry.
  const params = useMemo(
    () => ({ q: rawQuery.trim() || undefined, city: city ?? undefined }),
    [city, rawQuery],
  );
  const { data, isLoading, isRefetching, refetch, error } = usePgSearch(params);

  const openPg = useCallback(
    (pg: PgSummary) => navigation.navigate('PgDetail', { pgCode: pg.pgCode, name: pg.name }),
    [navigation],
  );

  const onLocationPress = useCallback(() => navigation.navigate('CityPicker'), [navigation]);

  const onSearchPress = useCallback(() => {
    setSearchOpen(open => {
      // Closing the field clears the query: leaving a hidden filter applied is
      // how someone ends up staring at an empty list with no visible reason.
      if (open) {
        setRawQuery('');
      }
      return !open;
    });
  }, []);

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

  const duration = tierDuration(theme.motion.duration.fast);

  return (
    <Screen>
      <Header
        city={city}
        isSearchOpen={isSearchOpen}
        onSearchPress={onSearchPress}
        onLocationPress={onLocationPress}
      />

      {isSearchOpen ? (
        <Animated.View
          entering={FadeInUp.duration(duration)}
          exiting={FadeOutUp.duration(duration)}
          style={{ paddingHorizontal: theme.spacing.xl, paddingBottom: theme.spacing.sm }}
        >
          <View
            style={[
              styles.search,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                borderRadius: theme.radii.pill,
                paddingHorizontal: theme.spacing.lg,
              },
            ]}
          >
            <Search size={17} color={theme.colors.textMuted} />
            <TextInput
              value={rawQuery}
              onChangeText={setRawQuery}
              placeholder="Search by name or area"
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="search"
              autoCorrect={false}
              autoFocus
              style={[
                styles.searchInput,
                { color: theme.colors.textPrimary, ...theme.typography.body },
              ]}
            />
          </View>
        </Animated.View>
      ) : null}

      {USE_FIXTURES ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: theme.colors.warningSubtle,
              paddingVertical: theme.spacing.sm,
              paddingHorizontal: theme.spacing.xl,
            },
          ]}
        >
          <Text variant="caption" tone="secondary">
            Sample listings — the catalogue endpoint is not built yet.
          </Text>
        </View>
      ) : null}

      {isLoading ? (
        <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.lg }}>
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
              description={
                city
                  ? 'No PGs in ' + city + ' match this search. Try another city or clear the search.'
                  : 'Try a different area, or clear the search to see everything.'
              }
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

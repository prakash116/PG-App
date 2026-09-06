import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  RefreshControl,
  StatusBar,
  StyleSheet,
  TextInput,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import { FlashList, type FlashListRef } from '@shopify/flash-list';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, {
  FadeInUp,
  FadeOutUp,
  runOnJS,
  useAnimatedReaction,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, X } from 'lucide-react-native';
import { Screen } from '@/components/common/Screen';
import { HEADER_SOLID_AT, Header, useHeaderHeight } from '@/components/common/Header';
import { StateView } from '@/components/common/StateView';
import { Text } from '@/components/common/Text';
import { PgCard, PgCardSkeleton } from '@/components/pg/PgCard';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { useBanners, usePgSearch } from '@/api/queries';
import { USE_FIXTURES } from '@/api/config';
import { fallbackBanners } from '@/lib/banners';
import { useLocation } from '@/store/location';
import { canRenderShadows, tierDuration } from '@/lib/device-tier';
import { useTheme } from '@/theme';
import type { PgSummary } from '@/api/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/** Banner height below the status bar. The total adds the inset back on.
 *  Shorter than a hero with copy would be: it carries no message, so past a
 *  point more height is just distance between the header and the first card. */
const BANNER_BODY = 280;

export function DiscoverScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<Nav>();
  const isFocused = useIsFocused();
  const city = useLocation(state => state.city);

  const listRef = useRef<FlashListRef<PgSummary>>(null);
  const scrollY = useSharedValue(0);
  const [isHeaderSolid, setHeaderSolid] = useState(false);
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [rawQuery, setRawQuery] = useState('');

  const bannerHeight = insets.top + BANNER_BODY;

  // The params object is the cache key, so it has to be stable across renders
  // or every keystroke would start a fresh cache entry.
  const params = useMemo(
    () => ({ q: rawQuery.trim() || undefined, city: city ?? undefined }),
    [city, rawQuery],
  );
  const { data, isLoading, isRefetching, refetch, error } = usePgSearch(params);
  // Banners are backend content. Until they arrive — or if they never do —
  // the header still needs brand ground under it, hence the fallback.
  const { data: banners } = useBanners();

  // FlashList wraps the onScroll prop in a plain function call before it
  // reaches the scroll view, so a Reanimated worklet handler cannot go here —
  // it is not callable from JS and crashes on the first scroll. A plain
  // handler writing the shared value keeps every animation that reads it
  // intact; the value crosses to the UI thread once per scroll event.
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollY.value = event.nativeEvent.contentOffset.y;
    },
    [scrollY],
  );

  // Status bar icons are light over the banner and flip with the header: a
  // boolean crossing, not a per-frame value, so JS only hears about the edge.
  useAnimatedReaction(
    () => scrollY.value >= HEADER_SOLID_AT,
    (solid, previous) => {
      if (solid !== previous) {
        runOnJS(setHeaderSolid)(solid);
      }
    },
  );

  const scrollToCards = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: bannerHeight - headerHeight, animated: true });
  }, [bannerHeight, headerHeight]);

  const openPg = useCallback(
    (pg: PgSummary) => navigation.navigate('PgDetail', { pgCode: pg.pgCode, name: pg.name }),
    [navigation],
  );

  const onWishlistPress = useCallback(
    () => navigation.navigate('GuestTabs', { screen: 'Saved' }),
    [navigation],
  );

  // There is no notifications feed yet; visit status changes are the closest
  // thing, so the bell takes you where those show up.
  const onNotificationsPress = useCallback(
    () => navigation.navigate('GuestTabs', { screen: 'Visits' }),
    [navigation],
  );

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

  // The banner says nothing, so a tap on it means "get me to the listings".
  const onSlidePress = useCallback(() => scrollToCards(), [scrollToCards]);

  // RefreshControl wants a void-returning handler; refetch resolves with the
  // query result, which would otherwise be an overload mismatch.
  const onRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  // Cards carry their own gutter: the list container cannot, because the
  // banner in its header has to run edge to edge.
  const gutter = theme.spacing.xl;
  const renderItem = useCallback(
    ({ item, index }: { item: PgSummary; index: number }) => (
      <View style={{ paddingHorizontal: gutter }}>
        <PgCard pg={item} index={index} onPress={openPg} />
      </View>
    ),
    [gutter, openPg],
  );

  const duration = tierDuration(theme.motion.duration.fast);

  const listHeader = (
    <View>
      <BannerCarousel
        slides={banners ?? fallbackBanners}
        height={bannerHeight}
        scrollY={scrollY}
        onSlidePress={onSlidePress}
      />
      {/* The ground overlaps the banner's bottom edge with rounded corners, so
          the listings read as a sheet resting on the brand surface rather than
          a hard seam between two blocks. */}
      <View
        style={{
          height: theme.radii.card,
          marginTop: -theme.radii.card,
          borderTopLeftRadius: theme.radii.card,
          borderTopRightRadius: theme.radii.card,
          backgroundColor: theme.colors.ground,
        }}
      />
      {USE_FIXTURES ? (
        <View
          style={[
            styles.notice,
            {
              backgroundColor: theme.colors.warningSubtle,
              borderRadius: theme.radii.md,
              marginHorizontal: gutter,
              marginTop: theme.spacing.lg,
              paddingVertical: theme.spacing.sm,
            },
          ]}
        >
          <Text variant="caption" tone="secondary">
            Sample listings — the catalogue endpoint is not built yet.
          </Text>
        </View>
      ) : null}
      <View style={{ height: theme.spacing.lg }} />
    </View>
  );

  return (
    <Screen topInset={false}>
      {isFocused ? (
        <StatusBar
          animated
          barStyle={isHeaderSolid && !theme.isDark ? 'dark-content' : 'light-content'}
        />
      ) : null}

      <Header
        scrollY={scrollY}
        isSearchOpen={isSearchOpen}
        onSearchPress={onSearchPress}
        onWishlistPress={onWishlistPress}
        onNotificationsPress={onNotificationsPress}
      />

      {isSearchOpen ? (
        <Animated.View
          entering={FadeInUp.duration(duration)}
          exiting={FadeOutUp.duration(duration)}
          style={[styles.searchWrap, { top: headerHeight, paddingHorizontal: theme.spacing.lg }]}
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
              canRenderShadows ? theme.shadows.card : null,
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
              style={[styles.searchInput, { color: theme.colors.textPrimary, ...theme.typography.body }]}
            />
            {rawQuery ? (
              <X size={16} color={theme.colors.textMuted} onPress={() => setRawQuery('')} />
            ) : null}
          </View>
        </Animated.View>
      ) : null}

      {isLoading ? (
        <View>
          {listHeader}
          <View style={{ paddingHorizontal: gutter }}>
            <PgCardSkeleton />
            <PgCardSkeleton />
          </View>
        </View>
      ) : error ? (
        <View style={styles.grow}>
          {listHeader}
          <StateView
            tone="error"
            title="Could not load PGs"
            description={error instanceof Error ? error.message : 'Something went wrong.'}
            actionLabel="Try again"
            onAction={onRefresh}
          />
        </View>
      ) : (
        <FlashList
          ref={listRef}
          data={data ?? []}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          onScroll={onScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: theme.spacing.xl }}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={onRefresh}
              progressViewOffset={insets.top + theme.spacing.sm}
              tintColor={theme.colors.accent}
            />
          }
          ListHeaderComponent={listHeader}
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
  // Floats under the header rather than pushing the list down, so opening
  // search never causes the content to jump.
  searchWrap: { position: 'absolute', left: 0, right: 0, zIndex: 9 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 46,
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  searchInput: { flex: 1, padding: 0 },
  notice: { alignItems: 'center' },
  grow: { flex: 1 },
});

import React, { useCallback } from 'react';
import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn } from 'react-native-reanimated';
import { BadgeCheck, MapPin, Star, UtensilsCrossed } from 'lucide-react-native';
import { Text } from '@/components/common/Text';
import { Button } from '@/components/common/Button';
import { StateView } from '@/components/common/StateView';
import { Skeleton } from '@/components/common/Skeleton';
import { usePgDetail } from '@/api/queries';
import { useSession } from '@/store/session';
import { useSaved } from '@/store/saved';
import { COOLING_LABEL, GENDER_LABEL, ROOM_TYPE_LABEL, formatINR } from '@/lib/format';
import { useTheme } from '@/theme';
import type { RootStackParamList } from '@/app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function PgDetailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<RouteProp<RootStackParamList, 'PgDetail'>>();

  const { data: pg, isLoading, error, refetch } = usePgDetail(params.pgCode);
  const isAuthenticated = useSession(state => state.status === 'authenticated');
  const isSaved = useSaved(state => state.codes.includes(params.pgCode));
  const toggleSaved = useSaved(state => state.toggle);

  const onRetry = useCallback(() => {
    void refetch();
  }, [refetch]);

  const onBookVisit = useCallback(() => {
    // The gate is the part that has to be right first; the booking form itself
    // is the next screen to build.
    if (!isAuthenticated) {
      navigation.navigate('SignIn');
    }
  }, [isAuthenticated, navigation]);

  const gutter = { paddingHorizontal: theme.spacing.xl };
  const heroHeight = Math.round(width * 0.68);

  if (isLoading) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.ground }]}>
        <Skeleton height={heroHeight} radius={0} />
        <View style={[gutter, { paddingTop: theme.spacing.xl, gap: theme.spacing.md }]}>
          <Skeleton height={26} width="70%" />
          <Skeleton height={16} width="50%" />
          <Skeleton height={60} />
        </View>
      </View>
    );
  }

  if (error || !pg) {
    return (
      <View style={[styles.root, { backgroundColor: theme.colors.ground, paddingTop: insets.top }]}>
        <StateView
          tone="error"
          title="Could not load this PG"
          description={
            error instanceof Error ? error.message : 'It may have been removed or unpublished.'
          }
          actionLabel="Try again"
          onAction={onRetry}
        />
      </View>
    );
  }

  const cover = pg.images[0] ?? null;

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.ground }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 96 }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.hero, { height: heroHeight, backgroundColor: theme.colors.surfaceRaised }]}
        >
          {cover ? (
            <Animated.Image
              entering={FadeIn.duration(240)}
              source={{ uri: cover }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : null}
        </View>

        {pg.images.length > 1 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              gutter,
              { gap: theme.spacing.sm, paddingVertical: theme.spacing.md },
            ]}
          >
            {pg.images.slice(1).map(uri => (
              <Image
                key={uri}
                source={{ uri }}
                style={[styles.thumb, { borderRadius: theme.radii.md }]}
                resizeMode="cover"
              />
            ))}
          </ScrollView>
        ) : null}

        <View style={[gutter, { paddingTop: theme.spacing.lg, gap: theme.spacing.sm }]}>
          <View style={styles.titleRow}>
            <Text variant="title1" style={styles.shrink}>
              {pg.name}
            </Text>
            {pg.verified ? <BadgeCheck size={22} color={theme.colors.verified} /> : null}
          </View>

          <View style={styles.metaRow}>
            <MapPin size={14} color={theme.colors.textMuted} />
            <Text variant="callout" tone="muted">
              {pg.location}
              {pg.city ? ', ' + pg.city : ''}
            </Text>
            {pg.reviewCount > 0 ? (
              <React.Fragment>
                <Star size={13} color={theme.colors.accent} fill={theme.colors.accent} />
                <Text variant="callout" tone="secondary">
                  {pg.rating.toFixed(1)} ({pg.reviewCount})
                </Text>
              </React.Fragment>
            ) : null}
          </View>

          <View style={[styles.priceRow, { marginTop: theme.spacing.sm }]}>
            <Text variant="title1">{formatINR(pg.price)}</Text>
            <Text variant="body" tone="muted">
              / month
            </Text>
            {pg.deposit !== null ? (
              <Text variant="callout" tone="muted">
                {formatINR(pg.deposit)} deposit
              </Text>
            ) : null}
          </View>

          <View style={[styles.tagRow, { marginTop: theme.spacing.sm }]}>
            {pg.gender ? <Chip label={GENDER_LABEL[pg.gender]} /> : null}
            {pg.cooling ? <Chip label={COOLING_LABEL[pg.cooling]} /> : null}
            {pg.foodIncluded ? <Chip label="Food included" /> : null}
          </View>
        </View>

        {pg.description ? (
          <Section title="About">
            <Text variant="body" tone="secondary">
              {pg.description}
            </Text>
          </Section>
        ) : null}

        {pg.roomTypes.length > 0 ? (
          <Section title="Rooms">
            <View style={{ gap: theme.spacing.sm }}>
              {pg.roomTypes.map(room => (
                <View
                  key={room.type}
                  style={[
                    styles.roomRow,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor: theme.colors.border,
                      borderRadius: theme.radii.lg,
                      padding: theme.spacing.lg,
                    },
                  ]}
                >
                  <Text variant="bodyStrong">{ROOM_TYPE_LABEL[room.type]} sharing</Text>
                  <Text variant="bodyStrong" tone="accent">
                    {formatINR(room.pricePerBed)}
                  </Text>
                </View>
              ))}
            </View>
          </Section>
        ) : null}

        {pg.amenities.length > 0 ? (
          <Section title="Amenities">
            <View style={styles.tagRow}>
              {pg.amenities.map(amenity => (
                <Chip key={amenity} label={amenity} />
              ))}
            </View>
          </Section>
        ) : null}

        {pg.foodDetails ? (
          <Section title="Food">
            <View style={styles.metaRow}>
              <UtensilsCrossed size={15} color={theme.colors.textMuted} />
              <Text variant="body" tone="secondary" style={styles.shrink}>
                {pg.foodDetails}
              </Text>
            </View>
          </Section>
        ) : null}
      </ScrollView>

      <View
        style={[
          styles.bar,
          gutter,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.border,
            paddingBottom: insets.bottom + theme.spacing.md,
            paddingTop: theme.spacing.md,
          },
        ]}
      >
        <Button
          label={isSaved ? 'Saved' : 'Save'}
          variant="secondary"
          onPress={() => toggleSaved(params.pgCode)}
        />
        <Button label="Book a visit" onPress={onBookVisit} style={styles.grow} />
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();

  return (
    <View
      style={{
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.xxl,
        gap: theme.spacing.md,
      }}
    >
      <Text variant="title3">{title}</Text>
      {children}
    </View>
  );
}

function Chip({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderRadius: theme.radii.pill,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  hero: { width: '100%' },
  thumb: { width: 92, height: 68 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexWrap: 'wrap' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { paddingVertical: 6 },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  bar: { flexDirection: 'row', gap: 10, borderTopWidth: StyleSheet.hairlineWidth * 2 },
  grow: { flex: 1 },
  shrink: { flexShrink: 1 },
});

import React, { useCallback } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { BadgeCheck, MapPin, Star, UtensilsCrossed } from 'lucide-react-native';
import { Text } from '@/components/common/Text';
import { Skeleton } from '@/components/common/Skeleton';
import { COOLING_LABEL, GENDER_LABEL, formatINR } from '@/lib/format';
import { canRenderShadows, tierDuration } from '@/lib/device-tier';
import { useTheme } from '@/theme';
import type { PgSummary } from '@/api/types';

interface PgCardProps {
  pg: PgSummary;
  /** Position in the list, used for the staggered entrance. */
  index: number;
  onPress: (pg: PgSummary) => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const MEDIA_HEIGHT = 168;

export function PgCard({ pg, index, onPress }: PgCardProps) {
  const theme = useTheme();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.02 }],
  }));

  const handlePress = useCallback(() => onPress(pg), [onPress, pg]);

  const onPressIn = useCallback(() => {
    pressed.value = withSpring(1, theme.motion.spring.responsive);
  }, [pressed, theme.motion.spring.responsive]);

  const onPressOut = useCallback(() => {
    pressed.value = withSpring(0, theme.motion.spring.responsive);
  }, [pressed, theme.motion.spring.responsive]);

  // Only the first screenful is worth staggering. Past that the delay is just
  // latency the user waits through while scrolling.
  const delay = index < 8 ? index * theme.motion.stagger : 0;

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(delay).duration(tierDuration(theme.motion.duration.base))}
      accessibilityRole="button"
      accessibilityLabel={pg.name + ', ' + pg.location}
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.card,
          marginBottom: theme.spacing.lg,
        },
        // Shadows are the cheapest thing to drop on a weak device, and the
        // least missed.
        canRenderShadows ? theme.shadows.card : null,
        animatedStyle,
      ]}
    >
      <View style={[styles.media, { backgroundColor: theme.colors.surfaceRaised }]}>
        {pg.coverImage ? (
          <Image
            source={{ uri: pg.coverImage }}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        ) : null}

        {pg.verified ? (
          <View
            style={[
              styles.verifiedPill,
              { backgroundColor: theme.colors.surface, borderRadius: theme.radii.pill },
            ]}
          >
            <BadgeCheck size={13} color={theme.colors.verified} />
            <Text variant="caption" tone="verified">
              Verified
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.xs }}>
        <View style={styles.headRow}>
          <Text variant="title3" numberOfLines={1} style={styles.shrink}>
            {pg.name}
          </Text>
          {pg.reviewCount > 0 ? (
            <View style={styles.rating}>
              <Star size={13} color={theme.colors.accent} fill={theme.colors.accent} />
              <Text variant="callout" tone="secondary">
                {pg.rating.toFixed(1)}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <MapPin size={13} color={theme.colors.textMuted} />
          <Text variant="callout" tone="muted" numberOfLines={1} style={styles.shrink}>
            {pg.location}
            {pg.city ? ', ' + pg.city : ''}
          </Text>
        </View>

        <View style={[styles.tagRow, { marginTop: theme.spacing.sm }]}>
          {pg.gender ? <Tag label={GENDER_LABEL[pg.gender]} /> : null}
          {pg.cooling ? <Tag label={COOLING_LABEL[pg.cooling]} /> : null}
          {pg.foodIncluded ? <Tag label="Food" showFoodIcon /> : null}
        </View>

        <View style={[styles.priceRow, { marginTop: theme.spacing.sm }]}>
          <Text variant="title2">{formatINR(pg.price)}</Text>
          <Text variant="callout" tone="muted">
            / month
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

function Tag({ label, showFoodIcon = false }: { label: string; showFoodIcon?: boolean }) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.tag,
        {
          backgroundColor: theme.colors.surfaceRaised,
          borderRadius: theme.radii.pill,
          paddingHorizontal: theme.spacing.md,
        },
      ]}
    >
      {showFoodIcon ? <UtensilsCrossed size={11} color={theme.colors.textSecondary} /> : null}
      <Text variant="caption" tone="secondary">
        {label}
      </Text>
    </View>
  );
}

/** Matches the card's real proportions, so the swap to content does not jump. */
export function PgCardSkeleton() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.card,
          marginBottom: theme.spacing.lg,
        },
      ]}
    >
      <Skeleton height={MEDIA_HEIGHT} radius={0} />
      <View style={{ padding: theme.spacing.lg, gap: theme.spacing.sm }}>
        <Skeleton height={18} width="65%" />
        <Skeleton height={14} width="45%" />
        <Skeleton height={24} width="35%" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: StyleSheet.hairlineWidth * 2, overflow: 'hidden' },
  media: { height: MEDIA_HEIGHT, alignItems: 'flex-end' },
  verifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    margin: 12,
  },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  rating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 5 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  shrink: { flexShrink: 1 },
});

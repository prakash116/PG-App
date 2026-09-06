import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Animated, {
  FadeInDown,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BedSingle } from 'lucide-react-native';
import { canRenderShadows, tierDuration } from '@/lib/device-tier';
import { useTheme } from '@/theme';
import type { RoomType } from '@/api/types';

const OPTIONS: { type: RoomType; label: string; beds: number }[] = [
  { type: 'SINGLE', label: 'Single', beds: 1 },
  { type: 'DOUBLE', label: 'Double', beds: 2 },
  { type: 'TRIPLE', label: 'Triple', beds: 3 },
];
const GAP = 10;
const TILE_HEIGHT = 76;

interface SharingPickerProps {
  value: RoomType | null;
  onChange: (next: RoomType | null) => void;
}

/**
 * One line, three tiles: how many people share the room. A real filter, not
 * decoration — the list narrows to PGs offering that sharing type, and a
 * second tap clears it.
 *
 * Selection is one saffron slab that springs between tiles rather than three
 * tiles each changing colour, so the eye follows a single object moving.
 * Beds are drawn as that many bed icons, which reads at a glance in a way
 * "1 / 2 / 3" does not.
 */
export function SharingPicker({ value, onChange }: SharingPickerProps) {
  const theme = useTheme();
  const [rowWidth, setRowWidth] = useState(0);
  const tileWidth = rowWidth > 0 ? (rowWidth - GAP * (OPTIONS.length - 1)) / OPTIONS.length : 0;
  const selectedIndex = value ? OPTIONS.findIndex(option => option.type === value) : -1;

  const slabX = useSharedValue(0);
  const slabOn = useSharedValue(0);

  useEffect(() => {
    const duration = tierDuration(theme.motion.duration.fast);
    if (selectedIndex >= 0) {
      slabX.value = withSpring(selectedIndex * (tileWidth + GAP), theme.motion.spring.responsive);
      slabOn.value = withTiming(1, { duration });
    } else {
      slabOn.value = withTiming(0, { duration });
    }
  }, [selectedIndex, slabOn, slabX, theme.motion, tileWidth]);

  const slabStyle = useAnimatedStyle(() => ({
    opacity: slabOn.value,
    transform: [{ translateX: slabX.value }, { scale: 0.94 + slabOn.value * 0.06 }],
  }));

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setRowWidth(event.nativeEvent.layout.width);
  }, []);

  const toggle = useCallback(
    (type: RoomType) => onChange(value === type ? null : type),
    [onChange, value],
  );

  return (
    <Animated.View
      entering={FadeInDown.delay(60).duration(tierDuration(theme.motion.duration.base))}
      onLayout={onLayout}
      style={[styles.row, { gap: GAP }]}
    >
      {tileWidth > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.slab,
            { width: tileWidth, backgroundColor: theme.colors.accent, borderRadius: theme.radii.lg },
            slabStyle,
          ]}
        />
      ) : null}

      {OPTIONS.map((option, index) => (
        <Tile
          key={option.type}
          label={option.label}
          beds={option.beds}
          active={selectedIndex === index}
          onPress={() => toggle(option.type)}
        />
      ))}
    </Animated.View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Tile({
  label,
  beds,
  active,
  onPress,
}: {
  label: string;
  beds: number;
  active: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const pressed = useSharedValue(0);
  const progress = useDerivedValue(() => withSpring(active ? 1 : 0, theme.motion.spring.responsive));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.04 }],
  }));
  // The tile's own surface fades out as the slab arrives underneath it.
  const surfaceStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [theme.colors.textPrimary, theme.colors.textOnAccent]),
  }));
  const captionStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [theme.colors.textMuted, theme.colors.textOnAccent]),
  }));
  const iconsOnStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const iconsOffStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label + ' sharing'}
      onPress={onPress}
      onPressIn={() => {
        pressed.value = withSpring(1, theme.motion.spring.responsive);
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, theme.motion.spring.responsive);
      }}
      style={[styles.tile, { borderRadius: theme.radii.lg }, pressStyle]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          styles.surface,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.lg },
          canRenderShadows ? theme.shadows.card : null,
          surfaceStyle,
        ]}
      />
      <View style={styles.beds}>
        <Animated.View style={[styles.bedsLayer, iconsOffStyle]}>
          {Array.from({ length: beds }, (_, i) => (
            <BedSingle key={i} size={18} color={theme.colors.accent} style={i > 0 ? styles.bedOverlap : null} />
          ))}
        </Animated.View>
        <Animated.View style={[styles.bedsLayer, styles.bedsOn, iconsOnStyle]}>
          {Array.from({ length: beds }, (_, i) => (
            <BedSingle key={i} size={18} color={theme.colors.textOnAccent} style={i > 0 ? styles.bedOverlap : null} />
          ))}
        </Animated.View>
      </View>
      <Animated.Text style={[theme.typography.bodyStrong, labelStyle]}>{label}</Animated.Text>
      <Animated.Text style={[theme.typography.caption, captionStyle]}>sharing</Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'stretch' },
  slab: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  tile: { flex: 1, height: TILE_HEIGHT, alignItems: 'center', justifyContent: 'center', gap: 2 },
  surface: { borderWidth: StyleSheet.hairlineWidth * 2 },
  beds: { height: 20, justifyContent: 'center', marginBottom: 2 },
  bedsLayer: { flexDirection: 'row', alignItems: 'center' },
  bedsOn: { position: 'absolute', left: 0, right: 0, justifyContent: 'center' },
  bedOverlap: { marginLeft: -5 },
});

import React, { useCallback } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ChevronDown, Search } from 'lucide-react-native';
import { Text } from './Text';
import { HIT_TARGET, useTheme } from '@/theme';
import logo from '../../assets/logo.png';

interface HeaderProps {
  /** The city in the middle. Null reads as "everywhere". */
  city: string | null;
  onSearchPress: () => void;
  onLocationPress: () => void;
  /** Marks the search control as active while the search field is open. */
  isSearchOpen?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * The app's one header: search on the left, location in the middle, the brand
 * mark on the right.
 *
 * Every screen uses this and nothing else at the top. Per-screen titles were
 * removed deliberately — repeating "Discover PGs" under a tab already labelled
 * Discover spends the most valuable strip of the screen saying nothing, and
 * makes each screen look subtly different from the last.
 */
export function Header({ city, onSearchPress, onLocationPress, isSearchOpen = false }: HeaderProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.root,
        {
          paddingHorizontal: theme.spacing.lg,
          paddingVertical: theme.spacing.sm,
          backgroundColor: theme.colors.ground,
        },
      ]}
    >
      <IconButton
        onPress={onSearchPress}
        accessibilityLabel={isSearchOpen ? 'Close search' : 'Search PGs'}
        active={isSearchOpen}
      />

      <LocationButton city={city} onPress={onLocationPress} />

      <Image
        source={logo}
        style={styles.logo}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="Pzee"
      />
    </View>
  );
}

function IconButton({
  onPress,
  accessibilityLabel,
  active,
}: {
  onPress: () => void;
  accessibilityLabel: string;
  active: boolean;
}) {
  const theme = useTheme();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.06 }],
  }));

  const onPressIn = useCallback(() => {
    pressed.value = withSpring(1, theme.motion.spring.responsive);
  }, [pressed, theme.motion.spring.responsive]);

  const onPressOut = useCallback(() => {
    pressed.value = withSpring(0, theme.motion.spring.responsive);
  }, [pressed, theme.motion.spring.responsive]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.iconButton,
        {
          backgroundColor: active ? theme.colors.accentSubtle : theme.colors.surface,
          borderColor: active ? theme.colors.accent : theme.colors.border,
          borderRadius: theme.radii.pill,
        },
        animatedStyle,
      ]}
    >
      <Search size={19} color={active ? theme.colors.accent : theme.colors.textPrimary} />
    </AnimatedPressable>
  );
}

function LocationButton({ city, onPress }: { city: string | null; onPress: () => void }) {
  const theme = useTheme();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: 1 - pressed.value * 0.35 }));

  const onPressIn = useCallback(() => {
    pressed.value = withSpring(1, theme.motion.spring.responsive);
  }, [pressed, theme.motion.spring.responsive]);

  const onPressOut = useCallback(() => {
    pressed.value = withSpring(0, theme.motion.spring.responsive);
  }, [pressed, theme.motion.spring.responsive]);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={'Change city, currently ' + (city ?? 'all cities')}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[styles.location, animatedStyle]}
    >
      <Text variant="overline" tone="muted">
        Location
      </Text>
      <View style={styles.locationRow}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {city ?? 'All cities'}
        </Text>
        <ChevronDown size={15} color={theme.colors.textSecondary} />
      </View>
    </AnimatedPressable>
  );
}

const LOGO_SIZE = 38;

const styles = StyleSheet.create({
  root: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  iconButton: {
    width: HIT_TARGET,
    height: HIT_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  // Centred by flex rather than by absolute position, so a long city name
  // pushes into its own space instead of sliding under the logo.
  location: { flex: 1, alignItems: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3, maxWidth: '100%' },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },
});

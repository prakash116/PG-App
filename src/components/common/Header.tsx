import React, { useCallback, useEffect } from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, ChevronDown, Heart, MapPin, Search } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { Text } from './Text';
import { useLocation } from '@/store/location';
import { canRenderShadows, tierDuration } from '@/lib/device-tier';
import { useTheme } from '@/theme';
import logo from '../../assets/logo.png';

interface HeaderProps {
  onSearchPress: () => void;
  onWishlistPress: () => void;
  onNotificationsPress: () => void;
  /** Marks the search control as active while the search field is open. */
  isSearchOpen?: boolean;
}

/** The row itself, excluding the status bar inset. */
export const HEADER_ROW_HEIGHT = 56;
const CONTROL_SIZE = 40;
const LOGO_SIZE = 40;
const ROW_PADDING = (HEADER_ROW_HEIGHT - CONTROL_SIZE) / 2;

/**
 * The height content has to clear so it starts below the header, not under it.
 * The header is transparent and floats over whatever the screen puts behind it
 * — a banner, a map, a plain ground — so nothing pushes content down for it.
 */
export function useHeaderHeight(): number {
  const insets = useSafeAreaInsets();
  return insets.top + HEADER_ROW_HEIGHT;
}

/**
 * The app's one header: the brand mark and location on the left; wishlist,
 * notifications and search on the right, search last so the most-used control
 * sits under the thumb.
 *
 * It paints no background of its own. Every control sits on its own frosted
 * pill so it reads over a photo or over the plain ground alike, which is what
 * lets a banner run edge-to-edge underneath without the header needing to
 * know about it.
 */
export function Header({
  onSearchPress,
  onWishlistPress,
  onNotificationsPress,
  isSearchOpen = false,
}: HeaderProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeInDown.duration(tierDuration(theme.motion.duration.slow))}
      pointerEvents="box-none"
      style={[
        styles.root,
        {
          paddingTop: insets.top + ROW_PADDING,
          paddingBottom: ROW_PADDING,
          paddingHorizontal: theme.spacing.lg,
          gap: theme.spacing.sm,
        },
      ]}
    >
      <View style={[styles.lead, { gap: theme.spacing.sm }]}>
        <Image
          source={logo}
          style={[styles.logo, { borderRadius: theme.radii.md }]}
          // The asset is cropped square with equal margins (the original had
          // twice the padding below the mark as above, which sat it visibly
          // high next to the pill), so contain and cover now agree.
          resizeMode="contain"
          accessibilityRole="image"
          accessibilityLabel="Pzee"
        />
        <LocationPill />
      </View>

      <View style={[styles.cluster, { gap: theme.spacing.sm }]}>
        <GlassButton icon={Heart} label="Saved PGs" onPress={onWishlistPress} />
        <GlassButton icon={Bell} label="Notifications" onPress={onNotificationsPress} />
        <GlassButton icon={Search} label="Search PGs" onPress={onSearchPress} active={isSearchOpen} />
      </View>
    </Animated.View>
  );
}

/** Press feedback shared by every control: a small UI-thread scale. */
function usePressScale() {
  const theme = useTheme();
  const pressed = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.07 }],
  }));

  const onPressIn = useCallback(() => {
    pressed.value = withSpring(1, theme.motion.spring.responsive);
  }, [pressed, theme.motion.spring.responsive]);

  const onPressOut = useCallback(() => {
    pressed.value = withSpring(0, theme.motion.spring.responsive);
  }, [pressed, theme.motion.spring.responsive]);

  return { style, onPressIn, onPressOut };
}

function useGlass() {
  const theme = useTheme();
  return [
    {
      backgroundColor: theme.isDark ? 'rgba(30, 24, 21, 0.82)' : 'rgba(255, 255, 255, 0.88)',
      borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.10)' : 'rgba(28, 23, 20, 0.08)',
      borderWidth: StyleSheet.hairlineWidth * 2,
    },
    canRenderShadows ? theme.shadows.card : null,
  ];
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function GlassButton({
  icon: Icon,
  label,
  onPress,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  const theme = useTheme();
  const glass = useGlass();
  const press = usePressScale();

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      hitSlop={4}
      style={[
        styles.control,
        glass,
        active ? { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent } : null,
        { borderRadius: theme.radii.pill },
        press.style,
      ]}
    >
      <Icon size={18} color={active ? theme.colors.textOnAccent : theme.colors.textPrimary} />
    </AnimatedPressable>
  );
}

function LocationPill() {
  const theme = useTheme();
  const glass = useGlass();
  const press = usePressScale();
  const city = useLocation(state => state.city);
  const isOpen = useLocation(state => state.isPickerOpen);
  const openPicker = useLocation(state => state.openPicker);
  const rotation = useSharedValue(0);

  // The chevron turns to point at the sheet while it is open, so the pill and
  // the sheet read as one control rather than two things that happen together.
  useEffect(() => {
    rotation.value = withTiming(isOpen ? 180 : 0, {
      duration: tierDuration(theme.motion.duration.fast),
    });
  }, [isOpen, rotation, theme.motion.duration.fast]);

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: rotation.value + 'deg' }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={'Change city, currently ' + (city ?? 'all cities')}
      accessibilityState={{ expanded: isOpen }}
      onPress={openPicker}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      style={[
        styles.pill,
        glass,
        { borderRadius: theme.radii.pill, paddingLeft: 5, paddingRight: theme.spacing.md },
        press.style,
      ]}
    >
      <View
        style={[
          styles.iconWell,
          { backgroundColor: theme.colors.accent, borderRadius: theme.radii.pill },
        ]}
      >
        <MapPin size={14} color={theme.colors.textOnAccent} />
      </View>
      <View style={styles.pillText}>
        <Text variant="overline" tone="muted" style={styles.pillEyebrow}>
          Location
        </Text>
        <Text variant="bodyStrong" numberOfLines={1} style={styles.pillCity}>
          {city ?? 'All cities'}
        </Text>
      </View>
      <Animated.View style={chevronStyle}>
        <ChevronDown size={15} color={theme.colors.textSecondary} />
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 8, height: CONTROL_SIZE, flexShrink: 1 },
  iconWell: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  pillText: { flexShrink: 1 },
  pillEyebrow: { fontSize: 9, lineHeight: 11 },
  pillCity: { fontSize: 14, lineHeight: 17 },
  // The lead shrinks before the action cluster does, so a long city name
  // truncates inside its pill rather than pushing the buttons off-screen.
  lead: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  cluster: { flexDirection: 'row', alignItems: 'center', flexShrink: 0 },
  control: { width: CONTROL_SIZE, height: CONTROL_SIZE, alignItems: 'center', justifyContent: 'center' },
  logo: { width: LOGO_SIZE, height: LOGO_SIZE },
});

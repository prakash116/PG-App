import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { canRenderShadows } from '@/lib/device-tier';
import { useTheme } from '@/theme';

const BAR_HEIGHT = 64;
const PILL_HEIGHT = 44;
/** Horizontal breathing room between the pill and its tab's edges. */
const PILL_INSET = 8;
const ICON_SIZE = 22;
const LABEL_MAX = 96;

/**
 * The tab bar: a floating dock where the chosen tab widens into a saffron
 * pill holding its icon and label side by side, and the others sit as bare
 * icons. Everything on one centre line, so nothing has to rise or drop.
 *
 * The pill is one object that springs between tabs while the tabs themselves
 * re-flow to make room — the same "one thing moving" language as the sharing
 * picker, so the two read as the same app.
 */
export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const theme = useTheme();
  const [rowWidth, setRowWidth] = useState(0);
  const count = state.routes.length;

  // The chosen tab takes a fixed, generous share; the rest split the remainder.
  const activeWidth = rowWidth > 0 ? Math.min(Math.max(rowWidth * 0.4, 118), 168) : 0;
  const inactiveWidth = rowWidth > 0 ? (rowWidth - activeWidth) / (count - 1) : 0;

  const pillX = useSharedValue(0);
  const pillPop = useSharedValue(1);

  useEffect(() => {
    if (rowWidth === 0) {
      return;
    }
    pillX.value = withSpring(state.index * inactiveWidth + PILL_INSET, theme.motion.spring.responsive);
    pillPop.value = withSequence(
      withSpring(1.06, { damping: 9, stiffness: 320 }),
      withSpring(1, theme.motion.spring.responsive),
    );
  }, [inactiveWidth, pillPop, pillX, rowWidth, state.index, theme.motion.spring.responsive]);

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }, { scale: pillPop.value }],
  }));

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setRowWidth(event.nativeEvent.layout.width);
  }, []);

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.colors.ground,
          paddingBottom: insets.bottom + theme.spacing.sm,
          paddingHorizontal: theme.spacing.lg,
        },
      ]}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.pill,
          },
          canRenderShadows ? theme.shadows.card : null,
        ]}
      >
        {/* Measured separately from the bar so the border is not counted. */}
        <View onLayout={onLayout} style={styles.row}>
          {rowWidth > 0 ? (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.pill,
                { width: activeWidth - PILL_INSET * 2, backgroundColor: theme.colors.accent },
                canRenderShadows ? { ...styles.glow, shadowColor: theme.colors.accent } : null,
                pillStyle,
              ]}
            />
          ) : null}

          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : (options.title ?? route.name);
            const focused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };
            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <Tab
                key={route.key}
                label={label}
                focused={focused}
                activeWidth={activeWidth}
                inactiveWidth={inactiveWidth}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
                renderIcon={color =>
                  options.tabBarIcon ? options.tabBarIcon({ focused, color, size: ICON_SIZE }) : null
                }
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Tab({
  label,
  focused,
  activeWidth,
  inactiveWidth,
  accessibilityLabel,
  renderIcon,
  onPress,
  onLongPress,
}: {
  label: string;
  focused: boolean;
  activeWidth: number;
  inactiveWidth: number;
  accessibilityLabel: string;
  renderIcon: (color: string) => React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const theme = useTheme();
  const measured = inactiveWidth > 0;
  const pressed = useSharedValue(0);
  const progress = useDerivedValue(() => withSpring(focused ? 1 : 0, theme.motion.spring.responsive));

  // The tab widens as it is chosen, so the pill has somewhere to be.
  const tabStyle = useAnimatedStyle(() => ({
    ...(measured ? { width: interpolate(progress.value, [0, 1], [inactiveWidth, activeWidth]) } : {}),
    transform: [{ scale: 1 - pressed.value * 0.06 }],
  }));
  const onStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const offStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  // The label unfolds beside the icon rather than appearing under it, which
  // keeps every tab on one centre line.
  const labelStyle = useAnimatedStyle(() => ({
    maxWidth: progress.value * LABEL_MAX,
    marginLeft: progress.value * 8,
    opacity: progress.value,
  }));

  return (
    <AnimatedPressable
      accessibilityRole="tab"
      accessibilityState={{ selected: focused }}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={() => {
        pressed.value = withSpring(1, theme.motion.spring.responsive);
      }}
      onPressOut={() => {
        pressed.value = withSpring(0, theme.motion.spring.responsive);
      }}
      style={[styles.tab, measured ? null : styles.flex, tabStyle]}
    >
      <View style={styles.content}>
        <View style={styles.icon}>
          <Animated.View style={offStyle}>{renderIcon(theme.colors.textMuted)}</Animated.View>
          <Animated.View style={[StyleSheet.absoluteFill, styles.center, onStyle]}>
            {renderIcon(theme.colors.textOnAccent)}
          </Animated.View>
        </View>
        <Animated.View style={[styles.labelWrap, labelStyle]}>
          <Animated.Text
            numberOfLines={1}
            style={[theme.typography.caption, styles.label, { color: theme.colors.textOnAccent }]}
          >
            {label}
          </Animated.Text>
        </Animated.View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8 },
  bar: { height: BAR_HEIGHT, borderWidth: StyleSheet.hairlineWidth * 2, justifyContent: 'center' },
  row: { flex: 1, flexDirection: 'row', alignItems: 'stretch' },
  pill: {
    position: 'absolute',
    left: 0,
    top: (BAR_HEIGHT - PILL_HEIGHT) / 2 - 1,
    height: PILL_HEIGHT,
    borderRadius: PILL_HEIGHT / 2,
  },
  glow: { shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  tab: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  content: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  icon: { width: ICON_SIZE + 4, height: ICON_SIZE + 4, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  labelWrap: { overflow: 'hidden' },
  label: { fontWeight: '700', fontSize: 12, lineHeight: 16 },
});

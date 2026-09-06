import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { canRenderShadows } from '@/lib/device-tier';
import { useTheme } from '@/theme';

const BAR_HEIGHT = 64;
const BUBBLE = 44;
const ICON_SIZE = 22;

/**
 * The tab bar: a floating dock with one saffron bubble that springs to the
 * chosen tab. The chosen icon rises onto the bubble and its label fades in
 * beneath; the others stay icon-only. One object moving, same as the
 * sharing picker, so the two read as the same app.
 *
 * Replaces the stock bar rather than restyling it: the stock one cannot
 * animate an indicator between tabs, and four labels at once is the least
 * of what was wrong with it.
 */
export function TabBar({ state, descriptors, navigation, insets }: BottomTabBarProps) {
  const theme = useTheme();
  const [barWidth, setBarWidth] = useState(0);
  const count = state.routes.length;
  const tabWidth = barWidth > 0 ? barWidth / count : 0;

  const bubbleX = useSharedValue(0);
  const bubblePop = useSharedValue(1);

  useEffect(() => {
    if (tabWidth === 0) {
      return;
    }
    bubbleX.value = withSpring(state.index * tabWidth + (tabWidth - BUBBLE) / 2, theme.motion.spring.responsive);
    bubblePop.value = withSequence(
      withSpring(1.12, { damping: 9, stiffness: 320 }),
      withSpring(1, theme.motion.spring.responsive),
    );
  }, [bubblePop, bubbleX, state.index, tabWidth, theme.motion.spring.responsive]);

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: bubbleX.value }, { scale: bubblePop.value }],
  }));

  const onLayout = useCallback((event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
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
        onLayout={onLayout}
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
        {tabWidth > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[styles.bubble, { backgroundColor: theme.colors.accent }, bubbleStyle]}
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
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function Tab({
  label,
  focused,
  accessibilityLabel,
  renderIcon,
  onPress,
  onLongPress,
}: {
  label: string;
  focused: boolean;
  accessibilityLabel: string;
  renderIcon: (color: string) => React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
}) {
  const theme = useTheme();
  const pressed = useSharedValue(0);
  const progress = useDerivedValue(() => withSpring(focused ? 1 : 0, theme.motion.spring.responsive));

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.06 }],
  }));
  // The icon rises onto the bubble, and the label comes up to meet it.
  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -progress.value * 9 }],
  }));
  const onStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const offStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }));
  const labelStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: (1 - progress.value) * 6 }],
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
      style={[styles.tab, pressStyle]}
    >
      <Animated.View style={[styles.icon, iconStyle]}>
        <Animated.View style={offStyle}>{renderIcon(theme.colors.textMuted)}</Animated.View>
        <Animated.View style={[StyleSheet.absoluteFill, styles.center, onStyle]}>
          {renderIcon(theme.colors.textOnAccent)}
        </Animated.View>
      </Animated.View>
      <Animated.Text
        numberOfLines={1}
        style={[theme.typography.caption, styles.label, { color: theme.colors.accent }, labelStyle]}
      >
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8 },
  bar: {
    height: BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth * 2,
  },
  bubble: {
    position: 'absolute',
    left: 0,
    top: (BAR_HEIGHT - BUBBLE) / 2 - 8,
    width: BUBBLE,
    height: BUBBLE,
    borderRadius: BUBBLE / 2,
  },
  tab: { flex: 1, height: BAR_HEIGHT, alignItems: 'center', justifyContent: 'center' },
  icon: { width: BUBBLE, height: BUBBLE, alignItems: 'center', justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  label: { position: 'absolute', bottom: 7, fontWeight: '700' },
});

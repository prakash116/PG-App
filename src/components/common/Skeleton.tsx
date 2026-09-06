import React, { useEffect } from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { canRenderShadows } from '@/lib/device-tier';
import { useTheme } from '@/theme';

interface SkeletonProps {
  width?: ViewStyle['width'];
  height: number;
  radius?: number;
  style?: ViewStyle;
}

/**
 * Skeletons, never spinners: a shape that matches the content tells someone
 * what is coming, and makes the swap when it arrives feel like a fill rather
 * than a repaint.
 *
 * The pulse is skipped entirely on the weakest tier, where a permanently
 * animating view on a list of ten placeholders is a real frame cost.
 */
export function Skeleton({ width = '100%', height, radius, style }: SkeletonProps) {
  const theme = useTheme();
  const pulse = useSharedValue(0.6);

  useEffect(() => {
    if (!canRenderShadows) {
      return;
    }
    pulse.value = withRepeat(
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: pulse.value }));

  const base: ViewStyle = {
    width,
    height,
    borderRadius: radius ?? theme.radii.md,
    backgroundColor: theme.colors.skeleton,
  };

  return canRenderShadows ? (
    <Animated.View style={[base, animatedStyle, style]} />
  ) : (
    <View style={[base, style]} />
  );
}

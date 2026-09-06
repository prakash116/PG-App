import React, { useCallback } from 'react';
import { Pressable, StyleSheet, ActivityIndicator, View, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Text } from './Text';
import { HIT_TARGET, useTheme } from '@/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const HEIGHT: Record<Size, number> = { sm: 36, md: HIT_TARGET, lg: 54 };

/**
 * The press scale runs entirely on the UI thread through a shared value, so it
 * stays honest while JS is busy parsing a listing response. A `setState`-driven
 * version of this same effect is the first thing to stutter under load.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
}: ButtonProps) {
  const theme = useTheme();
  const pressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.03 }],
    opacity: 1 - pressed.value * 0.12,
  }));

  const onPressIn = useCallback(() => {
    pressed.value = withSpring(1, theme.motion.spring.responsive);
  }, [pressed, theme.motion.spring.responsive]);

  const onPressOut = useCallback(() => {
    pressed.value = withSpring(0, theme.motion.spring.responsive);
  }, [pressed, theme.motion.spring.responsive]);

  const surface: Record<Variant, ViewStyle> = {
    primary: { backgroundColor: theme.colors.accent },
    secondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: theme.colors.borderStrong,
    },
    ghost: { backgroundColor: 'transparent' },
    danger: { backgroundColor: theme.colors.danger },
  };

  const tone = {
    primary: 'onAccent',
    secondary: 'primary',
    ghost: 'accent',
    danger: 'onAccent',
  } as const;

  const isInert = disabled || loading;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInert, busy: loading }}
      disabled={isInert}
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        styles.base,
        surface[variant],
        {
          height: HEIGHT[size],
          borderRadius: theme.radii.pill,
          paddingHorizontal: size === 'sm' ? theme.spacing.lg : theme.spacing.xxl,
          opacity: isInert ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'danger' ? theme.colors.textOnAccent : theme.colors.accent}
        />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text variant={size === 'lg' ? 'title3' : 'bodyStrong'} tone={tone[variant]}>
            {label}
          </Text>
        </View>
      )}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

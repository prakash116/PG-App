import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';
import { useTheme } from '@/theme';
import { typography } from '@/theme/typography';

type Variant = keyof typeof typography;
type Tone = 'primary' | 'secondary' | 'muted' | 'accent' | 'verified' | 'danger' | 'onAccent';

export interface TextProps extends RNTextProps {
  variant?: Variant;
  tone?: Tone;
}

/**
 * Every string in the app goes through here.
 *
 * The point is that colour is not a free-form prop: a caller picks a tone,
 * which keeps saffron meaning "actionable" and jade meaning "verified" rather
 * than drifting into decoration one screen at a time.
 */
export function Text({ variant = 'body', tone = 'primary', style, ...rest }: TextProps) {
  const theme = useTheme();

  const colors: Record<Tone, string> = {
    primary: theme.colors.textPrimary,
    secondary: theme.colors.textSecondary,
    muted: theme.colors.textMuted,
    accent: theme.colors.accent,
    verified: theme.colors.verified,
    danger: theme.colors.danger,
    onAccent: theme.colors.textOnAccent,
  };

  const base: TextStyle = { ...theme.typography[variant], color: colors[tone] };

  return <RNText {...rest} style={[base, style]} />;
}

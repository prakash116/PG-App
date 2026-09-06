import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/theme';

interface PlaceholderProps {
  title: string;
  note: string;
  description: string;
}

/**
 * An honest "designed, not built yet" panel.
 *
 * Mirrors PreviewSection on the website: a screen that is not finished says
 * so, rather than showing invented figures that get mistaken for working
 * software in a demo and have to be explained away afterwards.
 */
export function Placeholder({ title, note, description }: PlaceholderProps) {
  const theme = useTheme();

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.border,
            borderRadius: theme.radii.card,
            padding: theme.spacing.xxl,
            gap: theme.spacing.sm,
          },
        ]}
      >
        <Text variant="overline" tone="muted">
          {note}
        </Text>
        <Text variant="title2">{title}</Text>
        <Text variant="body" tone="secondary">
          {description}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: { borderWidth: StyleSheet.hairlineWidth * 2, width: '100%' },
});

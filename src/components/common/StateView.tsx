import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { Button } from './Button';
import { useTheme } from '@/theme';

interface StateViewProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: 'neutral' | 'error';
}

/**
 * One component for empty, error and offline. They differ only in wording, and
 * three near-identical components is how those three states drift apart until
 * one of them looks broken.
 */
export function StateView({
  title,
  description,
  actionLabel,
  onAction,
  tone = 'neutral',
}: StateViewProps) {
  const theme = useTheme();

  return (
    <View style={[styles.root, { padding: theme.spacing.xxxl, gap: theme.spacing.sm }]}>
      <Text variant="title3" tone={tone === 'error' ? 'danger' : 'primary'} style={styles.centered}>
        {title}
      </Text>
      {description ? (
        <Text variant="body" tone="secondary" style={styles.centered}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          variant="secondary"
          onPress={onAction}
          style={{ marginTop: theme.spacing.md }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  centered: { textAlign: 'center' },
});

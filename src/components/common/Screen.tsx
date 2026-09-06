import React from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';

interface ScreenProps {
  children: React.ReactNode;
  /** Off for screens with a full-bleed image under the status bar. */
  topInset?: boolean;
  style?: ViewStyle;
}

export function Screen({ children, topInset = true, style }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.ground, paddingTop: topInset ? insets.top : 0 },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({ root: { flex: 1 } });

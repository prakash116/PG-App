import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Check, MapPin } from 'lucide-react-native';
import { BottomSheet } from './BottomSheet';
import { Text } from './Text';
import { useLocation } from '@/store/location';
import { fixturePgs } from '@/lib/fixtures';
import { tierDuration } from '@/lib/device-tier';
import { useTheme } from '@/theme';

/**
 * The city picker, mounted once at the app root and opened from any header.
 *
 * Cities are derived from the catalogue rather than hardcoded, so the list can
 * never offer a city with no PGs in it. Today that is the sample data; when
 * the facets endpoint lands, only the source of this array changes.
 */
export function CitySheet() {
  const theme = useTheme();
  const city = useLocation(state => state.city);
  const isOpen = useLocation(state => state.isPickerOpen);
  const setCity = useLocation(state => state.setCity);
  const closePicker = useLocation(state => state.closePicker);

  const cities = useMemo(
    () =>
      [...new Set(fixturePgs.map(pg => pg.city).filter((c): c is string => Boolean(c)))].sort(),
    [],
  );

  const choose = useCallback(
    (next: string | null) => {
      setCity(next);
      closePicker();
    },
    [closePicker, setCity],
  );

  return (
    <BottomSheet open={isOpen} onClose={closePicker}>
      <View style={{ paddingHorizontal: theme.spacing.xxl, paddingTop: theme.spacing.md, gap: 2 }}>
        <Text variant="title2">Where are you looking?</Text>
        <Text variant="callout" tone="muted">
          Discovery shows PGs from the city you pick.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md }}
        showsVerticalScrollIndicator={false}
      >
        <CityRow index={0} label="All cities" selected={city === null} onPress={() => choose(null)} />
        {cities.map((name, index) => (
          <CityRow
            key={name}
            index={index + 1}
            label={name}
            selected={city === name}
            onPress={() => choose(name)}
          />
        ))}
      </ScrollView>
    </BottomSheet>
  );
}

function CityRow({
  index,
  label,
  selected,
  onPress,
}: {
  index: number;
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * theme.motion.stagger).duration(
        tierDuration(theme.motion.duration.base),
      )}
    >
      <Pressable
        accessibilityRole="radio"
        accessibilityState={{ selected }}
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: selected ? theme.colors.accentSubtle : 'transparent',
            borderRadius: theme.radii.lg,
            paddingVertical: theme.spacing.md,
            paddingHorizontal: theme.spacing.md,
            opacity: pressed ? 0.6 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.iconWell,
            {
              backgroundColor: selected ? theme.colors.accent : theme.colors.surfaceRaised,
              borderRadius: theme.radii.pill,
            },
          ]}
        >
          <MapPin size={15} color={selected ? theme.colors.textOnAccent : theme.colors.textSecondary} />
        </View>
        <Text variant={selected ? 'bodyStrong' : 'body'} style={styles.label}>
          {label}
        </Text>
        {selected ? <Check size={18} color={theme.colors.accent} /> : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWell: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1 },
});

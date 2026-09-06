import React, { useCallback, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check } from 'lucide-react-native';
import { Text } from '@/components/common/Text';
import { Screen } from '@/components/common/Screen';
import { useLocation } from '@/store/location';
import { fixturePgs } from '@/lib/fixtures';
import { useTheme } from '@/theme';

/**
 * Cities are derived from the catalogue rather than hardcoded, so the list can
 * never offer a city with no PGs in it. Today that means the sample data; when
 * the facets endpoint lands, only the source of this array changes.
 */
export function CityPickerScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const city = useLocation(state => state.city);
  const setCity = useLocation(state => state.setCity);

  const cities = useMemo(
    () =>
      [...new Set(fixturePgs.map(pg => pg.city).filter((c): c is string => Boolean(c)))].sort(),
    [],
  );

  const choose = useCallback(
    (next: string | null) => {
      setCity(next);
      navigation.goBack();
    },
    [navigation, setCity],
  );

  return (
    <Screen>
      <View style={{ padding: theme.spacing.xl, gap: theme.spacing.xs }}>
        <Text variant="title2">Choose a city</Text>
        <Text variant="callout" tone="muted">
          Discovery will show PGs from here.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: theme.spacing.xl }}>
        <CityRow label="All cities" selected={city === null} onPress={() => choose(null)} />
        {cities.map(name => (
          <CityRow
            key={name}
            label={name}
            selected={city === name}
            onPress={() => choose(name)}
          />
        ))}
      </ScrollView>
    </Screen>
  );
}

function CityRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: theme.colors.border,
          paddingVertical: theme.spacing.lg,
          opacity: pressed ? 0.6 : 1,
        },
      ]}
    >
      <Text variant="body" tone={selected ? 'accent' : 'primary'}>
        {label}
      </Text>
      {selected ? <Check size={18} color={theme.colors.accent} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});

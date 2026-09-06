import React, { useCallback, useMemo } from 'react';
import { FlashList } from '@shopify/flash-list';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '@/components/common/Screen';
import { Header } from '@/components/common/Header';
import { StateView } from '@/components/common/StateView';
import { PgCard } from '@/components/pg/PgCard';
import { useSaved } from '@/store/saved';
import { fixturePgs } from '@/lib/fixtures';
import { useLocation } from '@/store/location';
import { useTheme } from '@/theme';
import type { PgSummary } from '@/api/types';
import type { RootStackParamList } from '@/app/navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SavedScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const codes = useSaved(state => state.codes);

  // Resolved against the sample catalogue for now. With the real endpoint this
  // becomes one batched lookup by code, and the screen does not change.
  const saved = useMemo(
    () => codes.map(code => fixturePgs.find(pg => pg.pgCode === code)).filter(Boolean) as PgSummary[],
    [codes],
  );

  const city = useLocation(state => state.city);

  const onLocationPress = useCallback(() => navigation.navigate('CityPicker'), [navigation]);
  // Search belongs to discovery, so the control takes you there rather than
  // duplicating a filter on a screen that cannot use it.
  const onSearchPress = useCallback(
    () => navigation.navigate('GuestTabs', { screen: 'Discover' }),
    [navigation],
  );

  const openPg = useCallback(
    (pg: PgSummary) => navigation.navigate('PgDetail', { pgCode: pg.pgCode, name: pg.name }),
    [navigation],
  );

  return (
    <Screen>
      <Header
        city={city}
        onSearchPress={onSearchPress}
        onLocationPress={onLocationPress}
      />

      {saved.length === 0 ? (
        <StateView
          title="Nothing saved yet"
          description="Tap Save on a PG and it will be waiting here, on this device."
        />
      ) : (
        <FlashList
          data={saved}
          renderItem={({ item, index }) => <PgCard pg={item} index={index} onPress={openPg} />}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: theme.spacing.xl }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </Screen>
  );
}

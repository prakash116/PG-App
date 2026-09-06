import React from 'react';
import { View } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Screen } from '@/components/common/Screen';
import { Placeholder } from '@/components/common/Placeholder';
import { Text } from '@/components/common/Text';
import { useTheme } from '@/theme';
import type { RootStackParamList } from '@/app/navigation/types';

export function PgDetailScreen() {
  const theme = useTheme();
  const { params } = useRoute<RouteProp<RootStackParamList, 'PgDetail'>>();

  return (
    <Screen>
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md }}>
        <Text variant="overline" tone="muted">
          {params.pgCode}
        </Text>
        <Text variant="title1">{params.name ?? 'PG'}</Text>
      </View>
      <Placeholder
        title="Property detail"
        milestone="Milestone 2 · Discover"
        description="Gallery, room types with their four photo slots, amenities, food, and the sticky Book a visit action. GET /v1/pg/public/:pgCode already exists — this screen is next."
      />
    </Screen>
  );
}

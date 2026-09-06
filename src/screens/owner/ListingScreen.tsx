import React from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/common/Screen';
import { Text } from '@/components/common/Text';
import { Placeholder } from '@/components/common/Placeholder';
import { useTheme } from '@/theme';

export function ListingScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md }}>
        <Text variant="overline" tone="muted">
          Your PG
        </Text>
        <Text variant="title1">Listing</Text>
      </View>
      <Placeholder
        title="Listing"
        note="Owner tools"
        description="Your property details, amenities, photos and room types. The API already serves all of this at /v1/pg/me — the screen is next."
      />
    </Screen>
  );
}

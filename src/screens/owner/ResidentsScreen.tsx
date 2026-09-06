import React from 'react';
import { View } from 'react-native';
import { Screen } from '@/components/common/Screen';
import { Text } from '@/components/common/Text';
import { Placeholder } from '@/components/common/Placeholder';
import { useTheme } from '@/theme';

export function ResidentsScreen() {
  const theme = useTheme();

  return (
    <Screen>
      <View style={{ paddingHorizontal: theme.spacing.xl, paddingTop: theme.spacing.md }}>
        <Text variant="overline" tone="muted">
          Your PG
        </Text>
        <Text variant="title1">Residents</Text>
      </View>
      <Placeholder
        title="Residents"
        note="Owner tools"
        description="Who is staying, which room, what they pay and when rent is due. Backed by the CRM endpoints the API already has."
      />
    </Screen>
  );
}

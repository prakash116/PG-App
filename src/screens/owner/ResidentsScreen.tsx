import React from 'react';
import { Screen } from '@/components/common/Screen';
import { Placeholder } from '@/components/common/Placeholder';

export function ResidentsScreen() {
  return (
    <Screen>
      <Placeholder
        title="Residents"
        milestone="Milestone 4 · Owner"
        description="Who is staying, which room, what they pay and when rent is due. Add a resident, record a payment, check them out."
      />
    </Screen>
  );
}

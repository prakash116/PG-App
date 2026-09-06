import React from 'react';
import { Screen } from '@/components/common/Screen';
import { Placeholder } from '@/components/common/Placeholder';

export function DashboardScreen() {
  return (
    <Screen>
      <Placeholder
        title="Dashboard"
        milestone="Milestone 4 · Owner"
        description="Occupancy, rent collected this month and pending visit requests, from the CRM endpoints the backend already serves."
      />
    </Screen>
  );
}

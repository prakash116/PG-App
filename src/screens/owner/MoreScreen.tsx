import React from 'react';
import { Screen } from '@/components/common/Screen';
import { Placeholder } from '@/components/common/Placeholder';

export function MoreScreen() {
  return (
    <Screen>
      <Placeholder
        title="More"
        milestone="Milestone 5 · Owner"
        description="Publishing and the listing fee, support tickets, and your account."
      />
    </Screen>
  );
}

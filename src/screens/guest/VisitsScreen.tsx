import React from 'react';
import { Screen } from '@/components/common/Screen';
import { Placeholder } from '@/components/common/Placeholder';

export function VisitsScreen() {
  return (
    <Screen>
      <Placeholder
        title="My visits"
        milestone="Milestone 3 · Visits"
        description="Every PG you have asked to see, with its status. The owner's number appears here once a visit is confirmed."
      />
    </Screen>
  );
}

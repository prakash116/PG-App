import React from 'react';
import { Screen } from '@/components/common/Screen';
import { Placeholder } from '@/components/common/Placeholder';

export function OwnerVisitsScreen() {
  return (
    <Screen>
      <Placeholder
        title="Visit requests"
        milestone="Milestone 3 · Visits"
        description="People asking to see your PG. Confirming one hands over your number and theirs."
      />
    </Screen>
  );
}

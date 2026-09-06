import React from 'react';
import { Screen } from '@/components/common/Screen';
import { Placeholder } from '@/components/common/Placeholder';

export function SavedScreen() {
  return (
    <Screen>
      <Placeholder
        title="Saved"
        milestone="Milestone 2 · Discover"
        description="PGs you save will appear here, kept on the device so the list still opens without a connection."
      />
    </Screen>
  );
}

import React from 'react';
import { Screen } from '@/components/common/Screen';
import { Placeholder } from '@/components/common/Placeholder';

export function ProfileScreen() {
  return (
    <Screen>
      <Placeholder
        title="Profile"
        milestone="Milestone 5 · Account"
        description="Your details, referral code and earnings, current stay, and account settings."
      />
    </Screen>
  );
}

import React from 'react';
import { Screen } from '@/components/common/Screen';
import { Placeholder } from '@/components/common/Placeholder';

export function AuthScreen() {
  return (
    <Screen>
      <Placeholder
        title="Sign in"
        milestone="Milestone 1 · Shell"
        description="Phone number, MSG91 OTP, then name and email for a new account. Raised as a sheet over whatever you were doing, and it returns you there afterwards."
      />
    </Screen>
  );
}

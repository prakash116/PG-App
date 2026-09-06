import React from 'react';
import { Screen } from '@/components/common/Screen';
import { Placeholder } from '@/components/common/Placeholder';

export function ListingScreen() {
  return (
    <Screen>
      <Placeholder
        title="Listing"
        milestone="Milestone 4 · Owner"
        description="Your property details, amenities, photos and room types — the same fields as the web dashboard, with camera capture."
      />
    </Screen>
  );
}

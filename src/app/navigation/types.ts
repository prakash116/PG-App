import type { NavigatorScreenParams } from '@react-navigation/native';

export type GuestTabParamList = {
  Discover: undefined;
  Saved: undefined;
  Visits: undefined;
  Profile: undefined;
};

export type OwnerTabParamList = {
  Dashboard: undefined;
  Listing: undefined;
  Residents: undefined;
  OwnerVisits: undefined;
  More: undefined;
};

export type RootStackParamList = {
  GuestTabs: NavigatorScreenParams<GuestTabParamList>;
  OwnerTabs: NavigatorScreenParams<OwnerTabParamList>;
  /** Shared: reachable from either shell and from a deep link. */
  PgDetail: { pgCode: string; name?: string };
  /** Presented as a sheet over whatever triggered the auth gate. */
  Auth: { returnTo?: string } | undefined;
  AdminNotice: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

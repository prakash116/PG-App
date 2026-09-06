import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Building2, Inbox, User, Users } from 'lucide-react-native';
import { InboxScreen } from '@/screens/owner/InboxScreen';
import { ListingScreen } from '@/screens/owner/ListingScreen';
import { ResidentsScreen } from '@/screens/owner/ResidentsScreen';
import { ProfileScreen } from '@/screens/guest/ProfileScreen';
import { useTabScreenOptions } from './tabOptions';
import type { OwnerTabParamList } from './types';

const Tab = createBottomTabNavigator<OwnerTabParamList>();

export function OwnerTabs() {
  const screenOptions = useTabScreenOptions();

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Inbox"
        component={InboxScreen}
        options={{ tabBarIcon: ({ color, size }) => <Inbox color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Listing"
        component={ListingScreen}
        options={{ tabBarIcon: ({ color, size }) => <Building2 color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Residents"
        component={ResidentsScreen}
        options={{ tabBarIcon: ({ color, size }) => <Users color={color} size={size} /> }}
      />
      {/* The profile screen is role-agnostic, so the owner shell reuses it
          rather than keeping a second copy that drifts. */}
      <Tab.Screen
        name="Account"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

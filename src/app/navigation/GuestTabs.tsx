import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { CalendarCheck, Compass, Heart, User } from 'lucide-react-native';
import { DiscoverScreen } from '@/screens/guest/DiscoverScreen';
import { SavedScreen } from '@/screens/guest/SavedScreen';
import { VisitsScreen } from '@/screens/guest/VisitsScreen';
import { ProfileScreen } from '@/screens/guest/ProfileScreen';
import { useTabScreenOptions } from './tabOptions';
import type { GuestTabParamList } from './types';

const Tab = createBottomTabNavigator<GuestTabParamList>();

export function GuestTabs() {
  const screenOptions = useTabScreenOptions();

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Discover"
        component={DiscoverScreen}
        options={{ tabBarIcon: ({ color, size }) => <Compass color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Saved"
        component={SavedScreen}
        options={{ tabBarIcon: ({ color, size }) => <Heart color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Visits"
        component={VisitsScreen}
        options={{ tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

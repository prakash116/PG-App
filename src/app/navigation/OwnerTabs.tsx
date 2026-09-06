import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Building2, CalendarCheck, LayoutDashboard, Menu, Users } from 'lucide-react-native';
import { DashboardScreen } from '@/screens/owner/DashboardScreen';
import { ListingScreen } from '@/screens/owner/ListingScreen';
import { ResidentsScreen } from '@/screens/owner/ResidentsScreen';
import { OwnerVisitsScreen } from '@/screens/owner/OwnerVisitsScreen';
import { MoreScreen } from '@/screens/owner/MoreScreen';
import { useTabScreenOptions } from './tabOptions';
import type { OwnerTabParamList } from './types';

const Tab = createBottomTabNavigator<OwnerTabParamList>();

export function OwnerTabs() {
  const screenOptions = useTabScreenOptions();

  return (
    <Tab.Navigator screenOptions={screenOptions}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ tabBarIcon: ({ color, size }) => <LayoutDashboard color={color} size={size} /> }}
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
      <Tab.Screen
        name="OwnerVisits"
        component={OwnerVisitsScreen}
        options={{
          title: 'Visits',
          tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreScreen}
        options={{ tabBarIcon: ({ color, size }) => <Menu color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

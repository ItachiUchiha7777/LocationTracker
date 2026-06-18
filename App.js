import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';

import MapScreen from './src/screens/MapScreen';
import HistoryScreen from './src/screens/HistoryScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            const icons = { Map: '🗺️', History: '📍' };
            return <Text style={{ fontSize: focused ? 22 : 18 }}>{icons[route.name]}</Text>;
          },
          tabBarActiveTintColor: '#4F8EF7',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#1A1A2E',
            borderTopColor: '#2A2A4A',
            paddingBottom: 6,
            paddingTop: 6,
            height: 60,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#1A1A2E',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
        })}
      >
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{ title: '📡 Live Tracker', tabBarLabel: 'Map' }}
        />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ title: '📋 Route History', tabBarLabel: 'History' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

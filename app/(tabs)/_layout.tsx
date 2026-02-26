import { Tabs } from 'expo-router';
import React from 'react';
import { Image, ImageBackground, Pressable } from 'react-native';
import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';

import * as Haptics from 'expo-haptics';

import { HapticTab } from '@/components/haptic-tab';

function RecordButton({ onPress, children }: BottomTabBarButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      onPressIn={() => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      }}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      {children}
    </Pressable>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          height: 117,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          borderTopColor: 'transparent',
          elevation: 0,
          shadowOpacity: 0,
          shadowRadius: 0,
          shadowColor: 'transparent',
          shadowOffset: { width: 0, height: 0 },
          overflow: 'visible',
        },
        tabBarBackground: () => (
          <ImageBackground
            source={require('@/assets/images/blanknavbar.png')}
            style={{ flex: 1 }}
            resizeMode="stretch"
          />
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images/home-active.png')
                  : require('@/assets/images/home-inactive.png')
              }
              style={{ width: 50.08, height: 49, transform: [{ translateY: 50 }] }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images/map-active.png')
                  : require('@/assets/images/map-inactive.png')
              }
              style={{ width: 50.08, height: 49, transform: [{ translateY: 50 }] }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Timer',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images/timer-active.png')
                  : require('@/assets/images/timer-inactive.png')
              }
              style={{ width: 56, height: 80, transform: [{ translateY: 12 }] }}
              resizeMode="contain"
            />
          ),
          tabBarButton: (props) => <RecordButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images/friends-active.png')
                  : require('@/assets/images/friends-inactive.png')
              }
              style={{ width: 50.08, height: 49.24, transform: [{ translateY: 50 }] }}
              resizeMode="contain"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <Image
              source={
                focused
                  ? require('@/assets/images/profile-active.png')
                  : require('@/assets/images/profile-inactive.png')
              }
              style={{ width: 50.08, height: 47, transform: [{ translateY: 50 }] }}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}

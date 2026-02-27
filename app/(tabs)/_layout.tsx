import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import BlankNavbar from '@/assets/images/blanknavbar.svg';
import FriendsActive from '@/assets/images/friends-active.svg';
import FriendsInactive from '@/assets/images/friends-inactive.svg';
import HomeActive from '@/assets/images/home-active.svg';
import HomeInactive from '@/assets/images/home-inactive.svg';
import MapActive from '@/assets/images/map-active.svg';
import MapInactive from '@/assets/images/map-inactive.svg';
import ProfileActive from '@/assets/images/profile-active.svg';
import ProfileInactive from '@/assets/images/profile-inactive.svg';
import TimerActive from '@/assets/images/timer-active.svg';
import TimerInactive from '@/assets/images/timer-inactive.svg';

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
          bottom: -12,
          height: 127,
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
          <View style={{
            position: 'absolute',
            left: -4,
            right: -4,
            top: 0,
            bottom: 0,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 12,
          }}>
            <BlankNavbar width="100%" height="100%" preserveAspectRatio="none" />
          </View>
        ),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            focused
              ? <HomeActive width={52.08} height={51} style={{ transform: [{ translateY: 50 }] }} />
              : <HomeInactive width={52.08} height={51} style={{ transform: [{ translateY: 50 }] }} />
          ),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Map',
          tabBarIcon: ({ focused }) => (
            focused
              ? <MapActive width={52.08} height={51.24} style={{ transform: [{ translateY: 50 }] }} />
              : <MapInactive width={52.08} height={51.24} style={{ transform: [{ translateY: 50 }] }} />
          ),
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: 'Timer',
          tabBarStyle: { display: 'none' },
          tabBarIcon: ({ focused }) => (
            focused
              ? <TimerActive width={56} height={80} style={{ transform: [{ translateY: 8 }] }} />
              : <TimerInactive width={56} height={80} style={{ transform: [{ translateY: 8 }] }} />
          ),
          tabBarButton: (props) => <RecordButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: ({ focused }) => (
            focused
              ? <FriendsActive width={52.08} height={51.24} style={{ transform: [{ translateY: 50 }] }} />
              : <FriendsInactive width={52.08} height={51.24} style={{ transform: [{ translateY: 50 }] }} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            focused
              ? <ProfileActive width={52.08} height={49} style={{ transform: [{ translateY: 51 }] }} />
              : <ProfileInactive width={52.08} height={49} style={{ transform: [{ translateY: 51 }] }} />
          ),
        }}
      />
    </Tabs>
  );
}

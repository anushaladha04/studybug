import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable, type PressableProps } from 'react-native';

// Minimal tab button that triggers light haptic feedback on press.
export function HapticTab(props: PressableProps) {
  const { onPress, children, ...rest } = props;

  const handlePress = (e: any) => {
    // best-effort haptic feedback
    try {
      Haptics.selectionAsync();
    } catch (err) {
      // ignore
    }

    if (typeof onPress === 'function') {
      onPress(e);
    }
  };

  return (
    <Pressable onPress={handlePress} {...rest}>
      {children}
    </Pressable>
  );
}

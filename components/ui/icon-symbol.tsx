import React from 'react';
import { Text } from 'react-native';

type IconSymbolProps = {
  name: string;
  size?: number;
  color?: string;
};

// Lightweight placeholder icon component used in the tabs.
// Maps a few common symbol names to emoji fallbacks so bundling doesn't fail.
export function IconSymbol({ name, size = 24, color = '#000' }: IconSymbolProps) {
  const map: Record<string, string> = {
    'house.fill': '🏠',
    'person.2.fill': '👥',
    'map.fill': '🗺️',
    'person.fill': '👤',
  };

  const symbol = map[name] ?? '◻️';

  return (
    <Text style={{ fontSize: size, color }}>{symbol}</Text>
  );
}

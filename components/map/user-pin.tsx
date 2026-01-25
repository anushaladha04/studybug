import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LocationUser } from './study-map';

interface UserPinProps {
  user: LocationUser;
}

export function UserPin({ user }: UserPinProps) {
  const theme = useColorScheme() ?? 'light';

  return (
    <View style={styles.container}>
      {/* Avatar */}
      {user.imageUrl ? (
        <Image
          source={{ uri: user.imageUrl }}
          style={styles.avatar}
        />
      ) : (
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: Colors[theme].tint,
              justifyContent: 'center',
              alignItems: 'center',
            },
          ]}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>
            {user.name.charAt(0).toUpperCase()}
          </Text>
        </View>
      )}

      {/* Info Card */}
      <View
        style={[
          styles.infoCard,
          {
            backgroundColor: Colors[theme].background,
            borderColor: Colors[theme].tint,
          },
        ]}>
        <Text
          style={[
            styles.nameText,
            { color: Colors[theme].text },
          ]}
          numberOfLines={1}>
          {user.name}
        </Text>
        <Text
          style={[
            styles.studyingText,
            { color: Colors[theme].icon },
          ]}
          numberOfLines={2}>
          📚 {user.studying}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    width: 120,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#fff',
    marginBottom: 8,
  },
  infoCard: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1.5,
    maxWidth: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  nameText: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  studyingText: {
    fontSize: 10,
    lineHeight: 14,
  },
});

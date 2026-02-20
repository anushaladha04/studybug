import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SettingsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    pauseAll: false,
    sound: true,
    reminders: true,
  });

  const handleToggle = (key: 'pauseAll' | 'sound' | 'reminders') => {
    setNotifications(prev => {
      if (key === 'pauseAll') {
        const pausing = !prev.pauseAll;
        return { pauseAll: pausing, sound: !pausing, reminders: !pausing };
      }
      return { ...prev, [key]: !prev[key], pauseAll: false };
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionHeader}>PROFILE</Text>

        <Pressable style={styles.profilePicRow}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={30} color="#999" />
          </View>
          <Text style={styles.profilePicText}>Change Profile Photo</Text>
        </Pressable>

        <Pressable style={styles.settingRow}>
          <Text style={styles.settingLabel}>Name</Text>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>Jane Doe</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </View>
        </Pressable>

        <Pressable style={styles.settingRow}>
          <Text style={styles.settingLabel}>Username</Text>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>@janedoe</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </View>
        </Pressable>

        <Pressable style={styles.settingRow}>
          <Text style={styles.settingLabel}>Pronouns</Text>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>She/Her</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </View>
        </Pressable>

        <Text style={styles.sectionHeader}>ACCOUNT INFO</Text>

        <Pressable style={styles.settingRow}>
          <Text style={styles.settingLabel}>Email</Text>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>jane@example.com</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </View>
        </Pressable>

        <Pressable style={styles.settingRow}>
          <Text style={styles.settingLabel}>Password</Text>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>••••••••</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </View>
        </Pressable>

        <Pressable style={styles.settingRow}>
          <Text style={styles.settingLabel}>Phone</Text>
          <View style={styles.settingRight}>
            <Text style={styles.settingValue}>Not set</Text>
            <Ionicons name="chevron-forward" size={18} color="#999" />
          </View>
        </Pressable>

        <Text style={styles.sectionHeader}>NOTIFICATIONS</Text>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Pause All</Text>
          <Switch
            value={notifications.pauseAll}
            onValueChange={() => handleToggle('pauseAll')}
            trackColor={{ false: '#ddd', true: '#0a7ea4' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Sound</Text>
          <Switch
            value={notifications.sound}
            onValueChange={() => handleToggle('sound')}
            trackColor={{ false: '#ddd', true: '#0a7ea4' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Reminders</Text>
          <Switch
            value={notifications.reminders}
            onValueChange={() => handleToggle('reminders')}
            trackColor={{ false: '#ddd', true: '#0a7ea4' }}
            thumbColor="#fff"
          />
        </View>

        <View style={styles.bottomButtons}>
          <Pressable
            style={({ pressed }) => [styles.deleteButton, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.deleteText}>Delete Account</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.signOutButton, pressed && { opacity: 0.8 }]}
            onPress={() => supabase.auth.signOut()}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 60,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  scroll: {
    width: '100%',
    marginTop: 16,
  },
  scrollContent: {
    paddingHorizontal: '5%',
    paddingBottom: 40,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 28,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  profilePicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePicText: {
    marginLeft: 14,
    fontSize: 15,
    color: '#0a7ea4',
    fontWeight: '500',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 15,
    color: '#333',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: 15,
    color: '#999',
  },
  bottomButtons: {
    marginTop: 40,
    gap: 12,
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF3B30',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteText: {
    color: '#FF3B30',
    fontWeight: '600',
    fontSize: 16,
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

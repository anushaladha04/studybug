import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'insights' | 'archive'>('insights');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ width: 24 }} />
        <Text style={styles.title}>Profile</Text>
        <Pressable onPress={() => { /*todo- Settings page */ }}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </Pressable>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={40} color="#999" />
        </View>
        <View style={styles.profileText}>
          <Text style={styles.nameText}>Jane Doe</Text>
          <Text style={styles.usernameText}>@janedoe</Text>
          <Text style={styles.bioText}>Hi! I'm Jane Doe.</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'insights' && styles.activeTab]}
          onPress={() => setActiveTab('insights')}
        >
          <Text style={[styles.tabText, activeTab === 'insights' && styles.activeTabText]}>Insights</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'archive' && styles.activeTab]}
          onPress={() => setActiveTab('archive')}
        >
          <Text style={[styles.tabText, activeTab === 'archive' && styles.activeTabText]}>Archive</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {activeTab === 'insights' ? (
          <Text style={styles.emptyText}>No insights yet</Text>
        ) : (
          <Text style={styles.emptyText}>No archived sessions</Text>
        )}
      </View>

      <Pressable
        style={({ pressed }) => [styles.signOutButton, pressed && { opacity: 0.8 }]}
        onPress={() => supabase.auth.signOut()}
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
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
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginTop: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    marginLeft: 16,
    flex: 1,
  },
  nameText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  usernameText: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  bioText: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
  tabBar: {
    flexDirection: 'row',
    width: '90%',
    marginTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0a7ea4',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999',
  },
  activeTabText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  signOutButton: {
    width: '90%',
    backgroundColor: '#FF3B30',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  signOutText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});

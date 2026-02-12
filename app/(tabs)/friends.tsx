import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => { /*TODO: Add friend flow */ }}>
          <Ionicons name="person-add-outline" size={24} color="#333" />
        </Pressable>
        <Text style={styles.title}>Friends</Text>
        <Pressable onPress={() => { /* TODO: Notifications flow */ }}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </Pressable>
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Search friends..."
        placeholderTextColor="#999"
      />

      <View style={styles.tabBar}>
        <Pressable
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>All Friends</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {activeTab === 'active' ? (
          <Text style={styles.emptyText}>No active friends right now</Text>
        ) : (
          <Text style={styles.emptyText}>No friends added yet</Text>
        )}
      </View>
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
  searchBar: {
    width: '90%',
    height: 42,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 15,
    marginTop: 16,
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    width: '90%',
    marginTop: 20,
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
});

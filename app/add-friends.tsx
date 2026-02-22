import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AddFriendsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.title}>Add Friends</Text>
        <View style={{ width: 24 }} />
      </View>

      <TextInput
        style={styles.searchBar}
        placeholder="Find new friends..."
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
      />

      <Pressable style={styles.requestsButton}>
        <Ionicons name="mail-outline" size={20} color="#0a7ea4" />
        <Text style={styles.requestsButtonText}>Friend Requests</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </Pressable>

      <View style={styles.contactsSection}>
        <Text style={styles.sectionHeader}>All Contacts</Text>
        <View style={styles.contactsPlaceholder}>
          <Ionicons name="people-outline" size={40} color="#ccc" />
          <Text style={styles.placeholderText}>No contacts found yet</Text>
        </View>
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
  requestsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    paddingVertical: 14,
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  requestsButtonText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 10,
  },
  contactsSection: {
    width: '90%',
    marginTop: 24,
    flex: 1,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 16,
  },
  contactsPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 15,
    color: '#999',
    marginTop: 8,
  },
});

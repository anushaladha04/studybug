import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase';
import { useState } from 'react';


export default function SettingsScreen() {
  const router = useRouter();
  const { session, profile, refreshProfile } = useAuthContext();
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.full_name ?? '');

  async function handleLogOut() {
    await supabase.auth.signOut();
  }

  async function handleSaveName() {
    if (!session?.user?.id) return;
    await supabase
      .from('profiles')
      .update({ full_name: nameInput })
      .eq('id', session.user.id);
    await refreshProfile();
    setNameModalVisible(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </Pressable>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Section */}
        <Text style={styles.sectionLabel}>PROFILE</Text>

        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#bbb" />
          </View>
        </View>

        <View style={styles.rowGroup}>
          <Pressable style={styles.row} onPress={() => { setNameInput(profile?.full_name ?? ''); setNameModalVisible(true); }}>
            <Text style={styles.rowLabel}>Name</Text>
            <Text style={styles.rowValue}>{profile?.full_name ?? '-'}</Text>
            <View style={styles.editIconCircle}>
              <Ionicons name="pencil" size={13} color="#666" />
            </View>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row}>
            <Text style={styles.rowLabel}>Username</Text>
            <Text style={styles.rowValue}>{profile?.username ?? '-'}</Text>
          </Pressable>
          <View style={styles.divider} />
          <Pressable style={styles.row}>
            <Text style={styles.rowLabel}>Email</Text>
            <Text style={styles.rowValue}>{session?.user?.email ?? '-'}</Text>
          </Pressable>
        </View>

        {/* Log Out */}
        <View style={[styles.rowGroup, styles.logoutGroup]}>
          <Pressable style={styles.row} onPress={handleLogOut}>
            <Text style={[styles.rowText, styles.logoutText]}>Log Out</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Edit Name Modal */}
      <Modal
        visible={nameModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNameModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setNameModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Edit Name</Text>
              <TextInput
                style={styles.modalInput}
                value={nameInput}
                onChangeText={setNameInput}
                placeholder="Full name"
                autoCorrect={false}
                autoCapitalize="words"
                autoFocus
              />
              <Pressable style={styles.modalDone} onPress={handleSaveName}>
                <Text style={styles.modalDoneText}>Done</Text>
              </Pressable>
            </Pressable>
          </KeyboardAvoidingView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  backButton: {
    width: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    letterSpacing: 0.8,
    marginTop: 24,
    marginBottom: 12,
    marginHorizontal: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowGroup: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  logoutGroup: {
    marginTop: 32,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ddd',
    marginLeft: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  rowLabel: {
    fontSize: 16,
    color: '#333',
    width: 100,
  },
  rowValue: {
    fontSize: 16,
    color: '#888',
    flex: 1,
  },
  rowText: {
    fontSize: 16,
    color: '#333',
  },
  logoutText: {
    color: '#e53935',
  },
  editIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#e8e8e8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    width: 300,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  modalDone: {
    marginTop: 16,
    backgroundColor: '#333',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
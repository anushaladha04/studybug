import { useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase';


export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'insights' | 'archive'>('insights');
  const { session, profile, refreshProfile } = useAuthContext();
  const router = useRouter();
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [bioInput, setBioInput] = useState(profile?.bio ?? '');

  async function handleSaveBio() {
    if (!session?.user?.id) return;
    await supabase
      .from('profiles')
      .update({ bio: bioInput })
      .eq('id', session.user.id);
    await refreshProfile();
    setBioModalVisible(false);
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ width: 24 }} />
        <Text style={styles.title}>Profile</Text>
        <Pressable onPress={() => router.push('/settings')}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </Pressable>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={40} color="#999" />
        </View>
        <View style={styles.profileText}>
          <Text style={styles.nameText}>{profile?.full_name ?? '-'}</Text>
          <Text style={styles.usernameText}>@{profile?.username ?? '-'}</Text>
          <Pressable style={styles.bioRow} onPress={() => { setBioInput(profile?.bio ?? ''); setBioModalVisible(true); }}>
            <Text style={styles.bioText}>{profile?.bio ?? 'No bio yet'}</Text>
            <View style={styles.editIconCircle}>
              <Ionicons name="pencil" size={13} color="#666" />
            </View>
          </Pressable>
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

      {/* Edit Bio Modal */}
      <Modal
        visible={bioModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setBioModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setBioModalVisible(false)}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <Pressable style={styles.modalCard} onPress={() => {}}>
              <Text style={styles.modalTitle}>Edit Bio</Text>
              <TextInput
                style={[styles.modalInput, { height: 80, textAlignVertical: 'top' }]}
                value={bioInput}
                onChangeText={setBioInput}
                placeholder="Write something about yourself"
                autoCorrect
                autoCapitalize="sentences"
                multiline
                autoFocus
              />
              <Pressable style={styles.modalDone} onPress={handleSaveBio}>
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
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
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
    flex: 1,
  },
  editIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
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
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#0a7ea4',
  },
  modalDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
});

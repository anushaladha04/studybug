import { View, Text, StyleSheet, Pressable, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform, Image, Animated, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase';
import { useEffect, useRef, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { File as ExpoFile } from 'expo-file-system/next';


export default function SettingsScreen() {
  const router = useRouter();
  const { session, profile, refreshProfile, profileImageVersion } = useAuthContext();
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.full_name ?? '');
  const [pictureModalVisible, setPictureModalVisible] = useState(false);
  const [pictureTab, setPictureTab] = useState<'profile' | 'avatar'>('profile');
  const [uploading, setUploading] = useState(false);
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (pictureModalVisible) {
      Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, bounciness: 0 }).start();
    }
  }, [pictureModalVisible]);

  function closePictureModal() {
    Animated.timing(slideAnim, { toValue: 400, duration: 250, useNativeDriver: true }).start(() => {
      setPictureModalVisible(false);
      slideAnim.setValue(400);
    });
  }

  const imagePath = profile?.profile_image_path ?? 'avatar_4.jpg';
  const avatarPath = 'avatar_4.jpg';

  const { data: { publicUrl: imageUrlBase } } = supabase.storage
    .from('profile_pictures')
    .getPublicUrl(imagePath);
  const imageUrl = `${imageUrlBase}?v=${profileImageVersion}`;

  const { data: { publicUrl: avatarUrl } } = supabase.storage
    .from('profile_pictures')
    .getPublicUrl(avatarPath);

  async function uploadFromUri(uri: string) {
    const userId = session?.user?.id;
    if (!userId) return;

    setUploading(true);
    try {
      const manipulated = await manipulateAsync(
        uri,
        [{ resize: { width: 512 } }],
        { compress: 0.8, format: SaveFormat.JPEG }
      );

      const file = new ExpoFile(manipulated.uri);
      const arrayBuffer = await file.arrayBuffer();

      const filePath = `${userId}.jpg`;

      const { error } = await supabase.storage
        .from('profile_pictures')
        .upload(filePath, arrayBuffer, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({ profile_image_path: filePath })
        .eq('id', userId);

      await refreshProfile();
      closePictureModal();
    } catch (err: any) {
      Alert.alert('Upload failed', err.message ?? 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  }

  async function pickAndUploadPhoto() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library in Settings.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;
    await uploadFromUri(result.assets[0].uri);
  }

  async function takeAndUploadPhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow camera access in Settings.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;
    await uploadFromUri(result.assets[0].uri);
  }

  async function clearPicture() {
    const userId = session?.user?.id;
    if (!userId) return;
    setUploading(true);
    try {
      await supabase.storage
        .from('profile_pictures')
        .remove([`${userId}.jpg`]);

      await supabase
        .from('profiles')
        .update({ profile_image_path: null })
        .eq('id', userId);

      await refreshProfile();
      closePictureModal();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Something went wrong.');
    } finally {
      setUploading(false);
    }
  }

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
        <Text style={styles.sectionLabel}>Profile</Text>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Image
                source={{ uri: imageUrl }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            </View>
            <View style={[styles.avatar, { marginLeft: 16 }]}>
              <Image
                source={{ uri: avatarUrl }}
                style={{ width: 100, height: 100, borderRadius: 50 }}
              />
            </View>
          </View>
          <Pressable onPress={() => setPictureModalVisible(true)}>
            <Text style={styles.editPictureText}>Edit Picture or Avatar</Text>
          </Pressable>
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

      {/* Edit Picture Bottom Sheet */}
      <Modal
        visible={pictureModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closePictureModal}
      >
        <Pressable style={styles.bottomSheetOverlay} onPress={closePictureModal}>
          <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
            <Pressable onPress={() => {}} style={{ width: '100%' }}>
            <View style={styles.bottomSheetHandle} />
            <View style={styles.pictureTabs}>
              <Pressable
                style={[styles.pictureTab, pictureTab === 'profile' && styles.pictureTabActive]}
                onPress={() => setPictureTab('profile')}
              >
                <Text style={[styles.pictureTabText, pictureTab === 'profile' && styles.pictureTabTextActive]}>Profile</Text>
              </Pressable>
              <Pressable
                style={[styles.pictureTab, pictureTab === 'avatar' && styles.pictureTabActive]}
                onPress={() => setPictureTab('avatar')}
              >
                <Text style={[styles.pictureTabText, pictureTab === 'avatar' && styles.pictureTabTextActive]}>Avatar</Text>
              </Pressable>
            </View>
            <View style={styles.pictureTabContent}>
              {pictureTab === 'profile' ? (
                <View style={{ width: '100%' }}>
                  <Image
                    source={{ uri: imageUrl }}
                    style={{ width: 90, height: 90, borderRadius: 45, marginBottom: 24, alignSelf: 'center' }}
                  />
                  <View style={styles.actionGroup}>
                    <Pressable style={styles.actionRow} onPress={pickAndUploadPhoto} disabled={uploading}>
                      {uploading
                        ? <ActivityIndicator size="small" color="#333" />
                        : <Text style={styles.actionText}>Upload Photo</Text>
                      }
                    </Pressable>
                    <View style={styles.actionDivider} />
                    <Pressable style={styles.actionRow} onPress={takeAndUploadPhoto} disabled={uploading}>
                      <Text style={styles.actionText}>Camera</Text>
                    </Pressable>
                    <View style={styles.actionDivider} />
                    <Pressable style={styles.actionRow} onPress={clearPicture} disabled={uploading}>
                      <Text style={[styles.actionText, { color: '#e53935' }]}>Clear Picture</Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Ionicons name="happy-outline" size={64} color="#bbb" />
              )}
            </View>
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>

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
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editPictureText: {
    marginTop: 12,
    fontSize: 14,
    color: '#0a7ea4',
    fontWeight: '500',
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
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    paddingHorizontal: 16,
    paddingTop: 12,
    minHeight: 320,
  },
  bottomSheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 16,
  },
  pictureTabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginBottom: 24,
  },
  pictureTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  pictureTabActive: {
    borderBottomColor: '#333',
  },
  pictureTabText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#999',
  },
  pictureTabTextActive: {
    color: '#333',
    fontWeight: '600',
  },
  pictureTabContent: {
    justifyContent: 'flex-start',
    paddingVertical: 24,
  },
  actionGroup: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionRow: {
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
  },
  actionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#ddd',
    marginLeft: 16,
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
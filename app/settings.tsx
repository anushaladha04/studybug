import { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';


type ProfileField = 'name' | 'username' | 'pronouns' | 'email' | 'phone' | 'password';

type Profile = {
  name: string;
  username: string;
  pronouns: string;
  email: string;
  phone: string;
};

//TODO: real api call placeholder for backend

async function saveProfileField(
  _field: ProfileField,
  _value: string,
): Promise<void> {
  //Remove and implement above when backend is ready
  throw new Error('implement saveProfileField().');
}

//TODO:Need to load real profile data below

//Validation

function validate(field: ProfileField, value: string, confirm?: string): string | null {
  const v = value.trim();
  switch (field) {
    case 'name':
      if (!v) return 'Name is required.';
      if (v.length < 2) return 'Name must be at least 2 characters.';
      return null;
    case 'username':
      if (!v) return 'Username is required.';
      if (v.length < 3) return 'Username must be at least 3 characters.';
      if (!/^[a-zA-Z0-9_]+$/.test(v)) return 'Only letters, numbers, and underscores allowed.';
      return null;
    case 'email':
      if (!v) return 'Email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter a valid email address.';
      return null;
    case 'phone':
      if (v && !/^\+?[\d\s\-(). ]{7,15}$/.test(v)) return 'Enter a valid phone number.';
      return null;
    case 'password':
      if (!v) return 'Password is required.';
      if (v.length < 8) return 'Password must be at least 8 characters.';
      if (confirm !== undefined && v !== confirm.trim()) return 'Passwords do not match.';
      return null;
    case 'pronouns':
      return null;
    default:
      return null;
  }
}

//Comp

export default function SettingsScreen() {
  const router = useRouter();

  //TODO:Replace hardcoded values with data loaded from api/db
  const [profile, setProfile] = useState<Profile>({
    name: 'Jane Doe',
    username: '@janedoe',
    pronouns: 'She/Her',
    email: 'jane@example.com',
    phone: '',
  });

  const [notifications, setNotifications] = useState({
    pauseAll: false,
    sound: true,
    reminders: true,
  });

  //Modal
  
  const [editField, setEditField] = useState<ProfileField | null>(null);
  const [editValue, setEditValue] = useState('');
  const [confirmValue, setConfirmValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [successField, setSuccessField] = useState<ProfileField | null>(null);

  //Edit modal handlers

  const openEdit = (field: ProfileField) => {
    const current =
      field === 'password'
        ? ''
        : field === 'username'
          ? profile.username.replace(/^@/, '')
          : (profile as Record<string, string>)[field] ?? '';
    setEditField(field);
    setEditValue(current);
    setConfirmValue('');
    setFieldError(null);
  };

  const closeEdit = () => {
    if (saving) return;
    setEditField(null);
    setFieldError(null);
  };

  const handleSave = async () => {
    if (!editField) return;

    const error = validate(
      editField,
      editValue,
      editField === 'password' ? confirmValue : undefined,
    );
    if (error) {
      setFieldError(error);
      return;
    }

    setSaving(true);
    setFieldError(null);

    try {
      await saveProfileField(editField, editValue.trim());

      if (editField !== 'password') {
        setProfile(prev => ({
          ...prev,
          [editField]:
            editField === 'username' ? `@${editValue.trim()}` : editValue.trim(),
        }));
      }

      setSuccessField(editField);
      setTimeout(() => setSuccessField(null), 3000);
      setEditField(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong. Try again.';
      setFieldError(message);
    } finally {
      setSaving(false);
    }
  };


  const handleToggle = (key: 'pauseAll' | 'sound' | 'reminders') => {
    setNotifications(prev => {
      if (key === 'pauseAll') {
        const pausing = !prev.pauseAll;
        return { pauseAll: pausing, sound: !pausing, reminders: !pausing };
      }
      return { ...prev, [key]: !prev[key], pauseAll: false };
    });
  };


  const FIELD_LABELS: Record<ProfileField, string> = {
    name: 'Name',
    username: 'Username',
    pronouns: 'Pronouns',
    email: 'Email',
    phone: 'Phone',
    password: 'Password',
  };

  const displayValue = (field: ProfileField): string => {
    if (field === 'password') return '••••••••';
    if (field === 'phone') return profile.phone || 'Not set';
    return (profile as Record<string, string>)[field] ?? '';
  };

  const autoCapFor = (field: ProfileField) =>
    field === 'name' || field === 'pronouns' ? 'words' : 'none';

  const keyboardTypeFor = (field: ProfileField) => {
    if (field === 'email') return 'email-address' as const;
    if (field === 'phone') return 'phone-pad' as const;
    return 'default' as const;
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

        {/* ── PROFILE ── */}
        <Text style={styles.sectionHeader}>PROFILE</Text>

        <Pressable style={styles.profilePicRow}>
          <View style={styles.avatar}>
            <Ionicons name="person-outline" size={30} color="#999" />
          </View>
          <Text style={styles.profilePicText}>Change Profile Photo</Text>
        </Pressable>

        {(['name', 'username', 'pronouns'] as ProfileField[]).map(field => (
          <Pressable
            key={field}
            style={styles.settingRow}
            onPress={() => openEdit(field)}
          >
            <Text style={styles.settingLabel}>{FIELD_LABELS[field]}</Text>
            <View style={styles.settingRight}>
              {successField === field && (
                <Ionicons name="checkmark-circle" size={16} color="#34C759" style={{ marginRight: 2 }} />
              )}
              <Text style={styles.settingValue}>{displayValue(field)}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </View>
          </Pressable>
        ))}

        {/* ── ACCOUNT INFO ── */}
        <Text style={styles.sectionHeader}>ACCOUNT INFO</Text>

        {(['email', 'password', 'phone'] as ProfileField[]).map(field => (
          <Pressable
            key={field}
            style={styles.settingRow}
            onPress={() => openEdit(field)}
          >
            <Text style={styles.settingLabel}>{FIELD_LABELS[field]}</Text>
            <View style={styles.settingRight}>
              {successField === field && (
                <Ionicons name="checkmark-circle" size={16} color="#34C759" style={{ marginRight: 2 }} />
              )}
              <Text style={styles.settingValue}>{displayValue(field)}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </View>
          </Pressable>
        ))}

        {/* ── NOTIFICATIONS ── */}
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

        {/* ── BOTTOM BUTTONS ── */}
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

      {/* ── Edit Modal ── */}
      <Modal
        visible={editField !== null}
        transparent
        animationType="fade"
        onRequestClose={closeEdit}
      >
        {/* Tap outside to dismiss */}
        <Pressable style={styles.modalOverlay} onPress={closeEdit}>
          {/* Stop tap-through on the card itself */}
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>
              {editField ? `Edit ${FIELD_LABELS[editField]}` : ''}
            </Text>

            <TextInput
              style={[styles.input, fieldError ? styles.inputError : null]}
              value={editValue}
              onChangeText={v => {
                setEditValue(v);
                setFieldError(null);
              }}
              autoFocus
              autoCapitalize={editField ? autoCapFor(editField) : 'none'}
              keyboardType={editField ? keyboardTypeFor(editField) : 'default'}
              secureTextEntry={editField === 'password'}
              placeholder={
                editField === 'password'
                  ? 'New password'
                  : editField === 'username'
                    ? 'username (no @)'
                    : ''
              }
              placeholderTextColor="#bbb"
              returnKeyType={editField === 'password' ? 'next' : 'done'}
              onSubmitEditing={editField === 'password' ? undefined : handleSave}
            />

            {/* Confirm field — only for password */}
            {editField === 'password' && (
              <TextInput
                style={[
                  styles.input,
                  styles.inputSpacing,
                  fieldError ? styles.inputError : null,
                ]}
                value={confirmValue}
                onChangeText={v => {
                  setConfirmValue(v);
                  setFieldError(null);
                }}
                secureTextEntry
                placeholder="Confirm new password"
                placeholderTextColor="#bbb"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
            )}

            {/* Validation / API error */}
            {fieldError ? (
              <View style={styles.errorRow}>
                <Ionicons name="alert-circle-outline" size={14} color="#FF3B30" />
                <Text style={styles.errorText}>{fieldError}</Text>
              </View>
            ) : null}

            {/* Action buttons */}
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, styles.cancelBtn]}
                onPress={closeEdit}
                disabled={saving}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveBtnText}>Save</Text>
                )}
              </Pressable>
            </View>
          </Pressable>
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

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#333',
    backgroundColor: '#fafafa',
  },
  inputSpacing: {
    marginTop: 10,
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    flexShrink: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#f0f0f0',
  },
  cancelBtnText: {
    color: '#555',
    fontWeight: '500',
    fontSize: 15,
  },
  saveBtn: {
    backgroundColor: '#0a7ea4',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});

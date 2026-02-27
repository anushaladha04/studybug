import SessionPost from '@/components/session-component';
import { fetchSessionsByUser, getLifetimeSeconds, getStreakDays, getWeeklyDurations } from "@/controllers/study-session";
import { useAuthContext } from '@/hooks/use-auth-context';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Dimensions, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<'insights' | 'archive'>('insights');
  const { session, profile, refreshProfile, profileImageVersion } = useAuthContext();
  const router = useRouter();

  const imagePath = profile?.profile_image_path ?? 'avatar_4.jpg';
  const { data: { publicUrl: avatarUrlBase } } = supabase.storage
    .from('profile_pictures')
    .getPublicUrl(imagePath);
  const avatarUrl = `${avatarUrlBase}?v=${profileImageVersion}`;
  const [bioModalVisible, setBioModalVisible] = useState(false);
  const [bioInput, setBioInput] = useState(profile?.bio ?? '');

  const [weeklyDurations, setWeeklyDurations] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [lastWeekTotal, setLastWeekTotal] = useState<number | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [lifetimeSeconds, setLifetimeSeconds] = useState<number>(0);

  useEffect(() => {
    if (!session?.user?.id) return;
    const id = session.user.id;
    Promise.all([
      getWeeklyDurations(id, 0),
      getWeeklyDurations(id, 1),
      fetchSessionsByUser(id),
      getStreakDays(id),
      getLifetimeSeconds(id),
    ]).then(([thisWeek, lastWeek, userSessions, streakDays, lifetimeSecs]) => {
      console.log('weekly durations:', thisWeek);
      setWeeklyDurations(thisWeek);
      setLastWeekTotal(lastWeek.reduce((sum, v) => sum + v, 0));
      const completed = (userSessions ?? [])
        .filter((s: any) => s.end_time !== null)
        .sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
      setSessions(completed);
      setStreak(streakDays);
      setLifetimeSeconds(lifetimeSecs);
    });
  }, [session?.user?.id]);

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
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 89, height: 89, borderRadius: 44.5 }}
          />
        </View>
        <View style={styles.profileText}>
          <Text style={styles.nameText}>{profile?.full_name ?? '-'}</Text>
          <Text style={styles.usernameText}>@{profile?.username ?? '-'}</Text>
          <Pressable style={styles.bioRow} onPress={() => { setBioInput(profile?.bio ?? ''); setBioModalVisible(true); }}>
            <Text style={styles.bioText}>{profile?.bio ?? 'No bio yet'}</Text>
            <View style={styles.editIconCircle}>
              <Ionicons name="pencil" size={11} color="#666" />
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
          <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'center', paddingTop: 30, paddingBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 14, marginBottom: 4 }}>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Streak</Text>
                <Text style={styles.statValue}>{streak} {streak === 1 ? 'day' : 'days'}</Text>
              </View>
              <View style={styles.statBlock}>
                <Text style={styles.statLabel}>Lifetime</Text>
                <Text style={styles.statValue}>{Math.round(lifetimeSeconds / 3600)} hours</Text>
              </View>
            </View>
            <WeeklyBarChart durations={weeklyDurations} lastWeekTotal={lastWeekTotal} />
          </ScrollView>
        ) : (
          <ScrollView style={{ width: '100%' }} contentContainerStyle={{ alignItems: 'stretch', paddingVertical: 12 }}>
            {sessions.length === 0 ? (
              <Text style={styles.emptyText}>No past sessions yet</Text>
            ) : (
              sessions.map((s) => (
                <SessionPost
                  key={s.session_id}
                  name={profile?.full_name ?? '-'}
                  time={s.end_time}
                  title={s.session_name}
                  location={s.subject ?? ''}
                  totalTime={s.duration}
                  image={s.image_url}
                />
              ))
            )}
          </ScrollView>
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

function sessionTitle(isoString: string): string {
  const hour = new Date(isoString).getHours();
  if (hour >= 5 && hour < 9) return 'Early Morning Study Session';
  if (hour >= 9 && hour < 12) return 'Morning Study Session';
  if (hour >= 12 && hour < 14) return 'Midday Study Session';
  if (hour >= 14 && hour < 17) return 'Afternoon Study Session';
  if (hour >= 17 && hour < 20) return 'Evening Study Session';
  if (hour >= 20 && hour < 23) return 'Night Study Session';
  return 'Late Night Study Session';
}

function relativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
}

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return '0 min';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m} min`;
}

const CARD_WIDTH = Dimensions.get('window').width - 60;
const BAR_MAX_HEIGHT = 120;
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function WeeklyBarChart({ durations, lastWeekTotal }: { durations: number[]; lastWeekTotal: number | null }) {
  const max = Math.max(...durations, 1);
  const todayIndex = new Date().getDay();

  const thisWeekTotal = durations.reduce((sum, v) => sum + v, 0);
  const avgSeconds = Math.round(thisWeekTotal / (todayIndex + 1));
  const avgHours = Math.floor(avgSeconds / 3600);
  const avgMins = Math.floor((avgSeconds % 3600) / 60);
  const subtitleText = avgHours > 0 ? `${avgHours}hr ${avgMins}m` : `${avgMins}m`;
  const totalHours = Math.floor(thisWeekTotal / 3600);
  const totalMins = Math.floor((thisWeekTotal % 3600) / 60);
  const totalText = totalHours > 0 ? `${totalHours}hr ${totalMins}m` : `${totalMins}m`;

  return (
    <View style={chartStyles.card}>
      <Text style={chartStyles.cardTitle}>Daily Average</Text>
      <Text style={chartStyles.cardSubtitle}>{subtitleText}</Text>
      <View style={chartStyles.barsRow}>
        {durations.map((val, i) => {
          const barHeight = Math.max(4, (val / max) * BAR_MAX_HEIGHT);
          const isToday = i === todayIndex;
          return (
            <View key={i} style={chartStyles.barColumn}>
              <View
                style={[
                  chartStyles.bar,
                  { height: barHeight },
                  isToday ? chartStyles.barToday : chartStyles.barDefault,
                ]}
              />
              <Text style={[chartStyles.dayLabel, isToday && chartStyles.dayLabelToday]}>
                {DAY_LABELS[i]}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={chartStyles.totalRow}>
        <Text style={chartStyles.totalLabel}>Total Study Time</Text>
        <Text style={chartStyles.totalValue}>{totalText}</Text>
      </View>
    </View>
  );
}

const chartStyles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingTop: 9,
    paddingLeft: 15,
    paddingRight: 20,
    paddingBottom: 20,
    marginTop: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'RethinkSans-Regular',
    color: '#000',
  },
  cardSubtitle: {
    fontSize: 21,
    fontWeight: '600',
    fontFamily: 'RethinkSans-SemiBold',
    color: '#000',
    marginTop: 0,
    marginBottom: 0,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: BAR_MAX_HEIGHT + 24,
    marginTop: 22,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  bar: {
    width: '100%',
    borderRadius: 5,
  },
  barDefault: {
    backgroundColor: '#A3E2FF',
  },
  barToday: {
    backgroundColor: '#1EA1FF',
  },
  dayLabel: {
    fontSize: 15.37,
    fontWeight: '700',
    fontFamily: 'RethinkSans-Bold',
    color: '#686868',
    marginTop: 12,
  },
  dayLabelToday: {
    color: '#333',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 28,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'RethinkSans-Regular',
    color: '#000',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'RethinkSans-Regular',
    color: '#000',
  },
});

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
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'RethinkSans-Medium',
    color: '#000',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginTop: 24,
  },
  avatar: {
    width: 89,
    height: 89,
    borderRadius: 44.5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    marginLeft: 16,
    flex: 1,
    height: 89,
    overflow: 'hidden',
  },
  nameText: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'RethinkSans-Medium',
    color: '#000',
    marginTop: 6,
  },
  usernameText: {
    fontSize: 16,
    fontWeight: '400',
    fontFamily: 'RethinkSans-Regular',
    color: '#787878',
  },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  bioText: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'RethinkSans-Regular',
    color: '#333',

  },
  editIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
  tabBar: {
    flexDirection: 'row',
    width: '90%',
    marginTop: 27,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#E2E2E2',
  },
  activeTab: {
    borderBottomColor: '#000',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'RethinkSans-Medium',
    color: '#999',
  },
  activeTabText: {
    color: '#000',
  },
  content: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  emptyText: {
    fontSize: 15,
    color: '#999',
  },
  statBlock: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    width: 85,
    height: 33,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '500',
    fontFamily: 'RethinkSans-Regular',
    color: '#000',
  },
  statValue: {
    fontSize: 9,
    fontWeight: '500',
    fontFamily: 'RethinkSans-Regular',
    color: '#000',
  },
});
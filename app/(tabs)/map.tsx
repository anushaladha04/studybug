import AvatarIcon from '@/assets/icons/avatar.svg';
import { LocationUser, StudyMap } from '@/components/map';
import { fetchAllFriends } from '@/controllers/friends';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';

type FriendRow = {
  friend_id: string;
  full_name?: string | null;
  is_active?: boolean | null;
  location_name?: string | null;
  start_time?: string | null;
  profile_image_path?: string | null
};

type ActiveStudySessionRow = {
  session_id: string;
  user_id: string;
  session_name?: string | null,
  subject?: string | null;
  location_name?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  start_time?: string | null;
  focus_level?: string | null,
  note?: string;
};

type StudyType = 'Academic' | 'Career' | 'Personal';
type FocusLevel = 'High' | 'Medium' | 'Low';

type ActiveFriendMapItem = LocationUser & {
  friendUserId: string;
  pfpUrl?: string | null;
  startedAt?: string | null;
  studyType: StudyType;
  focusLevel: FocusLevel;
  note: string;
};

type AwayFriendItem = {
  friendUserId: string;
  name: string;
  pfpUrl?: string | null;
  lastActiveLabel: string;
};

const STUDY_TYPES: StudyType[] = ['Academic', 'Career', 'Personal'];
const FOCUS_LEVELS: FocusLevel[] = ['High', 'Medium', 'Low'];

const FOCUS_COLORS: Record<FocusLevel, string> = {
  High: '#e89a9a',
  Medium: '#e9cb8a',
  Low: '#9dcfa5',
};

const hashString = (value: string) => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
};

const pickDeterministic = <T,>(seed: string, options: T[]): T => {
  return options[hashString(seed) % options.length];
};

const formatDurationLabel = (startTime?: string | null) => {
  if (!startTime) return '1 hr 30 min';
  const start = new Date(startTime);
  if (Number.isNaN(start.getTime())) return '1 hr 30 min';
  const minutes = Math.max(1, Math.floor((Date.now() - start.getTime()) / 60000));
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (hours <= 0) return `${rem} min`;
  if (rem === 0) return `${hours} hr`;
  return `${hours} hr ${rem} min`;
};

const getAwayLabel = (startTime?: string | null) => {
  if (!startTime) return 'Last active 2 days ago';
  const dt = new Date(startTime);
  if (Number.isNaN(dt.getTime())) return 'Last active recently';
  const hours = Math.max(1, Math.floor((Date.now() - dt.getTime()) / 3600000));
  if (hours < 24) return `Last active ${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `Last active ${days} day${days === 1 ? '' : 's'} ago`;
};

const matchesSearch = (friend: ActiveFriendMapItem, query: string) => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [friend.name, friend.studying, friend.locationName ?? '', friend.studyType, friend.focusLevel]
    .join(' ')
    .toLowerCase()
    .includes(normalized);
};

export default function MapScreen() {
  const { height: windowHeight } = useWindowDimensions();
  const [selectedUser, setSelectedUser] = useState<ActiveFriendMapItem | null>(null);
  const [activeFriends, setActiveFriends] = useState<ActiveFriendMapItem[]>([]);
  const [awayFriends, setAwayFriends] = useState<AwayFriendItem[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStudyTypes, setSelectedStudyTypes] = useState<StudyType[]>([...STUDY_TYPES]);
  const [selectedFocusLevels, setSelectedFocusLevels] = useState<FocusLevel[]>([...FOCUS_LEVELS]);
  const [showActiveSection, setShowActiveSection] = useState(true);
  const [showAwaySection, setShowAwaySection] = useState(true);
  const [isFriendsSheetCollapsed, setIsFriendsSheetCollapsed] = useState(false);
  const [isFriendsSheetExpanded, setIsFriendsSheetExpanded] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [recenterTrigger, setRecenterTrigger] = useState(0);
  const collapsedSheetHeight = 76;
  const defaultSheetHeight = Math.max(250, Math.round(windowHeight * 0.35));
  const expandedSheetHeight = Math.max(defaultSheetHeight, Math.round(windowHeight * 0.9));
  const sheetHeightAnim = React.useRef(new Animated.Value(defaultSheetHeight)).current;
  const sheetHeightCurrentRef = React.useRef(defaultSheetHeight);
  const dragStartHeightRef = React.useRef(defaultSheetHeight);
  const collapsedSheetHeightRef = React.useRef(collapsedSheetHeight);
  const defaultSheetHeightRef = React.useRef(defaultSheetHeight);
  const expandedSheetHeightRef = React.useRef(expandedSheetHeight);
  const isFriendsSheetExpandedRef = React.useRef(isFriendsSheetExpanded);
  collapsedSheetHeightRef.current = collapsedSheetHeight;
  defaultSheetHeightRef.current = defaultSheetHeight;
  expandedSheetHeightRef.current = expandedSheetHeight;
  isFriendsSheetExpandedRef.current = isFriendsSheetExpanded;

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;
    let isMounted = true;
    let retryInterval: ReturnType<typeof setInterval> | null = null;
    let inFlight = false;

    const applyLocation = (location: Location.LocationObject | Location.LocationObjectCoords) => {
      const coords = 'coords' in location ? location.coords : location;
      if (!isMounted) return;
      setUserLocation({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setLocationError(null);
    };

    const getCurrentWithTimeout = (accuracy: Location.Accuracy, timeoutMs: number) =>
      Promise.race<Location.LocationObject>([
        Location.getCurrentPositionAsync({ accuracy }),
        new Promise<Location.LocationObject>((_, reject) =>
          setTimeout(() => reject(new Error('Location timeout')), timeoutMs)
        ),
      ]);

    const attemptLookup = async () => {
      if (!isMounted || inFlight) return;
      inFlight = true;
      try {
        const current = await getCurrentWithTimeout(Location.Accuracy.Balanced, 10000);
        applyLocation(current);
      } catch {
        try {
          const fallback = await getCurrentWithTimeout(Location.Accuracy.Low, 6000);
          applyLocation(fallback);
        } catch (error: any) {
          if (!isMounted) return;
          if (
            error?.message?.includes('timeout') ||
            error?.message?.includes('unavailable') ||
            error?.code === 'E_LOCATION_UNAVAILABLE'
          ) {
            setLocationError('Still trying to get your location...');
          } else {
            setLocationError('Using default location');
          }
        }
      } finally {
        inFlight = false;
      }
    };

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setLocationError('Location permission denied');
          return;
        }

        const enabled = await Location.hasServicesEnabledAsync();
        if (!enabled) {
          setLocationError('Location services are disabled');
          return;
        }

        try {
          const lastKnown = await Location.getLastKnownPositionAsync({
            maxAge: 120000,
            requiredAccuracy: 1000,
          });
          if (lastKnown) applyLocation(lastKnown);
        } catch {}

        try {
          subscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Highest,
              timeInterval: 1000,
              distanceInterval: 0,
            },
            (location) => applyLocation(location)
          );
        } catch {}

        await attemptLookup();
        retryInterval = setInterval(() => void attemptLookup(), 10000);
      } catch {
        if (isMounted) setLocationError('Location unavailable');
      }
    })();

    return () => {
      isMounted = false;
      if (retryInterval) clearInterval(retryInterval);
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchMapUsers = async () => {
      try {
        const friends = (await fetchAllFriends()) as FriendRow[];
        if (!isMounted) return;

        const friendIds = [...new Set(friends.map((friend) => friend.friend_id).filter(Boolean))];
        if (friendIds.length === 0) {
          setActiveFriends([]);
          setAwayFriends([]);
          return;
        }

        const friendNameById = new Map(
          friends.map((friend) => [friend.friend_id, friend.full_name?.trim() || 'Friend'])
        );
        const friendById = new Map(friends.map((friend) => [friend.friend_id, friend]));

        const { data, error } = await supabase
          .from('study_sessions')
          .select('session_id, user_id, session_name, subject, location_name, latitude, longitude, start_time, focus_level, note')
          .in('user_id', friendIds)
          .eq('is_active', true)
          .eq('is_public', true)
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) {
          console.error('Error fetching active friend study sessions:', error.message);
          if (isMounted) {
            setActiveFriends([]);
            setAwayFriends(
              friends.map((friend) => ({
                friendUserId: friend.friend_id,
                name: friend.full_name?.trim() || 'Friend',
                lastActiveLabel: getAwayLabel(friend.start_time),
              }))
            );
          }
          return;
        }

        const SUPABASE_URL = 'https://eabnnwzgebqtarbubyat.supabase.co';

        const getPublicUrl = (path: string) => {
            if (!path) 
                return null;
            return `${SUPABASE_URL}/storage/v1/object/public/profile_pictures/${path}`;
        };

        const mappedActive = ((data ?? []) as ActiveStudySessionRow[])
          .map((session): ActiveFriendMapItem | null => {
            const latitude = Number(session.latitude);
            const longitude = Number(session.longitude);
            if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

            const friendRecord = friendById.get(session.user_id);
    
            let publicPfpUrl = null;
            const rawAvatarPath = friendRecord?.profile_image_path;
            if (rawAvatarPath){
              publicPfpUrl = getPublicUrl(rawAvatarPath);
            } else {
              publicPfpUrl = 'avatar_4.jpg';
            }

            const rawSubject = session.subject?.trim();
            const studyType: StudyType = (['Academic', 'Career', 'Personal'].includes(rawSubject as any)) 
              ? (rawSubject as StudyType) 
              : 'Academic';

            const rawFocusLevel = session.focus_level?.trim();
            const focusLevel: FocusLevel = (['High', 'Medium', 'Low'].includes(rawFocusLevel as any)) 
              ? (rawFocusLevel as FocusLevel) 
              : 'Low';

            return {
              id: session.session_id,
              friendUserId: session.user_id,
              name: friendNameById.get(session.user_id) || 'Friend',
              pfpUrl: publicPfpUrl, 
              studying: session.session_name?.trim() || 'Studying',
              locationName: session.location_name?.trim() || friendById.get(session.user_id)?.location_name?.trim() || 'Powell Library',
              latitude,
              longitude,
              startedAt: session.start_time ?? friendById.get(session.user_id)?.start_time ?? null,
              studyType,
              focusLevel,
              note: session.note || 'Locked in for a study session.',
              pinColor: FOCUS_COLORS[focusLevel],
            };
          })
          .filter((value): value is ActiveFriendMapItem => value !== null);

        const activeUserIdSet = new Set(mappedActive.map((item) => item.friendUserId));
        const mappedAway = friends
          .filter((friend) => !activeUserIdSet.has(friend.friend_id))
          .map((friend) => {
            let publicPfpUrl = null;
            if (friend.profile_image_path) {
              publicPfpUrl = getPublicUrl(friend.profile_image_path);
            } else {
              publicPfpUrl = getPublicUrl('avatar_4.jpg');
            }

            return {
              friendUserId: friend.friend_id,
              name: friend.full_name?.trim() || 'Friend',
              pfpUrl: publicPfpUrl,
              lastActiveLabel: getAwayLabel(friend.start_time),
            };
          });

        if (!isMounted) return;
        setActiveFriends(mappedActive);
        setAwayFriends(mappedAway);
        setSelectedUser((prev) =>
          prev ? mappedActive.find((item) => item.id === prev.id) ?? null : null
        );
      } catch (error) {
        console.error('Error loading map users:', error);
        if (!isMounted) return;
        setActiveFriends([]);
        setAwayFriends([]);
      }
    };

    void fetchMapUsers();
    const interval = setInterval(() => void fetchMapUsers(), 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const visibleActiveFriends = activeFriends.filter(
    (friend) =>
      selectedStudyTypes.includes(friend.studyType) &&
      selectedFocusLevels.includes(friend.focusLevel) &&
      matchesSearch(friend, searchQuery)
  );

  const visibleAwayFriends = awayFriends.filter((friend) =>
    friend.name.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  const toggleStudyType = (value: StudyType) => {
    setSelectedStudyTypes((prev) => {
      if (prev.includes(value)) {
        return prev.length === 1 ? prev : prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const toggleFocusLevel = (value: FocusLevel) => {
    setSelectedFocusLevels((prev) => {
      if (prev.includes(value)) {
        return prev.length === 1 ? prev : prev.filter((item) => item !== value);
      }
      return [...prev, value];
    });
  };

  const openUserDetails = (user: ActiveFriendMapItem) => {
    setIsFriendsSheetCollapsed(false);
    if (sheetHeightCurrentRef.current <= collapsedSheetHeight + 2) {
      Animated.spring(sheetHeightAnim, {
        toValue: defaultSheetHeight,
        useNativeDriver: false,
        friction: 9,
        tension: 90,
      }).start();
      sheetHeightCurrentRef.current = defaultSheetHeight;
    }
    setSelectedUser(user);
  };

  const handleMapUserPress = (pressedUser: LocationUser) => {
    const match = activeFriends.find((friend) => friend.id === pressedUser.id);
    if (match) {
      openUserDetails(match);
    }
  };

  const showDetailSheet = Boolean(selectedUser);
  const showDetailSheetRef = React.useRef(showDetailSheet);
  showDetailSheetRef.current = showDetailSheet;
  const animateSheetToHeight = React.useCallback(
    (nextHeight: number) => {
      sheetHeightCurrentRef.current = nextHeight;
      Animated.spring(sheetHeightAnim, {
        toValue: nextHeight,
        useNativeDriver: false,
        friction: 9,
        tension: 90,
      }).start();
    },
    [sheetHeightAnim]
  );
  const setFriendsSheetMode = React.useCallback(
    (mode: 'collapsed' | 'default' | 'expanded') => {
      setIsFriendsSheetCollapsed(mode === 'collapsed');
      setIsFriendsSheetExpanded(mode === 'expanded');
      const targetHeight =
        mode === 'collapsed'
          ? collapsedSheetHeight
          : mode === 'expanded'
            ? expandedSheetHeight
            : defaultSheetHeight;
      animateSheetToHeight(targetHeight);
    },
    [
      animateSheetToHeight,
      collapsedSheetHeight,
      defaultSheetHeight,
      expandedSheetHeight,
    ]
  );
  const setFriendsSheetModeRef = React.useRef(setFriendsSheetMode);
  setFriendsSheetModeRef.current = setFriendsSheetMode;

  useEffect(() => {
    const targetHeight = isFriendsSheetCollapsed
      ? collapsedSheetHeight
      : isFriendsSheetExpanded
        ? expandedSheetHeight
        : defaultSheetHeight;

    sheetHeightCurrentRef.current = targetHeight;
    sheetHeightAnim.setValue(targetHeight);
  }, [
    collapsedSheetHeight,
    defaultSheetHeight,
    expandedSheetHeight,
    isFriendsSheetCollapsed,
    isFriendsSheetExpanded,
    sheetHeightAnim,
  ]);

  const friendsSheetHandlePanResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !showDetailSheetRef.current,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        !showDetailSheetRef.current &&
        Math.abs(gestureState.dy) > 8 &&
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        sheetHeightAnim.stopAnimation((value: number) => {
          dragStartHeightRef.current = value;
          sheetHeightCurrentRef.current = value;
        });
      },
      onPanResponderMove: (_, gestureState) => {
        if (showDetailSheetRef.current) return;
        const nextHeight = Math.max(
          collapsedSheetHeightRef.current,
          Math.min(expandedSheetHeightRef.current, dragStartHeightRef.current - gestureState.dy)
        );
        sheetHeightCurrentRef.current = nextHeight;
        sheetHeightAnim.setValue(nextHeight);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (showDetailSheetRef.current) return;
        const currentHeight = sheetHeightCurrentRef.current;
        const velocityY = gestureState.vy;
        const tapLike = Math.abs(gestureState.dy) < 8;

        if (tapLike) {
          setFriendsSheetModeRef.current(
            isFriendsSheetExpandedRef.current ? 'default' : 'expanded'
          );
          return;
        }

        if (velocityY < -0.35) {
          setFriendsSheetModeRef.current('expanded');
          return;
        }

        if (velocityY > 0.35) {
          const collapseThreshold =
            (collapsedSheetHeightRef.current + defaultSheetHeightRef.current) / 2;
          setFriendsSheetModeRef.current(
            currentHeight < collapseThreshold ? 'collapsed' : 'default'
          );
          return;
        }

        const snapPoints = [
          { mode: 'collapsed' as const, value: collapsedSheetHeightRef.current },
          { mode: 'default' as const, value: defaultSheetHeightRef.current },
          { mode: 'expanded' as const, value: expandedSheetHeightRef.current },
        ];
        const nearest = snapPoints.reduce((best, candidate) =>
          Math.abs(candidate.value - currentHeight) < Math.abs(best.value - currentHeight)
            ? candidate
            : best
        );
        setFriendsSheetModeRef.current(nearest.mode);
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <StudyMap
        users={visibleActiveFriends}
        onUserPress={handleMapUserPress}
        showUserLocation
        userLocation={userLocation}
        showMapboxBadge={false}
        showZoomControls={false}
        showRecenterControl={false}
        recenterTrigger={recenterTrigger}
        showMarkerLabels={false}
      />

      <View pointerEvents="box-none" style={styles.overlayLayer}>
        {showFilters ? (
          <Pressable
            style={styles.filterDismissBackdrop}
            onPress={() => setShowFilters(false)}
          />
        ) : null}

        <View style={styles.topOverlay}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color="#7a7a7a" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search location, friends, focus levels..."
              placeholderTextColor="#8b8b8b"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {showFilters ? (
            <View style={styles.filtersPanel}>
              <Text style={styles.filterGroupTitle}>Study Type</Text>
              <View style={styles.pillWrap}>
                {STUDY_TYPES.map((type) => (
                  <FilterPill
                    key={type}
                    label={type}
                    selected={selectedStudyTypes.includes(type)}
                    onPress={() => toggleStudyType(type)}
                  />
                ))}
              </View>

              <Text style={[styles.filterGroupTitle, styles.filterGroupTitleSpaced]}>Focus Level</Text>
              <View style={styles.pillWrap}>
                {FOCUS_LEVELS.map((level) => (
                  <FilterPill
                    key={level}
                    label={level}
                    selected={selectedFocusLevels.includes(level)}
                    onPress={() => toggleFocusLevel(level)}
                    dotColor={FOCUS_COLORS[level]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.quickChipsRow}>
              {STUDY_TYPES.map((type) => (
                <FilterPill
                  key={type}
                  label={type}
                  selected={selectedStudyTypes.includes(type)}
                  onPress={() => toggleStudyType(type)}
                  compact
                />
              ))}
              <Pressable style={styles.filterIconButton} onPress={() => setShowFilters(true)}>
                <Ionicons name="options-outline" size={22} color="#111" />
              </Pressable>
            </View>
          )}
        </View>

        {locationError && (
          <View style={styles.locationBanner}>
            <Text style={styles.locationBannerText}>{locationError}</Text>
          </View>
        )}

        {userLocation && (
          <Animated.View
            pointerEvents="box-none"
            style={[
              styles.recenterButtonWrap,
              { bottom: Animated.add(sheetHeightAnim, new Animated.Value(20)) },
            ]}>
            <Pressable
              style={styles.recenterButton}
              onPress={() => setRecenterTrigger((value) => value + 1)}>
              <Ionicons name="navigate" size={18} color="#1d1d1f" />
            </Pressable>
          </Animated.View>
        )}

        <Animated.View style={[styles.bottomSheet, { height: sheetHeightAnim }]}>
          <View style={styles.sheetTopBar} {...friendsSheetHandlePanResponder.panHandlers}>
            <View style={styles.sheetHandle} />
          </View>

          {isFriendsSheetCollapsed && !showDetailSheet ? (
            <View style={styles.collapsedSheetHeader}>
              <Text style={styles.sheetTitle}>Friends</Text>
              <Pressable
                hitSlop={8}
                onPress={() => setFriendsSheetMode('default')}
                style={styles.closeButton}>
                <Ionicons name="chevron-up" size={22} color="#707070" />
              </Pressable>
            </View>
          ) : null}

          {!isFriendsSheetCollapsed && showDetailSheet ? (
            <View style={styles.sheetContent}>
              <View style={styles.sheetHeaderRow}>
                <Text style={styles.sheetTitle}>{selectedUser?.name}</Text>
                <Pressable
                  hitSlop={8}
                  onPress={() => setSelectedUser(null)}
                  style={styles.closeButton}>
                  <Ionicons name="close" size={26} color="#707070" />
                </Pressable>
              </View>

              <View style={styles.detailList}>
                <Text style={styles.detailLine}>Location: {selectedUser?.locationName ?? 'Unknown location'}</Text>
                <Text style={styles.detailLine}>Focus Level: {selectedUser?.focusLevel}</Text>
                <Text style={styles.detailLine}>Study Type: {selectedUser?.studyType}</Text>
                <Text style={styles.detailLine}>Note: {selectedUser?.note}</Text>
              </View>
            </View>
          ) : !isFriendsSheetCollapsed ? (
            <ScrollView
              style={styles.sheetScroll}
              contentContainerStyle={styles.sheetScrollContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.sheetHeaderRow}>
                <Text style={styles.sheetTitle}>Friends</Text>
                <Pressable
                  hitSlop={8}
                  onPress={() => {
                    setFriendsSheetMode('collapsed');
                  }}
                  style={styles.closeButton}>
                  <Ionicons name="close" size={26} color="#707070" />
                </Pressable>
              </View>

              <SectionHeader
                label="Currently Studying"
                expanded={showActiveSection}
                onPress={() => setShowActiveSection((prev) => !prev)}
              />
              {showActiveSection &&
                (visibleActiveFriends.length > 0 ? (
                  visibleActiveFriends.map((friend) => (
                    <FriendRowItem
                      key={friend.id}
                      name={friend.name}
                      pfpUrl={friend.pfpUrl}
                      subtitleLeft={friend.locationName ?? 'Powell Library'}
                      subtitleRight={friend.studyType}
                      rightText={formatDurationLabel(friend.startedAt)}
                      onPress={() => openUserDetails(friend)}
                    />
                  ))
                ) : (
                  <Text style={styles.emptySectionText}>No active friends match these filters.</Text>
                ))}

              <SectionHeader
                label="Away"
                expanded={showAwaySection}
                onPress={() => setShowAwaySection((prev) => !prev)}
              />
              {showAwaySection &&
                (visibleAwayFriends.length > 0 ? (
                  visibleAwayFriends.map((friend) => (
                    <FriendRowItem
                      key={friend.friendUserId}
                      name={friend.name}
                      pfpUrl={friend.pfpUrl}
                      subtitleLeft={friend.lastActiveLabel}
                    />
                  ))
                ) : (
                  <Text style={styles.emptySectionText}>No away friends match this search.</Text>
                ))}
            </ScrollView>
          ) : null}
        </Animated.View>
      </View>
    </View>
  );
}

function SectionHeader({
  label,
  expanded,
  onPress,
}: {
  label: string;
  expanded: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.sectionHeader} onPress={onPress}>
      <Text style={styles.sectionHeaderText}>{label}</Text>
      <Ionicons
        name={expanded ? 'chevron-up' : 'chevron-down'}
        size={16}
        color="#5b5b5b"
      />
    </Pressable>
  );
}

function FilterPill({
  label,
  selected,
  onPress,
  dotColor,
  compact = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  dotColor?: string;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterPill,
        compact && styles.filterPillCompact,
        selected && styles.filterPillSelected,
      ]}>
      {dotColor ? <View style={[styles.pillDot, { backgroundColor: dotColor }]} /> : null}
      <Text style={[styles.filterPillText, selected && styles.filterPillTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function FriendRowItem({
  name,
  pfpUrl,
  subtitleLeft,
  subtitleRight,
  rightText,
  onPress,
}: {
  name: string;
  pfpUrl?: string | null;
  subtitleLeft: string;
  subtitleRight?: string;
  rightText?: string;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? Pressable : View;

  return (
    <Wrapper style={styles.friendRow} onPress={onPress as any}>
      {pfpUrl ? (
        <Image 
          source={{ uri: pfpUrl }} 
          style={styles.avatarCircle} 
        />
      ) : (
        <AvatarIcon />
      )}
      <View style={styles.friendTextBlock}>
        <Text style={styles.friendName}>{name}</Text>
        <View style={styles.friendMetaRow}>
          <Ionicons name="location-outline" size={13} color="#333" />
          <Text style={styles.friendMetaText}>{subtitleLeft}</Text>
          {subtitleRight ? (
            <>
              <Ionicons name="book-outline" size={13} color="#333" style={styles.inlineIcon} />
              <Text style={styles.friendMetaText}>{subtitleRight}</Text>
            </>
          ) : null}
        </View>
      </View>
      {rightText ? (
        <View style={styles.friendRightWrap}>
          <Ionicons name="time-outline" size={13} color="#333" />
          <Text style={styles.friendRightText}>{rightText}</Text>
        </View>
      ) : null}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dcdcdc',
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  filterDismissBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  topOverlay: {
    paddingTop: 54,
    paddingHorizontal: 18,
    gap: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    backgroundColor: '#f4f4f4',
    borderRadius: 22,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#202020',
    paddingVertical: 0,
  },
  quickChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 2,
  },
  filterIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1d1d1d',
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersPanel: {
    backgroundColor: 'rgba(245,245,245,0.95)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#bcbcbc',
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterGroupTitle: {
    fontSize: 14,
    color: '#222',
    marginBottom: 8,
  },
  filterGroupTitleSpaced: {
    marginTop: 10,
  },
  pillWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterPill: {
    minHeight: 34,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#b8b8b8',
    backgroundColor: '#f7f7f7',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterPillCompact: {
    minHeight: 32,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(245,245,245,0.95)',
    borderColor: '#3b3b3b',
  },
  filterPillSelected: {
    backgroundColor: '#e7e7e7',
    borderColor: '#1f1f1f',
  },
  filterPillText: {
    fontSize: 14,
    color: '#222',
  },
  filterPillTextSelected: {
    color: '#111',
    fontWeight: '500',
  },
  pillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  locationBanner: {
    position: 'absolute',
    top: 112,
    left: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#d1d1d1',
  },
  locationBannerText: {
    fontSize: 12,
    color: '#4d4d4d',
  },
  recenterButtonWrap: {
    position: 'absolute',
    right: 18,
  },
  recenterButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderWidth: 1,
    borderColor: '#d0d0d0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f3f3f3',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: '#d0d0d0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 8,
  },
  sheetTopBar: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    minHeight: 40,
    marginBottom: 2,
  },
  sheetHandle: {
    width: 68,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#c6c6c6',
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: 6,
  },
  collapsedSheetHeader: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 22,
  },
  sheetContent: {
    paddingHorizontal: 16,
    paddingBottom: 22,
    minHeight: 220,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#171717',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionHeaderText: {
    fontSize: 15,
    color: '#1f1f1f',
  },
  friendRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#cbcbcb',
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#9a9a9a',
    marginRight: 10,
  },
  friendTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  friendName: {
    fontSize: 16,
    color: '#1b1b1b',
  },
  friendMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexWrap: 'wrap',
  },
  friendMetaText: {
    fontSize: 12,
    color: '#2f2f2f',
    marginLeft: 2,
    marginRight: 6,
  },
  inlineIcon: {
    marginLeft: 2,
  },
  friendRightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  friendRightText: {
    fontSize: 12,
    color: '#2f2f2f',
    marginLeft: 2,
  },
  emptySectionText: {
    fontSize: 13,
    color: '#666',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#cbcbcb',
  },
  detailList: {
    marginTop: 8,
    gap: 12,
  },
  detailLine: {
    fontSize: 15,
    color: '#181818',
    lineHeight: 22,
  },
});

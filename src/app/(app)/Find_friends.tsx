import { useRouter } from 'expo-router';
import { Check, MessageCircle, Phone, Search, UserPlus, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { BottomTabInset, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type FriendRequest = { id: string; name: string; avatar: string; mutual: number };
type Friend = { id: string; name: string; avatar: string; online: boolean; lastSeen?: string };
type Suggestion = { id: string; name: string; avatar: string; mutual: number; status: 'none' | 'pending' };

const INITIAL_REQUESTS: FriendRequest[] = [
  { id: 'r1', name: 'Efia Owusu', avatar: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=200&q=80', mutual: 4 },
  { id: 'r2', name: 'Yaw Adjei', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', mutual: 1 },
];

const INITIAL_FRIENDS: Friend[] = [
  { id: 'f1', name: 'Maya Torres', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', online: true },
  { id: 'f2', name: 'Kwame Mensah', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', online: true },
  { id: 'f3', name: 'Noor Ahmed', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80', online: false, lastSeen: '2h ago' },
  { id: 'f4', name: 'Daniel Boateng', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', online: false, lastSeen: 'Yesterday' },
];

const INITIAL_SUGGESTIONS: Suggestion[] = [
  { id: 's1', name: 'Sarah Osei', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', mutual: 6, status: 'none' },
  { id: 's2', name: 'Nora Sarpong', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80', mutual: 2, status: 'none' },
  { id: 's3', name: 'Kojo Boadi', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80', mutual: 3, status: 'none' },
];

export default function FindFriendsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorScheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [friends, setFriends] = useState(INITIAL_FRIENDS);
  const [suggestions, setSuggestions] = useState(INITIAL_SUGGESTIONS);
  const [query, setQuery] = useState('');

  const acceptRequest = (request: FriendRequest) => {
    setRequests((items) => items.filter((r) => r.id !== request.id));
    setFriends((items) => [{ id: request.id, name: request.name, avatar: request.avatar, online: false, lastSeen: 'Just now' }, ...items]);
  };

  const declineRequest = (id: string) => setRequests((items) => items.filter((r) => r.id !== id));

  const toggleConnect = (id: string) =>
    setSuggestions((items) => items.map((s) => (s.id === id ? { ...s, status: s.status === 'pending' ? 'none' : 'pending' } : s)));

  const filteredFriends = friends.filter((f) => f.name.toLowerCase().includes(query.trim().toLowerCase()));
  const filteredSuggestions = suggestions.filter((s) => s.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <View style={styles.container}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>UNIVERSAL</Text>
            <Text style={styles.title}>Find Friends</Text>
          </View>
          <View style={styles.headerIcon}>
            <UserPlus size={20} color={theme.primary} strokeWidth={2} />
          </View>
        </View>

        <View style={styles.searchBox}>
          <Search size={17} color={theme.textSecondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by name"
            placeholderTextColor={theme.textSecondary}
            style={styles.searchInput}
          />
        </View>

        {requests.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionTitle}>Friend requests</Text>
              <View style={styles.countPill}><Text style={styles.countPillText}>{requests.length}</Text></View>
            </View>
            {requests.map((request) => (
              <View key={request.id} style={styles.requestCard}>
                <Avatar source={request.avatar} styles={styles} size={52} />
                <View style={styles.requestCopy}>
                  <Text style={styles.name}>{request.name}</Text>
                  <Text style={styles.meta}>{request.mutual} mutual friend{request.mutual !== 1 ? 's' : ''}</Text>
                  <View style={styles.requestActions}>
                    <TouchableOpacity style={styles.acceptButton} onPress={() => acceptRequest(request)} activeOpacity={0.85}>
                      <Check size={15} color="#fff" strokeWidth={2.5} />
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.declineButton} onPress={() => declineRequest(request.id)} activeOpacity={0.75}>
                      <X size={15} color={theme.textSecondary} strokeWidth={2.5} />
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        <Text style={[styles.sectionTitle, { marginTop: 28, paddingHorizontal: 24 }]}>Your friends</Text>
        {filteredFriends.length === 0 ? (
          <Text style={styles.emptyRowText}>No friends match your search.</Text>
        ) : (
          filteredFriends.map((friend) => (
            <View key={friend.id} style={styles.friendRow}>
              <View style={styles.friendAvatarWrap}>
                <Avatar source={friend.avatar} styles={styles} size={50} />
                {friend.online && <View style={styles.onlineDot} />}
              </View>
              <View style={styles.friendCopy}>
                <Text style={styles.name}>{friend.name}</Text>
                <Text style={styles.meta}>{friend.online ? 'Online' : `Last seen ${friend.lastSeen}`}</Text>
              </View>
              <TouchableOpacity style={styles.iconButton} hitSlop={6}>
                <Phone size={17} color={theme.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} hitSlop={6} onPress={() => router.push('/(public)/new_chat')}>
                <MessageCircle size={17} color={theme.primary} />
              </TouchableOpacity>
            </View>
          ))
        )}

        <Text style={[styles.sectionTitle, { marginTop: 28, paddingHorizontal: 24 }]}>People you may know</Text>
        {filteredSuggestions.length === 0 ? (
          <Text style={styles.emptyRowText}>No suggestions match your search.</Text>
        ) : (
          filteredSuggestions.map((suggestion) => {
            const pending = suggestion.status === 'pending';
            return (
              <View key={suggestion.id} style={styles.friendRow}>
                <Avatar source={suggestion.avatar} styles={styles} size={50} />
                <View style={styles.friendCopy}>
                  <Text style={styles.name}>{suggestion.name}</Text>
                  <Text style={styles.meta}>{suggestion.mutual} mutual friend{suggestion.mutual !== 1 ? 's' : ''}</Text>
                </View>
                <TouchableOpacity
                  style={pending ? styles.pendingButton : styles.connectButton}
                  onPress={() => toggleConnect(suggestion.id)}
                  activeOpacity={0.85}
                >
                  {!pending && <UserPlus size={14} color="#fff" strokeWidth={2.5} />}
                  <Text style={pending ? styles.pendingButtonText : styles.connectButtonText}>{pending ? 'Requested' : 'Connect'}</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function Avatar({ source, size, styles }: { source: string; size: number; styles: ReturnType<typeof createStyles> }) {
  return <Image source={{ uri: source }} style={[styles.avatarImage, { width: size, height: size, borderRadius: size * 0.36 }]} />;
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { paddingTop: Platform.OS === 'ios' ? 58 : 44, paddingBottom: BottomTabInset + 40 },
  header: { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: theme.primary, fontFamily: Fonts?.sansBold, fontSize: 10, letterSpacing: 1.5 },
  title: { color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 30, letterSpacing: -0.8 },
  headerIcon: { width: 43, height: 43, borderRadius: 15, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' },

  searchBox: { marginHorizontal: 24, marginTop: 18, borderRadius: 16, backgroundColor: theme.backgroundElement, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 14, height: 46 },
  searchInput: { flex: 1, color: theme.text, fontFamily: Fonts?.sans, fontSize: 14 },

  sectionRow: { marginTop: 26, marginBottom: 12, paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 16 },
  countPill: { minWidth: 20, height: 20, paddingHorizontal: 5, borderRadius: 10, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  countPillText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 11 },

  requestCard: { marginHorizontal: 24, marginBottom: 10, padding: 15, borderRadius: 20, backgroundColor: theme.backgroundElement, flexDirection: 'row', gap: 12 },
  requestCopy: { flex: 1 },
  requestActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  acceptButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 12, backgroundColor: theme.primary, paddingHorizontal: 16 },
  acceptButtonText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 13 },
  declineButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, height: 38, borderRadius: 12, backgroundColor: theme.background, paddingHorizontal: 16 },
  declineButtonText: { color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 13 },

  friendRow: { marginHorizontal: 24, marginBottom: 8, paddingVertical: 6, flexDirection: 'row', alignItems: 'center', gap: 12 },
  friendAvatarWrap: { position: 'relative' },
  onlineDot: { position: 'absolute', bottom: 1, right: 1, width: 12, height: 12, borderRadius: 6, backgroundColor: '#34C759', borderWidth: 2, borderColor: theme.background },
  friendCopy: { flex: 1 },
  name: { color: theme.text, fontFamily: Fonts?.sansSemiBold, fontSize: 15 },
  meta: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 2 },
  iconButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

  connectButton: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, borderRadius: 18, backgroundColor: theme.primary, paddingHorizontal: 14 },
  connectButtonText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 12.5 },
  pendingButton: { height: 36, borderRadius: 18, borderWidth: 1, borderColor: theme.backgroundElement, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  pendingButtonText: { color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 12.5 },

  avatarImage: { backgroundColor: theme.backgroundElement },
  emptyRowText: { paddingHorizontal: 24, color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13 },
});
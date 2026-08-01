import { useRouter } from 'expo-router';
import { Bell, Camera, PenLine, Plus, Send } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Image, Modal, Platform, RefreshControl, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { GradientWrapper } from '@/components/gradient-wrapper';
import { BottomTabInset, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { getCurrentProfile, ProfileRecord } from '@/lib/profile';
import { createStatusPost, FeedPostRecord, getFeedPosts } from '@/lib/posts';

const initialsFor = (name: string) => name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'U';
const timeAgo = (timestamp: string) => {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000));
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ago`;
  return `${Math.floor(minutes / 1440)}d ago`;
};

export default function UpdatesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorScheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [composer, setComposer] = useState(false);
  const [note, setNote] = useState('');
  const [profile, setProfile] = useState<ProfileRecord | null>(null);
  const [posts, setPosts] = useState<FeedPostRecord[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [posting, setPosting] = useState(false);

  const load = useCallback(async (showRefresh = true) => {
    if (showRefresh) setRefreshing(true);
    try {
      const [currentProfile, feed] = await Promise.all([getCurrentProfile(), getFeedPosts(50)]);
      setProfile(currentProfile);
      setPosts(feed);
    } catch (error) {
      console.warn('[status] failed to load', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { void load(false); }, 0);
    return () => clearTimeout(timer);
  }, [load]);

  const share = async () => {
    const content = note.trim();
    if (!content || posting) return;
    setPosting(true);
    try {
      await createStatusPost(content);
      setNote('');
      setComposer(false);
      await load();
    } catch (error) {
      Alert.alert('Unable to share status', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const ownName = profile?.full_name || profile?.username || 'My profile';

  return (
    <View style={styles.container}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load()} tintColor={theme.primary} />}>
        <View style={styles.header}>
          <View><Text style={styles.eyebrow}>UNIVERSAL</Text><Text style={styles.title}>Status</Text></View>
          <TouchableOpacity style={styles.bell}><Bell size={19} color={theme.text} /></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.myStatusCard} activeOpacity={0.85} onPress={() => setComposer(true)}>
          <View style={styles.myStatusRingWrap}>
            <GradientWrapper colors={['#4361EE', '#7955D9']} style={styles.myStatusRing}>
              <View style={styles.avatarWrap}>{profile?.avatar_url ? <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} /> : <Text style={styles.initials}>{initialsFor(ownName)}</Text>}</View>
            </GradientWrapper>
            <View style={styles.addBadge}><Plus size={13} color="#fff" strokeWidth={2.6} /></View>
          </View>
          <View style={styles.myStatusCopy}><Text style={styles.myStatusTitle}>My status</Text><Text style={styles.subtitle}>Tap to share something with your contacts</Text></View>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.action} onPress={() => setComposer(true)}><PenLine size={17} color={theme.primary} /></TouchableOpacity>
            <TouchableOpacity style={styles.action} onPress={() => router.push('/(public)/status_camera')}><Camera size={17} color={theme.primary} /></TouchableOpacity>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Recent updates</Text>
        {!refreshing && posts.length === 0 ? (
          <View style={styles.empty}><Text style={styles.emptyTitle}>No status updates yet</Text><Text style={styles.subtitle}>Your first status will appear here after you share it.</Text></View>
        ) : posts.map((post, index) => {
          const name = post.profiles?.full_name || post.profiles?.username || 'Universal user';
          return (
            <View key={post.id} style={styles.updateCard}>
              <GradientWrapper colors={index % 2 ? ['#3C9CA2', '#00A6A6'] : ['#7955D9', '#4361EE']} style={styles.updateRing}>
                <View style={styles.updateAvatar}>{post.profiles?.avatar_url ? <Image source={{ uri: post.profiles.avatar_url }} style={styles.avatarImage} /> : <Text style={styles.updateInitials}>{initialsFor(name)}</Text>}</View>
              </GradientWrapper>
              <View style={styles.updateCopy}><View style={styles.updateHeader}><Text style={styles.updateName}>{name}</Text><Text style={styles.updateTime}>{timeAgo(post.created_at)}</Text></View><Text style={styles.updateContent}>{post.content}</Text></View>
            </View>
          );
        })}
      </ScrollView>

      <Modal visible={composer} animationType="slide" transparent onRequestClose={() => setComposer(false)}>
        <View style={styles.overlay}><View style={styles.sheet}>
          <View style={styles.sheetHandle} />
          <View style={styles.sheetHeader}><View><Text style={styles.sheetTitle}>New status</Text><Text style={styles.subtitle}>Share a live update with your contacts.</Text></View><TouchableOpacity onPress={() => setComposer(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity></View>
          <View style={styles.noteBox}><PenLine size={18} color={theme.textSecondary} style={{ marginTop: 13 }} /><TextInput autoFocus multiline value={note} onChangeText={setNote} maxLength={500} placeholder="What's on your mind?" placeholderTextColor={theme.textSecondary} style={styles.noteInput} /></View>
          <TouchableOpacity style={[styles.postButton, (!note.trim() || posting) && { opacity: 0.45 }]} onPress={share} disabled={!note.trim() || posting}><Send size={18} color="#fff" /><Text style={styles.postText}>{posting ? 'Posting...' : 'Post status'}</Text></TouchableOpacity>
        </View></View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { paddingTop: Platform.OS === 'ios' ? 58 : 44, paddingBottom: BottomTabInset + 40 },
  header: { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: theme.primary, fontFamily: Fonts?.sansBold, fontSize: 10, letterSpacing: 1.5 },
  title: { color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 35, letterSpacing: -1.2 },
  bell: { width: 43, height: 43, borderRadius: 15, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  myStatusCard: { marginHorizontal: 24, marginTop: 22, padding: 16, borderRadius: 26, backgroundColor: theme.backgroundElement, flexDirection: 'row', alignItems: 'center', gap: 14 },
  myStatusRingWrap: { position: 'relative' }, myStatusRing: { width: 68, height: 68, borderRadius: 25, padding: 3 },
  avatarWrap: { flex: 1, borderRadius: 22, backgroundColor: theme.background, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, avatarImage: { width: '100%', height: '100%' }, initials: { color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 19 },
  addBadge: { position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: theme.backgroundElement },
  myStatusCopy: { flex: 1 }, myStatusTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 17 }, subtitle: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 4, lineHeight: 17 },
  actions: { gap: 8 }, action: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { paddingHorizontal: 24, marginTop: 28, marginBottom: 12, color: theme.textSecondary, fontFamily: Fonts?.sansBold, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { marginHorizontal: 24, borderRadius: 20, padding: 22, backgroundColor: theme.backgroundElement }, emptyTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 15 },
  updateCard: { marginHorizontal: 24, marginBottom: 12, padding: 14, borderRadius: 20, backgroundColor: theme.backgroundElement, flexDirection: 'row', gap: 12 },
  updateRing: { width: 50, height: 50, borderRadius: 18, padding: 2 }, updateAvatar: { flex: 1, borderRadius: 16, backgroundColor: theme.background, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }, updateInitials: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 12 },
  updateCopy: { flex: 1 }, updateHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 }, updateName: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 14 }, updateTime: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 10 }, updateContent: { color: theme.text, fontFamily: Fonts?.sans, fontSize: 13.5, lineHeight: 19, marginTop: 6 },
  overlay: { flex: 1, backgroundColor: 'rgba(3,7,18,0.35)', justifyContent: 'flex-end' }, sheet: { backgroundColor: theme.background, padding: 24, paddingBottom: 36, borderTopLeftRadius: 30, borderTopRightRadius: 30 }, sheetHandle: { width: 38, height: 4, borderRadius: 3, backgroundColor: theme.backgroundSelected, alignSelf: 'center', marginBottom: 19 }, sheetHeader: { flexDirection: 'row', justifyContent: 'space-between' }, sheetTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 19 }, cancel: { color: theme.primary, fontFamily: Fonts?.sansSemiBold, fontSize: 13 },
  noteBox: { minHeight: 125, backgroundColor: theme.backgroundElement, borderRadius: 18, marginTop: 19, flexDirection: 'row', paddingHorizontal: 14, gap: 10 }, noteInput: { flex: 1, color: theme.text, fontFamily: Fonts?.sans, fontSize: 15, textAlignVertical: 'top', paddingTop: 13 }, postButton: { marginTop: 16, height: 52, borderRadius: 18, backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }, postText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 15 },
});

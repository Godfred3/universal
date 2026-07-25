import { useRouter } from 'expo-router';
import { Bell, Camera, ChevronRight, PenLine, Plus, Send } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { GradientWrapper } from '@/components/gradient-wrapper';
import { BottomTabInset, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type StatusUpdate = {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  colors: readonly [string, string];
  count: number;
  timeAgo: string;
  viewed: boolean;
  isGroup?: boolean;
};

const VIEWED_RING = ['#D9D9E3', '#D9D9E3'] as const;

const STATUS_UPDATES: StatusUpdate[] = [
  { id: 'u1', name: 'Maya Torres', initials: 'MT', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80', colors: ['#7955D9', '#4361EE'], count: 3, timeAgo: '12m', viewed: false },
  { id: 'u2', name: 'Kwame Mensah', initials: 'KM', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80', colors: ['#3C9CA2', '#00A6A6'], count: 1, timeAgo: '38m', viewed: false },
  { id: 'u3', name: 'Family 🏠', initials: 'F', colors: ['#4361EE', '#7955D9'], count: 5, timeAgo: '1h', viewed: false, isGroup: true },
  { id: 'u4', name: 'Noor Ahmed', initials: 'NA', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80', colors: ['#D28E4B', '#F5B942'], count: 2, timeAgo: '3h', viewed: true },
  { id: 'u5', name: 'Daniel Boateng', initials: 'DB', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80', colors: ['#E85AAD', '#7955D9'], count: 1, timeAgo: 'Yesterday', viewed: true },
];

export default function UpdatesScreen() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorScheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [composer, setComposer] = useState(false);
  const [note, setNote] = useState('');

  const recent = STATUS_UPDATES.filter((u) => !u.viewed);
  const viewed = STATUS_UPDATES.filter((u) => u.viewed);

  return (
    <View style={styles.container}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>UNIVERSAL</Text>
            <Text style={styles.title}>Status</Text>
          </View>
          <TouchableOpacity style={styles.bell}><Bell size={19} color={theme.text} /></TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.myStatusCard} activeOpacity={0.85} onPress={() => setComposer(true)}>
          <View style={styles.myStatusRingWrap}>
            <GradientWrapper colors={['#4361EE', '#7955D9']} style={styles.myStatusRing}>
              <View style={styles.myStatusAvatarWrap}>
                <Text style={styles.myStatusInitials}>JD</Text>
              </View>
            </GradientWrapper>
            <View style={styles.myStatusAddBadge}><Plus size={13} color="#fff" strokeWidth={2.6} /></View>
          </View>
          <View style={styles.myStatusCopy}>
            <Text style={styles.myStatusTitle}>My status</Text>
            <Text style={styles.myStatusSubtitle}>Tap to share a photo, video, or write something</Text>
          </View>
          <View style={styles.myStatusActions}>
            <TouchableOpacity style={styles.myStatusActionButton} onPress={() => setComposer(true)} hitSlop={8}>
              <PenLine size={17} color={theme.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.myStatusActionButton} onPress={() => router.push('/(public)/status_camera')} hitSlop={8}>
              <Camera size={17} color={theme.primary} />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {recent.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Recent updates</Text>
            {recent.map((update) => (
              <StatusRow key={update.id} update={update} styles={styles} theme={theme} />
            ))}
          </>
        )}

        {viewed.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 26 }]}>Viewed updates</Text>
            {viewed.map((update) => (
              <StatusRow key={update.id} update={update} styles={styles} theme={theme} />
            ))}
          </>
        )}
      </ScrollView>

      <Modal visible={composer} animationType="slide" transparent onRequestClose={() => setComposer(false)}>
        <View style={styles.overlay}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <View>
                <Text style={styles.sheetTitle}>New status</Text>
                <Text style={styles.sheetSub}>Visible to your contacts for 24 hours.</Text>
              </View>
              <TouchableOpacity onPress={() => setComposer(false)}><Text style={styles.cancel}>Cancel</Text></TouchableOpacity>
            </View>
            <View style={styles.noteBox}>
              <PenLine size={18} color={theme.textSecondary} style={{ marginTop: 13 }} />
              <TextInput autoFocus multiline value={note} onChangeText={setNote} placeholder="What's on your mind?" placeholderTextColor={theme.textSecondary} style={styles.noteInput} />
            </View>
            <TouchableOpacity style={[styles.postButton, !note.trim() && { opacity: 0.45 }]} onPress={() => { if (note.trim()) { setNote(''); setComposer(false); } }}>
              <Send size={18} color="#fff" />
              <Text style={styles.postText}>Post status</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.fabStack}>
        <TouchableOpacity style={styles.editFab} onPress={() => setComposer(true)}>
          <PenLine size={18} color={theme.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cameraFab} onPress={() => router.push('/(public)/status_camera')}>
          <Camera size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function StatusRow({ update, styles, theme }: { update: StatusUpdate; styles: ReturnType<typeof createStyles>; theme: ReturnType<typeof useTheme> }) {
  return (
    <TouchableOpacity style={styles.updateRow} activeOpacity={0.75}>
      <View style={styles.updateRingWrap}>
        <GradientWrapper colors={update.viewed ? VIEWED_RING : update.colors} style={styles.updateRing}>
          <View style={styles.updateAvatarWrap}>
            {update.avatar ? (
              <Text style={styles.updateInitials}>{update.initials}</Text>
            ) : (
              <Text style={styles.updateInitials}>{update.initials}</Text>
            )}
          </View>
        </GradientWrapper>
        <View style={styles.updateCountBadge}><Text style={styles.updateCountText}>{update.count}</Text></View>
      </View>
      <View style={styles.updateCopy}>
        <Text style={styles.updateName}>{update.name}</Text>
        <Text style={styles.updateMeta}>{update.count} update{update.count > 1 ? 's' : ''} · {update.timeAgo}</Text>
      </View>
      <ChevronRight size={18} color={theme.textSecondary} />
    </TouchableOpacity>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { paddingTop: Platform.OS === 'ios' ? 58 : 44, paddingBottom: BottomTabInset + 40 },
  header: { paddingHorizontal: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: theme.primary, fontFamily: Fonts?.sansBold, fontSize: 10, letterSpacing: 1.5 },
  title: { color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 35, letterSpacing: -1.2 },
  bell: { width: 43, height: 43, borderRadius: 15, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' },

  myStatusCard: {
    marginHorizontal: 24,
    marginTop: 22,
    padding: 16,
    borderRadius: 26,
    backgroundColor: theme.backgroundElement,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  myStatusRingWrap: { position: 'relative' },
  myStatusRing: { width: 72, height: 72, borderRadius: 26, padding: 3, alignItems: 'center', justifyContent: 'center' },
  myStatusAvatarWrap: { width: '100%', height: '100%', borderRadius: 23, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' },
  myStatusInitials: { color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 20 },
  myStatusAddBadge: { position: 'absolute', bottom: -2, right: -2, width: 24, height: 24, borderRadius: 12, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: theme.backgroundElement },
  myStatusCopy: { flex: 1 },
  myStatusTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 17 },
  myStatusSubtitle: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 4, lineHeight: 17 },
  myStatusActions: { gap: 10 },
  myStatusActionButton: { width: 36, height: 36, borderRadius: 12, backgroundColor: theme.background, alignItems: 'center', justifyContent: 'center' },

  sectionTitle: { paddingHorizontal: 24, marginTop: 26, marginBottom: 10, color: theme.textSecondary, fontFamily: Fonts?.sansBold, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.5 },

  updateRow: { marginHorizontal: 24, marginBottom: 10, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 13 },
  updateRingWrap: { position: 'relative' },
  updateRing: { width: 60, height: 60, borderRadius: 21, padding: 2.5, alignItems: 'center', justifyContent: 'center' },
  updateAvatarWrap: { width: '100%', height: '100%', borderRadius: 18, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  updateInitials: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 14 },
  updateCountBadge: { position: 'absolute', bottom: -3, right: -3, minWidth: 20, height: 20, paddingHorizontal: 4, borderRadius: 10, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: theme.background },
  updateCountText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 10 },
  updateCopy: { flex: 1 },
  updateName: { color: theme.text, fontFamily: Fonts?.sansSemiBold, fontSize: 15 },
  updateMeta: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 3 },

  fabStack: { position: 'absolute', right: 24, bottom: BottomTabInset + 10, alignItems: 'center', gap: 12 },
  editFab: { width: 46, height: 46, borderRadius: 17, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  cameraFab: { width: 58, height: 58, borderRadius: 21, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', shadowColor: theme.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 7 },

  overlay: { flex: 1, backgroundColor: 'rgba(3, 7, 18, 0.35)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: theme.background, padding: 24, paddingBottom: 36, borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  sheetHandle: { width: 38, height: 4, borderRadius: 3, backgroundColor: theme.backgroundSelected, alignSelf: 'center', marginBottom: 19 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  sheetTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 19 },
  sheetSub: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 3 },
  cancel: { color: theme.primary, fontFamily: Fonts?.sansSemiBold, fontSize: 13 },
  noteBox: { minHeight: 125, backgroundColor: theme.backgroundElement, borderRadius: 18, marginTop: 19, flexDirection: 'row', paddingHorizontal: 14, gap: 10 },
  noteInput: { flex: 1, color: theme.text, fontFamily: Fonts?.sans, fontSize: 15, textAlignVertical: 'top', paddingTop: 13, paddingBottom: 13 },
  postButton: { marginTop: 16, height: 52, borderRadius: 18, backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 },
  postText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 15 },
});
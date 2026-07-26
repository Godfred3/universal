import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  Camera,
  Check,
  CheckCheck,
  ChevronDown,
  Flame,
  Forward,
  Lock,
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Pin,
  Play,
  Send,
  Smile,
  Sticker,
  Video,
  X,
} from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { GradientWrapper } from '@/components/gradient-wrapper';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type Ticks = 'sent' | 'delivered' | 'read';

type Message = {
  id: string;
  senderId: 'me' | 'contact';
  type: 'text' | 'voice' | 'image';
  text?: string;
  imageUri?: string;
  voiceDuration?: string;
  time: string;
  ticks?: Ticks;
  replyTo?: { author: string; text: string };
  forwarded?: boolean;
  edited?: boolean;
  reactions?: { emoji: string; count: number }[];
};

// This contact has no message history yet — that's what puts the room
// into the "new conversation" empty state below. Swap this out (or wire
// it up to a route param / a lookup against your chats store) for any
// contact tapped from Find Friends or the Chats list who you haven't
// messaged before.
const CONTACT = {
  name: 'Kojo Boadi',
  handle: '@kojoboadi',
  avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
  following: 128,
  followers: 340,
  online: true,
};

const STATUS_RING = ['#4361EE', '#7955D9'] as const;
const WAVEFORM = [6, 14, 9, 18, 11, 20, 8, 15, 10, 22, 13, 7, 17, 9, 14, 6, 12, 19, 8, 11];
const REPLY_POOL = ['Hey! Good to connect 👋', "What's up!", 'Hey there 😊', 'Hi! Thanks for reaching out'];
const QUICK_REACTIONS = ['❤️', '😂', '👍', '👋'];

const formatNow = () => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(new Date());

export default function ChatRoomScreen() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorScheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [contactTyping, setContactTyping] = useState(false);
  const [pinnedVisible, setPinnedVisible] = useState(true);
  const [greetingVisible, setGreetingVisible] = useState(true);
  const scrollRef = useRef<ScrollView>(null);

  const isNewConversation = messages.length === 0;
  const pinnedMessage = messages.find((m) => m.reactions && m.reactions.length > 0);

  const sendContent = (text: string) => {
    const id = String(Date.now());
    const outgoing: Message = { id, senderId: 'me', type: 'text', text, time: formatNow(), ticks: 'sent' };
    setMessages((items) => [...items, outgoing]);

    setTimeout(() => setMessages((items) => items.map((m) => (m.id === id ? { ...m, ticks: 'delivered' } : m))), 900);
    setTimeout(() => setMessages((items) => items.map((m) => (m.id === id ? { ...m, ticks: 'read' } : m))), 2100);
    setTimeout(() => setContactTyping(true), 1300);
    setTimeout(() => {
      setContactTyping(false);
      const reply = REPLY_POOL[Math.floor(Math.random() * REPLY_POOL.length)];
      setMessages((items) => [...items, { id: String(Date.now() + 1), senderId: 'contact', type: 'text', text: reply, time: formatNow() }]);
    }, 3300);
  };

  const sendMessage = () => {
    if (!draft.trim()) return;
    sendContent(draft.trim());
    setDraft('');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerAvatarWrap}>
          <GradientWrapper colors={STATUS_RING} style={styles.headerRing}>
            <View style={styles.headerAvatarInner}>
              <Image source={{ uri: CONTACT.avatar }} style={styles.headerAvatarImage} />
            </View>
          </GradientWrapper>
          {CONTACT.online && <View style={styles.headerOnlineDot} />}
        </View>
        <View style={styles.headerCopy}>
          <Text style={styles.headerName}>{CONTACT.name}</Text>
          {contactTyping ? (
            <TypingIndicator styles={styles} theme={theme} />
          ) : (
            <Text style={styles.headerStatus}>{CONTACT.online ? 'Active now' : 'Last seen recently'}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.headerIcon} hitSlop={6}><Phone size={18} color={theme.primary} /></TouchableOpacity>
        <TouchableOpacity style={styles.headerIcon} hitSlop={6}><Video size={19} color={theme.primary} /></TouchableOpacity>
        <TouchableOpacity hitSlop={6}><MoreVertical size={20} color={theme.textSecondary} /></TouchableOpacity>
      </View>

      {!isNewConversation && pinnedVisible && pinnedMessage && (
        <View style={styles.pinnedBanner}>
          <Pin size={14} color={theme.primary} />
          <Text style={styles.pinnedText} numberOfLines={1}>{pinnedMessage.text}</Text>
          <TouchableOpacity onPress={() => setPinnedVisible(false)} hitSlop={8}>
            <X size={15} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {isNewConversation ? (
        <ScrollView contentContainerStyle={styles.newChatContent} showsVerticalScrollIndicator={false}>
          <View style={styles.profileBlock}>
            <Image source={{ uri: CONTACT.avatar }} style={styles.profileAvatar} />
            <Text style={styles.profileName}>{CONTACT.name}</Text>
            <Text style={styles.profileHandle}>{CONTACT.handle}</Text>
            <Text style={styles.profileStats}>{CONTACT.following} following · {CONTACT.followers} followers</Text>
          </View>

          {greetingVisible && (
            <View style={styles.greetingBlock}>
              <View style={styles.greetingTopRow}>
                <Text style={styles.greetingText}>Say hi by sending a sticker</Text>
                <TouchableOpacity onPress={() => setGreetingVisible(false)} hitSlop={8}>
                  <X size={16} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.waveButton} activeOpacity={0.7} onPress={() => sendContent('👋')}>
                <Text style={styles.waveEmoji}>👋</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.encryptedPill}>
            <Lock size={11} color={theme.textSecondary} />
            <Text style={styles.encryptedText}>Messages are end-to-end encrypted</Text>
          </View>
          <View style={styles.dateSeparator}><Text style={styles.dateSeparatorText}>Today</Text></View>

          {messages.map((message, index) => {
            const prev = messages[index - 1];
            const next = messages[index + 1];
            const groupedWithPrev = !!prev && prev.senderId === message.senderId;
            const groupedWithNext = !!next && next.senderId === message.senderId;
            return (
              <MessageBubble
                key={message.id}
                message={message}
                styles={styles}
                theme={theme}
                contactAvatar={CONTACT.avatar}
                showAvatar={message.senderId === 'contact' && !groupedWithNext}
                tightTop={groupedWithPrev}
              />
            );
          })}

          {contactTyping && (
            <View style={styles.incomingRow}>
              <Image source={{ uri: CONTACT.avatar }} style={styles.bubbleAvatar} />
              <View style={[styles.bubble, styles.incomingBubble, styles.typingBubble]}>
                <TypingDots color={theme.textSecondary} />
              </View>
            </View>
          )}
        </ScrollView>
      )}

      {!isNewConversation && (
        <TouchableOpacity style={styles.scrollToBottom} onPress={() => scrollRef.current?.scrollToEnd({ animated: true })} activeOpacity={0.85}>
          <ChevronDown size={18} color={theme.primary} />
        </TouchableOpacity>
      )}

      {isNewConversation && (
        <View style={styles.quickReactionRow}>
          {QUICK_REACTIONS.map((emoji) => (
            <TouchableOpacity key={emoji} style={styles.quickReactionChip} activeOpacity={0.75} onPress={() => sendContent(emoji)}>
              <Text style={styles.quickReactionEmoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.streakChip} activeOpacity={0.75} onPress={() => sendContent('🔥')}>
            <Flame size={13} color="#fff" />
            <Text style={styles.streakChipText}>Streak</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.inputBar}>
        {isNewConversation && <TouchableOpacity hitSlop={6}><Camera size={21} color={theme.textSecondary} /></TouchableOpacity>}
        {!isNewConversation && <TouchableOpacity hitSlop={6}><Smile size={22} color={theme.textSecondary} /></TouchableOpacity>}
        <View style={styles.inputField}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder="Message"
            placeholderTextColor={theme.textSecondary}
            style={styles.inputText}
            multiline
          />
          {draft.trim().length === 0 && !isNewConversation && (
            <TouchableOpacity hitSlop={6}><Paperclip size={19} color={theme.textSecondary} /></TouchableOpacity>
          )}
          {isNewConversation && draft.trim().length === 0 && (
            <View style={styles.inputTrailingIcons}>
              <TouchableOpacity hitSlop={6}><Sticker size={18} color={theme.textSecondary} /></TouchableOpacity>
            </View>
          )}
        </View>
        {draft.trim().length > 0 ? (
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage} activeOpacity={0.85}>
            <GradientWrapper colors={['#4361EE', '#7955D9']} style={styles.sendButtonGradient}>
              <Send size={17} color="#fff" strokeWidth={2.4} />
            </GradientWrapper>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.micButton} hitSlop={6}><Mic size={20} color="#fff" /></TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  message,
  styles,
  theme,
  contactAvatar,
  showAvatar,
  tightTop,
}: {
  message: Message;
  styles: ReturnType<typeof createStyles>;
  theme: ReturnType<typeof useTheme>;
  contactAvatar: string;
  showAvatar: boolean;
  tightTop: boolean;
}) {
  const [playing, setPlaying] = useState(false);
  const isMe = message.senderId === 'me';
  const TickIcon = message.ticks === 'sent' ? Check : message.ticks ? CheckCheck : null;
  const tickColor = message.ticks === 'read' ? '#7BD8FF' : 'rgba(255,255,255,0.75)';

  const bubbleContent = (
    <>
      {message.forwarded && (
        <View style={styles.tagRow}>
          <Forward size={11} color={isMe ? 'rgba(255,255,255,0.85)' : theme.textSecondary} />
          <Text style={[styles.tagText, isMe && styles.tagTextOnPrimary]}>Forwarded</Text>
        </View>
      )}
      {message.replyTo && (
        <View style={[styles.replyBlock, isMe && styles.replyBlockOnPrimary]}>
          <Text style={[styles.replyAuthor, isMe && styles.replyAuthorOnPrimary]}>{message.replyTo.author}</Text>
          <Text style={[styles.replyText, isMe && styles.replyTextOnPrimary]} numberOfLines={1}>{message.replyTo.text}</Text>
        </View>
      )}

      {message.type === 'image' && message.imageUri && (
        <Image source={{ uri: message.imageUri }} style={styles.messageImage} />
      )}

      {message.type === 'voice' && (
        <View style={styles.voiceRow}>
          <TouchableOpacity style={[styles.playButton, isMe && styles.playButtonOnPrimary]} onPress={() => setPlaying((p) => !p)}>
            <Play size={13} color={isMe ? theme.primary : '#fff'} fill={isMe ? theme.primary : '#fff'} />
          </TouchableOpacity>
          <View style={styles.waveform}>
            {WAVEFORM.map((h, i) => (
              <View
                key={i}
                style={[
                  styles.waveformBar,
                  { height: h, backgroundColor: isMe ? 'rgba(255,255,255,0.55)' : theme.backgroundSelected },
                  playing && i < 7 && { backgroundColor: isMe ? '#fff' : theme.primary },
                ]}
              />
            ))}
          </View>
          <Text style={[styles.voiceDuration, isMe && styles.voiceDurationOnPrimary]}>{message.voiceDuration}</Text>
        </View>
      )}

      {message.type === 'text' && (
        <Text style={[styles.bubbleText, isMe && styles.bubbleTextOnPrimary, isSingleEmoji(message.text) && styles.bubbleTextEmoji]}>{message.text}</Text>
      )}

      <View style={styles.bubbleFooter}>
        {message.edited && <Text style={[styles.editedLabel, isMe && styles.editedLabelOnPrimary]}>edited</Text>}
        <Text style={[styles.bubbleTime, isMe && styles.bubbleTimeOnPrimary]}>{message.time}</Text>
        {isMe && TickIcon && <TickIcon size={14} color={tickColor} style={{ marginLeft: 3 }} />}
      </View>
    </>
  );

  return (
    <View style={[styles.messageRow, isMe ? styles.messageRowMe : styles.messageRowContact, tightTop && { marginTop: 3 }]}>
      {!isMe && (showAvatar ? <Image source={{ uri: contactAvatar }} style={styles.bubbleAvatar} /> : <View style={styles.bubbleAvatarSpacer} />)}

      <View style={styles.bubbleWithReactions}>
        {isMe ? (
          <GradientWrapper colors={['#4361EE', '#7955D9']} style={[styles.bubble, styles.outgoingBubble]}>
            {bubbleContent}
          </GradientWrapper>
        ) : (
          <View style={[styles.bubble, styles.incomingBubble]}>{bubbleContent}</View>
        )}

        {message.reactions && message.reactions.length > 0 && (
          <View style={[styles.reactionChipRow, isMe ? styles.reactionChipRowMe : styles.reactionChipRowContact]}>
            {message.reactions.map((r) => (
              <View key={r.emoji} style={styles.reactionChip}>
                <Text style={styles.reactionChipEmoji}>{r.emoji}</Text>
                <Text style={styles.reactionChipCount}>{r.count}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

const isSingleEmoji = (text?: string) => !!text && text.trim().length <= 2 && /\p{Emoji}/u.test(text);

function TypingDots({ color }: { color: string }) {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDot = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.timing(value, { toValue: 0.3, duration: 320, useNativeDriver: true }),
          Animated.delay(320),
        ]),
      );
    const loops = [animateDot(dot1, 0), animateDot(dot2, 160), animateDot(dot3, 320)];
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, []);

  return (
    <View style={{ flexDirection: 'row', gap: 4, paddingVertical: 3 }}>
      <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, opacity: dot1 }} />
      <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, opacity: dot2 }} />
      <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, opacity: dot3 }} />
    </View>
  );
}

function TypingIndicator({ styles, theme }: { styles: ReturnType<typeof createStyles>; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.headerTypingRow}>
      <Text style={styles.headerTypingText}>typing</Text>
      <TypingDots color={theme.primary} />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },

  header: { paddingTop: Platform.OS === 'ios' ? 56 : 36, paddingBottom: 12, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.backgroundElement },
  backButton: { marginRight: 2 },
  headerAvatarWrap: { position: 'relative' },
  headerRing: { width: 42, height: 42, borderRadius: 16, padding: 2, alignItems: 'center', justifyContent: 'center' },
  headerAvatarInner: { width: '100%', height: '100%', borderRadius: 13, overflow: 'hidden' },
  headerAvatarImage: { width: '100%', height: '100%' },
  headerOnlineDot: { position: 'absolute', bottom: -1, right: -1, width: 11, height: 11, borderRadius: 6, backgroundColor: '#34C759', borderWidth: 2, borderColor: theme.background },
  headerCopy: { flex: 1 },
  headerName: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 15.5 },
  headerStatus: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 1 },
  headerTypingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  headerTypingText: { color: theme.primary, fontFamily: Fonts?.sansSemiBold, fontSize: 12 },
  headerIcon: { marginRight: 2 },

  pinnedBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 9, backgroundColor: theme.backgroundElement, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.background },
  pinnedText: { flex: 1, color: theme.text, fontFamily: Fonts?.sansMedium, fontSize: 12.5 },

  // ---- new conversation empty state ----
  newChatContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, paddingBottom: 30 },
  profileBlock: { alignItems: 'center' },
  profileAvatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: theme.backgroundElement },
  profileName: { marginTop: 14, color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 18 },
  profileHandle: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13, marginTop: 2 },
  profileStats: { color: theme.textSecondary, fontFamily: Fonts?.sansMedium, fontSize: 12.5, marginTop: 8 },

  greetingBlock: { alignItems: 'center', marginTop: 46, width: '100%' },
  greetingTopRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  greetingText: { color: theme.textSecondary, fontFamily: Fonts?.sansMedium, fontSize: 13.5 },
  waveButton: { marginTop: 18, width: 64, height: 64, borderRadius: 32, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  waveEmoji: { fontSize: 30 },

  quickReactionRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingBottom: 10 },
  quickReactionChip: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  quickReactionEmoji: { fontSize: 18 },
  streakChip: { flexDirection: 'row', alignItems: 'center', gap: 5, height: 40, borderRadius: 20, backgroundColor: theme.primary, paddingHorizontal: 14 },
  streakChipText: { color: '#fff', fontFamily: Fonts?.sansSemiBold, fontSize: 12.5 },

  // ---- thread ----
  messages: { flex: 1 },
  messagesContent: { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },

  encryptedPill: { alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: theme.backgroundElement, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 14 },
  encryptedText: { color: theme.textSecondary, fontFamily: Fonts?.sansMedium, fontSize: 10.5, textAlign: 'center' },
  dateSeparator: { alignSelf: 'center', backgroundColor: theme.backgroundElement, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, marginBottom: 14 },
  dateSeparatorText: { color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 11 },

  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: 10, gap: 8 },
  messageRowMe: { justifyContent: 'flex-end' },
  messageRowContact: { justifyContent: 'flex-start' },
  bubbleAvatar: { width: 26, height: 26, borderRadius: 9 },
  bubbleAvatarSpacer: { width: 26 },
  bubbleWithReactions: { maxWidth: '76%' },

  bubble: { paddingHorizontal: 13, paddingVertical: 9, borderRadius: 20 },
  incomingBubble: { backgroundColor: theme.backgroundElement, borderBottomLeftRadius: 6 },
  outgoingBubble: { borderBottomRightRadius: 6, alignSelf: 'flex-end' },
  typingBubble: { paddingVertical: 11, paddingHorizontal: 14 },

  bubbleText: { color: theme.text, fontFamily: Fonts?.sans, fontSize: 14.5, lineHeight: 20 },
  bubbleTextOnPrimary: { color: '#fff' },
  bubbleTextEmoji: { fontSize: 34, lineHeight: 40 },

  bubbleFooter: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end', gap: 3, marginTop: 3 },
  bubbleTime: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 10.5 },
  bubbleTimeOnPrimary: { color: 'rgba(255,255,255,0.8)' },
  editedLabel: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 10.5, fontStyle: 'italic', marginRight: 2 },
  editedLabelOnPrimary: { color: 'rgba(255,255,255,0.75)' },

  tagRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  tagText: { color: theme.textSecondary, fontFamily: Fonts?.sansMedium, fontSize: 10.5, fontStyle: 'italic' },
  tagTextOnPrimary: { color: 'rgba(255,255,255,0.85)' },

  replyBlock: { borderLeftWidth: 3, borderLeftColor: theme.primary, backgroundColor: theme.background, borderRadius: 8, paddingHorizontal: 9, paddingVertical: 6, marginBottom: 6 },
  replyBlockOnPrimary: { backgroundColor: 'rgba(255,255,255,0.16)', borderLeftColor: '#fff' },
  replyAuthor: { color: theme.primary, fontFamily: Fonts?.sansBold, fontSize: 11.5 },
  replyAuthorOnPrimary: { color: '#fff' },
  replyText: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 11.5, marginTop: 1 },
  replyTextOnPrimary: { color: 'rgba(255,255,255,0.85)' },

  messageImage: { width: 210, height: 150, borderRadius: 14, marginBottom: 6 },

  voiceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 2, minWidth: 190 },
  playButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
  playButtonOnPrimary: { backgroundColor: '#fff' },
  waveform: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 2, height: 22 },
  waveformBar: { width: 2.5, borderRadius: 2 },
  voiceDuration: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 10.5 },
  voiceDurationOnPrimary: { color: 'rgba(255,255,255,0.85)' },

  reactionChipRow: { flexDirection: 'row', gap: 4, marginTop: -8 },
  reactionChipRowMe: { alignSelf: 'flex-end', marginRight: 8 },
  reactionChipRowContact: { alignSelf: 'flex-start', marginLeft: 8 },
  reactionChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: theme.background, borderWidth: 1, borderColor: theme.backgroundElement, borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  reactionChipEmoji: { fontSize: 11 },
  reactionChipCount: { color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 10 },

  incomingRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginTop: 10 },

  scrollToBottom: { position: 'absolute', right: 16, bottom: 84, width: 34, height: 34, borderRadius: 17, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.backgroundElement, backgroundColor: theme.background },
  inputField: { flex: 1, minHeight: 42, maxHeight: 110, borderRadius: 21, backgroundColor: theme.backgroundElement, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  inputText: { flex: 1, color: theme.text, fontFamily: Fonts?.sans, fontSize: 14.5, maxHeight: 90 },
  inputTrailingIcons: { flexDirection: 'row', gap: 10 },
  sendButton: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden' },
  sendButtonGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  micButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
});
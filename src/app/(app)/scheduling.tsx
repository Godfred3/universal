import {
  AlertCircle,
  Calendar as CalendarIcon,
  CalendarClock,
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  FileText,
  Image as ImageIcon,
  Mic,
  Pause,
  Play,
  Plus,
  Repeat,
  Search,
  Send,
  Smile,
  Sparkles,
  Trash2,
  Users,
  UserRound,
  Video,
  X,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { BottomTabInset, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

// ---------- Types ----------

type Recipient = {
  id: string;
  name: string;
  kind: 'friend' | 'group';
  members?: number;
};

type RepeatOption = 'Once' | 'Daily' | 'Weekly' | 'Monthly' | 'Custom';
type DeliveryStatus = 'Pending' | 'Sent' | 'Recurring' | 'Failed';
type AttachmentKind = 'photo' | 'video' | 'voice' | 'document';

type ScheduledMessage = {
  id: string;
  recipients: Recipient[];
  message: string;
  attachments: AttachmentKind[];
  sendAt: Date;
  repeat: RepeatOption;
  status: DeliveryStatus;
  paused: boolean;
};

// ---------- Mock data ----------

const CONTACTS: Recipient[] = [
  { id: 'f1', name: 'Amara Boateng', kind: 'friend' },
  { id: 'f2', name: 'Kojo Mensah', kind: 'friend' },
  { id: 'f3', name: 'Efia Owusu', kind: 'friend' },
  { id: 'f4', name: 'Nana Asante', kind: 'friend' },
  { id: 'f5', name: 'Yaw Adjei', kind: 'friend' },
  { id: 'g1', name: 'Family 🏠', kind: 'group', members: 6 },
  { id: 'g2', name: 'Design Team', kind: 'group', members: 9 },
  { id: 'g3', name: 'Weekend Crew', kind: 'group', members: 4 },
];

const AI_STARTERS = [
  'Wish them a great morning ☀️',
  'Send a friendly check-in',
  'Follow up on our last chat',
  'Share a quick reminder',
];

const AI_ENHANCEMENTS = [
  'Make it warmer',
  'Make it more concise',
  'Add an emoji',
  'Make it more formal',
];

const REPEAT_OPTIONS: RepeatOption[] = ['Once', 'Daily', 'Weekly', 'Monthly', 'Custom'];

const ATTACHMENT_TYPES: { kind: AttachmentKind; label: string; Icon: typeof ImageIcon }[] = [
  { kind: 'photo', label: 'Photo', Icon: ImageIcon },
  { kind: 'video', label: 'Video', Icon: Video },
  { kind: 'voice', label: 'Voice note', Icon: Mic },
  { kind: 'document', label: 'Document', Icon: FileText },
];

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = ['00', '15', '30', '45'];
const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ---------- Helpers ----------

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);

const formatTime = (date: Date) =>
  new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(date);

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const buildMonthGrid = (monthAnchor: Date) => {
  const first = startOfMonth(monthAnchor);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth(), d));
  return cells;
};

const recipientLabel = (recipients: Recipient[]) => {
  if (recipients.length === 0) return 'Choose recipients';
  if (recipients.length === 1) return recipients[0].name;
  return `${recipients[0].name} +${recipients.length - 1}`;
};

const statusMeta = (theme: ReturnType<typeof useTheme>) => ({
  Pending: { color: theme.primary, bg: theme.backgroundSelected, Icon: Clock3 },
  Sent: { color: '#34C759', bg: '#E9F9EE', Icon: CheckCheck },
  Recurring: { color: '#8E5CF7', bg: '#F1EAFE', Icon: Repeat },
  Failed: { color: '#FF3B30', bg: '#FDECEB', Icon: AlertCircle },
});

// ---------- Component ----------

export default function SchedulingScreen() {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const STATUS = useMemo(() => statusMeta(theme), [theme]);

  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [filter, setFilter] = useState<'All' | DeliveryStatus>('All');

  // composer
  const [composerVisible, setComposerVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<AttachmentKind[]>([]);
  const [sendDate, setSendDate] = useState<Date>(() => {
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    return d;
  });
  const [repeat, setRepeat] = useState<RepeatOption>('Once');

  // sub-modals
  const [recipientPickerVisible, setRecipientPickerVisible] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePickerVisible, setTimePickerVisible] = useState(false);
  const [monthAnchor, setMonthAnchor] = useState(new Date());
  const [actionSheetId, setActionSheetId] = useState<string | null>(null);

  const filteredContacts = useMemo(
    () => CONTACTS.filter((c) => c.name.toLowerCase().includes(recipientSearch.trim().toLowerCase())),
    [recipientSearch],
  );

  const visibleMessages = useMemo(
    () => (filter === 'All' ? scheduledMessages : scheduledMessages.filter((m) => m.status === filter)),
    [scheduledMessages, filter],
  );

  const suggestions = message.trim().length === 0 ? AI_STARTERS : AI_ENHANCEMENTS;

  // ---------- Actions ----------

  const resetForm = () => {
    setEditingId(null);
    setSelectedRecipients([]);
    setMessage('');
    setAttachments([]);
    setRepeat('Once');
    const d = new Date();
    d.setMinutes(0, 0, 0);
    d.setHours(d.getHours() + 1);
    setSendDate(d);
  };

  const openComposer = (existing?: ScheduledMessage) => {
    if (existing) {
      setEditingId(existing.id);
      setSelectedRecipients(existing.recipients);
      setMessage(existing.message);
      setAttachments(existing.attachments);
      setSendDate(existing.sendAt);
      setRepeat(existing.repeat);
    } else {
      resetForm();
    }
    setComposerVisible(true);
  };

  const toggleRecipient = (recipient: Recipient) => {
    setSelectedRecipients((current) =>
      current.some((r) => r.id === recipient.id)
        ? current.filter((r) => r.id !== recipient.id)
        : [...current, recipient],
    );
  };

  const toggleAttachment = (kind: AttachmentKind) => {
    setAttachments((current) => (current.includes(kind) ? current.filter((a) => a !== kind) : [...current, kind]));
  };

  const applySuggestion = (text: string) => {
    if (message.trim().length === 0) {
      setMessage(text);
    } else {
      setMessage((current) => `${current.trim()} — ${text.toLowerCase()}`);
    }
  };

  const confirmSchedule = () => {
    if (selectedRecipients.length === 0) {
      Alert.alert('Add a recipient', 'Choose at least one friend or group.');
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      Alert.alert('Add a message', 'Write a message or attach something to send.');
      return;
    }
    if (sendDate <= new Date()) {
      Alert.alert('Choose a future time', 'Pick a date and time that hasn’t passed yet.');
      return;
    }

    if (editingId) {
      setScheduledMessages((items) =>
        items.map((item) =>
          item.id === editingId
            ? {
                ...item,
                recipients: selectedRecipients,
                message: message.trim(),
                attachments,
                sendAt: sendDate,
                repeat,
                status: repeat === 'Once' ? 'Pending' : 'Recurring',
              }
            : item,
        ),
      );
    } else {
      const newMessage: ScheduledMessage = {
        id: String(Date.now()),
        recipients: selectedRecipients,
        message: message.trim(),
        attachments,
        sendAt: sendDate,
        repeat,
        status: repeat === 'Once' ? 'Pending' : 'Recurring',
        paused: false,
      };
      setScheduledMessages((items) => [newMessage, ...items]);
    }

    setComposerVisible(false);
    resetForm();
  };

  const deleteMessage = (id: string) => {
    setScheduledMessages((items) => items.filter((item) => item.id !== id));
    setActionSheetId(null);
  };

  const togglePause = (id: string) => {
    setScheduledMessages((items) =>
      items.map((item) => (item.id === id ? { ...item, paused: !item.paused } : item)),
    );
    setActionSheetId(null);
  };

  const sendNow = (id: string) => {
    setScheduledMessages((items) =>
      items.map((item) => (item.id === id ? { ...item, status: 'Sent', paused: false } : item)),
    );
    setActionSheetId(null);
  };

  const activeMessage = scheduledMessages.find((m) => m.id === actionSheetId) ?? null;
  const monthCells = useMemo(() => buildMonthGrid(monthAnchor), [monthAnchor]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Scheduling</Text>
            <Text style={styles.subtitle}>Send the right message at the right time.</Text>
          </View>
          <View style={styles.headerIcon}>
            <CalendarClock size={25} color={theme.primary} strokeWidth={2} />
          </View>
        </View>

        <TouchableOpacity style={styles.newButton} onPress={() => openComposer()} activeOpacity={0.85}>
          <Plus size={20} color="#fff" strokeWidth={2.5} />
          <Text style={styles.newButtonText}>New scheduled message</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ gap: 8 }}>
          {(['All', 'Pending', 'Recurring', 'Sent', 'Failed'] as const).map((option) => (
            <TouchableOpacity
              key={option}
              onPress={() => setFilter(option)}
              style={[styles.filterChip, filter === option && styles.filterChipActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, filter === option && styles.filterChipTextActive]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {visibleMessages.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Clock3 size={25} color={theme.primary} />
            </View>
            <Text style={styles.emptyTitle}>Nothing scheduled yet</Text>
            <Text style={styles.emptyText}>Compose a message and pick a time — we’ll take it from there.</Text>
          </View>
        ) : (
          visibleMessages.map((item) => {
            const meta = STATUS[item.paused ? 'Pending' : item.status];
            const StatusIcon = meta.Icon;
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.messageCard}
                activeOpacity={0.85}
                onPress={() => setActionSheetId(item.id)}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.contactRow}>
                    <View style={styles.avatar}>
                      {item.recipients[0].kind === 'group' ? (
                        <Users size={16} color="#fff" />
                      ) : (
                        <Text style={styles.avatarText}>{item.recipients[0].name.slice(0, 1).toUpperCase()}</Text>
                      )}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.contactName} numberOfLines={1}>
                        {recipientLabel(item.recipients)}
                      </Text>
                      <Text style={styles.sendAt}>
                        {formatDate(item.sendAt)} · {formatTime(item.sendAt)}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                    <StatusIcon size={12} color={meta.color} />
                    <Text style={[styles.statusText, { color: meta.color }]}>
                      {item.paused ? 'Paused' : item.status}
                    </Text>
                  </View>
                </View>

                {item.message ? (
                  <Text style={styles.scheduledText} numberOfLines={2}>
                    {item.message}
                  </Text>
                ) : null}

                {(item.attachments.length > 0 || item.repeat !== 'Once') && (
                  <View style={styles.cardFooterRow}>
                    {item.repeat !== 'Once' && (
                      <View style={styles.metaPill}>
                        <Repeat size={11} color={theme.textSecondary} />
                        <Text style={styles.metaPillText}>{item.repeat}</Text>
                      </View>
                    )}
                    {item.attachments.map((kind) => {
                      const Icon = ATTACHMENT_TYPES.find((a) => a.kind === kind)!.Icon;
                      return (
                        <View key={kind} style={styles.metaPill}>
                          <Icon size={11} color={theme.textSecondary} />
                        </View>
                      );
                    })}
                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* ---------- Composer Modal ---------- */}
      <Modal visible={composerVisible} animationType="slide" onRequestClose={() => setComposerVisible(false)}>
        <View style={styles.container}>
          <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setComposerVisible(false)} hitSlop={10}>
              <Text style={styles.modalHeaderAction}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>{editingId ? 'Edit Message' : 'New Message'}</Text>
            <TouchableOpacity onPress={confirmSchedule} hitSlop={10}>
              <Text style={[styles.modalHeaderAction, styles.modalHeaderActionPrimary]}>Schedule</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.composerScroll} keyboardShouldPersistTaps="handled">
            <TouchableOpacity style={styles.recipientSelector} onPress={() => setRecipientPickerVisible(true)} activeOpacity={0.8}>
              <View style={styles.recipientSelectorLeft}>
                <UserRound size={18} color={theme.textSecondary} />
                <Text style={styles.recipientSelectorText} numberOfLines={1}>
                  {recipientLabel(selectedRecipients)}
                </Text>
              </View>
              <ChevronRight size={18} color={theme.textSecondary} />
            </TouchableOpacity>

            {selectedRecipients.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
                {selectedRecipients.map((r) => (
                  <View key={r.id} style={styles.recipientChip}>
                    <Text style={styles.recipientChipText}>{r.name}</Text>
                    <TouchableOpacity onPress={() => toggleRecipient(r)} hitSlop={8}>
                      <X size={13} color={theme.primary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            <View style={styles.composerCard}>
              <TextInput
                style={styles.composerInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Write your message…"
                placeholderTextColor={theme.textSecondary}
                multiline
                maxLength={1000}
              />
              <View style={styles.composerToolbar}>
                <View style={styles.toolbarLeft}>
                  {ATTACHMENT_TYPES.map(({ kind, Icon }) => (
                    <TouchableOpacity
                      key={kind}
                      style={[styles.toolbarIcon, attachments.includes(kind) && styles.toolbarIconActive]}
                      onPress={() => toggleAttachment(kind)}
                      hitSlop={6}
                    >
                      <Icon size={17} color={attachments.includes(kind) ? theme.primary : theme.textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity hitSlop={6}>
                  <Smile size={19} color={theme.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.aiSection}>
              <View style={styles.aiHeader}>
                <Sparkles size={14} color={theme.primary} />
                <Text style={styles.aiHeaderText}>AI suggestions</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {suggestions.map((s) => (
                  <TouchableOpacity key={s} style={styles.aiChip} onPress={() => applySuggestion(s)} activeOpacity={0.8}>
                    <Text style={styles.aiChipText}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionLabel}>When</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity style={styles.pickerPill} onPress={() => setDatePickerVisible(true)} activeOpacity={0.8}>
                <CalendarIcon size={16} color={theme.primary} />
                <Text style={styles.pickerPillText}>{formatDate(sendDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.pickerPill} onPress={() => setTimePickerVisible(true)} activeOpacity={0.8}>
                <Clock3 size={16} color={theme.primary} />
                <Text style={styles.pickerPillText}>{formatTime(sendDate)}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.sectionLabel}>Repeat</Text>
            <View style={styles.repeatRow}>
              {REPEAT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.repeatChip, repeat === option && styles.repeatChipActive]}
                  onPress={() => setRepeat(option)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.repeatChipText, repeat === option && styles.repeatChipTextActive]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ---------- Recipient Picker ---------- */}
      <Modal visible={recipientPickerVisible} animationType="slide" transparent onRequestClose={() => setRecipientPickerVisible(false)}>
        <View style={styles.sheetOverlay}>
          <View style={styles.sheetContainer}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetTitleRow}>
              <Text style={styles.sheetTitle}>Choose recipients</Text>
              <TouchableOpacity onPress={() => setRecipientPickerVisible(false)} hitSlop={10}>
                <X size={20} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.searchField}>
              <Search size={16} color={theme.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={recipientSearch}
                onChangeText={setRecipientSearch}
                placeholder="Search friends and groups"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
            <ScrollView style={{ maxHeight: 380 }}>
              {filteredContacts.map((c) => {
                const selected = selectedRecipients.some((r) => r.id === c.id);
                return (
                  <TouchableOpacity key={c.id} style={styles.contactRowItem} onPress={() => toggleRecipient(c)} activeOpacity={0.75}>
                    <View style={styles.contactRowLeft}>
                      <View style={styles.avatarSmall}>
                        {c.kind === 'group' ? <Users size={15} color="#fff" /> : <Text style={styles.avatarText}>{c.name.slice(0, 1)}</Text>}
                      </View>
                      <View>
                        <Text style={styles.contactRowName}>{c.name}</Text>
                        {c.kind === 'group' && <Text style={styles.contactRowSub}>{c.members} members</Text>}
                      </View>
                    </View>
                    <View style={[styles.checkCircle, selected && styles.checkCircleActive]}>
                      {selected && <Check size={13} color="#fff" />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
            <TouchableOpacity style={styles.sheetPrimaryButton} onPress={() => setRecipientPickerVisible(false)} activeOpacity={0.85}>
              <Text style={styles.sheetPrimaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ---------- Date Picker ---------- */}
      <Modal visible={datePickerVisible} animationType="fade" transparent onRequestClose={() => setDatePickerVisible(false)}>
        <Pressable style={styles.centerOverlay} onPress={() => setDatePickerVisible(false)}>
          <Pressable style={styles.calendarCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setMonthAnchor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))} hitSlop={10}>
                <ChevronLeft size={20} color={theme.text} />
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>
                {new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(monthAnchor)}
              </Text>
              <TouchableOpacity onPress={() => setMonthAnchor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))} hitSlop={10}>
                <ChevronRight size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.calendarWeekRow}>
              {WEEKDAY_LABELS.map((w, i) => (
                <Text key={`${w}-${i}`} style={styles.calendarWeekLabel}>{w}</Text>
              ))}
            </View>
            <View style={styles.calendarGrid}>
              {monthCells.map((cell, idx) => {
                if (!cell) return <View key={idx} style={styles.calendarCell} />;
                const past = cell < new Date(new Date().setHours(0, 0, 0, 0));
                const selected = isSameDay(cell, sendDate);
                return (
                  <TouchableOpacity
                    key={idx}
                    disabled={past}
                    style={[styles.calendarCell, selected && styles.calendarCellActive]}
                    onPress={() => {
                      const next = new Date(sendDate);
                      next.setFullYear(cell.getFullYear(), cell.getMonth(), cell.getDate());
                      setSendDate(next);
                      setDatePickerVisible(false);
                    }}
                  >
                    <Text style={[styles.calendarCellText, past && styles.calendarCellTextDisabled, selected && styles.calendarCellTextActive]}>
                      {cell.getDate()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ---------- Time Picker ---------- */}
      <Modal visible={timePickerVisible} animationType="fade" transparent onRequestClose={() => setTimePickerVisible(false)}>
        <Pressable style={styles.centerOverlay} onPress={() => setTimePickerVisible(false)}>
          <Pressable style={styles.timeCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.calendarTitle}>Select time</Text>
            <View style={styles.timeColumns}>
              <ScrollView style={styles.timeColumn} showsVerticalScrollIndicator={false}>
                {HOURS.map((h) => {
                  const current = sendDate.getHours() % 12 === 0 ? 12 : sendDate.getHours() % 12;
                  const selected = current === h;
                  return (
                    <TouchableOpacity
                      key={h}
                      style={[styles.timeCell, selected && styles.timeCellActive]}
                      onPress={() => {
                        const next = new Date(sendDate);
                        const isPM = next.getHours() >= 12;
                        next.setHours((h % 12) + (isPM ? 12 : 0));
                        setSendDate(next);
                      }}
                    >
                      <Text style={[styles.timeCellText, selected && styles.timeCellTextActive]}>{h}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <ScrollView style={styles.timeColumn} showsVerticalScrollIndicator={false}>
                {MINUTES.map((m) => {
                  const selected = sendDate.getMinutes() === Number(m);
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.timeCell, selected && styles.timeCellActive]}
                      onPress={() => {
                        const next = new Date(sendDate);
                        next.setMinutes(Number(m));
                        setSendDate(next);
                      }}
                    >
                      <Text style={[styles.timeCellText, selected && styles.timeCellTextActive]}>{m}</Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <View style={styles.timeColumn}>
                {['AM', 'PM'].map((period) => {
                  const selected = (period === 'AM') === (sendDate.getHours() < 12);
                  return (
                    <TouchableOpacity
                      key={period}
                      style={[styles.timeCell, selected && styles.timeCellActive]}
                      onPress={() => {
                        const next = new Date(sendDate);
                        const hour12 = next.getHours() % 12;
                        next.setHours(period === 'AM' ? hour12 : hour12 + 12);
                        setSendDate(next);
                      }}
                    >
                      <Text style={[styles.timeCellText, selected && styles.timeCellTextActive]}>{period}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            <TouchableOpacity style={styles.sheetPrimaryButton} onPress={() => setTimePickerVisible(false)} activeOpacity={0.85}>
              <Text style={styles.sheetPrimaryButtonText}>Done</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* ---------- Action Sheet ---------- */}
      <Modal visible={!!activeMessage} animationType="slide" transparent onRequestClose={() => setActionSheetId(null)}>
        <Pressable style={styles.sheetOverlay} onPress={() => setActionSheetId(null)}>
          <Pressable style={styles.actionSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetHandle} />
            {activeMessage && (
              <>
                <Text style={styles.sheetTitle}>{recipientLabel(activeMessage.recipients)}</Text>
                <Text style={styles.actionSheetPreview} numberOfLines={2}>
                  {activeMessage.message || 'Attachment'}
                </Text>

                <TouchableOpacity style={styles.actionRow} onPress={() => { setActionSheetId(null); openComposer(activeMessage); }}>
                  <Edit3 size={18} color={theme.text} />
                  <Text style={styles.actionRowText}>Edit</Text>
                </TouchableOpacity>

                {activeMessage.status !== 'Sent' && (
                  <TouchableOpacity style={styles.actionRow} onPress={() => togglePause(activeMessage.id)}>
                    {activeMessage.paused ? <Play size={18} color={theme.text} /> : <Pause size={18} color={theme.text} />}
                    <Text style={styles.actionRowText}>{activeMessage.paused ? 'Resume' : 'Pause'}</Text>
                  </TouchableOpacity>
                )}

                {activeMessage.status !== 'Sent' && (
                  <TouchableOpacity style={styles.actionRow} onPress={() => sendNow(activeMessage.id)}>
                    <Send size={18} color={theme.primary} />
                    <Text style={[styles.actionRowText, { color: theme.primary }]}>Send now</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.actionRow} onPress={() => deleteMessage(activeMessage.id)}>
                  <Trash2 size={18} color="#FF3B30" />
                  <Text style={[styles.actionRowText, { color: '#FF3B30' }]}>Delete</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ---------- Styles ----------

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    content: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 48, paddingBottom: BottomTabInset + 32 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
    title: { color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 30, letterSpacing: -0.5 },
    subtitle: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 14, marginTop: 4 },
    headerIcon: { width: 54, height: 54, borderRadius: 18, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' },

    newButton: {
      height: 54,
      borderRadius: 27,
      backgroundColor: theme.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: theme.primary,
      shadowOpacity: 0.25,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
    },
    newButtonText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 15.5 },

    filterRow: { marginTop: 18, marginBottom: 6 },
    filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: theme.backgroundElement },
    filterChipActive: { backgroundColor: theme.primary },
    filterChipText: { color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 12.5 },
    filterChipTextActive: { color: '#fff' },

    emptyState: { alignItems: 'center', paddingVertical: 42, paddingHorizontal: 25, borderRadius: 20, borderWidth: 1, borderColor: theme.backgroundElement, marginTop: 18 },
    emptyIcon: { width: 52, height: 52, borderRadius: 26, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    emptyTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 16 },
    emptyText: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13, marginTop: 5, textAlign: 'center' },

    messageCard: {
      backgroundColor: theme.backgroundElement,
      borderRadius: 20,
      padding: 16,
      marginTop: 14,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 1,
    },
    cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 10 },
    avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
    avatarSmall: { width: 34, height: 34, borderRadius: 17, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center' },
    avatarText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 14 },
    contactName: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 14.5 },
    sendAt: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 2 },
    scheduledText: { color: theme.text, fontFamily: Fonts?.sans, fontSize: 14, lineHeight: 20, marginTop: 12 },

    statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
    statusText: { fontFamily: Fonts?.sansSemiBold, fontSize: 11 },

    cardFooterRow: { flexDirection: 'row', gap: 6, marginTop: 12 },
    metaPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: theme.background, paddingHorizontal: 8, paddingVertical: 5, borderRadius: 10 },
    metaPillText: { color: theme.textSecondary, fontFamily: Fonts?.sansMedium, fontSize: 11 },

    // modal header
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: Platform.OS === 'ios' ? 60 : 40,
      paddingBottom: 16,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.backgroundElement,
    },
    modalHeaderTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 16 },
    modalHeaderAction: { color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 15 },
    modalHeaderActionPrimary: { color: theme.primary },

    composerScroll: { padding: 20, paddingBottom: 60 },

    recipientSelector: {
      height: 52,
      borderRadius: 16,
      backgroundColor: theme.backgroundElement,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
    },
    recipientSelectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
    recipientSelectorText: { color: theme.text, fontFamily: Fonts?.sansMedium, fontSize: 14.5, flexShrink: 1 },

    chipRow: { gap: 8, paddingTop: 12, paddingBottom: 2 },
    recipientChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.backgroundSelected,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderRadius: 14,
    },
    recipientChipText: { color: theme.primary, fontFamily: Fonts?.sansSemiBold, fontSize: 12.5 },

    composerCard: {
      backgroundColor: theme.backgroundElement,
      borderRadius: 20,
      marginTop: 16,
      padding: 16,
    },
    composerInput: { color: theme.text, fontFamily: Fonts?.sans, fontSize: 15.5, lineHeight: 22, minHeight: 120, textAlignVertical: 'top' },
    composerToolbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.background },
    toolbarLeft: { flexDirection: 'row', gap: 16 },
    toolbarIcon: { padding: 2 },
    toolbarIconActive: { opacity: 1 },

    aiSection: { marginTop: 18 },
    aiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
    aiHeaderText: { color: theme.primary, fontFamily: Fonts?.sansBold, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.3 },
    aiChip: {
      backgroundColor: theme.backgroundSelected,
      paddingHorizontal: 13,
      paddingVertical: 9,
      borderRadius: 14,
    },
    aiChipText: { color: theme.primary, fontFamily: Fonts?.sansMedium, fontSize: 12.5 },

    sectionLabel: { color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 12.5, textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 24, marginBottom: 10 },

    dateTimeRow: { flexDirection: 'row', gap: 10 },
    pickerPill: {
      flex: 1,
      height: 50,
      borderRadius: 14,
      backgroundColor: theme.backgroundElement,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    pickerPillText: { color: theme.text, fontFamily: Fonts?.sansSemiBold, fontSize: 14 },

    repeatRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    repeatChip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, backgroundColor: theme.backgroundElement },
    repeatChipActive: { backgroundColor: theme.primary },
    repeatChipText: { color: theme.text, fontFamily: Fonts?.sansSemiBold, fontSize: 13 },
    repeatChipTextActive: { color: '#fff' },

    // sheets
    sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    sheetContainer: { backgroundColor: theme.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: BottomTabInset + 20 },
    sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: theme.backgroundElement, alignSelf: 'center', marginBottom: 14 },
    sheetTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sheetTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 17 },

    searchField: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: theme.backgroundElement, borderRadius: 14, paddingHorizontal: 14, height: 44, marginBottom: 12 },
    searchInput: { flex: 1, color: theme.text, fontFamily: Fonts?.sans, fontSize: 14 },

    contactRowItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 },
    contactRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    contactRowName: { color: theme.text, fontFamily: Fonts?.sansSemiBold, fontSize: 14.5 },
    contactRowSub: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 1 },

    checkCircle: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' },
    checkCircleActive: { backgroundColor: theme.primary, borderColor: theme.primary },

    sheetPrimaryButton: { height: 50, borderRadius: 25, backgroundColor: theme.primary, alignItems: 'center', justifyContent: 'center', marginTop: 14 },
    sheetPrimaryButtonText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 15 },

    centerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    calendarCard: { width: '100%', maxWidth: 340, backgroundColor: theme.background, borderRadius: 24, padding: 20 },
    calendarHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    calendarTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 15.5 },
    calendarWeekRow: { flexDirection: 'row', marginBottom: 6 },
    calendarWeekLabel: { flex: 1, textAlign: 'center', color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 11 },
    calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    calendarCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
    calendarCellActive: { backgroundColor: theme.primary, borderRadius: 18 },
    calendarCellText: { color: theme.text, fontFamily: Fonts?.sansMedium, fontSize: 13.5 },
    calendarCellTextDisabled: { color: theme.textSecondary, opacity: 0.35 },
    calendarCellTextActive: { color: '#fff', fontFamily: Fonts?.sansBold },

    timeCard: { width: '100%', maxWidth: 320, backgroundColor: theme.background, borderRadius: 24, padding: 20 },
    timeColumns: { flexDirection: 'row', gap: 10, marginTop: 14, height: 190 },
    timeColumn: { flex: 1 },
    timeCell: { paddingVertical: 10, borderRadius: 12, alignItems: 'center', marginBottom: 4 },
    timeCellActive: { backgroundColor: theme.backgroundSelected },
    timeCellText: { color: theme.text, fontFamily: Fonts?.sansMedium, fontSize: 15 },
    timeCellTextActive: { color: theme.primary, fontFamily: Fonts?.sansBold },

    actionSheet: { backgroundColor: theme.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: BottomTabInset + 20 },
    actionSheetPreview: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13, marginTop: 4, marginBottom: 14 },
    actionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.backgroundElement },
    actionRowText: { color: theme.text, fontFamily: Fonts?.sansSemiBold, fontSize: 15 },
  });
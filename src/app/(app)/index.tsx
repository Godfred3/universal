// app/(tabs)/chats.tsx
import { useRouter } from "expo-router";
import {
  MessageSquare,
  Mic,
  MoreVertical,
  Pin,
  Plus,
  RefreshCw,
  Search,
  Users
} from "lucide-react-native";
import { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { BottomTabInset, Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTheme } from "@/hooks/use-theme";
import { Modal } from "react-native";

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = "All Chats" | "Groups";

interface ChatItem {
  id: string;
  name: string;
  preview: string;
  time: string;
  avatar: string; // initials fallback
  unread?: number;
  pinned?: boolean;
  previewType?: "text" | "voice" | "sticker" | "typing" | "sync";
  online?: boolean;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const CHATS: ChatItem[] = [
  {
    id: "1",
    name: "Larry Machigo",
    preview: "Ok, Let me check",
    time: "09:38 AM",
    avatar: "LM",
    pinned: true,
    online: true,
  },
  {
    id: "2",
    name: "Natalie Nora",
    preview: "Natalie is typing...",
    time: "",
    avatar: "NN",
    unread: 2,
    previewType: "typing",
  },
  {
    id: "3",
    name: "Jennifer Jones",
    preview: "Voice message",
    time: "02:03 AM",
    avatar: "JJ",
    previewType: "voice",
  },
  {
    id: "4",
    name: "Larry Machigo",
    preview: "See you tomorrow, take...",
    time: "Yesterday",
    avatar: "LM",
  },
  {
    id: "5",
    name: "Sofia",
    preview: "Oh... thank you so...",
    time: "26 May",
    avatar: "SO",
  },
  {
    id: "6",
    name: "Haider Lve",
    preview: "Sticker",
    time: "12 Jun",
    avatar: "HL",
    previewType: "sticker",
  },
  {
    id: "7",
    name: "Mr. Elon",
    preview: "Cool -))",
    time: "11 Jun",
    avatar: "ME",
    previewType: "sync",
  },
];

// Avatar colour palette — cycles through
const AVATAR_COLORS = [
  "#7C6AF7",
  "#F78C6A",
  "#6ABFF7",
  "#F76A8C",
  "#6AF7C8",
  "#C86AF7",
  "#F7C86A",
];

function avatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  initials,
  colorIndex,
  size = 52,
}: {
  initials: string;
  colorIndex: number;
  size?: number;
}) {
  const theme = useTheme();
  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: avatarColor(colorIndex),
          alignItems: "center",
          justifyContent: "center",
        },
      ]}
    >
      <Text style={{
        color: "#fff",
        fontWeight: "700",
        fontSize: size * 0.33,
        fontFamily: Fonts?.sansBold
      }}>
        {initials}
      </Text>
    </View>
  );
}

function PreviewText({ item, styles }: { item: ChatItem, styles: any }) {
  const theme = useTheme();
  if (item.previewType === "typing") {
    return <Text style={styles.typingText}>{item.preview}</Text>;
  }
  if (item.previewType === "voice") {
    return (
      <View style={styles.previewRow}>
        <Mic size={13} color={theme.textSecondary} strokeWidth={2} />
        <Text style={[styles.previewText, { marginLeft: 4 }]}>
          {item.preview}
        </Text>
      </View>
    );
  }
  if (item.previewType === "sticker") {
    return (
      <View style={styles.previewRow}>
        <Text style={{ fontSize: 13 }}>🎨 </Text>
        <Text style={styles.previewText}>{item.preview}</Text>
      </View>
    );
  }
  if (item.previewType === "sync") {
    return (
      <View style={styles.previewRow}>
        <RefreshCw size={13} color={theme.textSecondary} strokeWidth={2} />
        <Text style={[styles.previewText, { marginLeft: 4 }]}>
          {item.preview}
        </Text>
      </View>
    );
  }
  return <Text style={styles.previewText} numberOfLines={1}>{item.preview}</Text>;
}

/** Modal for starting a new chat or group */
function NewChatModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            style={styles.modalOption}
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              router.push('/(public)/new_chat');
            }}
          >
            <View style={[styles.modalIconContainer, { backgroundColor: theme.primary + "15" }]}>
              <MessageSquare size={18} color={theme.primary} />
            </View>
            <Text style={styles.modalOptionText}>New Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.modalOption}
            activeOpacity={0.7}
            onPress={() => {
              onClose();
              router.push('/(public)/new_group');
            }}
          >
            <View style={[styles.modalIconContainer, { backgroundColor: theme.primary + "15" }]}>
              <Users size={18} color={theme.primary} />
            </View>
            <Text style={styles.modalOptionText}>New Group</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ChatsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const [activeTab, setActiveTab] = useState<Tab>("All Chats");
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fabModalVisible, setFabModalVisible] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const tabs: Tab[] = ["All Chats", "Groups"];

  const filtered = CHATS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  function openChat(item: ChatItem) {
    router.push({
      pathname: "/(chat)/[id]",
      params: { id: item.id, name: item.name, initials: item.avatar },
    });
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.helloText}>Hello,</Text>
          <Text style={styles.nameText}>Johan</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => setSearchVisible((v) => !v)}
          >
            <Search size={18} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MoreVertical size={18} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Search bar ── */}
      {searchVisible && (
        <View style={styles.searchBar}>
          <Search size={16} color={theme.textSecondary} strokeWidth={2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search chats…"
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
        </View>
      )}

      {/* ── Tabs ── */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.tabTextActive,
              ]}
            >
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Chat List ── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 100 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.chatRow}
            onPress={() => openChat(item)}
            activeOpacity={0.7}
          >
            <View style={{ position: "relative" }}>
              <Avatar initials={item.avatar} colorIndex={index} />
              {item.online && <View style={[styles.onlineDot, { borderColor: theme.background }]} />}
            </View>

            <View style={styles.chatInfo}>
              <View style={styles.chatTopRow}>
                <View style={styles.nameRow}>
                  <Text style={styles.chatName}>{item.name}</Text>
                  {item.pinned && (
                    <Pin
                      size={12}
                      color={theme.primary}
                      strokeWidth={2}
                      style={{ marginLeft: 4, transform: [{ rotate: "45deg" }] }}
                    />
                  )}
                </View>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
              <View style={styles.chatBottomRow}>
                <View style={{ flex: 1 }}>
                  <PreviewText item={item} styles={styles} />
                </View>
                {item.unread ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.unread}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* ── FAB ── */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setFabModalVisible(true)}
      >
        <Plus size={28} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      {/* ── Modals ── */}
      <NewChatModal
        visible={fabModalVisible}
        onClose={() => setFabModalVisible(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: Platform.OS === "ios" ? 60 : 48,
    paddingBottom: 16,
  },
  helloText: {
    fontSize: 14,
    color: theme.textSecondary,
    fontFamily: Fonts?.sansMedium,
  },
  nameText: {
    fontSize: 28,
    color: theme.text,
    letterSpacing: -0.5,
    fontFamily: Fonts?.sansExtraBold,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.backgroundElement,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: theme.backgroundElement,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
    fontFamily: Fonts?.sans,
  },
  tabRow: {
    flexDirection: "row",
    marginHorizontal: 24,
    backgroundColor: theme.backgroundElement,
    borderRadius: 30,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 26,
  },
  tabActive: {
    backgroundColor: theme.primary,
    shadowColor: theme.primary,
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  tabText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontFamily: Fonts?.sansSemiBold,
  },
  tabTextActive: {
    color: "#fff",
  },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 14,
  },
  separator: {
    height: 1,
    backgroundColor: theme.backgroundElement,
    marginLeft: 90,
  },
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontFamily: Fonts?.sansBold,
  },
  onlineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CD964",
    position: "absolute",
    bottom: 1,
    right: 1,
    borderWidth: 2,
  },
  chatInfo: {
    flex: 1,
  },
  chatTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  chatName: {
    fontSize: 15,
    color: theme.text,
    fontFamily: Fonts?.sansBold,
  },
  timeText: {
    fontSize: 12,
    color: theme.textSecondary,
    fontFamily: Fonts?.sans,
  },
  chatBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  previewText: {
    fontSize: 13,
    color: theme.textSecondary,
    flex: 1,
    fontFamily: Fonts?.sans,
  },
  typingText: {
    fontSize: 13,
    color: theme.primary,
    fontStyle: "italic",
    fontFamily: Fonts?.sans,
  },
  previewRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: theme.primary,
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontFamily: Fonts?.sansBold,
  },
  fab: {
    position: "absolute",
    bottom: 24 + BottomTabInset,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.primary,
    shadowOpacity: 0.45,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-end",
    alignItems: "flex-end",
  },
  modalContent: {
    backgroundColor: theme.backgroundElement,
    borderRadius: 16,
    padding: 8,
    marginRight: 24,
    marginBottom: 90 + BottomTabInset,
    width: 180,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  modalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOptionText: {
    fontSize: 15,
    color: theme.text,
    fontFamily: Fonts?.sansMedium,
  },
});
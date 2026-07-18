// app/(tabs)/status.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  Dimensions,
} from "react-native";
import {
  Camera,
  PenLine,
  X,
  Send,
} from "lucide-react-native";
import { useTheme } from "@/hooks/use-theme";
import { Fonts } from "@/constants/theme";
import { useRouter } from "expo-router";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatusItem {
  id: string;
  name: string;
  initials: string;
  bgColor: string;
  viewed: boolean;
  time?: string;
  previewText?: string;
  statusCount: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const STATUSES: StatusItem[] = [
  {
    id: "1",
    name: "Wofa George",
    initials: "WG",
    bgColor: "#2A6B3C",
    viewed: false,
    time: "2 min ago",
    previewText: "Living my best life 🌿",
    statusCount: 2,
  },
  {
    id: "2",
    name: "Mentor 🎙️",
    initials: "ME",
    bgColor: "#8B2252",
    viewed: false,
    time: "15 min ago",
    previewText: "New podcast episode out now!",
    statusCount: 1,
  },
  {
    id: "3",
    name: "Sarkso",
    initials: "SK",
    bgColor: "#1A4A7A",
    viewed: true,
    time: "5:00",
    previewText: "🎵 New track dropping soon",
    statusCount: 3,
  },
  {
    id: "4",
    name: "Larry M.",
    initials: "LM",
    bgColor: "#7C3A2A",
    viewed: true,
    time: "1 hr ago",
    previewText: "Good morning! ☀️",
    statusCount: 1,
  },
  {
    id: "5",
    name: "Natalie",
    initials: "NN",
    bgColor: "#4A2A7A",
    viewed: false,
    time: "30 min ago",
    previewText: "Weekend vibes 🌴",
    statusCount: 2,
  },
];

// ─── Card Dimensions ──────────────────────────────────────────────────────────

const CARD_WIDTH = (SCREEN_WIDTH - 48 - 12) / 3.5; // 3.5 cards visible
const CARD_HEIGHT = CARD_WIDTH * 1.72;

// ─── Components ───────────────────────────────────────────────────────────────

/** Individual status card (colored background, initials, name) */
function StatusCard({ item, onPress }: { item: StatusItem; onPress: () => void }) {
  const theme = useTheme();
  const ringColor = item.viewed ? theme.textSecondary : theme.primary;

  return (
    <TouchableOpacity
      style={[styles.statusCard, { width: CARD_WIDTH, height: CARD_HEIGHT }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Full colored background */}
      <View style={[styles.statusCardBg, { backgroundColor: item.bgColor }]} />

      {/* Top: avatar with ring */}
      <View style={styles.statusCardTop}>
        <View style={[styles.statusRing, { borderColor: ringColor }]}>
          <View style={[styles.statusAvatarCircle, { backgroundColor: item.bgColor }]}>
            <Text style={styles.statusAvatarText}>{item.initials}</Text>
          </View>
        </View>
      </View>

      {/* Bottom: name */}
      <View style={styles.statusCardBottom}>
        <Text style={styles.statusCardName} numberOfLines={2}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );
}

/** "Add status" card */
function AddStatusCard({ onPress }: { onPress: () => void }) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.statusCard, 
        styles.addStatusCard, 
        { width: CARD_WIDTH, height: CARD_HEIGHT, backgroundColor: theme.backgroundElement }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.statusCardTop}>
        <View style={styles.addStatusAvatarWrapper}>
          <View style={[styles.addStatusAvatar, { backgroundColor: theme.backgroundSelected }]}>
            <Text style={{ fontSize: 20 }}>👤</Text>
          </View>
          <View style={[styles.addStatusPlus, { backgroundColor: theme.primary, borderColor: theme.backgroundElement }]}>
            <Text style={{ color: "#fff", fontSize: 12, fontFamily: Fonts?.sansBold }}>+</Text>
          </View>
        </View>
      </View>
      <View style={styles.statusCardBottom}>
        <Text style={[styles.statusCardName, { color: theme.text }]}>Add status</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Modals ───────────────────────────────────────────────────────────────────

/** View Status Modal */
function ViewStatusModal({ item, visible, onClose }: {
  item: StatusItem | null;
  visible: boolean;
  onClose: () => void;
}) {
  if (!item) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.viewOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.viewCard, { backgroundColor: item.bgColor }]}>
          {/* Progress bar */}
          <View style={styles.progressBar}>
            {Array.from({ length: item.statusCount }).map((_, i) => (
              <View
                key={i}
                style={[
                  styles.progressSegment,
                  { backgroundColor: i === 0 ? "#fff" : "rgba(255,255,255,0.35)" },
                ]}
              />
            ))}
          </View>

          {/* Header */}
          <View style={styles.viewHeader}>
            <View style={styles.viewHeaderLeft}>
              <View style={styles.viewAvatar}>
                <Text style={styles.viewAvatarText}>{item.initials}</Text>
              </View>
              <View>
                <Text style={styles.viewName}>{item.name}</Text>
                <Text style={styles.viewTime}>{item.time}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
              <X size={22} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Status text */}
          <View style={styles.viewContent}>
            <Text style={styles.viewText}>{item.previewText}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

/** Create Status Modal */
function CreateStatusModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const [text, setText] = useState("");
  const [selectedBg, setSelectedBg] = useState<string>(theme.primary);
  const BG_OPTIONS = [theme.primary, "#6C63FF", "#F76A8C", "#F78C6A", "#6ABFF7", "#C86AF7", theme.background];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={[styles.modalCloseBtn, { backgroundColor: theme.backgroundSelected }]}>
            <X size={20} color={theme.text} strokeWidth={2} />
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>New Status</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Preview card */}
        <View style={[styles.previewCard, { backgroundColor: selectedBg }]}>
          <Text style={styles.previewCardText}>
            {text.trim() ? text : "What's on your mind?"}
          </Text>
        </View>

        {/* Color picker */}
        <View style={styles.colorPickerRow}>
          {BG_OPTIONS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorDot,
                { backgroundColor: color },
                selectedBg === color && { borderWidth: 3, borderColor: theme.text, transform: [{ scale: 1.18 }] },
              ]}
              onPress={() => setSelectedBg(color)}
            />
          ))}
        </View>

        {/* Text input */}
        <View style={[styles.statusInput, { backgroundColor: theme.backgroundElement }]}>
          <PenLine size={16} color={theme.textSecondary} strokeWidth={2} />
          <TextInput
            style={[styles.statusInputField, { color: theme.text, fontFamily: Fonts?.sans }]}
            placeholder="Type your status…"
            placeholderTextColor={theme.textSecondary}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={180}
          />
        </View>
        <Text style={[styles.charCount, { color: theme.textSecondary }]}>{text.length}/180</Text>

        {/* Post button */}
        <TouchableOpacity
          style={[
            styles.postBtn,
            { backgroundColor: text.trim() ? theme.primary : theme.backgroundElement },
          ]}
          onPress={() => { onClose(); setText(""); }}
          activeOpacity={0.85}
        >
          <Send size={18} color={text.trim() ? "#fff" : theme.textSecondary} strokeWidth={2} />
          <Text style={[styles.postBtnText, { color: text.trim() ? "#fff" : theme.textSecondary }]}>
            Post Status
          </Text>
        </TouchableOpacity>

        {/* Add media button */}
        <TouchableOpacity style={[styles.cameraBtn, { borderColor: theme.backgroundSelected }]} activeOpacity={0.8}>
          <Camera size={18} color={theme.text} strokeWidth={2} />
          <Text style={[styles.cameraBtnText, { color: theme.text }]}>Add Photo / Video</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function StatusScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [createVisible, setCreateVisible] = useState(false);
  const [viewItem, setViewItem] = useState<StatusItem | null>(null);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.text === "#ffffff" ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Updates</Text>
          <TouchableOpacity style={[styles.menuBtn, { backgroundColor: theme.backgroundElement }]}>
            <Text style={{ color: theme.text, fontSize: 18, fontFamily: Fonts?.sansBold }}>⋮</Text>
          </TouchableOpacity>
        </View>

        {/* Status section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Status</Text>
          <View style={styles.sectionActions}>
            <TouchableOpacity style={[styles.sectionIconBtn, { backgroundColor: theme.backgroundElement }]} onPress={() => router.push('/(public)/status_camera')}>
              <Camera size={18} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sectionIconBtn, { backgroundColor: theme.backgroundElement }]} onPress={() => router.push('/(public)/status_text')}>
              <PenLine size={18} color={theme.text} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Horizontal status cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusScroll}
        >
          <AddStatusCard onPress={() => setCreateVisible(true)} />
          {STATUSES.map((item) => (
            <StatusCard
              key={item.id}
              item={item}
              onPress={() => setViewItem(item)}
            />
          ))}
        </ScrollView>
      </ScrollView>

      {/* Modals */}
      <CreateStatusModal visible={createVisible} onClose={() => setCreateVisible(false)} />
      <ViewStatusModal item={viewItem} visible={!!viewItem} onClose={() => setViewItem(null)} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: Platform.OS === "ios" ? 60 : 48,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 34,
    fontFamily: Fonts?.sansExtraBold,
    letterSpacing: -0.5,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  // Section headers
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginTop: 24,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: Fonts?.sansBold,
  },
  sectionActions: { flexDirection: "row", gap: 10 },
  sectionIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },

  // Status horizontal scroll
  statusScroll: {
    paddingHorizontal: 18,
    gap: 10,
  },

  // Status card
  statusCard: {
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "space-between",
  },
  statusCardBg: {
    ...StyleSheet.absoluteFill,
    opacity: 0.85,
  },
  statusCardTop: {
    padding: 10,
    alignItems: "flex-start",
  },
  statusRing: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  statusAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  statusAvatarText: {
    color: "#fff",
    fontFamily: Fonts?.sansBold,
    fontSize: 13,
  },
  statusCardBottom: {
    padding: 10,
    paddingBottom: 12,
  },
  statusCardName: {
    color: "#fff",
    fontSize: 13,
    fontFamily: Fonts?.sansBold,
    lineHeight: 17,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },

  // Add status card
  addStatusCard: {
    justifyContent: "space-between",
  },
  addStatusAvatarWrapper: {
    alignItems: "flex-start",
  },
  addStatusAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  addStatusPlus: {
    position: "absolute",
    bottom: -2,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },

  // Create Modal
  modalContainer: { flex: 1, paddingHorizontal: 24, paddingTop: Platform.OS === "ios" ? 20 : 16 },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalCloseBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  modalTitle: { fontSize: 17, fontFamily: Fonts?.sansBold },
  previewCard: {
    height: 200, borderRadius: 20,
    alignItems: "center", justifyContent: "center",
    paddingHorizontal: 24, marginBottom: 16,
  },
  previewCardText: { color: "#fff", fontSize: 18, fontFamily: Fonts?.sansBold, textAlign: "center" },
  colorPickerRow: { flexDirection: "row", gap: 10, justifyContent: "center", marginBottom: 20 },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  statusInput: {
    flexDirection: "row", alignItems: "flex-start",
    borderRadius: 16, padding: 16, gap: 10, minHeight: 100,
  },
  statusInputField: { flex: 1, fontSize: 15, lineHeight: 22 },
  charCount: { fontSize: 11, textAlign: "right", marginTop: 6, marginBottom: 20, fontFamily: Fonts?.sans },
  postBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, height: 52, borderRadius: 26, marginBottom: 12,
  },
  postBtnText: { fontSize: 16, fontFamily: Fonts?.sansBold },
  cameraBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, height: 50, borderRadius: 26, borderWidth: 1.5,
  },
  cameraBtnText: { fontSize: 15, fontFamily: Fonts?.sansSemiBold },

  // View Status Modal
  viewOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center", justifyContent: "center", padding: 24,
  },
  viewCard: { width: "100%", height: 480, borderRadius: 28, padding: 20, overflow: "hidden" },
  progressBar: { flexDirection: "row", gap: 4, marginBottom: 16 },
  progressSegment: { flex: 1, height: 3, borderRadius: 2 },
  viewHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  viewHeaderLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  viewAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center", justifyContent: "center",
  },
  viewAvatarText: { color: "#fff", fontFamily: Fonts?.sansBold, fontSize: 14 },
  viewName: { color: "#fff", fontFamily: Fonts?.sansBold, fontSize: 15 },
  viewTime: { color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 1, fontFamily: Fonts?.sans },
  viewContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  viewText: { color: "#fff", fontSize: 22, fontFamily: Fonts?.sansBold, textAlign: "center", lineHeight: 32 },
});
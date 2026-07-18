import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, Send, Phone, Video, MoreVertical } from "lucide-react-native";

import { useTheme } from "@/hooks/use-theme";
import { Fonts } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const MESSAGES = [
  { id: "1", text: "Hey! How's it going?", sender: "other", time: "09:30 AM" },
  { id: "2", text: "All good! Just working on the new app design.", sender: "me", time: "09:32 AM" },
  { id: "3", text: "Nice! Are you using the Teal primary color?", sender: "other", time: "09:33 AM" },
  { id: "4", text: "Yeah, and the Outfit font looks amazing.", sender: "me", time: "09:35 AM" },
];

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function ChatDetailScreen() {
  const { id, name, initials } = useLocalSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const colorScheme = useColorScheme();

  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? "light-content" : "dark-content"} 
        backgroundColor={theme.background} 
      />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <ChevronLeft size={24} color={theme.text} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.avatar}>
             <Text style={styles.avatarText}>{initials || "U"}</Text>
          </View>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerName}>{name || "User"}</Text>
            <Text style={styles.headerStatus}>Online</Text>
          </View>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Phone size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Video size={20} color={theme.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <MoreVertical size={20} color={theme.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Message List ── */}
      <FlatList
        data={MESSAGES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble,
            item.sender === "me" ? styles.myMessage : styles.otherMessage
          ]}>
            <Text style={[
              styles.messageText,
              item.sender === "me" ? styles.myMessageText : styles.otherMessageText
            ]}>
              {item.text}
            </Text>
            <Text style={styles.timeText}>{item.time}</Text>
          </View>
        )}
      />

      {/* ── Input Area ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor={theme.textSecondary}
              multiline
            />
          </View>
          <TouchableOpacity style={styles.sendBtn}>
            <Send size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.backgroundSelected,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  backBtn: {
    padding: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#fff",
    fontFamily: Fonts?.sansBold,
    fontSize: 16,
  },
  headerTitleContainer: {
    justifyContent: "center",
  },
  headerName: {
    fontSize: 17,
    fontFamily: Fonts?.sansBold,
    color: theme.text,
  },
  headerStatus: {
    fontSize: 12,
    fontFamily: Fonts?.sans,
    color: theme.primary,
  },
  headerIcons: {
    flexDirection: "row",
    gap: 16,
  },
  iconBtn: {
    padding: 4,
  },
  messageList: {
    padding: 16,
    gap: 12,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 20,
    marginBottom: 4,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: theme.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: theme.backgroundSelected,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    fontFamily: Fonts?.sans,
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  otherMessageText: {
    color: theme.text,
  },
  timeText: {
    fontSize: 10,
    fontFamily: Fonts?.sans,
    color: "rgba(0,0,0,0.4)",
    alignSelf: "flex-end",
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    gap: 12,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: theme.backgroundSelected,
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 44,
    justifyContent: "center",
  },
  input: {
    fontFamily: Fonts?.sans,
    fontSize: 15,
    color: theme.text,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: theme.primary,
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
});
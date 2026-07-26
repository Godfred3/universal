import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Search, X } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomTabInset, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ContactRecord, createGroupChat, getFriendsAndContacts } from '@/lib/chats';

export default function NewGroupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContactIds, setSelectedContactIds] = useState<Set<string>>(new Set());
  const [groupName, setGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const styles = useMemo(() => createStyles(theme), [theme]);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const data = await getFriendsAndContacts();
        setContacts(data);
      } catch (error) {
        console.warn('[new_group] failed to load contacts', error);
      } finally {
        setLoading(false);
      }
    };

    void loadContacts();
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const name = (c.full_name || c.username || '').toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const toggleContact = (contactId: string) => {
    setSelectedContactIds((prev) => {
      const next = new Set(prev);
      if (next.has(contactId)) {
        next.delete(contactId);
      } else {
        next.add(contactId);
      }
      return next;
    });
  };

  const selectedContacts = contacts.filter((c) => selectedContactIds.has(c.id));

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      Alert.alert('Group name required', 'Please enter a name for the group');
      return;
    }

    if (selectedContactIds.size === 0) {
      Alert.alert('Add members', 'Please select at least one member');
      return;
    }

    try {
      setCreating(true);
      const chatId = await createGroupChat(groupName.trim(), Array.from(selectedContactIds));
      router.push(`/(chat)/${chatId}`);
    } catch (error) {
      console.warn('[new_group] failed to create group', error);
      Alert.alert('Failed to create group', 'Please try again');
      setCreating(false);
    }
  };

  const renderContact = ({ item }: { item: ContactRecord }) => {
    const isSelected = selectedContactIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.contactRow, isSelected && styles.contactRowSelected]}
        onPress={() => toggleContact(item.id)}
        disabled={creating}
        activeOpacity={0.7}
      >
        {item.avatar_url ? (
          <Image source={{ uri: item.avatar_url }} style={styles.contactAvatar} />
        ) : (
          <View style={[styles.contactAvatarPlaceholder, { backgroundColor: theme.backgroundElement }]}>
            <Text style={styles.contactAvatarText}>{(item.full_name || item.username || '?')[0].toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.full_name || item.username || 'Unknown'}</Text>
          <Text style={styles.contactStatus} numberOfLines={1}>{item.bio_status || 'User'}</Text>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Check size={14} color="#fff" strokeWidth={3} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} disabled={creating}>
          <ArrowLeft size={22} color={theme.primary} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>New Group</Text>
          <Text style={styles.headerSubtitle}>Add participants</Text>
        </View>
        <TouchableOpacity onPress={handleCreateGroup} style={styles.createButton} disabled={creating || selectedContactIds.size === 0}>
          {creating ? <ActivityIndicator size="small" color={theme.primary} /> : <Check size={22} color={selectedContactIds.size > 0 ? theme.primary : theme.textSecondary} />}
        </TouchableOpacity>
      </View>

      {/* Group name input */}
      <View style={styles.groupNameSection}>
        <TextInput
          style={styles.groupNameInput}
          placeholder="Group name (optional)"
          placeholderTextColor={theme.textSecondary}
          value={groupName}
          onChangeText={setGroupName}
          editable={!creating}
        />
      </View>

      {/* Selected members */}
      {selectedContacts.length > 0 && (
        <View style={styles.selectedSection}>
          <Text style={styles.sectionLabel}>Selected members ({selectedContacts.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.selectedList}>
            {selectedContacts.map((contact) => (
              <View key={contact.id} style={styles.selectedMember}>
                {contact.avatar_url ? (
                  <Image source={{ uri: contact.avatar_url }} style={styles.selectedMemberAvatar} />
                ) : (
                  <View style={[styles.selectedMemberAvatar, { backgroundColor: theme.backgroundElement }]}>
                    <Text style={styles.selectedMemberText}>{(contact.full_name || contact.username || '?')[0]}</Text>
                  </View>
                )}
                <TouchableOpacity
                  style={styles.removeMemberButton}
                  onPress={() => toggleContact(contact.id)}
                  disabled={creating}
                >
                  <X size={12} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchContainer}>
        <Search size={18} color={theme.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search contacts"
          placeholderTextColor={theme.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
          editable={!creating}
        />
      </View>

      {/* Contacts list */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : filteredContacts.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No contacts found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredContacts}
          keyExtractor={(item) => item.id}
          renderItem={renderContact}
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: { paddingHorizontal: 16, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
    backButton: { padding: 8 },
    headerText: { flex: 1 },
    headerTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 18 },
    headerSubtitle: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 2 },
    createButton: { padding: 8 },
    groupNameSection: { paddingHorizontal: 16, paddingVertical: 12 },
    groupNameInput: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.backgroundElement, color: theme.text, fontFamily: Fonts?.sans, fontSize: 14 },
    selectedSection: { paddingHorizontal: 16, paddingBottom: 12 },
    sectionLabel: { color: theme.textSecondary, fontFamily: Fonts?.sansMedium, fontSize: 12, marginBottom: 8 },
    selectedList: { gap: 8 },
    selectedMember: { position: 'relative' },
    selectedMemberAvatar: { width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    selectedMemberText: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 14 },
    removeMemberButton: { position: 'absolute', top: -4, right: -4, width: 20, height: 20, borderRadius: 10, backgroundColor: theme.secondary, alignItems: 'center', justifyContent: 'center' },
    searchContainer: { marginHorizontal: 16, marginVertical: 12, paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, backgroundColor: theme.backgroundElement, flexDirection: 'row', alignItems: 'center', gap: 8 },
    searchInput: { flex: 1, color: theme.text, fontFamily: Fonts?.sans, fontSize: 14, paddingVertical: 6 },
    listContent: { paddingHorizontal: 16, paddingBottom: BottomTabInset + 20 },
    contactRow: { paddingVertical: 12, paddingHorizontal: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 12, backgroundColor: theme.backgroundElement },
    contactRowSelected: { backgroundColor: theme.backgroundSelected },
    contactAvatar: { width: 44, height: 44, borderRadius: 12 },
    contactAvatarPlaceholder: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
    contactAvatarText: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 12 },
    contactInfo: { flex: 1 },
    contactName: { color: theme.text, fontFamily: Fonts?.sansMedium, fontSize: 14 },
    contactStatus: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 2 },
    checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 2, borderColor: theme.backgroundSelected, alignItems: 'center', justifyContent: 'center' },
    checkboxSelected: { backgroundColor: theme.primary, borderColor: theme.primary },
    centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    emptyText: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 16 },
  });

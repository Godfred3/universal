import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, X, Send, Check } from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Fonts } from '@/constants/theme';

interface Contact {
  id: string;
  name: string;
  status: string;
  avatar: string | null;
}

interface SelectedContact {
  id: string;
  name: string;
  avatar: string;
}

const dummyContacts: Contact[] = [
  {
    id: '1',
    name: 'Marcus Aurelius',
    status: 'History is a bath of blood.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCx3dWiJ73Cy1LCK_mH9op074kxp-psns_Oz2_7jw96cfwDwaqLhYEeslZlTM-tv002XkZE6VdR-TmoZEbW9lk2DNiXmoh2r6bj2JlwrnpvbPxvTVvqNuqPvUJGun_ScZBad8EbsVTOQEPJ1ALzF4OxKU-3paymyu9ekp2GxkQ0R6MkIGSxIahk-B1W5V6zbXxAMoe-pzAMFpHR_PUzeFR0CgFr_f_UHBjwMmFEdW133NKVsTz8H0zo-Bd275IHTw9XLGVxzoDur-g',
  },
  {
    id: '2',
    name: 'Elara Vance',
    status: 'Design is in the details.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDritK6EExgZJJDGnOiGcOUMfnrYFlBHwZ17TpCqWOhJslTEf5fcWbOHd-CU-JBaSfCd441lxBDMBh4WrkoC7UACM4kOtaTlNrgunVac3Lbr4wJcZxTTsGBgOesEbrf6eRgx-dN1aAXGXHWUbaoPphaOA5wsvB2adimEkr_de_dWDjWt0OAHUUTQmpMUcp9HQngTRkl1uk_dbJG8l6Fv0s5YXIbp5iyJ1sgLUfvwOfyvMyLQ16AlaTNoJXYBelYTuo-xL_zcuwr7Z4',
  },
  {
    id: '3',
    name: 'Julian Thorne',
    status: 'Coding into the void...',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-4czVUmZ2eTqOt9y27CU4NdpiJ9RvNx9pswVcuJmn-PGrNWXfZYVUWTGLBmy7RzGmCiyY7B9-w-olFf0oC0Bd-kSyVW1IWhUEiCfDtzyZA1NFPucyzoVhfLtDa55HgfPfOMboMuIZOaPAoUjsbkkXOJIlXyQJz8Jh_cIhqSBLiIvylAtPkzcDQgii7tG-NY5HiOJ-l08vbbN0dXXZL5j2aPjiKyS82ys_zi1_pMsI4QVPO_RwgfBuwlbxsgJ47-dPXayVBTiLvgc',
  },
  {
    id: '4',
    name: 'Sasha Grey',
    status: 'Active now',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBCwXklVE94NujcnPQMMRtsoNlL-rHq3a2Z6ZA70yMtLsTrODE3xFgACwU864QIDmPax6tQeDMeJCx8x2SjjLdbm87i8iF-SfLecTYYtb0mRTpR79BXKWfLi-r_kW-VoKAeYnzMNnAf8azf__lgNspVThb7Ue3EYU6IViwfh3M2h_6DoG2bgZOZ82elQHRRcTOldPPmFsYOPi4aQVhff_UMCT7-jfl4DY_TenHuvdBQ2zFnXnojkExjGvKWnI_IdIN7CtERr07D5cg',
  },
  {
    id: '5',
    name: 'Zion Walker',
    status: 'Busy',
    avatar: null,
  },
];

const dummySelectedMembers: SelectedContact[] = [
  {
    id: '1',
    name: 'Alex',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACCkNj154FLE5WJRiyXXybjv7HPdcyxqo3XybPnqjZk3kT-Tk0zHdfcvNhGfLTMHZwsTRO4kJzlp9VfNxweRZ5rOmReCAIpZp_-CrIJalxnponMVAN8mlGNDjNvrWua4FCbJbDMN9RbilQexWv4TosLuLXLDtODRj-yolGfYNOYQoSUbGoozW6B14ysQp25Cd8d6JqpipvPlrc972is3-P84Hbaf3EoXfhaWNu2Yfh2glCc7xDOs-fQ7KUPBKXSLEjzWrTOaTR1R0',
  },
  {
    id: '2',
    name: 'Sarah',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBF3zWKkz6FxXpKxKYFgKq-M60G-rpvWXvHEQl3bukCYt8HN4wa-w4MT3Ia3gGer4sJ5Z4LBY_pnOmwT9c1EAz7d6279lzqYdYwMvNp-ai78Tbp2f9fd2sJ1anaKmsaYW5566iF6u9_blkEsbiuhaPuMXMUaVf2JkzY2EmHluV3IYr7R768keH7wbQ5PBj3huDHgk1Olw6kyRMRIGAhD87rLU5T9pdJG-WNwTjyfuoTe59tpdp1c3zZMeX2QOkCgxjTmfA10ll52E',
  },
  {
    id: '3',
    name: 'David',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_fS2TnP-ZspE3tkQoCArer5C3Qdj7dQ6592GYxmF15fvv4pI72KZzdqaZMIvrQBDai0MvtLG_ch8Tz77VI5Pa6VamE-wOyuGHkusvjSKQFCrMo0DizSHLN9vI5GoqeQ0XG4Al58FqW4nE9Ah_uZWaLsBXZY8tR8MXpG9A9Eg8v1jPjNekkq4yop3mpJ2CNCOSq-4VTQMBmDJjXB7qbFSi4DzGf7KSWGTWtgQ7kNmV9sn9eLnBMne4ZyN-sgtUrhsfx3JZGV44ytM',
  },
];

export default function NewGroupScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<SelectedContact[]>(dummySelectedMembers);
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set(['2']));

  const styles = useMemo(() => createStyles(theme), [theme]);

  const filteredContacts = dummyContacts.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const toggleContact = (contact: Contact) => {
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      if (next.has(contact.id)) {
        next.delete(contact.id);
        setSelectedMembers((members) => members.filter((m) => m.id !== contact.id));
      } else {
        next.add(contact.id);
        if (contact.avatar) {
          setSelectedMembers((m) => [...m, { id: contact.id, name: contact.name, avatar: contact.avatar! }]);
        }
      }
      return next;
    });
  };

  const removeMember = (id: string) => {
    setSelectedMembers((members) => members.filter((m) => m.id !== id));
    setSelectedContacts((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const renderSelectedMember = ({ item }: { item: SelectedContact }) => (
    <View style={styles.selectedItem}>
      <View style={styles.selectedAvatarWrapper}>
        <Image source={{ uri: item.avatar }} style={styles.selectedAvatar} />
        <TouchableOpacity style={styles.removeBtn} onPress={() => removeMember(item.id)}>
          <X size={12} color={theme.primary} />
        </TouchableOpacity>
      </View>
      <Text style={styles.selectedName} numberOfLines={1}>{item.name}</Text>
    </View>
  );

  const renderContact = ({ item }: { item: Contact }) => {
    const isSelected = selectedContacts.has(item.id);
    return (
      <TouchableOpacity style={styles.contactRow} activeOpacity={0.7} onPress={() => toggleContact(item)}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.contactAvatar} />
        ) : (
          <View style={styles.contactAvatarPlaceholder}>
            <Text style={styles.contactAvatarText}>{item.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.contactInfo}>
          <View style={styles.contactTopRow}>
            <Text style={styles.contactName} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Check size={14} color="#000" strokeWidth={3} />}
            </View>
          </View>
          <Text style={styles.contactStatus} numberOfLines={1}>{item.status}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={22} color={theme.primary} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>New Group</Text>
            <Text style={styles.headerSubtitle}>Add participants</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Search size={20} color={theme.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name or number"
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Selected Contacts */}
      {selectedMembers.length > 0 && (
        <View style={styles.selectedSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectedList}
          >
            {selectedMembers.map((item) => (
              <View key={item.id} style={styles.selectedItem}>
                <View style={styles.selectedAvatarWrapper}>
                  <Image source={{ uri: item.avatar }} style={styles.selectedAvatar} />
                  <TouchableOpacity style={styles.removeBtn} onPress={() => removeMember(item.id)}>
                    <X size={12} color={theme.primary} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.selectedName} numberOfLines={1}>{item.name}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Contacts List */}
      <View style={styles.contactsSectionHeader}>
        <Text style={styles.contactsSectionTitle}>Contacts on Emerald</Text>
      </View>

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        renderItem={renderContact}
        contentContainerStyle={styles.contactsList}
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => router.push('/(public)/new_group_next')}
      >
        <Send size={22} color={theme.primary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      height: 56,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: 20,
      color: theme.primary,
      fontFamily: Fonts?.sansBold,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      fontFamily: Fonts?.sansMedium,
    },
    cancelButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
    },
    cancelText: {
      fontSize: 14,
      color: theme.primary,
      fontFamily: Fonts?.sansMedium,
    },
    searchContainer: {
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 8,
    },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundElement,
      borderRadius: 28,
      paddingHorizontal: 16,
      height: 48,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: theme.text,
      fontFamily: Fonts?.sans,
    },
    selectedSection: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.backgroundElement,
      paddingVertical: 12,
    },
    selectedList: {
      paddingHorizontal: 18,
      gap: 16,
    },
    selectedItem: {
      alignItems: 'center',
      width: 64,
    },
    selectedAvatarWrapper: {
      position: 'relative',
      marginBottom: 6,
    },
    selectedAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: theme.primary,
    },
    removeBtn: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: theme.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.background,
    },
    selectedName: {
      fontSize: 10,
      color: theme.text,
      fontFamily: Fonts?.sansMedium,
      textAlign: 'center',
    },
    contactsSectionHeader: {
      paddingHorizontal: 18,
      paddingVertical: 12,
    },
    contactsSectionTitle: {
      fontSize: 12,
      color: theme.primary,
      fontFamily: Fonts?.sansMedium,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },
    contactsList: {
      paddingBottom: 100,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 18,
      paddingVertical: 12,
    },
    contactAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 16,
      backgroundColor: theme.backgroundElement,
    },
    contactAvatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      marginRight: 16,
      backgroundColor: theme.primary + '30',
      alignItems: 'center',
      justifyContent: 'center',
    },
    contactAvatarText: {
      fontSize: 18,
      color: theme.primary,
      fontFamily: Fonts?.sansBold,
    },
    contactInfo: {
      flex: 1,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.backgroundElement,
      paddingBottom: 12,
    },
    contactTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    contactName: {
      fontSize: 15,
      color: theme.text,
      fontFamily: Fonts?.sansBold,
      flex: 1,
    },
    contactStatus: {
      fontSize: 14,
      color: theme.textSecondary,
      fontFamily: Fonts?.sans,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.textSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxSelected: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,
    },
    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.primary + '40',
    },
  });

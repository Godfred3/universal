import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { Stack, useRouter } from 'expo-router';
import { MoreVertical, Search, User, Users } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Contact {
  id: string;
  name: string;
  status: string;
  avatar: string | null;
}

const dummyContacts: Contact[] = [
  {
    id: '1',
    name: 'Marcus Aurelius',
    status: 'Hey there! I am using ChatApp',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB934g-guYzsQOHWLb89-MzzFx2EcqaBnywVavb3meKjkd_VbB53vj0TIKurw_m_tsMvgn7w7WOle6wp2MzVwTU63ba1tCMee09wnc43siOZzM2D2AQ-Zal-i3HDTO-R1fykgenu1RqGeHouix51Pz8Ilw6W-a9kp8C6X80PFY1Bax6lh7woeSuskCDq24FkJ7JvK74ZX7sJBWAEoFM9RNPYWgSIyYomCFUZFsQLJ4e7p9NNjSjTvhUIYsaM5OeYCf_nx7K3exzdZs',
  },
  {
    id: '2',
    name: 'Elara Vance',
    status: 'Busy',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPTW2IQJzOMvpf0LiN9gGRQMOhoSZotJkcHXpv6rzW0sLIuvGAp2GQeapt8uRPU1NyzFd3J_OZkyPozQ0mcJSZhsFbL5gKsYtgFXxReYNUPAR9c69y-wMOkz22IamXcFct7M39imSwzIQys4mGkpWiWa2aheTfXoGaCoMpxTV3vEfCkMi55g83h9ggb0upqCh_dSucqJ02ZadZCtSB8afax533L40oSv9PhFT8Og-z95CwPH9LdOgTZF-dgzgHw2rLH4pnVPGUfb8',
  },
  {
    id: '3',
    name: 'Julian Thorne',
    status: 'At the gym 🏋️‍♂️',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBkuhtN0IX3be7LAsVIx27J7yddaXh90wuauylyn-bMbzakVPsC96VUDyIGvgGulMoArbuz-cr3_VZI0kQZu1aH_Mk6A3AYKMX0vmFw7Cy7X5aVdgxKbQ_05hNAmrl5WHd23T2e1Xr-tITI6LW9xehfJI6h3aIx7nZEzMqIVJ8AdpCfZcx1fbuajoxXxsN6Q-N5Ws4A4UBa46G-cZ7S7TfMHtA3G6Vhom_i-lno9-wB8JUo_eMd9KFEwMdB99kjgYjSUDUo5di6O_0',
  },
  {
    id: '4',
    name: 'Cassian Grey',
    status: 'Available',
    avatar: null,
  },
  {
    id: '5',
    name: 'Lyra Moon',
    status: 'Urgent calls only',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0SR-fdenv8plqqAmmJpwOU2-WruX2ZgXg1uZlZU1c7atxlBNHsr2V27BDyq_vAS-VosdpHF4WyOI7GSWtA7WhY0dMtXvrk8Du5818sTfPvnvCRORV16D9pGT7vOgQjn_0zwAzM2KPtfq72nGdxR4YbW6VFiFay7QEGsLTL94A-0A8fb-sMIa3o7d0sFC1ZqbOTjrQz0ZHC-tiG5GUW7Hun8ACAuiHFBDzFVcGZcfK6Un_54R6cdrW27PnXRLtwjtuVFHc0_9Z2lU',
  },
  {
    id: '6',
    name: 'Silas Vane',
    status: 'Sleeping...',
    avatar: null,
  },
];

export default function NewChatScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const styles = useMemo(() => createStyles(theme), [theme]);

  const filteredContacts = dummyContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderHeader = () => (
    <View>
      <View style={styles.sectionHeaderContainer}>
        <Text style={styles.sectionHeader}>Select a contact to begin a new chat</Text>
      </View>

      <View style={styles.actionSection}>
        <TouchableOpacity style={styles.actionRow} activeOpacity={0.7}>
          <View style={[styles.actionIconContainer, { backgroundColor: theme.primary + '20' }]}>
            <Users size={24} color={theme.primary} />
          </View>
          <Text style={styles.actionText}>New Group</Text>
        </TouchableOpacity>


      </View>

      <View style={styles.contactsHeaderContainer}>
        <Text style={styles.contactsHeaderText}>Contacts on ChatApp</Text>
      </View>
    </View>
  );

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity style={styles.contactRow} activeOpacity={0.7}>
      {item.avatar ? (
        <Image source={{ uri: item.avatar }} style={styles.avatar} />
      ) : (
        <View style={styles.avatarPlaceholder}>
          <User size={24} color={theme.textSecondary} />
        </View>
      )}
      <View style={styles.contactInfo}>
        <Text style={styles.contactName}>{item.name}</Text>
        <Text style={styles.contactStatus} numberOfLines={1}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen
        options={{
          headerTitle: () => (
            <View>
              <Text style={styles.navTitle}>New Chat</Text>
              <Text style={styles.navSubtitle}>{dummyContacts.length} contacts</Text>
            </View>
          ),
          headerRight: () => (
            <View style={styles.navRightIcons}>
              <TouchableOpacity style={styles.navIconBtn}>
                <Search size={20} color={theme.text} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.navIconBtn}>
                <MoreVertical size={20} color={theme.text} />
              </TouchableOpacity>
            </View>
          ),
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
          headerShadowVisible: true,
        }}
      />

      {/* Sticky search bar — outside FlatList so it never scrolls */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
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

      <FlatList
        data={filteredContacts}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={renderContact}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  navTitle: {
    fontSize: 18,
    color: theme.text,
    fontFamily: Fonts?.sansBold,
  },
  navSubtitle: {
    fontSize: 12,
    color: theme.textSecondary,
    fontFamily: Fonts?.sans,
  },
  navRightIcons: {
    flexDirection: 'row',
    gap: 16,
  },
  navIconBtn: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.backgroundElement,
    borderRadius: 30,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.text,
    fontFamily: Fonts?.sans,
  },
  sectionHeaderContainer: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  sectionHeader: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: theme.primary,
    fontFamily: Fonts?.sansMedium,
  },
  actionSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  actionTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionText: {
    fontSize: 16,
    color: theme.text,
    fontFamily: Fonts?.sansMedium,
  },
  contactsHeaderContainer: {
    backgroundColor: theme.backgroundElement,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 8,
  },
  contactsHeaderText: {
    fontSize: 13,
    color: theme.textSecondary,
    fontFamily: Fonts?.sansMedium,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.backgroundElement,
    paddingBottom: 12,
  },
  contactName: {
    fontSize: 16,
    color: theme.text,
    fontFamily: Fonts?.sansMedium,
    marginBottom: 2,
  },
  contactStatus: {
    fontSize: 14,
    color: theme.textSecondary,
    fontFamily: Fonts?.sans,
  },
});

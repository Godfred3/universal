import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { ArrowLeft, Camera, Edit, Plus, Send, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Member {
  id: string;
  name: string;
  avatar: string;
}

const dummyMembers: Member[] = [
  {
    id: '1',
    name: 'Alex',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC0Zuyn6gdfRXWWZyaaQ52Pbl5lIniVwr3WarTVL9O0n1S9vaGuTJ_-NrhiGopM0j61iWZd8r-oQQBnOu8sX8ugSjL4ZajksUz8CwudcTgk9r88sgpHSMLqpxJ0kVlmM274d9776kCJ3sTEeRoaU5r3K1mL8xJeYsRWP43lgyfiv5dEspW2NXLR8qqll1FMmVrZoLinU7YbHcaB3F9swIc9Vt6mVqv1fzfHxjSBVZOucXmKZl-XobcjRhUXtkUb6-x0ERScB9Tqgoo',
  },
  {
    id: '2',
    name: 'Sarah',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD9cpPpul7brzMces8Bv-LadhdjRHuwY4ejC4oo5s5D-VUkGRlMtwCTqseGICZmitzxecKGt9nUsdgoDcwDiV_V8GwOQccwc9OKzBq__GFu0Vv9bvPaZKvKSUX8iqLEoeecmeVtKOz59_GMYMmpvm5e_Wf4-9QRG3UWGMJOR7sYpSNCJt7BznzG9tnNF7FGcnWneM1almEGGvT4Vn9Qdbx7cG0K-iar8NXvVGtWltRy3_aH0dwORROGulBTa2gko8q0NORpyt3Ifws',
  },
  {
    id: '3',
    name: 'David',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACQGh-Zj7g99b6cJH6QfN7efhOqh6-zuuiw7s-FjRuOAilBPnihAFu9D93sr0jeqrQqG1aWUGN6Mr1GBppgylCHFfnCQvAfnrjs_7H4iGscgvhX6k6-ulbWoYf_td254CH6kuKUPX8IgqhcgkHeu-ViuvKS8dIsXEpDRtWDbNYnUjp4sJA9gUK75QTuDACJBxABPNuUrepK0zcgQd6ifKLUCcdTzcT1zjcSDkozLJsL3rrIlID2_qK73VllfOfOESGinHFVFPwgLc',
  },
];

export default function NewGroupNextScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [editSettings, setEditSettings] = useState(true);
  const [sendMessages, setSendMessages] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [members, setMembers] = useState<Member[]>(dummyMembers);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleCreate = () => {
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      router.back();
      router.back();
    }, 1500);
  };

  const removeMember = (id: string) => {
    setMembers((members) => members.filter((m) => m.id !== id));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>New Group</Text>
          <Text style={styles.headerSubtitle}>Add subject</Text>
        </View>
        <TouchableOpacity style={styles.createButton} onPress={handleCreate} disabled={isCreating}>
          <Text style={styles.createButtonText}>{isCreating ? 'CREATING...' : 'CREATE'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile & Name */}
        <View style={styles.sectionRow}>
          <TouchableOpacity style={styles.photoContainer} activeOpacity={0.8}>
            <View style={styles.photoCircle}>
              <Camera size={32} color={theme.textSecondary} />
            </View>
            <View style={styles.addBadge}>
              <Plus size={14} color="#fff" strokeWidth={3} />
            </View>
          </TouchableOpacity>

          <View style={styles.nameInputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.nameInput}
                placeholder="Group name"
                placeholderTextColor={theme.textSecondary}
                value={groupName}
                onChangeText={setGroupName}
                maxLength={100}
              />
              <Text style={styles.charCount}>{groupName.length}/100</Text>
            </View>
            <Text style={styles.inputHelperText}>Provide a group subject and optional group icon</Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Description</Text>
          <TextInput
            style={styles.descriptionInput}
            placeholder="Add group description"
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Group Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Group Settings</Text>
          <View style={styles.settingsCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <Edit size={20} color={theme.textSecondary} style={styles.settingIcon} />
                <Text style={styles.settingText}>Edit group settings</Text>
              </View>
              <Switch
                value={editSettings}
                onValueChange={setEditSettings}
                trackColor={{ false: theme.backgroundElement, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>

            <View style={[styles.settingRow, styles.borderTop]}>
              <View style={styles.settingLeft}>
                <Send size={20} color={theme.textSecondary} style={styles.settingIcon} />
                <Text style={styles.settingText}>Send messages</Text>
              </View>
              <Switch
                value={sendMessages}
                onValueChange={setSendMessages}
                trackColor={{ false: theme.backgroundElement, true: theme.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        </View>

        {/* Members */}
        <View style={styles.section}>
          <View style={styles.membersHeader}>
            <Text style={styles.sectionHeader}>Members ({members.length})</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.editListText}>Edit list</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.membersScroll}
          >
            {members.map((member) => (
              <View key={member.id} style={styles.memberItem}>
                <View style={styles.memberAvatarContainer}>
                  <Image source={{ uri: member.avatar }} style={styles.memberAvatar} />
                  <TouchableOpacity style={styles.removeMemberBtn} onPress={() => removeMember(member.id)}>
                    <X size={12} color={theme.text} />
                  </TouchableOpacity>
                </View>
                <Text style={styles.memberName} numberOfLines={1}>{member.name}</Text>
              </View>
            ))}

            <TouchableOpacity style={styles.memberItem} activeOpacity={0.7} onPress={() => router.back()}>
              <View style={styles.addMemberBtn}>
                <Plus size={24} color={theme.primary} />
              </View>
              <Text style={styles.addMemberText}>Add</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </ScrollView>
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
      paddingHorizontal: 16,
      height: 56,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.backgroundElement,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleContainer: {
      flex: 1,
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 18,
      color: theme.text,
      fontFamily: Fonts?.sansBold,
    },
    headerSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
      fontFamily: Fonts?.sans,
    },
    createButton: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 8,
    },
    createButtonText: {
      color: theme.primary,
      fontFamily: Fonts?.sansBold,
      fontSize: 14,
      letterSpacing: 0.5,
    },
    scrollContent: {
      padding: 24,
      paddingBottom: 60,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 24,
      paddingBottom: 24,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.backgroundElement,
    },
    photoContainer: {
      marginRight: 20,
      position: 'relative',
    },
    photoCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      borderWidth: 2,
      borderColor: theme.backgroundElement,
      borderStyle: 'dashed',
      backgroundColor: theme.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
    },
    addBadge: {
      position: 'absolute',
      bottom: -2,
      right: -2,
      backgroundColor: theme.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: theme.background,
    },
    nameInputContainer: {
      flex: 1,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      borderBottomWidth: 2,
      borderBottomColor: theme.backgroundElement,
      paddingBottom: 6,
      marginBottom: 8,
    },
    nameInput: {
      flex: 1,
      fontSize: 16,
      fontFamily: Fonts?.sansMedium,
      color: theme.text,
      padding: 0,
    },
    charCount: {
      fontSize: 12,
      color: theme.textSecondary,
      fontFamily: Fonts?.sans,
      marginLeft: 8,
    },
    inputHelperText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontFamily: Fonts?.sans,
    },
    section: {
      marginBottom: 24,
      paddingBottom: 24,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.backgroundElement,
    },
    sectionHeader: {
      fontSize: 12,
      color: theme.primary,
      fontFamily: Fonts?.sansBold,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 12,
    },
    descriptionInput: {
      backgroundColor: theme.backgroundElement,
      borderRadius: 12,
      padding: 12,
      color: theme.text,
      fontFamily: Fonts?.sans,
      fontSize: 14,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    settingsCard: {
      backgroundColor: theme.backgroundElement,
      borderRadius: 16,
      overflow: 'hidden',
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    borderTop: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.background,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingIcon: {
      marginRight: 16,
    },
    settingText: {
      fontSize: 15,
      color: theme.text,
      fontFamily: Fonts?.sansMedium,
    },
    membersHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },
    editListText: {
      fontSize: 13,
      color: theme.primary,
      fontFamily: Fonts?.sansMedium,
    },
    membersScroll: {
      paddingBottom: 8,
      gap: 16,
    },
    memberItem: {
      alignItems: 'center',
      width: 64,
    },
    memberAvatarContainer: {
      position: 'relative',
      marginBottom: 8,
    },
    memberAvatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: theme.backgroundElement,
    },
    removeMemberBtn: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: theme.backgroundElement,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: theme.background,
    },
    memberName: {
      fontSize: 12,
      color: theme.text,
      fontFamily: Fonts?.sansMedium,
      textAlign: 'center',
    },
    addMemberBtn: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 2,
      borderColor: theme.backgroundElement,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    addMemberText: {
      fontSize: 12,
      color: theme.textSecondary,
      fontFamily: Fonts?.sansMedium,
    },
  });

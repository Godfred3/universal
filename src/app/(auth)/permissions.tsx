// src/app/(auth)/permissions.tsx
// ─────────────────────────────────────────────────────────────────────────────
// Permissions onboarding screen — shown once after a user completes signup.
// Requests Contacts, Camera, Microphone, and Media Library permissions with
// a clear explanation for each before the user lands on the main app.
// ─────────────────────────────────────────────────────────────────────────────

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import {
  AllPermissionsStatus,
  requestAllPermissions,
  requestCameraPermission,
  requestContactsPermission,
  requestMediaLibraryPermission,
  requestMicrophonePermission,
} from '@/hooks/use-permissions';
import { useRouter } from 'expo-router';
import {
  BookUser,
  Camera,
  CheckCircle2,
  ChevronRight,
  HardDrive,
  Mic,
  ShieldCheck,
  XCircle,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ── Types ─────────────────────────────────────────────────────────────────────

type PermissionKey = keyof AllPermissionsStatus;
type PermissionStatus = 'granted' | 'denied' | 'undetermined';

interface PermissionItem {
  key: PermissionKey;
  label: string;
  description: string;
  icon: React.ReactNode;
  request: () => Promise<PermissionStatus>;
}

// ── Main Screen ───────────────────────────────────────────────────────────────

export default function PermissionsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [statuses, setStatuses] = useState<Partial<AllPermissionsStatus>>({});
  const [loading, setLoading] = useState(false);
  const [requestingAll, setRequestingAll] = useState(false);

  const permissions: PermissionItem[] = [
    {
      key: 'contacts',
      label: 'Contacts',
      description: 'Find friends who are already on ChatApp by scanning your address book.',
      icon: <BookUser size={24} color={theme.primary} strokeWidth={2} />,
      request: requestContactsPermission,
    },
    {
      key: 'camera',
      label: 'Camera',
      description: 'Take photos and videos to share in chats or set your profile picture.',
      icon: <Camera size={24} color={theme.primary} strokeWidth={2} />,
      request: requestCameraPermission,
    },
    {
      key: 'microphone',
      label: 'Microphone',
      description: 'Record voice messages and make voice/video calls with your contacts.',
      icon: <Mic size={24} color={theme.primary} strokeWidth={2} />,
      request: requestMicrophonePermission,
    },
    {
      key: 'mediaLibrary',
      label: 'Photos & Storage',
      description: 'Share photos and videos from your gallery and save received media.',
      icon: <HardDrive size={24} color={theme.primary} strokeWidth={2} />,
      request: requestMediaLibraryPermission,
    },
  ];

  async function handleRequestSingle(item: PermissionItem) {
    setLoading(true);
    const status = await item.request();
    setStatuses((prev) => ({ ...prev, [item.key]: status }));
    setLoading(false);
  }

  async function handleAllowAll() {
    setRequestingAll(true);
    const result = await requestAllPermissions();
    setStatuses(result);
    setRequestingAll(false);
  }

  function handleContinue() {
    router.replace('/(app)');
  }

  const allGranted = permissions.every(
    (p) => statuses[p.key] === 'granted'
  );

  function renderStatus(key: PermissionKey) {
    const s = statuses[key];
    if (!s || s === 'undetermined') return null;
    if (s === 'granted') {
      return <CheckCircle2 size={20} color="#4CD964" strokeWidth={2.5} />;
    }
    return <XCircle size={20} color="#FF3B30" strokeWidth={2.5} />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={[styles.iconBadge, { backgroundColor: theme.primary + '18' }]}>
          <ShieldCheck size={40} color={theme.primary} strokeWidth={1.5} />
        </View>
        <Text style={styles.title}>App Permissions</Text>
        <Text style={styles.subtitle}>
          ChatApp needs a few permissions to give you the full experience. You can change these
          anytime in your phone settings.
        </Text>
      </View>

      {/* ── Permission Cards ── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {permissions.map((item) => {
          const status = statuses[item.key];
          const granted = status === 'granted';
          const denied = status === 'denied';

          return (
            <TouchableOpacity
              key={item.key}
              id={`permission-card-${item.key}`}
              style={[
                styles.card,
                granted && styles.cardGranted,
                denied && styles.cardDenied,
              ]}
              activeOpacity={granted ? 1 : 0.75}
              onPress={() => !granted && handleRequestSingle(item)}
            >
              <View style={[styles.cardIcon, { backgroundColor: theme.primary + '12' }]}>
                {item.icon}
              </View>

              <View style={styles.cardText}>
                <Text style={styles.cardLabel}>{item.label}</Text>
                <Text style={styles.cardDesc}>{item.description}</Text>
                {denied && (
                  <Text style={styles.cardDeniedHint}>
                    Go to Settings → ChatApp to enable manually.
                  </Text>
                )}
              </View>

              <View style={styles.cardAction}>
                {renderStatus(item.key) ?? (
                  <View style={styles.allowBadge}>
                    <Text style={styles.allowBadgeText}>Allow</Text>
                    <ChevronRight size={13} color={theme.primary} strokeWidth={2.5} />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Action Buttons ── */}
      <View style={styles.footer}>
        {!allGranted && (
          <TouchableOpacity
            id="btn-allow-all"
            style={[styles.btnPrimary, requestingAll && { opacity: 0.7 }]}
            activeOpacity={0.85}
            onPress={handleAllowAll}
            disabled={requestingAll || loading}
          >
            {requestingAll ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnPrimaryText}>Allow All Permissions</Text>
            )}
          </TouchableOpacity>
        )}

        <TouchableOpacity
          id="btn-continue"
          style={[styles.btnSecondary, allGranted && styles.btnPrimary]}
          activeOpacity={0.75}
          onPress={handleContinue}
        >
          <Text style={[styles.btnSecondaryText, allGranted && styles.btnPrimaryText]}>
            {allGranted ? '🎉  Continue to ChatApp' : 'Skip for Now'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      alignItems: 'center',
      paddingHorizontal: 32,
      paddingTop: Platform.OS === 'ios' ? 16 : 32,
      paddingBottom: 24,
    },
    iconBadge: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 28,
      fontFamily: Fonts?.sansExtraBold,
      color: theme.text,
      letterSpacing: -0.5,
      marginBottom: 10,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 15,
      fontFamily: Fonts?.sans,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 12,
      gap: 12,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.backgroundElement,
      borderRadius: 18,
      padding: 16,
      gap: 14,
      borderWidth: 1.5,
      borderColor: 'transparent',
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    cardGranted: {
      borderColor: '#4CD96440',
      backgroundColor: '#4CD96408',
    },
    cardDenied: {
      borderColor: '#FF3B3040',
    },
    cardIcon: {
      width: 52,
      height: 52,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cardText: {
      flex: 1,
    },
    cardLabel: {
      fontSize: 16,
      fontFamily: Fonts?.sansBold,
      color: theme.text,
      marginBottom: 3,
    },
    cardDesc: {
      fontSize: 13,
      fontFamily: Fonts?.sans,
      color: theme.textSecondary,
      lineHeight: 18,
    },
    cardDeniedHint: {
      fontSize: 12,
      fontFamily: Fonts?.sans,
      color: '#FF3B30',
      marginTop: 4,
    },
    cardAction: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    allowBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.primary + '15',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 20,
      gap: 2,
    },
    allowBadgeText: {
      fontSize: 13,
      fontFamily: Fonts?.sansSemiBold,
      color: theme.primary,
    },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: Platform.OS === 'ios' ? 8 : 20,
      gap: 10,
    },
    btnPrimary: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: theme.primary,
      shadowOpacity: 0.35,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    btnPrimaryText: {
      fontSize: 16,
      fontFamily: Fonts?.sansBold,
      color: '#fff',
    },
    btnSecondary: {
      borderRadius: 16,
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1.5,
      borderColor: theme.backgroundElement,
    },
    btnSecondaryText: {
      fontSize: 15,
      fontFamily: Fonts?.sansMedium,
      color: theme.textSecondary,
    },
  });

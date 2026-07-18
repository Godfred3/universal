// screens/ProfileScreen.tsx
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
  Image,
  Animated,
  Alert,
} from 'react-native';
import {
  ArrowLeft,
  MoreVertical,
  Camera,
  Edit3,
  Key,
  Lock,
  Bell,
  HelpCircle,
  UserPlus,
  Moon,
  Sun,
} from 'lucide-react-native';
import { useTheme } from '@/hooks/use-theme';
import { Fonts } from '@/constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeContext } from '@/context/theme-context';
import { useRouter } from 'expo-router';
// import * as ImagePicker from 'expo-image-picker';

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

// ─── Sub‑components ──────────────────────────────────────────────────────────

interface ProfileActionProps {
  icon: React.ReactNode;
  label: string;
  onPress?: () => void;
}

const ProfileAction = ({ icon, label, onPress }: ProfileActionProps) => {
  const theme = useTheme();
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.actionIconContainer, { backgroundColor: theme.backgroundSelected }]}>{icon}</View>
      <Text style={[styles.actionLabel, { color: theme.textSecondary, fontFamily: Fonts?.sansMedium }]}>{label}</Text>
    </TouchableOpacity>
  );
};

interface SettingsRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
}

const SettingsRow = ({ icon, title, subtitle, onPress, rightElement }: SettingsRowProps) => {
  const theme = useTheme();
  return (
    <TouchableOpacity style={styles.settingsRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.settingsIcon}>{icon}</View>
      <View style={styles.settingsTextContainer}>
        <Text style={[styles.settingsTitle, { color: theme.text, fontFamily: Fonts?.sans }]}>{title}</Text>
        {subtitle && <Text style={[styles.settingsSubtitle, { color: theme.textSecondary, fontFamily: Fonts?.sansMedium }]}>{subtitle}</Text>}
      </View>
      {rightElement}
    </TouchableOpacity>
  );
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const theme = useTheme();
  const { theme: currentTheme, setTheme, colorScheme: activeScheme } = useThemeContext();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const isDarkMode = activeScheme === 'dark';
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const pickImage = async () => {
    // TEMPORARILY DISABLED
    /*
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant gallery access to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfileImage(result.assets[0].uri);
    }
    */
    console.log('Image picker temporarily disabled');
  };

  const headerBackground = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: ['transparent', theme.background],
    extrapolate: 'clamp',
  });

  const headerShadow = scrollY.interpolate({
    inputRange: [0, 30],
    outputRange: [0, 0.1],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: false }
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={activeScheme === 'dark' ? "light-content" : "dark-content"} backgroundColor={theme.background} />

      {/* Header with SafeAreaView for the top section */}
      <AnimatedSafeAreaView style={{ backgroundColor: headerBackground }}>
        <Animated.View
          style={[
            styles.header,
            { backgroundColor: headerBackground, shadowOpacity: headerShadow, borderBottomColor: theme.backgroundSelected },
          ]}
        >
          <View style={styles.headerLeft}>
            <TouchableOpacity style={[styles.headerBtn, { backgroundColor: theme.backgroundSelected }]}>
              <ArrowLeft size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: theme.text, fontFamily: Fonts?.sansBold }]}>You</Text>
          </View>
          <TouchableOpacity style={[styles.headerBtn, { backgroundColor: theme.backgroundSelected }]}>
            <MoreVertical size={24} color={theme.text} />
          </TouchableOpacity>
        </Animated.View>
      </AnimatedSafeAreaView>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: profileImage ?? 'https://lh3.googleusercontent.com/aida-public/AB6AXuD86Zp2c2-NuX03NoXB8sA5mWbUhaN4YbIUEDA171wU0sIFrjU2lFzRXOkj82c7ughRipViZ5iugTCeuAkYilEosDWwUYONzh5wwS-ogpUSmwsLlYvvyNVsvBjmto1plrTP6Ihe3zdkYt5B2MhcJ0s36aa5upBAxm1wyUOdQ_MbjlBbvOdOwA3LSLWYSbTESRFTkW2NbZdguuEco4EkaPZxvmVqW_c6PXC2sEkjvMrCfMVw6dXq6ixmGYD_4z9sJ0AkXJDGr1FGY40',
              }}
              style={[styles.avatar, { borderColor: theme.backgroundSelected }]}
            />
            <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: theme.primary }]} activeOpacity={0.8} onPress={pickImage}>
              <Camera size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userName, { color: theme.text, fontFamily: Fonts?.sansBold }]}>John Doe</Text>
          <Text style={[styles.userBio, { color: theme.textSecondary, fontFamily: Fonts?.sansMedium }]}>Hey there! I am using ChatApp</Text>
        </View>

        {/* Edit Action */}
        <View style={styles.actionsRow}>
          <ProfileAction icon={<Edit3 size={24} color={theme.textSecondary} />} label="Edit" />
        </View>

        {/* Settings List */}
        <View style={[styles.settingsList, { borderTopColor: theme.backgroundSelected }]}>
          <SettingsRow 
            icon={isDarkMode ? <Moon size={20} color={theme.primary} /> : <Sun size={20} color={theme.primary} />} 
            title="Theme" 
            subtitle={isDarkMode ? "Dark Mode" : "Light Mode"}
            onPress={() => setTheme(isDarkMode ? 'light' : 'dark')}
            rightElement={
              <View style={[styles.toggleContainer, { backgroundColor: theme.backgroundSelected }]}>
                <View style={[styles.toggleCircle, { backgroundColor: theme.primary, transform: [{ translateX: isDarkMode ? 14 : 0 }] }]} />
              </View>
            }
          />
          <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />
          <SettingsRow icon={<Key size={20} color={theme.primary} />} title="Account" subtitle="Security notifications, change number" onPress={() => router.push('/(public)/setting_account')} />
          <SettingsRow icon={<Lock size={20} color={theme.primary} />} title="Privacy" subtitle="Block contacts, disappearing messages" onPress={() => router.push('/(public)/setting_privacy')} />
          <SettingsRow icon={<Bell size={20} color={theme.primary} />} title="Notifications" subtitle="Message, group & call tones" onPress={() => router.push('/(public)/setting_notification')} />
          <SettingsRow icon={<HelpCircle size={20} color={theme.primary} />} title="Help" subtitle="Help center, contact us, privacy policy" onPress={() => router.push('/(public)/setting_help')} />
          <View style={[styles.divider, { backgroundColor: theme.backgroundSelected }]} />
          <SettingsRow icon={<UserPlus size={20} color={theme.primary} />} title="Invite a friend" onPress={() => router.push('/(public)/setting_invite_friend')} />
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
  },
  toggleContainer: {
    width: 36,
    height: 20,
    borderRadius: 10,
    padding: 3,
    justifyContent: 'center',
  },
  toggleCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  userName: {
    fontSize: 20,
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.8,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  actionBtn: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  actionLabel: {
    fontSize: 12,
    letterSpacing: 0.5,
  },
  settingsList: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingsIcon: {
    marginRight: 16,
  },
  settingsTextContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
  },
  settingsSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
    marginVertical: 8,
    opacity: 0.5,
  },
});
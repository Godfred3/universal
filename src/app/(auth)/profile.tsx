import { useRouter } from 'expo-router';
import { Camera, CheckCircle2, MessageCircle, XCircle } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
// import * as ImagePicker from 'expo-image-picker';
import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { SafeAreaView } from 'react-native-safe-area-context';

// Simulated username availability — swap in a real API call when ready
const TAKEN_USERNAMES = ['admin', 'support', 'universalchat', 'chat', 'user'];

type UsernameStatus = 'idle' | 'available' | 'taken';
type ThemeValue = ReturnType<typeof useTheme>;

function ProgressIndicator({ colors }: { colors: ThemeValue }) {
    return (
        <View style={styles.progressWrapper}>
            <View style={styles.progressRow}>
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <View style={[styles.line, { backgroundColor: colors.primary }]} />
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                <View style={[styles.line, { backgroundColor: colors.backgroundSelected }]} />
                <View style={[styles.dotOutline, { borderColor: colors.backgroundSelected }]} />
            </View>
            <Text style={[styles.stepLabel, { color: colors.textSecondary, fontFamily: Fonts.sansMedium }]}>Profile Setup</Text>
        </View>
    );
}

function AvatarPicker({ colors, image, displayName, onPickImage }: { colors: ThemeValue; image: string | null; displayName: string; onPickImage: () => void }) {
    return (
        <View style={styles.avatarSection}>
            <TouchableOpacity onPress={onPickImage} activeOpacity={0.85} style={styles.avatarWrapper}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.avatarImage} />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}> 
                        <Text style={[styles.avatarInitials, { color: colors.textSecondary, fontFamily: Fonts.sansBold }]}> 
                            {displayName.trim() ? displayName.trim().split(' ').slice(0, 2).map((word) => word[0]).join('').toUpperCase() : '?'}
                        </Text>
                    </View>
                )}
                <View style={[styles.cameraBadge, { backgroundColor: colors.primary }]}>
                    <Camera color="#fff" size={16} strokeWidth={2.5} />
                </View>
            </TouchableOpacity>
            <Text style={[styles.avatarLabel, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>Add Profile Photo</Text>
            <Text style={[styles.avatarOptional, { color: colors.backgroundSelected, fontFamily: Fonts.sans }]}>Optional</Text>
        </View>
    );
}

function UsernameHelper({ colors, usernameStatus }: { colors: ThemeValue; usernameStatus: UsernameStatus }) {
    if (usernameStatus === 'available') {
        return (
            <View style={styles.statusRow}>
                <CheckCircle2 color="#22C55E" size={15} strokeWidth={2.5} />
                <Text style={[styles.statusText, { color: '#22C55E', fontFamily: Fonts.sansMedium }]}>Available</Text>
            </View>
        );
    }
    if (usernameStatus === 'taken') {
        return (
            <View style={styles.statusRow}>
                <XCircle color="#EF4444" size={15} strokeWidth={2.5} />
                <Text style={[styles.statusText, { color: '#EF4444', fontFamily: Fonts.sansMedium }]}>Already taken</Text>
            </View>
        );
    }
    return <Text style={[styles.helperText, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>This is how people can find you.</Text>;
}

export default function ProfileScreen() {
    const router = useRouter();
    const colors = useTheme();

    const [image, setImage] = useState<string | null>(null);
    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [about, setAbout] = useState('');
    const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
    const usernameTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const ABOUT_LIMIT = 120;
    const isValid = displayName.trim().length > 0 && usernameStatus === 'available';

    // ── Handlers ──────────────────────────────────────────────────────────────
    const pickImage = async () => {
        setImage(null);
        // TEMPORARILY DISABLED: uncomment after rebuilding native app with expo-image-picker
        /*
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) setImage(result.assets[0].uri);
        */
        console.log('Image picker temporarily disabled');
    };

    const handleUsernameChange = (value: string) => {
        // Sanitise: lowercase letters, digits, underscore only
        const sanitised = value.replace(/[^a-z0-9_]/gi, '').toLowerCase();
        setUsername(sanitised);

        if (usernameTimer.current) clearTimeout(usernameTimer.current);

        if (sanitised.length === 0) {
            setUsernameStatus('idle');
            return;
        }

        // Debounce the lookup by 500 ms
        usernameTimer.current = setTimeout(() => {
            setUsernameStatus(TAKEN_USERNAMES.includes(sanitised) ? 'taken' : 'available');
        }, 500);
    };

    const handleContinue = () => {
        router.replace('/(auth)/permissions');
    };

    const handleSkipPhoto = () => {
        // Skips only the photo — name + username must already be valid
        if (isValid) router.replace('/(auth)/permissions');
    };



    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                >
                    {/* Progress */}
                    <ProgressIndicator colors={colors} />

                    {/* Logo */}
                    <View style={styles.logoWrapper}>
                        <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
                            <MessageCircle color="#fff" size={34} strokeWidth={2} />
                        </View>
                        <Text style={[styles.appName, { color: colors.primary, fontFamily: Fonts.sansBold }]}>
                            UNIVERSAL CHAT
                        </Text>
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.sansBold }]}>
                            Create your profile
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
                            Tell everyone who you are. You can update this information anytime.
                        </Text>
                    </View>

                    {/* Avatar */}
                    <AvatarPicker colors={colors} image={image} displayName={displayName} onPickImage={pickImage} />

                    {/* Display Name */}
                    <View style={styles.fieldGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: Fonts.sansBold }]}>
                            DISPLAY NAME
                        </Text>
                        <View style={[
                            styles.inputWrapper,
                            {
                                borderColor: displayName.length > 0 ? colors.primary + '60' : colors.backgroundSelected,
                                backgroundColor: colors.backgroundElement,
                            }
                        ]}>
                            <TextInput
                                style={[styles.input, { color: colors.text, fontFamily: Fonts.sans }]}
                                placeholder="Enter your full name"
                                placeholderTextColor={colors.textSecondary}
                                value={displayName}
                                onChangeText={setDisplayName}
                                returnKeyType="next"
                            />
                        </View>
                    </View>

                    {/* Username */}
                    <View style={styles.fieldGroup}>
                        <Text style={[styles.label, { color: colors.textSecondary, fontFamily: Fonts.sansBold }]}>
                            USERNAME
                        </Text>
                        <View style={[
                            styles.inputWrapper,
                            {
                                borderColor: usernameStatus === 'available'
                                    ? '#22C55E60'
                                    : usernameStatus === 'taken'
                                        ? '#EF444460'
                                        : colors.backgroundSelected,
                                backgroundColor: colors.backgroundElement,
                            }
                        ]}>
                            <Text style={[styles.atSign, { color: colors.primary, fontFamily: Fonts.sansBold }]}>
                                @
                            </Text>
                            <TextInput
                                style={[styles.input, { color: colors.text, fontFamily: Fonts.sans }]}
                                placeholder="username"
                                placeholderTextColor={colors.textSecondary}
                                value={username}
                                onChangeText={handleUsernameChange}
                                autoCapitalize="none"
                                autoCorrect={false}
                                returnKeyType="next"
                            />
                        </View>
                        <View style={styles.usernameHelper}>
                            <UsernameHelper colors={colors} usernameStatus={usernameStatus} />
                        </View>
                    </View>

                    {/* About */}
                    <View style={styles.fieldGroup}>
                        <View style={styles.labelRow}>
                            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: Fonts.sansBold }]}>
                                ABOUT
                            </Text>
                            <Text style={[styles.labelOptional, { color: colors.backgroundSelected, fontFamily: Fonts.sans }]}>
                                Optional
                            </Text>
                        </View>
                        <View style={[
                            styles.textAreaWrapper,
                            {
                                borderColor: about.length > 0 ? colors.primary + '60' : colors.backgroundSelected,
                                backgroundColor: colors.backgroundElement,
                            }
                        ]}>
                            <TextInput
                                style={[styles.textArea, { color: colors.text, fontFamily: Fonts.sans }]}
                                placeholder="Tell people a little about yourself..."
                                placeholderTextColor={colors.textSecondary}
                                value={about}
                                onChangeText={(t) => setAbout(t.slice(0, ABOUT_LIMIT))}
                                multiline
                                numberOfLines={3}
                                textAlignVertical="top"
                                returnKeyType="done"
                            />
                        </View>
                        <Text style={[
                            styles.charCount,
                            {
                                color: about.length >= ABOUT_LIMIT ? '#EF4444' : colors.textSecondary,
                                fontFamily: Fonts.sans,
                            }
                        ]}>
                            {about.length}/{ABOUT_LIMIT}
                        </Text>
                    </View>

                    {/* Continue button */}
                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: isValid ? colors.primary : colors.backgroundSelected }
                        ]}
                        disabled={!isValid}
                        onPress={handleContinue}
                        activeOpacity={0.85}
                    >
                        <Text style={[
                            styles.buttonText,
                            {
                                color: isValid ? '#FFF' : colors.textSecondary,
                                fontFamily: Fonts.sansMedium,
                            }
                        ]}>
                            Continue
                        </Text>
                    </TouchableOpacity>

                    {/* Skip photo */}
                    <TouchableOpacity
                        onPress={handleSkipPhoto}
                        disabled={!isValid}
                        style={styles.skipButton}
                        activeOpacity={0.7}
                    >
                        <Text style={[
                            styles.skipText,
                            {
                                color: isValid ? colors.primary : colors.backgroundSelected,
                                fontFamily: Fonts.sans,
                            }
                        ]}>
                            Skip photo for now
                        </Text>
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // Layout
    safeArea: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.four,
        paddingTop: Spacing.three,
        paddingBottom: Spacing.five,
    },

    // Progress
    progressWrapper: {
        alignItems: 'center',
        marginBottom: Spacing.four,
        gap: Spacing.two,
    },
    progressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    dotOutline: {
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    line: {
        width: 32,
        height: 2,
        borderRadius: 1,
    },
    stepLabel: {
        fontSize: 12,
        letterSpacing: 0.5,
    },

    // Logo / Header
    logoWrapper: {
        alignItems: 'center',
        marginBottom: Spacing.three,
        gap: Spacing.two,
    },
    logoBox: {
        width: 72,
        height: 72,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    appName: {
        fontSize: 13,
        letterSpacing: 2,
    },
    header: {
        alignItems: 'center',
        marginBottom: Spacing.four,
    },
    title: {
        fontSize: 26,
        marginBottom: Spacing.two,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 15,
        textAlign: 'center',
        lineHeight: 22,
        paddingHorizontal: Spacing.two,
    },

    // Avatar
    avatarSection: {
        alignItems: 'center',
        marginBottom: Spacing.four,
    },
    avatarWrapper: {
        marginBottom: Spacing.two,
        position: 'relative',
    },
    avatarPlaceholder: {
        width: 112,
        height: 112,
        borderRadius: 56,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: 112,
        height: 112,
        borderRadius: 56,
    },
    avatarInitials: {
        fontSize: 36,
    },
    cameraBadge: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    avatarLabel: {
        fontSize: 14,
        marginTop: Spacing.one,
    },
    avatarOptional: {
        fontSize: 12,
        marginTop: 2,
    },

    // Fields
    fieldGroup: {
        marginBottom: Spacing.three,
    },
    label: {
        fontSize: 11,
        letterSpacing: 1,
        marginBottom: Spacing.two,
        marginLeft: Spacing.one,
        textTransform: 'uppercase',
    },
    labelRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.two,
        marginLeft: Spacing.one,
        marginRight: Spacing.one,
    },
    labelOptional: {
        fontSize: 12,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: Spacing.three,
    },
    atSign: {
        fontSize: 18,
        marginRight: 2,
    },
    input: {
        flex: 1,
        fontSize: 16,
        height: '100%',
    },
    textAreaWrapper: {
        borderWidth: 1.5,
        borderRadius: 16,
        paddingHorizontal: Spacing.three,
        paddingVertical: Spacing.two,
        minHeight: 96,
    },
    textArea: {
        fontSize: 15,
        lineHeight: 22,
        minHeight: 72,
    },
    usernameHelper: {
        marginTop: Spacing.one,
        marginLeft: Spacing.one,
        minHeight: 20,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    statusText: {
        fontSize: 13,
    },
    helperText: {
        fontSize: 13,
    },
    charCount: {
        fontSize: 12,
        textAlign: 'right',
        marginTop: 6,
        marginRight: Spacing.one,
    },

    // Actions
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: Spacing.two,
        marginBottom: Spacing.two,
    },
    buttonText: {
        fontSize: 18,
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: Spacing.two,
    },
    skipText: {
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

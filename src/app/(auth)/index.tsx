import { Spacing } from '@/constants/theme';
import { useThemeContext } from '@/context/theme-context';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { ArrowRight, Moon, Sun } from 'lucide-react-native';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LandingScreen() {
    const router = useRouter();
    const colors = useTheme();
    const { setTheme, colorScheme } = useThemeContext();
    const isDark = colorScheme === 'dark';

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

            {/* Top bar with theme toggle */}
            <View style={styles.topBar}>
                <TouchableOpacity
                    style={[styles.themeToggle, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}
                    onPress={() => setTheme(isDark ? 'light' : 'dark')}
                    activeOpacity={0.8}
                >
                    {isDark
                        ? <Sun size={20} color={colors.primary} strokeWidth={2} />
                        : <Moon size={20} color={colors.primary} strokeWidth={2} />
                    }
                    <View style={[styles.toggleTrack, { backgroundColor: colors.backgroundSelected }]}>
                        <View style={[
                            styles.toggleThumb,
                            { backgroundColor: colors.primary, transform: [{ translateX: isDark ? 14 : 0 }] }
                        ]} />
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* App Logo */}
                <Image
                    source={require('../../../assets/images/universal-chat-logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={() => router.push('/(auth)/phone')}
            >
                <ArrowRight color="#FFFFFF" size={24} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.four,
    },
    topBar: {
        width: '100%',
        alignItems: 'flex-end',
        paddingTop: Spacing.two,
    },
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
    },
    toggleTrack: {
        width: 36,
        height: 20,
        borderRadius: 10,
        padding: 3,
        justifyContent: 'center',
    },
    toggleThumb: {
        width: 14,
        height: 14,
        borderRadius: 7,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logo: {
        width: 280,
        height: 280,
    },
    button: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.four,
    },
});

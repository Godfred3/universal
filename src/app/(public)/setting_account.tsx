import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, Phone, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsAccountScreen() {
    const theme = useTheme();
    const router = useRouter();

    // Security notification toggles
    const [securityNotifications, setSecurityNotifications] = useState(true);
    const [loginAlerts, setLoginAlerts] = useState(true);
    const [newDeviceAlerts, setNewDeviceAlerts] = useState(false);

    // Change number fields
    const [oldNumber, setOldNumber] = useState('');
    const [newNumber, setNewNumber] = useState('');
    const [showConfirm, setShowConfirm] = useState(false);

    const canSubmit = oldNumber.trim().length > 0 && newNumber.trim().length > 0;

    const handleRequestChange = () => {
        if (!canSubmit) return;
        setShowConfirm(true);
    };

    const handleConfirmChange = () => {
        // Hook up your actual number-change logic here, e.g.:
        // changePhoneNumber({ oldNumber, newNumber });
        setShowConfirm(false);
        setOldNumber('');
        setNewNumber('');
    };

    return (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: theme.backgroundElement }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ArrowLeft size={22} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>Account</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.contentContainer}
                keyboardShouldPersistTaps="handled"
            >
                {/* Security Notifications Section */}
                <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
                    SECURITY NOTIFICATIONS
                </Text>
                <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <ShieldCheck size={20} color={theme.primary} />
                            <View style={styles.rowTextWrap}>
                                <Text style={[styles.rowTitle, { color: theme.text }]}>
                                    Security notifications
                                </Text>
                                <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                                    Get notified about important account security events
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={securityNotifications}
                            onValueChange={setSecurityNotifications}
                            trackColor={{ false: theme.backgroundElement, true: theme.primary }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.background }]} />

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <AlertTriangle size={20} color={theme.primary} />
                            <View style={styles.rowTextWrap}>
                                <Text style={[styles.rowTitle, { color: theme.text }]}>Login alerts</Text>
                                <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                                    Alert me when someone logs into my account
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={loginAlerts}
                            onValueChange={setLoginAlerts}
                            trackColor={{ false: theme.backgroundElement, true: theme.primary }}
                            thumbColor="#fff"
                        />
                    </View>

                    <View style={[styles.divider, { backgroundColor: theme.background }]} />

                    <View style={styles.row}>
                        <View style={styles.rowLeft}>
                            <ShieldCheck size={20} color={theme.primary} />
                            <View style={styles.rowTextWrap}>
                                <Text style={[styles.rowTitle, { color: theme.text }]}>New device sign-in</Text>
                                <Text style={[styles.rowSubtitle, { color: theme.textSecondary }]}>
                                    Notify me when a new device signs into my account
                                </Text>
                            </View>
                        </View>
                        <Switch
                            value={newDeviceAlerts}
                            onValueChange={setNewDeviceAlerts}
                            trackColor={{ false: theme.backgroundElement, true: theme.primary }}
                            thumbColor="#fff"
                        />
                    </View>
                </View>

                {/* Change Number Section */}
                <Text style={[styles.sectionLabel, { color: theme.textSecondary, marginTop: 28 }]}>
                    CHANGE NUMBER
                </Text>
                <View style={[styles.card, { backgroundColor: theme.backgroundElement }]}>
                    <View style={styles.changeNumberHeader}>
                        <Phone size={20} color={theme.primary} />
                        <Text style={[styles.rowTitle, { color: theme.text, marginLeft: 10 }]}>
                            Update your phone number
                        </Text>
                    </View>
                    <Text style={[styles.rowSubtitle, { color: theme.textSecondary, marginBottom: 16 }]}>
                        Enter your old and new number. We'll confirm before making any changes.
                    </Text>

                    <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>Old number</Text>
                    <TextInput
                        style={[
                            styles.input,
                            { backgroundColor: theme.background, color: theme.text },
                        ]}
                        value={oldNumber}
                        onChangeText={setOldNumber}
                        placeholder="+1 234 567 8900"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="phone-pad"
                    />

                    <Text style={[styles.inputLabel, { color: theme.textSecondary, marginTop: 14 }]}>
                        New number
                    </Text>
                    <TextInput
                        style={[
                            styles.input,
                            { backgroundColor: theme.background, color: theme.text },
                        ]}
                        value={newNumber}
                        onChangeText={setNewNumber}
                        placeholder="+1 234 567 8900"
                        placeholderTextColor={theme.textSecondary}
                        keyboardType="phone-pad"
                    />

                    <TouchableOpacity
                        style={[
                            styles.changeBtn,
                            { backgroundColor: canSubmit ? theme.primary : theme.background },
                        ]}
                        activeOpacity={0.85}
                        disabled={!canSubmit}
                        onPress={handleRequestChange}
                    >
                        <Text
                            style={[
                                styles.changeBtnText,
                                { color: canSubmit ? '#fff' : theme.textSecondary },
                            ]}
                        >
                            Change Number
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Confirmation Modal */}
            <Modal
                visible={showConfirm}
                transparent
                animationType="fade"
                onRequestClose={() => setShowConfirm(false)}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                >
                    <Pressable style={styles.modalBackdrop} onPress={() => setShowConfirm(false)} />
                    <View style={[styles.modalCard, { backgroundColor: theme.background }]}>
                        <View
                            style={[
                                styles.modalIconWrap,
                                { backgroundColor: theme.backgroundElement },
                            ]}
                        >
                            <Phone size={26} color={theme.primary} />
                        </View>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Confirm number change</Text>
                        <Text style={[styles.modalBody, { color: theme.textSecondary }]}>
                            Are you sure you want to change your number from{' '}
                            <Text style={{ color: theme.text, fontFamily: Fonts?.sansMedium }}>
                                {oldNumber}
                            </Text>{' '}
                            to{' '}
                            <Text style={{ color: theme.text, fontFamily: Fonts?.sansMedium }}>
                                {newNumber}
                            </Text>
                            ?
                        </Text>

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: theme.backgroundElement }]}
                                onPress={() => setShowConfirm(false)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.modalBtnText, { color: theme.text }]}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                                onPress={handleConfirmChange}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.modalBtnText, { color: '#fff' }]}>Confirm</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 18,
        height: 56,
        borderBottomWidth: StyleSheet.hairlineWidth,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontFamily: Fonts?.sansBold,
    },
    content: {
        flex: 1,
    },
    contentContainer: {
        padding: 18,
        paddingBottom: 40,
    },
    sectionLabel: {
        fontSize: 12,
        fontFamily: Fonts?.sansMedium,
        letterSpacing: 0.5,
        marginBottom: 8,
        marginLeft: 4,
    },
    card: {
        borderRadius: 16,
        padding: 14,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
        gap: 12,
        paddingRight: 12,
    },
    rowTextWrap: {
        flex: 1,
    },
    rowTitle: {
        fontSize: 15,
        fontFamily: Fonts?.sansMedium,
        marginBottom: 2,
    },
    rowSubtitle: {
        fontSize: 12,
        fontFamily: Fonts?.sans,
        lineHeight: 16,
    },
    divider: {
        height: 1,
        marginVertical: 4,
    },
    changeNumberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    inputLabel: {
        fontSize: 12,
        fontFamily: Fonts?.sansMedium,
        marginBottom: 6,
    },
    input: {
        height: 48,
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 15,
        fontFamily: Fonts?.sans,
    },
    changeBtn: {
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 22,
    },
    changeBtnText: {
        fontSize: 15,
        fontFamily: Fonts?.sansBold,
    },
    modalOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalCard: {
        width: '85%',
        borderRadius: 20,
        padding: 22,
        alignItems: 'center',
    },
    modalIconWrap: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    modalTitle: {
        fontSize: 17,
        fontFamily: Fonts?.sansBold,
        marginBottom: 8,
    },
    modalBody: {
        fontSize: 14,
        fontFamily: Fonts?.sans,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 22,
    },
    modalActions: {
        flexDirection: 'row',
        gap: 10,
        width: '100%',
    },
    modalBtn: {
        flex: 1,
        height: 46,
        borderRadius: 23,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalBtnText: {
        fontSize: 14,
        fontFamily: Fonts?.sansBold,
    },
});
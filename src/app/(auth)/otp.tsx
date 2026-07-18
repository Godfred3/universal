import { Fonts, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { MessageCircle, Shield } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PHONE_NUMBER = '+233 55 123 4567';
const OTP_LENGTH = 6;
const RESEND_SECONDS = 32;

export default function OTPScreen() {
    const router = useRouter();
    const colors = useTheme();
    const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [countdown, setCountdown] = useState(RESEND_SECONDS);
    const inputs = useRef<Array<TextInput | null>>([]);

    useEffect(() => {
        if (countdown <= 0) return;
        const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
        return () => clearInterval(timer);
    }, [countdown]);

    const handleOtpChange = (value: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        if (value && index < OTP_LENGTH - 1) {
            inputs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (key: string, index: number) => {
        if (key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1]?.focus();
        }
    };

    const handleVerify = () => {
        router.push('/(auth)/profile');
    };

    const handleResend = () => {
        if (countdown === 0) {
            setCountdown(RESEND_SECONDS);
            setOtp(Array(OTP_LENGTH).fill(''));
            inputs.current[0]?.focus();
        }
    };

    const pad = (n: number) => String(n).padStart(2, '0');
    const isComplete = otp.every((v) => v.length === 1);

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Logo */}
            <View style={styles.logoWrapper}>
                <View style={[styles.logoBox, { backgroundColor: colors.primary }]}>
                    <MessageCircle color="#fff" size={34} strokeWidth={2} />
                </View>
                <Text style={[styles.appName, { color: colors.primary, fontFamily: Fonts.sansBold }]}>
                    UNIVERSAL CHAT
                </Text>
            </View>

            {/* Heading */}
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.sansBold }]}>
                    Verify your number
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
                    Enter the 6-digit verification code sent to
                </Text>
                <Text style={[styles.phoneNumber, { color: colors.text, fontFamily: Fonts.sansBold }]}>
                    {PHONE_NUMBER}
                </Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text style={[styles.editLink, { color: colors.primary, fontFamily: Fonts.sans }]}>
                        Edit phone number
                    </Text>
                </TouchableOpacity>
            </View>

            {/* OTP Boxes */}
            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={(ref) => { inputs.current[index] = ref; }}
                        style={[
                            styles.otpInput,
                            {
                                backgroundColor: colors.backgroundElement,
                                borderColor: focusedIndex === index ? colors.primary : colors.backgroundSelected,
                                color: colors.text,
                                fontFamily: Fonts.sansBold,
                            }
                        ]}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={(val) => handleOtpChange(val, index)}
                        onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                        onFocus={() => setFocusedIndex(index)}
                        onBlur={() => setFocusedIndex(-1)}
                    />
                ))}
            </View>

            {/* Resend */}
            <TouchableOpacity onPress={handleResend} disabled={countdown > 0}>
                <Text style={[styles.resendText, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
                    Resend code in{' '}
                    <Text style={{ color: colors.text, fontFamily: Fonts.sansBold }}>
                        00:{pad(countdown)}
                    </Text>
                </Text>
            </TouchableOpacity>

            {/* Security Info */}
            <View style={[styles.infoBox, { backgroundColor: colors.primary + '0A', borderColor: colors.primary + '15' }]}>
                <View style={[styles.shieldContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Shield color={colors.primary} size={18} />
                </View>
                <Text style={[styles.infoText, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
                    For your security, verification codes expire after{' '}
                    <Text style={{ fontFamily: Fonts.sansBold, color: colors.text }}>5 minutes</Text>.
                </Text>
            </View>

            {/* Verify Button */}
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: isComplete ? colors.primary : colors.backgroundSelected }
                ]}
                disabled={!isComplete}
                onPress={handleVerify}
            >
                <Text style={[styles.buttonText, {
                    color: isComplete ? '#FFF' : colors.textSecondary,
                    fontFamily: Fonts.sansMedium
                }]}>
                    Verify
                </Text>
            </TouchableOpacity>

            {/* Support Footer */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
                    Didn't receive a code?
                </Text>
                <TouchableOpacity>
                    <Text style={[styles.footerLink, { color: colors.primary, fontFamily: Fonts.sansBold }]}>
                        Contact Support
                    </Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: Spacing.four,
        paddingTop: Spacing.four,
    },
    logoWrapper: {
        alignItems: 'center',
        marginTop: Spacing.three,
        marginBottom: Spacing.five,
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
        marginBottom: Spacing.five,
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
    },
    phoneNumber: {
        fontSize: 17,
        marginTop: Spacing.two,
        textAlign: 'center',
    },
    editLink: {
        fontSize: 14,
        marginTop: Spacing.two,
        textDecorationLine: 'underline',
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.four,
    },
    otpInput: {
        width: 52,
        height: 58,
        borderWidth: 1.5,
        borderRadius: 14,
        textAlign: 'center',
        fontSize: 22,
    },
    resendText: {
        textAlign: 'center',
        fontSize: 14,
        marginBottom: Spacing.five,
    },
    infoBox: {
        flexDirection: 'row',
        padding: Spacing.four,
        borderWidth: 1,
        borderRadius: 16,
        marginBottom: Spacing.five,
        gap: Spacing.three,
        alignItems: 'flex-start',
    },
    shieldContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    button: {
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 'auto',
        marginBottom: Spacing.four,
    },
    buttonText: {
        fontSize: 18,
    },
    footer: {
        alignItems: 'center',
        marginBottom: Spacing.three,
        gap: Spacing.one,
    },
    footerText: {
        fontSize: 13,
    },
    footerLink: {
        fontSize: 14,
    },
});

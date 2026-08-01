import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { GradientWrapper } from '@/components/gradient-wrapper';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;

const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(name.length - 2, 2))}@${domain}`;
};

export default function OtpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorScheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { verifyEmailOtp, resendEmailOtp } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();
  const email = typeof params.email === 'string' ? params.email : '';
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [shake] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;

  const runShake = () => {
    shake.setValue(0);
    Animated.sequence([-1, 1, -1, 1, 0].map((toValue) =>
      Animated.timing(shake, { toValue, duration: 55, useNativeDriver: true })
    )).start();
  };

  const handleChangeDigit = (value: string, index: number) => {
    const clean = value.replace(/\D/g, '');
    setError(null);
    if (clean.length > 1) {
      const next = Array(CODE_LENGTH).fill('');
      clean.slice(0, CODE_LENGTH).split('').forEach((digit, digitIndex) => { next[digitIndex] = digit; });
      setDigits(next);
      inputRefs.current[Math.min(clean.length, CODE_LENGTH) - 1]?.focus();
      return;
    }
    setDigits((current) => current.map((digit, digitIndex) => digitIndex === index ? clean : digit));
    if (clean && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const verify = async () => {
    if (!email) {
      setError('Your email is missing. Please return to account creation.');
      return;
    }
    if (!isComplete || verifying) return;
    setVerifying(true);
    const { error: verifyError } = await verifyEmailOtp(email, code);
    setVerifying(false);
    if (verifyError) {
      setError(verifyError.message || 'That code is invalid or expired.');
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      runShake();
      return;
    }
    router.replace('/(auth)/profile');
  };

  const resend = async () => {
    if (!email || secondsLeft > 0 || resending) return;
    setResending(true);
    const { error: resendError } = await resendEmailOtp(email);
    setResending(false);
    if (resendError) {
      setError(resendError.message);
      return;
    }
    setDigits(Array(CODE_LENGTH).fill(''));
    setError(null);
    setSecondsLeft(RESEND_SECONDS);
    inputRefs.current[0]?.focus();
  };

  const shakeTranslate = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>
        <View style={styles.iconBadge}>
          <GradientWrapper colors={['#4361EE', '#7955D9']} style={styles.iconBadgeGradient}>
            <ShieldCheck size={26} color="#fff" />
          </GradientWrapper>
        </View>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>Enter the six-digit code Supabase sent to your email to finish creating your account.</Text>
        <Text style={styles.destinationText}>Code sent to <Text style={styles.destinationValue}>{maskEmail(email)}</Text></Text>
        <Animated.View style={[styles.codeRow, { transform: [{ translateX: shakeTranslate }] }]}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              value={digit}
              onChangeText={(value) => handleChangeDigit(value, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
              }}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              style={[styles.codeBox, digit ? styles.codeBoxFilled : null, error && styles.codeBoxError]}
              textAlign="center"
            />
          ))}
        </Animated.View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.resendRow}>
          <Text style={styles.resendHint}>Didn&apos;t get a code? </Text>
          {secondsLeft > 0 ? (
            <Text style={styles.resendTimer}>Resend in 0:{secondsLeft.toString().padStart(2, '0')}</Text>
          ) : (
            <TouchableOpacity onPress={resend} hitSlop={6}><Text style={styles.resendLink}>{resending ? 'Sending...' : 'Resend code'}</Text></TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={[styles.verifyButton, !isComplete && styles.verifyButtonDisabled]} onPress={verify} activeOpacity={0.85} disabled={!isComplete || verifying}>
          <GradientWrapper colors={['#4361EE', '#7955D9']} style={styles.verifyGradient}>
            <Text style={styles.verifyText}>{verifying ? 'Verifying...' : 'Verify and continue'}</Text>
          </GradientWrapper>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { flex: 1, padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 44 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  iconBadge: { width: 60, height: 60, borderRadius: 20, overflow: 'hidden', marginBottom: 20 },
  iconBadgeGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 26, letterSpacing: -0.5 },
  subtitle: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13.5, marginTop: 8, lineHeight: 19, maxWidth: '92%' },
  destinationText: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13, marginTop: 26 },
  destinationValue: { color: theme.text, fontFamily: Fonts?.sansSemiBold },
  codeRow: { flexDirection: 'row', gap: 9, marginTop: 22 },
  codeBox: { flex: 1, height: 58, borderRadius: 16, backgroundColor: theme.backgroundElement, color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 22, borderWidth: 1.5, borderColor: 'transparent' },
  codeBoxFilled: { borderColor: theme.primary },
  codeBoxError: { borderColor: '#FF3B30' },
  errorText: { color: '#FF3B30', fontFamily: Fonts?.sansMedium, fontSize: 12.5, marginTop: 12 },
  resendRow: { flexDirection: 'row', marginTop: 20 },
  resendHint: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13 },
  resendTimer: { color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 13 },
  resendLink: { color: theme.primary, fontFamily: Fonts?.sansBold, fontSize: 13 },
  verifyButton: { height: 54, borderRadius: 27, overflow: 'hidden', marginTop: 36 },
  verifyButtonDisabled: { opacity: 0.45 },
  verifyGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  verifyText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 15.5 },
});

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Mail, Phone, ShieldCheck } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { GradientWrapper } from '@/components/gradient-wrapper';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

type Method = 'email' | 'phone';

const CODE_LENGTH = 6;
const RESEND_SECONDS = 60;
// Temporary placeholder: OTP verification is not wired yet, so any complete code is accepted.

const maskEmail = (email: string) => {
  const [name, domain] = email.split('@');
  if (!domain) return email;
  return `${name.slice(0, 2)}${'*'.repeat(Math.max(name.length - 2, 2))}@${domain}`;
};

const maskPhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) return phone;
  return `+233 ${digits.slice(0, 2)} *** ${digits.slice(-4)}`;
};

export default function OtpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorScheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // In production, pass these in from the sign-up screen, e.g.
  // router.push({ pathname: '/(auth)/otp', params: { email, phone } })
  const params = useLocalSearchParams<{ email?: string; phone?: string }>();
  const email = params.email ?? 'amara.boateng@example.com';
  const phone = params.phone ?? '+233241234567';

  const [method, setMethod] = useState<Method>('email');
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  const code = digits.join('');
  const isComplete = code.length === CODE_LENGTH;
  const destination = method === 'email' ? maskEmail(email) : maskPhone(phone);

  const runShake = () => {
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -1, duration: 55, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 55, useNativeDriver: true }),
    ]).start();
  };

  const handleChangeDigit = (value: string, index: number) => {
    const clean = value.replace(/[^0-9]/g, '');
    setError(null);
    if (clean.length > 1) {
      // Handles pasting a full code into one box.
      const pasted = clean.slice(0, CODE_LENGTH).split('');
      const next = Array(CODE_LENGTH).fill('');
      pasted.forEach((d, i) => { next[i] = d; });
      setDigits(next);
      const lastIndex = Math.min(pasted.length, CODE_LENGTH) - 1;
      inputRefs.current[lastIndex]?.focus();
      return;
    }
    setDigits((current) => {
      const next = [...current];
      next[index] = clean;
      return next;
    });
    if (clean && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const switchMethod = (next: Method) => {
    setMethod(next);
    setSecondsLeft(RESEND_SECONDS);
    setError(null);
  };

  const resend = () => {
    if (secondsLeft > 0) return;
    setSecondsLeft(RESEND_SECONDS);
    setDigits(Array(CODE_LENGTH).fill(''));
    setError(null);
    inputRefs.current[0]?.focus();
  };

  const verify = () => {
    if (!isComplete) return;
    setVerifying(true);

    setTimeout(() => {
      setVerifying(false);
      if (isComplete) {
        router.replace('/(auth)/profile');
      } else {
        setError('Please enter the full code.');
        setDigits(Array(CODE_LENGTH).fill(''));
        inputRefs.current[0]?.focus();
        runShake();
      }
    }, 700);
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

        <Text style={styles.title}>Verify your account</Text>
        <Text style={styles.subtitle}>Please confirm the OTP sent to your email or phone to finish creating your account.</Text>

        <View style={styles.methodRow}>
          <TouchableOpacity
            style={[styles.methodChip, method === 'email' && styles.methodChipActive]}
            onPress={() => switchMethod('email')}
            activeOpacity={0.8}
          >
            <Mail size={14} color={method === 'email' ? '#fff' : theme.textSecondary} />
            <Text style={[styles.methodChipText, method === 'email' && styles.methodChipTextActive]}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.methodChip, method === 'phone' && styles.methodChipActive]}
            onPress={() => switchMethod('phone')}
            activeOpacity={0.8}
          >
            <Phone size={14} color={method === 'phone' ? '#fff' : theme.textSecondary} />
            <Text style={[styles.methodChipText, method === 'phone' && styles.methodChipTextActive]}>Phone</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.destinationText}>
          Code sent to <Text style={styles.destinationValue}>{destination}</Text>
        </Text>

        <Animated.View style={[styles.codeRow, { transform: [{ translateX: shakeTranslate }] }]}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              value={digit}
              onChangeText={(value) => handleChangeDigit(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              style={[styles.codeBox, digit ? styles.codeBoxFilled : null, error && styles.codeBoxError]}
              textAlign="center"
            />
          ))}
        </Animated.View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.resendRow}>
          <Text style={styles.resendHint}>Didn't get a code? </Text>
          {secondsLeft > 0 ? (
            <Text style={styles.resendTimer}>Resend in 0:{secondsLeft.toString().padStart(2, '0')}</Text>
          ) : (
            <TouchableOpacity onPress={resend} hitSlop={6}>
              <Text style={styles.resendLink}>Resend code</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity onPress={() => switchMethod(method === 'email' ? 'phone' : 'email')} hitSlop={6} style={styles.switchLinkWrap}>
          <Text style={styles.switchLink}>Send code via {method === 'email' ? 'phone' : 'email'} instead</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.verifyButton, !isComplete && styles.verifyButtonDisabled]} onPress={verify} activeOpacity={0.85} disabled={!isComplete || verifying}>
          <GradientWrapper colors={['#4361EE', '#7955D9']} style={styles.verifyGradient}>
            <Text style={styles.verifyText}>{verifying ? 'Verifying…' : 'Verify and continue'}</Text>
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

  methodRow: { flexDirection: 'row', gap: 8, marginTop: 24 },
  methodChip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 38, borderRadius: 19, backgroundColor: theme.backgroundElement, paddingHorizontal: 16 },
  methodChipActive: { backgroundColor: theme.primary },
  methodChipText: { color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 13 },
  methodChipTextActive: { color: '#fff' },

  destinationText: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13, marginTop: 16 },
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

  switchLinkWrap: { marginTop: 8 },
  switchLink: { color: theme.primary, fontFamily: Fonts?.sansSemiBold, fontSize: 12.5 },

  verifyButton: { height: 54, borderRadius: 27, overflow: 'hidden', marginTop: 36 },
  verifyButtonDisabled: { opacity: 0.45 },
  verifyGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  verifyText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 15.5 },
});
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Platform, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GradientWrapper } from '@/components/gradient-wrapper';
import { Fonts } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';

const CODE_LENGTH = 6;

export default function AuthorizeAccountScreen() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorScheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { authorizeAccount, generateAuthorizationCode } = useAuth();
  const params = useLocalSearchParams<{ code?: string }>();
  const [displayedCode, setDisplayedCode] = useState(typeof params.code === 'string' ? params.code : '');
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [shake] = useState(() => new Animated.Value(0));

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

  const useCode = () => {
    if (!displayedCode) return;
    setDigits(displayedCode.split('').slice(0, CODE_LENGTH));
    setError(null);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const regenerate = async () => {
    if (generating) return;
    setGenerating(true);
    const { code: nextCode, error: generateError } = await generateAuthorizationCode();
    setGenerating(false);
    if (generateError || !nextCode) {
      setError(generateError?.message || 'Could not generate another code.');
      return;
    }
    setDisplayedCode(nextCode);
    setDigits(Array(CODE_LENGTH).fill(''));
    setError(null);
    setCopied(false);
  };

  const verify = async () => {
    if (!isComplete || verifying) return;
    setVerifying(true);
    const { authorized, error: verifyError } = await authorizeAccount(code);
    setVerifying(false);
    if (verifyError || !authorized) {
      setError(verifyError?.message || 'That authorization code is incorrect or expired.');
      setDigits(Array(CODE_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      runShake();
      return;
    }
    router.replace('/(auth)/profile');
  };

  const shakeTranslate = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });

  return (
    <SafeAreaView style={styles.safeArea}>
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <View style={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={10}><ArrowLeft size={22} color={theme.text} /></TouchableOpacity>
        <View style={styles.iconBadge}><GradientWrapper colors={['#4361EE', '#7955D9']} style={styles.iconBadgeGradient}><ShieldCheck size={26} color="#fff" /></GradientWrapper></View>
        <Text style={styles.title}>Authorize account</Text>
        <Text style={styles.subtitle}>Enter your temporary authorization code below, or tap Use code to fill it automatically. The code expires after 10 minutes.</Text>

        <View style={styles.generatedCard}>
          <View><Text style={styles.generatedLabel}>YOUR AUTHORIZATION CODE</Text><Text selectable style={styles.generatedCode}>{displayedCode || '------'}</Text></View>
          <TouchableOpacity style={styles.copyButton} onPress={useCode} disabled={!displayedCode}>
            <Check size={18} color="#fff" />
            <Text style={styles.copyText}>{copied ? 'Added' : 'Use code'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.inputLabel}>Paste or enter the code</Text>
        <Animated.View style={[styles.codeRow, { transform: [{ translateX: shakeTranslate }] }]}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              value={digit}
              onChangeText={(value) => handleChangeDigit(value, index)}
              onKeyPress={({ nativeEvent }) => { if (nativeEvent.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus(); }}
              keyboardType="number-pad"
              maxLength={CODE_LENGTH}
              style={[styles.codeBox, digit ? styles.codeBoxFilled : null, error && styles.codeBoxError]}
              textAlign="center"
            />
          ))}
        </Animated.View>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <TouchableOpacity onPress={regenerate} disabled={generating} hitSlop={8}><Text style={styles.regenerateText}>{generating ? 'Generating...' : 'Generate a new code'}</Text></TouchableOpacity>
        <TouchableOpacity style={[styles.verifyButton, !isComplete && styles.verifyButtonDisabled]} onPress={verify} activeOpacity={0.85} disabled={!isComplete || verifying}>
          <GradientWrapper colors={['#4361EE', '#7955D9']} style={styles.verifyGradient}><Text style={styles.verifyText}>{verifying ? 'Authorizing...' : 'Authorize account'}</Text></GradientWrapper>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.background },
  container: { flex: 1, backgroundColor: theme.background },
  content: { flex: 1, padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 44 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  iconBadge: { width: 60, height: 60, borderRadius: 20, overflow: 'hidden', marginBottom: 20 }, iconBadgeGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 26, letterSpacing: -0.5 }, subtitle: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13.5, marginTop: 8, lineHeight: 19, maxWidth: '94%' },
  generatedCard: { marginTop: 24, padding: 18, borderRadius: 20, backgroundColor: theme.backgroundElement, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  generatedLabel: { color: theme.textSecondary, fontFamily: Fonts?.sansBold, fontSize: 9.5, letterSpacing: 1.1 }, generatedCode: { color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 30, letterSpacing: 7, marginTop: 6 },
  copyButton: { height: 42, borderRadius: 14, paddingHorizontal: 13, backgroundColor: theme.primary, flexDirection: 'row', alignItems: 'center', gap: 6 }, copyText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 12 },
  inputLabel: { color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 12.5, marginTop: 28 }, codeRow: { flexDirection: 'row', gap: 9, marginTop: 12 },
  codeBox: { flex: 1, height: 58, borderRadius: 16, backgroundColor: theme.backgroundElement, color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 22, borderWidth: 1.5, borderColor: 'transparent' }, codeBoxFilled: { borderColor: theme.primary }, codeBoxError: { borderColor: '#FF3B30' },
  errorText: { color: '#FF3B30', fontFamily: Fonts?.sansMedium, fontSize: 12.5, marginTop: 12 }, regenerateText: { color: theme.primary, fontFamily: Fonts?.sansSemiBold, fontSize: 12.5, marginTop: 18 },
  verifyButton: { height: 54, borderRadius: 27, overflow: 'hidden', marginTop: 32 }, verifyButtonDisabled: { opacity: 0.45 }, verifyGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' }, verifyText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 15.5 },
});

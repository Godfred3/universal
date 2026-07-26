import { useRouter } from 'expo-router';
import { ArrowLeft, Check, ChevronDown, Eye, EyeOff, Lock, Mail, Phone, User, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { GradientWrapper } from '@/components/gradient-wrapper';
import { Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { saveProfileDraft } from '@/lib/profile';

type Gender = 'Male' | 'Female' | 'Other';

const GENDERS: Gender[] = ['Male', 'Female', 'Other'];

interface Country {
  name: string;
  code: string;
  dialCode: string;
  minLength: number;
  maxLength: number;
  format: string; // For display/help
}

const COUNTRIES: Country[] = [
  { name: 'Ghana', code: 'GH', dialCode: '+233', minLength: 9, maxLength: 12, format: '024 123 4567' },
  { name: 'Nigeria', code: 'NG', dialCode: '+234', minLength: 10, maxLength: 13, format: '801 234 5678' },
  { name: 'Kenya', code: 'KE', dialCode: '+254', minLength: 9, maxLength: 12, format: '712 345 678' },
  { name: 'South Africa', code: 'ZA', dialCode: '+27', minLength: 9, maxLength: 12, format: '21 234 5678' },
  { name: 'Uganda', code: 'UG', dialCode: '+256', minLength: 9, maxLength: 12, format: '701 234 567' },
  { name: 'Tanzania', code: 'TZ', dialCode: '+255', minLength: 9, maxLength: 12, format: '612 345 678' },
  { name: 'Egypt', code: 'EG', dialCode: '+20', minLength: 10, maxLength: 13, format: '100 234 5678' },
  { name: 'Ethiopia', code: 'ET', dialCode: '+251', minLength: 9, maxLength: 12, format: '912 345 678' },
  { name: 'Cameroon', code: 'CM', dialCode: '+237', minLength: 9, maxLength: 12, format: '650 123 456' },
  { name: 'Morocco', code: 'MA', dialCode: '+212', minLength: 9, maxLength: 12, format: '612 345 678' },
  { name: 'United States', code: 'US', dialCode: '+1', minLength: 10, maxLength: 13, format: '201 555 0123' },
  { name: 'United Kingdom', code: 'GB', dialCode: '+44', minLength: 10, maxLength: 13, format: '20 7946 0958' },
  { name: 'Canada', code: 'CA', dialCode: '+1', minLength: 10, maxLength: 13, format: '201 555 0123' },
  { name: 'India', code: 'IN', dialCode: '+91', minLength: 10, maxLength: 13, format: '98123 45678' },
];

export default function SignUpScreen() {
  const router = useRouter();
  const theme = useTheme();
  const scheme = useColorScheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [showCountryModal, setShowCountryModal] = useState(false);
  const [gender, setGender] = useState<Gender | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (email.trim().length === 0) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  };

  const validatePhone = (phone: string, country: Country): string | null => {
    if (phone.trim().length === 0) return 'Phone number is required';
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < country.minLength) return `Phone number must be at least ${country.minLength} digits`;
    if (digitsOnly.length > country.maxLength) return `Phone number must not exceed ${country.maxLength} digits`;
    return null;
  };

  const validatePassword = (password: string): string | null => {
    if (password.length === 0) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (confirmPassword.length === 0) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  };

  const errors = {
    fullName: fullName.trim().length === 0 ? 'Enter your full name' : null,
    email: validateEmail(email),
    phone: validatePhone(phone, selectedCountry),
    gender: gender === null ? 'Please select a gender' : null,
    password: validatePassword(password),
    confirmPassword: validateConfirmPassword(password, confirmPassword),
    terms: !termsAccepted ? 'You must accept the terms to continue' : null,
  };

  const isValid =
    fullName.trim().length > 0 &&
    validateEmail(email) === null &&
    validatePhone(phone, selectedCountry) === null &&
    gender !== null &&
    validatePassword(password) === null &&
    validateConfirmPassword(password, confirmPassword) === null &&
    termsAccepted;

  const handleSubmit = async () => {
    setSubmitted(true);
    if (!isValid) return;

    try {
      await saveProfileDraft({
        fullName: fullName.trim(),
        phone: `${selectedCountry.dialCode}${phone.replace(/\D/g, '')}`,
        username: fullName.trim().toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '') || null,
        about: 'Joined via Universal Chat',
      });

      Alert.alert('Profile ready', 'Your details were saved to the connected profile store.', [
        { text: 'Continue', onPress: () => router.push({ pathname: '/(auth)/otp', params: { email, phone: `${selectedCountry.dialCode}${phone.replace(/\D/g, '')}` } }) },
      ]);
    } catch (error) {
      console.warn('[phone] profile save failed', error);
      Alert.alert('Could not save profile', 'Please try again in a moment.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle={scheme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()} hitSlop={10}>
          <ArrowLeft size={22} color={theme.text} />
        </TouchableOpacity>

        <Text style={styles.eyebrow}>UNIVERSAL</Text>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.subtitle}>Join Universal and start chatting with friends.</Text>

        <Field label="Full name" icon={<User size={18} color={theme.textSecondary} />} styles={styles}>
          <TextInput
            style={styles.fieldInput}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Your full name"
            placeholderTextColor={theme.textSecondary}
            autoCapitalize="words"
          />
        </Field>
        <FieldError message={submitted ? errors.fullName : null} styles={styles} />

        <Field label="Email" icon={<Mail size={18} color={theme.textSecondary} />} styles={styles}>
          <TextInput
            style={styles.fieldInput}
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor={theme.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </Field>
        <FieldError message={submitted ? errors.email : null} styles={styles} />

        <Text style={styles.label}>Phone number</Text>
        <View style={styles.phoneRow}>
          <TouchableOpacity 
            style={styles.countryCode} 
            activeOpacity={0.75}
            onPress={() => setShowCountryModal(true)}
          >
            <Text style={styles.countryCodeText}>{selectedCountry.dialCode}</Text>
            <ChevronDown size={14} color={theme.textSecondary} />
          </TouchableOpacity>
          <View style={[styles.field, styles.phoneField]}>
            <Phone size={18} color={theme.textSecondary} />
            <TextInput
              style={styles.fieldInput}
              value={phone}
              onChangeText={setPhone}
              placeholder={selectedCountry.format}
              placeholderTextColor={theme.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
        </View>
        <Text style={styles.helperText}>Format: {selectedCountry.format} ({selectedCountry.minLength}-{selectedCountry.maxLength} digits)</Text>
        <FieldError message={submitted ? errors.phone : null} styles={styles} />

        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          {GENDERS.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.genderChip, gender === option && styles.genderChipActive]}
              onPress={() => setGender(option)}
              activeOpacity={0.8}
            >
              <Text style={[styles.genderChipText, gender === option && styles.genderChipTextActive]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <FieldError message={submitted ? errors.gender : null} styles={styles} />

        <Field label="Password" icon={<Lock size={18} color={theme.textSecondary} />} styles={styles}>
          <TextInput
            style={styles.fieldInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
            {showPassword ? <EyeOff size={18} color={theme.textSecondary} /> : <Eye size={18} color={theme.textSecondary} />}
          </TouchableOpacity>
        </Field>
        <FieldError message={submitted ? errors.password : null} styles={styles} />

        <Field label="Confirm password" icon={<Lock size={18} color={theme.textSecondary} />} styles={styles}>
          <TextInput
            style={styles.fieldInput}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Re-enter your password"
            placeholderTextColor={theme.textSecondary}
            secureTextEntry={!showConfirmPassword}
          />
          <TouchableOpacity onPress={() => setShowConfirmPassword((v) => !v)} hitSlop={8}>
            {showConfirmPassword ? <EyeOff size={18} color={theme.textSecondary} /> : <Eye size={18} color={theme.textSecondary} />}
          </TouchableOpacity>
        </Field>
        <FieldError message={submitted ? errors.confirmPassword : null} styles={styles} />

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setRememberMe((v) => !v)} activeOpacity={0.75}>
          <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
            {rememberMe && <Check size={13} color="#fff" strokeWidth={3} />}
          </View>
          <Text style={styles.checkboxLabel}>Remember me</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.checkboxRow} onPress={() => setTermsAccepted((v) => !v)} activeOpacity={0.75}>
          <View style={[styles.checkbox, termsAccepted && styles.checkboxActive]}>
            {termsAccepted && <Check size={13} color="#fff" strokeWidth={3} />}
          </View>
          <Text style={styles.checkboxLabel}>
            I agree to the <Text style={styles.checkboxLink}>Terms of Service</Text> and <Text style={styles.checkboxLink}>Privacy Policy</Text>
          </Text>
        </TouchableOpacity>
        <FieldError message={submitted ? errors.terms : null} styles={styles} />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.85}>
          <GradientWrapper colors={['#4361EE', '#7955D9']} style={styles.submitGradient}>
            <Text style={styles.submitText}>Create account</Text>
          </GradientWrapper>
        </TouchableOpacity>

      </ScrollView>

      {/* Country Selection Modal */}
      <Modal
        visible={showCountryModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCountryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setShowCountryModal(false)} hitSlop={10}>
                <X size={24} color={theme.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.countryOption, selectedCountry.code === item.code && styles.countryOptionActive]}
                  onPress={() => {
                    setSelectedCountry(item);
                    setShowCountryModal(false);
                  }}
                  activeOpacity={0.7}
                >
                  <View>
                    <Text style={styles.countryOptionName}>{item.name}</Text>
                    <Text style={styles.countryOptionCode}>{item.dialCode}</Text>
                  </View>
                  {selectedCountry.code === item.code && (
                    <Check size={20} color={theme.primary} strokeWidth={3} />
                  )}
                </TouchableOpacity>
              )}
              scrollEnabled={true}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function Field({ label, icon, children, styles }: { label: string; icon: React.ReactNode; children: React.ReactNode; styles: ReturnType<typeof createStyles> }) {
  return (
    <>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        {icon}
        {children}
      </View>
    </>
  );
}

function FieldError({ message, styles }: { message: string | null; styles: ReturnType<typeof createStyles> }) {
  if (!message) return <View style={{ height: 16 }} />;
  return <Text style={styles.errorText}>{message}</Text>;
}

const createStyles = (theme: ReturnType<typeof useTheme>) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  content: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 44, paddingBottom: 48 },
  backButton: { width: 40, height: 40, borderRadius: 14, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  eyebrow: { color: theme.primary, fontFamily: Fonts?.sansBold, fontSize: 10, letterSpacing: 1.5 },
  title: { color: theme.text, fontFamily: Fonts?.sansExtraBold, fontSize: 30, letterSpacing: -0.6, marginTop: 4 },
  subtitle: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13.5, marginTop: 6, marginBottom: 26, lineHeight: 19 },

  label: { color: theme.textSecondary, fontFamily: Fonts?.sansSemiBold, fontSize: 12.5, marginBottom: 8, marginTop: 4 },
  field: { minHeight: 52, borderRadius: 16, backgroundColor: theme.backgroundElement, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  fieldInput: { flex: 1, color: theme.text, fontFamily: Fonts?.sans, fontSize: 14.5, paddingVertical: 14 },

  phoneRow: { flexDirection: 'row', gap: 10 },
  countryCode: { width: 84, height: 52, borderRadius: 16, backgroundColor: theme.backgroundElement, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  countryCodeText: { color: theme.text, fontFamily: Fonts?.sansSemiBold, fontSize: 14 },
  phoneField: { flex: 1 },

  genderRow: { flexDirection: 'row', gap: 8 },
  genderChip: { flex: 1, height: 46, borderRadius: 14, backgroundColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  genderChipActive: { backgroundColor: theme.primary },
  genderChipText: { color: theme.text, fontFamily: Fonts?.sansSemiBold, fontSize: 13.5 },
  genderChipTextActive: { color: '#fff' },

  errorText: { color: '#FF3B30', fontFamily: Fonts?.sansMedium, fontSize: 11.5, marginTop: 6, marginBottom: 6 },

  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 6, marginBottom: 4 },
  checkbox: { width: 21, height: 21, borderRadius: 6, borderWidth: 1.5, borderColor: theme.backgroundElement, alignItems: 'center', justifyContent: 'center' },
  checkboxActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  checkboxLabel: { flex: 1, color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13, lineHeight: 18 },
  checkboxLink: { color: theme.primary, fontFamily: Fonts?.sansSemiBold },

  helperText: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 11, marginTop: 4, marginBottom: 4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: theme.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: theme.backgroundElement },
  modalTitle: { color: theme.text, fontFamily: Fonts?.sansBold, fontSize: 18 },
  countryOption: { paddingHorizontal: 24, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: theme.backgroundElement },
  countryOptionActive: { backgroundColor: theme.primary + '10' },
  countryOptionName: { color: theme.text, fontFamily: Fonts?.sansMedium, fontSize: 15 },
  countryOptionCode: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 12, marginTop: 2 },

  submitButton: { height: 54, borderRadius: 27, overflow: 'hidden', marginTop: 22 },
  submitGradient: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontFamily: Fonts?.sansBold, fontSize: 15.5 },

  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 22 },
  footerText: { color: theme.textSecondary, fontFamily: Fonts?.sans, fontSize: 13 },
  footerLink: { color: theme.primary, fontFamily: Fonts?.sansBold, fontSize: 13 },
});
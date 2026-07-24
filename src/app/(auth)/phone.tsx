import { Fonts, Spacing } from '@/constants/theme';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import { ChevronDown, Phone, Shield } from 'lucide-react-native';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COUNTRIES = [
    // North America
    { name: 'United States', code: '+1', flag: '🇺🇸' },
    { name: 'Canada', code: '+1', flag: '🇨🇦' },
    { name: 'Mexico', code: '+52', flag: '🇲🇽' },

    // Europe
    { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
    { name: 'France', code: '+33', flag: '🇫🇷' },
    { name: 'Germany', code: '+49', flag: '🇩🇪' },
    { name: 'Italy', code: '+39', flag: '🇮🇹' },
    { name: 'Spain', code: '+34', flag: '🇪🇸' },
    { name: 'Portugal', code: '+351', flag: '🇵🇹' },
    { name: 'Netherlands', code: '+31', flag: '🇳🇱' },
    { name: 'Belgium', code: '+32', flag: '🇧🇪' },
    { name: 'Sweden', code: '+46', flag: '🇸🇪' },
    { name: 'Norway', code: '+47', flag: '🇳🇴' },
    { name: 'Denmark', code: '+45', flag: '🇩🇰' },
    { name: 'Finland', code: '+358', flag: '🇫🇮' },
    { name: 'Poland', code: '+48', flag: '🇵🇱' },
    { name: 'Russia', code: '+7', flag: '🇷🇺' },
    { name: 'Ukraine', code: '+380', flag: '🇺🇦' },
    { name: 'Switzerland', code: '+41', flag: '🇨🇭' },
    { name: 'Austria', code: '+43', flag: '🇦🇹' },
    { name: 'Greece', code: '+30', flag: '🇬🇷' },
    { name: 'Turkey', code: '+90', flag: '🇹🇷' },

    // Asia
    { name: 'India', code: '+91', flag: '🇮🇳' },
    { name: 'China', code: '+86', flag: '🇨🇳' },
    { name: 'Japan', code: '+81', flag: '🇯🇵' },
    { name: 'South Korea', code: '+82', flag: '🇰🇷' },
    { name: 'Pakistan', code: '+92', flag: '🇵🇰' },
    { name: 'Bangladesh', code: '+880', flag: '🇧🇩' },
    { name: 'Indonesia', code: '+62', flag: '🇮🇩' },
    { name: 'Philippines', code: '+63', flag: '🇵🇭' },
    { name: 'Vietnam', code: '+84', flag: '🇻🇳' },
    { name: 'Thailand', code: '+66', flag: '🇹🇭' },
    { name: 'Malaysia', code: '+60', flag: '🇲🇾' },
    { name: 'Singapore', code: '+65', flag: '🇸🇬' },
    { name: 'Saudi Arabia', code: '+966', flag: '🇸🇦' },
    { name: 'UAE', code: '+971', flag: '🇦🇪' },
    { name: 'Iraq', code: '+964', flag: '🇮🇶' },
    { name: 'Iran', code: '+98', flag: '🇮🇷' },

    // Oceania
    { name: 'Australia', code: '+61', flag: '🇦🇺' },
    { name: 'New Zealand', code: '+64', flag: '🇳🇿' },

    // South America
    { name: 'Brazil', code: '+55', flag: '🇧🇷' },
    { name: 'Argentina', code: '+54', flag: '🇦🇷' },
    { name: 'Colombia', code: '+57', flag: '🇨🇴' },
    { name: 'Chile', code: '+56', flag: '🇨🇱' },
    { name: 'Peru', code: '+51', flag: '🇵🇪' },
    { name: 'Venezuela', code: '+58', flag: '🇻🇪' },

    // Africa — North
    { name: 'Egypt', code: '+20', flag: '🇪🇬' },
    { name: 'Algeria', code: '+213', flag: '🇩🇿' },
    { name: 'Morocco', code: '+212', flag: '🇲🇦' },
    { name: 'Tunisia', code: '+216', flag: '🇹🇳' },
    { name: 'Libya', code: '+218', flag: '🇱🇾' },
    { name: 'Sudan', code: '+249', flag: '🇸🇩' },

    // Africa — West
    { name: 'Nigeria', code: '+234', flag: '🇳🇬' },
    { name: 'Ghana', code: '+233', flag: '🇬🇭' },
    { name: 'Senegal', code: '+221', flag: '🇸🇳' },
    { name: 'Ivory Coast', code: '+225', flag: '🇨🇮' },
    { name: 'Cameroon', code: '+237', flag: '🇨🇲' },
    { name: 'Mali', code: '+223', flag: '🇲🇱' },
    { name: 'Burkina Faso', code: '+226', flag: '🇧🇫' },
    { name: 'Niger', code: '+227', flag: '🇳🇪' },
    { name: 'Guinea', code: '+224', flag: '🇬🇳' },
    { name: 'Benin', code: '+229', flag: '🇧🇯' },
    { name: 'Togo', code: '+228', flag: '🇹🇬' },
    { name: 'Sierra Leone', code: '+232', flag: '🇸🇱' },
    { name: 'Liberia', code: '+231', flag: '🇱🇷' },
    { name: 'Mauritania', code: '+222', flag: '🇲🇷' },
    { name: 'Cape Verde', code: '+238', flag: '🇨🇻' },
    { name: 'Gambia', code: '+220', flag: '🇬🇲' },
    { name: 'Guinea-Bissau', code: '+245', flag: '🇬🇼' },

    // Africa — East
    { name: 'Ethiopia', code: '+251', flag: '🇪🇹' },
    { name: 'Kenya', code: '+254', flag: '🇰🇪' },
    { name: 'Tanzania', code: '+255', flag: '🇹🇿' },
    { name: 'Uganda', code: '+256', flag: '🇺🇬' },
    { name: 'Rwanda', code: '+250', flag: '🇷🇼' },
    { name: 'Somalia', code: '+252', flag: '🇸🇴' },
    { name: 'South Sudan', code: '+211', flag: '🇸🇸' },
    { name: 'Djibouti', code: '+253', flag: '🇩🇯' },
    { name: 'Eritrea', code: '+291', flag: '🇪🇷' },
    { name: 'Burundi', code: '+257', flag: '🇧🇮' },
    { name: 'Madagascar', code: '+261', flag: '🇲🇬' },
    { name: 'Mozambique', code: '+258', flag: '🇲🇿' },
    { name: 'Malawi', code: '+265', flag: '🇲🇼' },
    { name: 'Zambia', code: '+260', flag: '🇿🇲' },
    { name: 'Zimbabwe', code: '+263', flag: '🇿🇼' },

    // Africa — Central
    { name: 'DR Congo', code: '+243', flag: '🇨🇩' },
    { name: 'Republic of Congo', code: '+242', flag: '🇨🇬' },
    { name: 'Chad', code: '+235', flag: '🇹🇩' },
    { name: 'Central African Republic', code: '+236', flag: '🇨🇫' },
    { name: 'Gabon', code: '+241', flag: '🇬🇦' },
    { name: 'Equatorial Guinea', code: '+240', flag: '🇬🇶' },
    { name: 'São Tomé and Príncipe', code: '+239', flag: '🇸🇹' },

    // Africa — South
    { name: 'South Africa', code: '+27', flag: '🇿🇦' },
    { name: 'Angola', code: '+244', flag: '🇦🇴' },
    { name: 'Namibia', code: '+264', flag: '🇳🇦' },
    { name: 'Botswana', code: '+267', flag: '🇧🇼' },
    { name: 'Lesotho', code: '+266', flag: '🇱🇸' },
    { name: 'Eswatini', code: '+268', flag: '🇸🇿' },
    { name: 'Mauritius', code: '+230', flag: '🇲🇺' },
    { name: 'Seychelles', code: '+248', flag: '🇸🇨' },
    { name: 'Comoros', code: '+269', flag: '🇰🇲' },
];

const COUNTRY_LOCAL_LENGTHS: Record<string, number> = {
    '+1': 10,
    '+52': 10,
    '+44': 10,
    '+33': 9,
    '+49': 10,
    '+39': 10,
    '+34': 9,
    '+351': 9,
    '+31': 9,
    '+32': 9,
    '+46': 9,
    '+47': 8,
    '+45': 8,
    '+358': 9,
    '+48': 9,
    '+7': 10,
    '+380': 9,
    '+41': 9,
    '+43': 9,
    '+30': 10,
    '+90': 10,
    '+91': 10,
    '+86': 11,
    '+81': 10,
    '+82': 10,
    '+92': 10,
    '+880': 10,
    '+62': 10,
    '+63': 10,
    '+84': 9,
    '+66': 9,
    '+60': 9,
    '+65': 8,
    '+966': 9,
    '+971': 9,
    '+964': 10,
    '+98': 10,
    '+61': 9,
    '+64': 9,
    '+55': 11,
    '+54': 10,
    '+57': 10,
    '+56': 9,
    '+51': 9,
    '+58': 10,
    '+20': 10,
    '+213': 9,
    '+212': 9,
    '+216': 8,
    '+218': 9,
    '+249': 9,
    '+234': 10,
    '+233': 9,
    '+221': 9,
    '+225': 8,
    '+237': 9,
    '+223': 8,
    '+226': 8,
    '+227': 8,
    '+224': 8,
    '+229': 8,
    '+228': 8,
    '+232': 8,
    '+231': 7,
    '+222': 8,
    '+238': 7,
    '+220': 7,
    '+245': 7,
    '+251': 9,
    '+254': 9,
    '+255': 9,
    '+256': 9,
    '+250': 9,
    '+252': 9,
    '+211': 9,
    '+253': 8,
    '+291': 7,
    '+257': 8,
    '+261': 9,
    '+258': 9,
    '+265': 9,
    '+260': 9,
    '+263': 9,
    '+243': 9,
    '+242': 9,
    '+235': 8,
    '+236': 8,
    '+241': 8,
    '+240': 9,
    '+239': 7,
    '+27': 9,
    '+244': 9,
    '+264': 9,
    '+267': 7,
    '+266': 8,
    '+268': 8,
    '+230': 8,
    '+248': 7,
    '+269': 7,
};

const getAbbr = (flag: string) => [...flag].map(c => String.fromCharCode(c.codePointAt(0)! - 127397)).join('');

export default function PhoneScreen() {
    const router = useRouter();
    const colors = useTheme();
    const { signInWithPhone } = useAuth();
    const [phoneNumber, setPhoneNumber] = useState('');
    const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const filteredCountries = COUNTRIES.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.code.includes(search)
    );

    const cleanNumber = phoneNumber.replace(/\D/g, '').replace(/^0+/, '');
    const maxLocalLength = COUNTRY_LOCAL_LENGTHS[selectedCountry.code] ?? 10;
    const truncatedNumber = cleanNumber.slice(0, maxLocalLength);
    const fullPhone = `${selectedCountry.code}${truncatedNumber}`;
    const isPhoneValid = truncatedNumber.length >= Math.min(7, maxLocalLength) && truncatedNumber.length <= maxLocalLength;

    const handleContinue = async () => {
        if (!isPhoneValid) {
            Alert.alert(
                'Invalid Phone Number',
                `Please enter a valid phone number for ${selectedCountry.name} (up to ${maxLocalLength} digits).`
            );
            return;
        }

        Alert.alert(
            'Confirm Number',
            `Send verification code to ${fullPhone}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setIsLoading(true);
                        const { error } = await signInWithPhone(fullPhone);
                        setIsLoading(false);
                        if (error) {
                            Alert.alert('Error', error.message);
                        } else {
                            router.push({ pathname: '/(auth)/otp', params: { phone: fullPhone } });
                        }
                    },
                },
            ]
        );
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text, fontFamily: Fonts.sansBold }]}>
                    Enter your phone number
                </Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
                    We&apos;ll send a one-time verification code to securely sign you in. Your phone number is used only for authentication.
                </Text>
            </View>

            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: Fonts.sansBold }]}>COUNTRY</Text>
            <TouchableOpacity
                style={[styles.countrySelector, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}
                onPress={() => setPickerVisible(true)}
            >
                <View style={styles.countryLeft}>
                    <Text style={[styles.countryAbbr, { color: colors.text, fontFamily: Fonts.sansMedium }]}>
                        {getAbbr(selectedCountry.flag)}
                    </Text>
                    <Text style={[styles.countryName, { color: colors.text, fontFamily: Fonts.sans }]}>
                        {selectedCountry.name}
                    </Text>
                </View>
                <View style={styles.countryRight}>
                    <View style={[styles.codeBadge, { backgroundColor: colors.primary + '15' }]}>
                        <Text style={{ color: colors.primary, fontFamily: Fonts.sansMedium }}>
                            {selectedCountry.code}
                        </Text>
                    </View>
                    <ChevronDown color={colors.textSecondary} size={20} />
                </View>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.textSecondary, fontFamily: Fonts.sansBold, marginTop: Spacing.four }]}>PHONE NUMBER</Text>
            <View style={[styles.inputWrapper, { borderColor: colors.backgroundSelected, backgroundColor: colors.backgroundElement }]}>
                <Phone color={colors.textSecondary} size={20} style={styles.inputIcon} />
                <Text style={[styles.inputCode, { color: colors.primary, fontFamily: Fonts.sansBold }]}>
                    {selectedCountry.code}
                </Text>
                <TextInput
                    style={[styles.input, {
                        color: colors.text,
                        fontFamily: Fonts.sans
                    }]}
                    placeholder="55 123 4567"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={(text) => {
                        let digits = text.replace(/\D/g, '');
                        
                        // Strip country code if entered at the beginning
                        const rawCode = selectedCountry.code.replace('+', '');
                        if (rawCode && digits.startsWith(rawCode)) {
                            digits = digits.slice(rawCode.length);
                        }

                        // Allow extra digit for leading zero if present
                        const hasLeadingZero = digits.startsWith('0');
                        const baseLength = COUNTRY_LOCAL_LENGTHS[selectedCountry.code] ?? 10;
                        const maxLength = baseLength + (hasLeadingZero ? 1 : 0);
                        
                        setPhoneNumber(digits.slice(0, maxLength));
                    }}
                />
            </View>

            <View style={[styles.infoBox, { backgroundColor: colors.primary + '0A', borderColor: colors.primary + '15' }]}>
                <View style={[styles.shieldContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Shield color={colors.primary} size={18} />
                </View>
                <Text style={[styles.infoText, { color: colors.textSecondary, fontFamily: Fonts.sans }]}>
                    Your phone number is <Text style={{ fontFamily: Fonts.sansBold, color: colors.text }}>encrypted</Text> and never shared with other users without your permission.
                </Text>
            </View>

            <Text style={[styles.validationText, { color: isPhoneValid ? colors.textSecondary : '#FF6B6B', fontFamily: Fonts.sans, marginTop: Spacing.two }]}> 
                {isPhoneValid ? `Enter up to ${maxLocalLength} digits for ${selectedCountry.name}.` : `Phone number must be ${Math.min(7, maxLocalLength)}-${maxLocalLength} digits.`}
            </Text>

            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: isPhoneValid && !isLoading ? colors.primary : colors.backgroundSelected }
                ]}
                disabled={!isPhoneValid || isLoading}
                onPress={handleContinue}
            >
                {isLoading
                    ? <ActivityIndicator color="#FFF" />
                    : <Text style={[styles.buttonText, {
                        color: isPhoneValid ? '#FFF' : colors.textSecondary,
                    }]}>
                        Continue
                    </Text>
                }
            </TouchableOpacity>

            <Modal visible={isPickerVisible} animationType="slide" transparent={true}>
                <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                        <Text style={[styles.modalTitle, { color: colors.text, fontFamily: Fonts.sansBold }]}>Select Country</Text>
                        <TextInput
                            style={[styles.searchInput, {
                                borderColor: colors.backgroundSelected,
                                color: colors.text,
                                backgroundColor: colors.backgroundElement,
                                fontFamily: Fonts.sans,
                            }]}
                            placeholder="Search country or code…"
                            placeholderTextColor={colors.textSecondary}
                            value={search}
                            onChangeText={setSearch}
                            autoCorrect={false}
                        />
                        <FlatList
                            data={filteredCountries}
                            keyExtractor={(item) => item.name}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.countryItem,
                                        { borderBottomColor: colors.backgroundSelected },
                                        selectedCountry.name === item.name && { backgroundColor: colors.backgroundElement },
                                    ]}
                                    onPress={() => {
                                        setSelectedCountry(item);
                                        setPickerVisible(false);
                                        setSearch('');
                                    }}
                                >
                                    <View style={styles.countryItemLeft}>
                                        <Text style={styles.flagText}>{item.flag}</Text>
                                        <Text style={{ color: colors.text, fontFamily: Fonts.sans }}>{item.name}</Text>
                                    </View>
                                    <Text style={{ color: colors.textSecondary, fontFamily: Fonts.sans }}>{item.code}</Text>
                                </TouchableOpacity>
                            )}
                            keyboardShouldPersistTaps="handled"
                        />
                        <TouchableOpacity style={[styles.closeButton, { backgroundColor: colors.backgroundSelected }]} onPress={() => { setPickerVisible(false); setSearch(''); }}>
                            <Text style={{ color: colors.text, fontFamily: Fonts.sansMedium }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: Spacing.four,
    },
    header: {
        marginTop: Spacing.five,
        marginBottom: Spacing.five,
    },
    title: {
        fontSize: 28,
        marginBottom: Spacing.three,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    label: {
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: Spacing.two,
        marginLeft: Spacing.one,
        textTransform: 'uppercase',
    },
    countrySelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.four,
        height: 56,
        borderWidth: 1,
        borderRadius: 16,
    },
    countryLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    countryAbbr: {
        fontSize: 16,
        width: 32,
    },
    countryName: {
        fontSize: 16,
    },
    countryRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,
    },
    codeBadge: {
        paddingHorizontal: Spacing.two,
        paddingVertical: 4,
        borderRadius: 8,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 56,
        borderWidth: 1,
        borderRadius: 16,
        paddingHorizontal: Spacing.four,
    },
    inputIcon: {
        marginRight: Spacing.three,
    },
    inputCode: {
        fontSize: 16,
        marginRight: Spacing.two,
    },
    input: {
        flex: 1,
        fontSize: 16,
    },
    infoBox: {
        flexDirection: 'row',
        padding: Spacing.four,
        borderWidth: 1,
        borderRadius: 16,
        marginTop: Spacing.five,
        gap: Spacing.three,
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
    footerText: {
        textAlign: 'center',
        fontSize: 13,
        marginBottom: Spacing.two,
        paddingHorizontal: Spacing.four,
        lineHeight: 20,
    },
    validationText: {
        fontSize: 13,
        marginTop: Spacing.two,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.four,
        maxHeight: '80%',
    },
    modalTitle: {
        fontSize: 20,
        marginBottom: Spacing.three,
        textAlign: 'center',
    },
    searchInput: {
        height: 44,
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: Spacing.three,
        marginBottom: Spacing.three,
        fontSize: 15,
    },
    countryItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.three,
        paddingHorizontal: Spacing.two,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderRadius: 8,
    },
    countryItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    flagText: {
        fontSize: 22,
    },
    closeButton: {
        marginTop: Spacing.four,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
    },
});
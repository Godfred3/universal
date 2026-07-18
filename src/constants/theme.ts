/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0D0F1E',
    background: '#F0F2FF',
    backgroundElement: '#E4E8FF',
    backgroundSelected: '#C7CEFF',
    textSecondary: '#6B7280',
    primary: '#4361EE',
    secondary: '#8B5CF6',
  },
  dark: {
    text: '#E8EAFF',
    background: '#080D1E',
    backgroundElement: '#111827',
    backgroundSelected: '#1E2A4A',
    textSecondary: '#9CA3AF',
    primary: '#4361EE',
    secondary: '#8B5CF6',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'Outfit_400Regular',
    sansMedium: 'Outfit_500Medium',
    sansSemiBold: 'Outfit_600SemiBold',
    sansBold: 'Outfit_700Bold',
    sansExtraBold: 'Outfit_800ExtraBold',
    sansLight: 'Outfit_300Light',
    sansThin: 'Outfit_100Thin',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Outfit_400Regular',
    sansMedium: 'Outfit_500Medium',
    sansSemiBold: 'Outfit_600SemiBold',
    sansBold: 'Outfit_700Bold',
    sansExtraBold: 'Outfit_800ExtraBold',
    sansLight: 'Outfit_300Light',
    sansThin: 'Outfit_100Thin',
    serif: 'serif',
    rounded: 'Outfit_400Regular',
    mono: 'monospace',
  },
  web: {
    sans: 'Outfit_400Regular',
    sansMedium: 'Outfit_500Medium',
    sansSemiBold: 'Outfit_600SemiBold',
    sansBold: 'Outfit_700Bold',
    sansExtraBold: 'Outfit_800ExtraBold',
    sansLight: 'Outfit_300Light',
    sansThin: 'Outfit_100Thin',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

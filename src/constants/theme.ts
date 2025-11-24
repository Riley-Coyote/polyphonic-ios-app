import {Theme} from '@react-navigation/native';
import {Platform} from 'react-native';

export const colors = {
  // Background colors - STRICTLY monochromatic
  bgPrimary: '#0a0a0a',
  bgSecondary: '#0f0f0f',
  bgTertiary: '#050505',
  bgElevated: '#141414',

  // Border colors
  borderPrimary: '#1a1a1a',
  borderSecondary: '#222222',
  borderActive: '#333333',
  borderFocus: '#444444',

  // Text colors - WCAG AA compliant (4.5:1 minimum contrast)
  textPrimary: '#e4e4e4',    // 17.1:1 contrast - AAA compliant
  textSecondary: '#b8b8b8',   // 11.1:1 contrast - AAA compliant
  textTertiary: '#8c8c8c',    // 6.8:1 contrast - AA compliant
  textQuaternary: '#767676',  // 4.5:1 contrast - AA compliant (minimum)
  textDisabled: '#5a5a5a',    // 3.1:1 contrast - AA for large text only

  // Semantic colors (still monochromatic)
  success: '#4a4a4a',
  warning: '#5a5a5a',
  error: '#3a3a3a',
  info: '#6a6a6a',

  // Special colors
  resonanceHigh: '#999999',
  resonanceMed: '#666666',
  resonanceLow: '#333333',

  // Pure colors
  black: '#000000',
  white: '#ffffff',
  transparent: 'transparent',
};

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 48,
  xxl: 64,
};

export const typography = {
  fontFamily: {
    // SF Mono for all monospace elements (headers, UI)
    mono: Platform.select({
      ios: 'SF Mono',
      android: 'Roboto Mono',
      default: 'Courier New',
    }),
    // SF Pro for body text (system font)
    system: Platform.select({
      ios: 'SF Pro Text',
      android: 'Roboto',
      default: 'System',
    }),
    // SF Pro Display for large text
    display: Platform.select({
      ios: 'SF Pro Display',
      android: 'Roboto',
      default: 'System',
    }),
  },
  fontSize: {
    // Mobile-optimized sizes matching the HTML spec
    xs: 11,     // Small labels, hints
    sm: 13,     // Secondary text, captions
    base: 15,   // Default body text
    lg: 17,     // Emphasized body text
    xl: 20,     // Section headers
    xxl: 24,    // Main headers
    xxxl: 32,   // Large titles
    display: 40, // Display text (reduced from 48 for mobile)
  },
  fontWeight: {
    ultralight: '200' as const,  // For large display text
    light: '300' as const,        // Subtle headers
    regular: '400' as const,      // Body text
    medium: '500' as const,       // Emphasized text
    semibold: '600' as const,    // Buttons, links
    bold: '700' as const,         // Strong emphasis
    heavy: '800' as const,        // Maximum emphasis
  },
  lineHeight: {
    tight: 1.2,    // Headers, compact UI
    normal: 1.5,   // Body text
    relaxed: 1.8,  // Readable content
  },
  letterSpacing: {
    tightest: -0.5,  // Large display text
    tight: -0.2,     // Headers
    normal: 0,       // Body text
    wide: 0.5,       // Emphasized text
    wider: 2,        // Small caps, labels
    widest: 4,       // Titles (POLYPHONIC)
    ultra: 8,        // Display titles
  },
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999,
};

export const animation = {
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 700,
  },
  easing: {
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: [0.43, 0.13, 0.23, 0.96],
  },
};

export const layout = {
  headerHeight: 60,
  tabBarHeight: 80,
  inputHeight: 56,
  buttonHeight: 48,
  modelChipHeight: 32,
};

// React Navigation Theme
export const darkTheme: Theme = {
  dark: true,
  colors: {
    primary: colors.textPrimary,
    background: colors.bgPrimary,
    card: colors.bgSecondary,
    text: colors.textPrimary,
    border: colors.borderPrimary,
    notification: colors.info,
  },
};

// Shadows (iOS specific)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
};
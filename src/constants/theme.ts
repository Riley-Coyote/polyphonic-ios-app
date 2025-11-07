import {Theme} from '@react-navigation/native';

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

  // Text colors
  textPrimary: '#cccccc',
  textSecondary: '#999999',
  textTertiary: '#666666',
  textQuaternary: '#444444',
  textDisabled: '#333333',

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
    mono: 'Courier New',
    system: 'System',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    display: 48,
  },
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.8,
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
// Modern Silicon Valley Theme - Clean, Light, Professional
export const theme = {
  colors: {
    // Light, modern palette
    background: '#FFFFFF',
    backgroundSecondary: '#F8F9FB',
    card: '#FFFFFF',
    cardLight: '#FFFFFF',
    cardBorder: '#E8ECEF',
    cardBorderLightDark: '#B0BEC5',
    cardBgSecondary: '#F5F7FA',
    
    // Text
    textPrimary: '#1A1D23',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textWhite: '#FFFFFF',
    
    // Text colors for dark blur backgrounds
    textOnDarkBlur: '#FFFFFF',
    textSecondaryOnDarkBlur: '#E5E7EB',
    textTertiaryOnDarkBlur: '#D1D5DB',
    
    // Accents - Modern blue
    accent: '#0066FF',
    accentHover: '#0052CC',
    accentLight: '#E0EAFF',
    
    // Status colors
    routePolyline: '#0066FF',
    poiMarker: '#00D084',
    error: '#F04545',
    success: '#00C853',
    warning: '#FFA500',
    
    // Secondary accents
    secondary: '#FF6B6B',
    tertiary: '#FFD700',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 28,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
      lineHeight: 40,
    },
    h2: {
      fontSize: 26,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '700' as const,
      letterSpacing: 0,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 20,
    },
    bodySemibold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 24,
    },
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      letterSpacing: 0.3,
      lineHeight: 20,
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: '600' as const,
      letterSpacing: 0.2,
      lineHeight: 18,
    },
  },
  shadows: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
  },
};

export type Theme = typeof theme;

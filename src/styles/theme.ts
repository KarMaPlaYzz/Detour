// Urban Explorer Theme
export const theme = {
  colors: {
    background: '#121212',
    card: '#1E1E1E',
    cardBorder: '#2A2A2A',
    textPrimary: '#FFFFFF',
    textSecondary: '#B3B3B3',
    accent: '#00A8FF',
    accentHover: '#0096E6',
    routePolyline: '#00A8FF',
    poiMarker: '#FFD600',
    error: '#FF4444',
    success: '#00C853',
    warning: '#FFA726',
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
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
  },
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      letterSpacing: 0.5,
    },
    h2: {
      fontSize: 22,
      fontWeight: '700' as const,
      letterSpacing: 0.3,
    },
    h3: {
      fontSize: 18,
      fontWeight: '600' as const,
      letterSpacing: 0.2,
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
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 16,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      letterSpacing: 0.5,
    },
  },
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.35,
      shadowRadius: 16,
      elevation: 10,
    },
  },
};

export type Theme = typeof theme;

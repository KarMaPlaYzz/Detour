// Detour App Theme - Complete Color System (Phase 1 Foundation)
// Primary Brand Colors from Logo:
// - Green (#184528) - Dark forest green
// - Cream (#fdedcb) - Warm light background
export const theme = {
  colors: {
    // PRIMARY GREEN PALETTE (from logo #184528)
    greenDark: '#184528',           // Primary brand green (darkest)
    greenMedium: '#2d5c52',         // Medium green
    greenLight: '#4a8a7f',          // Light green
    greenAccent: '#5ba89a',         // Teal accent (complementary)
    greenLighter: '#7ab5aa',        // Very light green (hover states)
    
    // CREAM PALETTE (from logo #fdedcb)
    creamLight: '#fdedcb',          // Primary light cream
    creamLighter: '#fef5e6',        // Lighter cream (backgrounds)
    creamDarker: '#f5e0b0',         // Darker cream (accents)
    creamDarkest: '#ead5a0',        // Darkest cream (borders)
    
    // DARK SURFACES (for dark theme)
    darkPrimary: '#0f1419',         // Main dark background (very dark)
    darkSecondary: '#1a1f27',       // Cards, secondary surfaces
    darkTertiary: '#252a34',        // Borders, overlays
    darkLight: '#2f3640',           // Slight lighter (hover/active states)
    
    // TEXT COLORS (on dark background)
    textPrimary: '#f5f5f5',         // Primary text (slightly off-white)
    textSecondary: '#b8b8b8',       // Secondary text (readable)
    textTertiary: '#808080',        // Tertiary/disabled text
    textWhite: '#ffffff',           // Pure white (rare use)
    textOnCream: '#184528',         // Text on cream background
    
    // STATUS COLORS
    success: '#00c853',             // Green
    error: '#ff4757',               // Red
    warning: '#ffa500',             // Orange
    info: '#5ba89a',                // Teal (from accent)
    
    // SEMANTIC COLORS
    background: '#0f1419',          // Main background
    backgroundSecondary: '#1a1f27', // Secondary background
    card: '#1a1f27',                // Card background
    cardLight: '#252a34',           // Light card variant
    cardBorder: '#2f3640',          // Card borders
    cardBorderLight: '#3d4551',     // Light card borders
    
    // ACCENT COLORS
    accent: '#184528',              // Primary green (CTA buttons)
    accentHover: '#122c1d',         // Darker green (pressed state)
    accentLight: '#5ba89a',         // Light green (backgrounds)
    accentCream: '#fdedcb',         // Cream accent (highlights)
    
    // FUNCTIONAL COLORS
    routePolyline: '#5ba89a',       // Route line (teal, visible on map)
    routePolylineActive: '#184528', // Selected route (darker green)
    poiMarkerStart: '#00c853',      // Start point (green)
    poiMarkerEnd: '#ff4757',        // End point (red)
    poiMarkerPoi: '#5ba89a',        // POI point (teal)
    poiMarkerHover: '#fdedcb',      // POI hover (cream)
    
    // DEPRECATED (for backwards compatibility)
    poiMarker: '#5ba89a',
    secondary: '#ff6b6b',
    tertiary: '#ffd700',
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
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.18,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.23,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.27,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.32,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.38,
      shadowRadius: 24,
      elevation: 12,
    },
  },
};

export type Theme = typeof theme;

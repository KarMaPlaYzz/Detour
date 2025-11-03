// Detour Design System - Based on UX_BLUEPRINT_4
export const theme = {
  colors: {
    // Primary Colors (Light Mode)
    primary: '#0891B2',           // Vibrant Teal (Brand/CTA)
    primaryDark: '#06B6D4',       // Darker Teal for hover
    primaryLight: '#E0F2FE',      // Light Teal for backgrounds
    
    // Secondary Colors
    secondary: '#EC4899',         // Vibrant Coral/Magenta (Accent)
    secondaryDark: '#DB2777',     // Darker Coral
    secondaryLight: '#FCE7F3',    // Light Coral
    
    // Neutral Colors (Light Mode)
    background: '#FAFAFA',        // Off-White Canvas
    backgroundElevated: '#FFFFFF', // Pure white for cards
    backgroundSecondary: '#F8F8F8',
    
    // Text Colors (Light Mode)
    textPrimary: '#1F2937',       // Dark Gray
    textSecondary: '#6B7280',     // Medium Gray
    textTertiary: '#9CA3AF',      // Light Gray
    textInverse: '#FFFFFF',       // White text for dark backgrounds
    
    // Dark Mode Colors
    backgroundDark: '#0F172A',    // Dark Canvas
    backgroundDarkElevated: '#1E293B', // Elevated surface
    backgroundDarkSecondary: '#334155',
    textDarkPrimary: '#F1F5F9',   // Light text
    textDarkSecondary: '#CBD5E1', // Medium gray text
    textDarkTertiary: '#94A3B8',  // Tertiary text
    
    // Semantic Colors
    error: '#EF4444',             // Red for errors
    errorLight: '#FEE2E2',        // Light red background
    success: '#10B981',           // Green for success
    successLight: '#D1FAE5',      // Light green background
    warning: '#F59E0B',           // Amber for warnings
    warningLight: '#FEF3C7',      // Light amber background
    info: '#3B82F6',              // Blue for info
    infoLight: '#DBEAFE',         // Light blue background
    
    // Vibe Colors (for POI markers and route polylines)
    vibeCreative: '#8B5CF6',      // Purple
    vibeFoodie: '#F97316',        // Orange
    vibeNature: '#10B981',        // Green
    vibeHistory: '#92400E',       // Brown
    vibeNightlife: '#EC4899',     // Pink/Magenta
    vibeHiddenGems: '#6366F1',    // Indigo
    vibeLocalFavorites: '#0891B2', // Teal (primary)
    
    // Map specific
    routePolyline: '#0891B2',
    poiMarker: '#10B981',
    userLocationPin: '#3B82F6',
    destinationPin: '#EF4444',
    
    // Legacy compatibility
    card: '#FFFFFF',
    cardBorder: '#E5E7EB',
    accent: '#0891B2',
    accentHover: '#06B6D4',
    accentLight: '#E0F2FE',
  },
  // Spacing based on 8px grid (UX_BLUEPRINT_4)
  spacing: {
    xs: 4,     // 4px for fine-tuning
    sm: 8,     // Base unit
    md: 12,    // Intermediate
    lg: 16,    // Standard padding
    xl: 20,    // Generous spacing
    xxl: 24,   // Screen margins
    xxxl: 32,  // Large sections
  },
  
  // Border Radius (UX_BLUEPRINT_4)
  borderRadius: {
    xs: 4,     // Subtle rounding
    sm: 8,     // Small components
    md: 12,    // Cards, buttons
    lg: 16,    // Large cards
    xl: 20,    // Bottom sheets
    xxl: 24,   // Modals
    full: 9999, // Circular
  },
  // Typography (UX_BLUEPRINT_4 - Inter font family)
  typography: {
    // Headlines (48-52px for hero, Poppins/Outfit alternative)
    hero: {
      fontSize: 48,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
      lineHeight: 56,
    },
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      letterSpacing: -0.5,
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      letterSpacing: -0.3,
      lineHeight: 36,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      letterSpacing: 0,
      lineHeight: 28,
    },
    // Body text (14px minimum)
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 26,        // 1.6 line height
    },
    bodyLarge: {
      fontSize: 18,
      fontWeight: '400' as const,
      lineHeight: 28,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 22,        // 1.5-1.6 line height
    },
    bodySemibold: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 26,
    },
    // Buttons (16px minimum)
    button: {
      fontSize: 18,
      fontWeight: '600' as const,
      letterSpacing: 0.3,
      lineHeight: 24,
    },
    buttonSmall: {
      fontSize: 16,
      fontWeight: '600' as const,
      letterSpacing: 0.2,
      lineHeight: 22,
    },
    // Labels and captions (12px minimum)
    caption: {
      fontSize: 12,
      fontWeight: '500' as const,
      lineHeight: 18,        // 1.5 line height
    },
    label: {
      fontSize: 14,
      fontWeight: '500' as const,
      lineHeight: 20,
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

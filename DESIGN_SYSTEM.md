# Detour App - Modern Design System

## 🎨 Design Philosophy
The Detour app now features a modern, **light-themed Silicon Valley design** inspired by leading tech products like Google Maps, Apple Maps, and AirBnB. The design emphasizes clarity, usability, and a premium aesthetic.

---

## 🎯 Color Palette

### Primary Colors
- **Accent (Primary Blue)**: `#0066FF`
  - Used for buttons, active states, and interactive elements
  - Modern, trustworthy, and professional
  
- **Accent Hover**: `#0052CC`
  - Deeper blue for active/pressed states
  
- **Accent Light**: `#E0EAFF`
  - Light blue background for subtle highlights

### Status Colors
- **Success (Green)**: `#00C853`
  - Route endpoints, positive confirmations
  
- **Error (Red)**: `#F04545`
  - Errors and warnings
  
- **Warning (Orange)**: `#FFA500`
  - Secondary alerts
  
- **POI Marker (Green)**: `#00D084`
  - Points of Interest markers

### Semantic Colors
- **Background**: `#FFFFFF` (Pure white, clean canvas)
- **Background Secondary**: `#F8F9FB` (Subtle off-white for layering)
- **Card Background**: `#FFFFFF` (Clean white)
- **Card Secondary**: `#F5F7FA` (Light gray for secondary surfaces)

### Text Colors
- **Primary Text**: `#1A1D23` (Deep dark gray, excellent readability)
- **Secondary Text**: `#6B7280` (Medium gray for supporting content)
- **Tertiary Text**: `#9CA3AF` (Light gray for disabled/hints)

### Borders & Dividers
- **Card Border**: `#E8ECEF` (Subtle light gray)

---

## 📐 Spacing System

All spacing is built on an 8px base unit:

```
xs:   4px   (subtle spacing)
sm:   8px   (small gaps)
md:  16px   (standard spacing)
lg:  24px   (large spacing)
xl:  32px   (extra large)
xxl: 48px   (huge spacing)
```

### Usage Guidelines
- **Component padding**: `md` (16px)
- **Between sections**: `lg` (24px)
- **Section padding**: `xl` (32px)
- **Text inside buttons**: `md` vertical, `lg` horizontal

---

## 🔲 Border Radius

```
xs:  4px    (minimal rounding)
sm:  8px    (subtle rounding)
md: 12px    (standard rounding)
lg: 16px    (prominent rounding)
xl: 20px    (extra rounded)
full: 9999px (pill/circle shape)
```

### Usage
- **Input fields**: `md` (12px)
- **Cards & containers**: `lg` (16px)
- **Buttons**: `md` (12px)
- **Navigation**: `full` (pill-shaped)
- **Icons in pills**: `full` (circular)

---

## 🔤 Typography System

### Headings
- **H1**: 32px, Bold (700), -0.5 letter-spacing
  - Page titles, main headers
  
- **H2**: 26px, Bold (700), -0.3 letter-spacing
  - Section headers, modal titles
  
- **H3**: 20px, Bold (700), 0 letter-spacing
  - Subsection headers, component titles

### Body Text
- **Body**: 16px, Regular (400), 24px line-height
  - Standard paragraph text
  
- **Body Small**: 14px, Regular (400), 20px line-height
  - Secondary information, descriptions
  
- **Body Semibold**: 16px, Semibold (600), 24px line-height
  - Emphasized body text

### UI Text
- **Button**: 16px, Semibold (600), 0.3 letter-spacing
  - All button text
  
- **Button Small**: 14px, Semibold (600), 0.2 letter-spacing
  - Small buttons, compact UI
  
- **Caption**: 12px, Medium (500), 16px line-height
  - Labels, badges, helpers

---

## 🎁 Shadow System

All shadows maintain subtle depth:

### Shadow Sizes
- **xs**: 1px offset, 0.05 opacity, 2px blur
  - Minimal elevation
  
- **sm**: 2px offset, 0.08 opacity, 4px blur
  - Subtle cards
  
- **md**: 4px offset, 0.1 opacity, 8px blur
  - Standard elevation (cards, buttons)
  
- **lg**: 8px offset, 0.12 opacity, 16px blur
  - Prominent elements (modals, overlays)
  
- **xl**: 12px offset, 0.15 opacity, 24px blur
  - Maximum elevation (save dialogs)

---

## 🎯 Component Design

### Search Bar
- **Style**: Pill-shaped (border-radius: 9999px)
- **Height**: 52px
- **Background**: White card
- **Border**: 1px `#E8ECEF`
- **Shadow**: md
- **Padding**: 16px (horizontal)
- **Icon size**: 24px (tertiary color)

### Route Input Container
- **Background**: Secondary (`#F5F7FA`)
- **Border**: 1px `#E8ECEF`
- **Radius**: md (12px)
- **Padding**: 16px
- **Dots**: 10px circles
  - Start: Blue (`#0066FF`)
  - End: Red (`#FF6B6B`)

### Buttons
- **Primary**: Blue background (`#0066FF`)
- **Secondary**: Card background with border
- **Radius**: md (12px)
- **Padding**: 16px horizontal, 12px vertical
- **Height**: ~48-52px
- **Shadow**: md
- **Text**: Button typography, white text on blue

### Markers
- **Start**: Circular, blue, checkmark icon
- **End**: Circular, red, flag icon
- **POI**: Circular, green, star icon
- **Size**: 48px diameter
- **Shadow**: md (4px offset, 0.2 opacity)

### Modals
- **Background**: White card
- **Border**: 1px `#E8ECEF`
- **Radius**: lg (16px)
- **Padding**: 32px (xl)
- **Backdrop**: 50% black opacity
- **Shadow**: xl

### Navigation Buttons (FAB)
- **Position**: Bottom-right, 80px from bottom
- **Style**: Pill-shaped column layout
- **Background**: White with border
- **Active**: Light blue background
- **Size**: 56x56px minimum
- **Shadow**: lg

---

## 📱 Layout Principles

### Safe Areas
- **Top padding**: Use safe area for status bar
- **Bottom padding**: 120px for navigation (FAB + tab bar)

### Spacing Between Sections
- **Top section** (search): 16px padding
- **Middle section** (map): Full stretch
- **Bottom section** (actions): 16px padding, 120px bottom safety

### Card Elevation Hierarchy
1. **Map** (base level, no shadow)
2. **Search bar** (md shadow)
3. **Buttons** (md shadow)
4. **Modal** (xl shadow)

---

## 🎨 Color Usage Guide

### For Routes
- **Start point**: Blue (`#0066FF`)
- **End point**: Red (`#FF6B6B`)
- **Polyline**: Blue with semi-transparent background for depth

### For POI
- **Marker**: Green (`#00D084`)
- **Background highlight**: Light green tint
- **Rating badge**: Orange
- **Open status**: Green dot
- **Closed status**: Red dot

### For Interactive States
- **Default**: Gray border, white background
- **Hover/Active**: Blue background, white text
- **Disabled**: 60% opacity
- **Loading**: Spinner animation

---

## ✨ Visual Hierarchy

### Primary (Most Important)
- Search bar
- Primary call-to-action buttons (blue)
- Active markers
- Route polylines

### Secondary (Important)
- Route input fields
- Interest selector buttons
- Modal titles

### Tertiary (Supporting)
- Secondary text
- Labels
- Hint text
- Disabled elements

---

## 🚀 Implementation Notes

### File Locations
- **Theme**: `src/styles/theme.ts`
- **Components**: `src/components/`
  - `MapViewComponent.tsx`
  - `InputFormComponent.tsx`
  - `FloatingNavigation.tsx`
  - `SaveDetourModal.tsx`

### Theme Usage
```typescript
import { theme } from '@/styles/theme';

// Colors
backgroundColor: theme.colors.accent
color: theme.colors.textPrimary

// Spacing
padding: theme.spacing.md
gap: theme.spacing.lg

// Radius
borderRadius: theme.borderRadius.md

// Typography
...theme.typography.h1
...theme.typography.button

// Shadows
...theme.shadows.md
```

---

## 🔄 Dark Mode Readiness

The design system is prepared for future dark mode implementation:
- All colors defined with semantic names
- Light/dark pairs ready for theming
- Shadow opacity levels support both themes

---

## 📊 Comparison to Previous Design

### Before
- Dark theme (`#121212` background)
- Ugly default map markers
- Inconsistent spacing
- Clashing color scheme

### After
- ✅ Light, modern theme (white background)
- ✅ Custom beautiful markers with icons
- ✅ Consistent 8px spacing grid
- ✅ Cohesive color palette (blue-based)
- ✅ Premium shadows and elevation
- ✅ Professional typography
- ✅ AirBnB/Google Maps aesthetic

---

## 🎓 Design References

The updated design draws inspiration from:
- **Google Maps**: Clean, minimal aesthetic
- **Apple Maps**: Refined typography and spacing
- **AirBnB**: Modern color palette and card design
- **Stripe**: Professional UI patterns
- **Linear**: Minimalist interface design

---

**Design System v1.0** | Created October 31, 2025

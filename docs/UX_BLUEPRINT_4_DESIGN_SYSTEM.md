# DETOUR UX/UI BLUEPRINT
## Part 4: Visual Design System

---

VISUAL DESIGN SYSTEM OVERVIEW

The Detour design system balances minimalism with emotional expressiveness. The interface is built around a primary map canvas with intentionally sparse chrome. Color, typography, and spacing create hierarchy and guide focus. Every visual element serves a functional purpose or reinforces the app's emotional intent: curiosity, serendipity, and discovery.

---

TYPOGRAPHY

Primary Font Family: Inter (or similar modern, geometric sans-serif)
- Rationale: Readable at small sizes; geometric forms feel contemporary and friendly; excellent web/mobile rendering.
- Fallback (system): -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

Secondary Font Family (Headlines, optional): Poppins or Outfit
- Rationale: Slightly more playful than Inter; works well for large, expressive headlines.
- Used for: Screen titles, vibe names, POI titles.
- Fallback: Inter or system sans-serif.

Monospace Font (for technical details, optional): IBM Plex Mono or Menlo
- Used for: Route codes, technical metadata (API responses, debugging).
- Not typically visible in user-facing UI.

Type Scale & Usage:

  Headline 1 (Large Screens): 52px, 700 (bold), line-height 1.2
    Use: Welcome screen title ("Where to?"), major section headers.
    Letter-spacing: -0.02em (slight tightening for impact)

  Headline 2 (Medium Screens): 40px, 700 (bold), line-height 1.2
    Use: Screen titles (modal headers, "Your Detour"), section headlines.
    Letter-spacing: -0.01em

  Headline 3 (UI Headings): 28–32px, 700 (bold), line-height 1.3
    Use: Vibe names, POI titles, major interactive elements.
    Letter-spacing: 0 (neutral)

  Headline 4 (Card Headings): 20–24px, 600 (semibold), line-height 1.3
    Use: POI card titles, summary section headers.
    Letter-spacing: 0

  Subheading 1 (Large): 18px, 500 (medium), line-height 1.4
    Use: Navigation bar text, prominent labels, subheadings below H1/H2.
    Letter-spacing: 0

  Body Large: 16px, 400 (regular), line-height 1.5
    Use: POI descriptions, primary body text, button labels, form inputs.
    Letter-spacing: 0

  Body Regular: 14px, 400 (regular), line-height 1.5
    Use: Secondary text, captions, helper text, statistics labels.
    Letter-spacing: 0.01em (slight opening for clarity at small size)

  Body Small: 12px, 400 (regular), line-height 1.6
    Use: Tertiary text, timestamps, category tags, copyright/legal.
    Letter-spacing: 0.02em (more opening; critical for legibility at small size)

  Label: 12px, 500 (medium), line-height 1.4
    Use: Form labels, tab names, chip text.
    Letter-spacing: 0.02em

  Button: 16px, 600 (semibold), line-height 1.3
    Use: All button text (primary, secondary, tertiary).
    Letter-spacing: 0.01em (slight tightening for emphasis)

Weight Usage:
  - 400 (Regular): Body text, descriptions, secondary information.
  - 500 (Medium): Labels, secondary headings, emphasized body text.
  - 600 (Semibold): Buttons, card titles, highlights within body.
  - 700 (Bold): Main headlines, critical titles, strong emphasis.

Minimum Text Sizes:
  - Body text: 14px (WCAG AA compliance at normal contrast)
  - Labels: 12px (acceptable for secondary information)
  - Buttons: 16px (easier touch targeting and readability)

Line-Height Ranges:
  - Headlines: 1.1–1.3 (tighter, more impactful)
  - Body: 1.4–1.6 (openness for readability)
  - Small text: 1.5–1.8 (more generous spacing to prevent cramping)

Text Truncation:
  - Headline text: Full text always visible; if needed, text wraps (no truncation).
  - POI names: Single-line truncation with ellipsis; max 2 lines for descriptions.
  - Navigation bar text: Truncate or shorten if space constrained.
  - Labels/buttons: No truncation; text should fit or wrap cleanly.

---

COLOR PALETTE

Primary Color (Brand / CTA):
  Light Mode: #0891B2 (Vibrant Teal)
  Dark Mode: #06B6D4 (Lighter Teal for contrast)
  RGB: 8, 145, 178 (light); 6, 182, 212 (dark)
  Use: Primary buttons, active states, links, brand moments.
  Contrast: 7.2:1 with white (WCAG AAA), 4.8:1 with dark backgrounds.

Secondary Color (Accent / Vibrancy):
  Light Mode: #EC4899 (Vibrant Coral/Magenta)
  Dark Mode: #F472B6 (Lighter Coral for contrast)
  RGB: 236, 72, 153 (light); 244, 114, 182 (dark)
  Use: Secondary CTAs, highlights, success states, emotional moments.
  Contrast: 6.1:1 with white (WCAG AAA), 4.2:1 with dark backgrounds.

Neutral Background (Light Mode):
  Off-White / Canvas: #FAFAFA or #F8F8F8
  Light Gray: #F3F4F6 (for cards, subtle backgrounds)
  Medium Gray: #E5E7EB (dividers, borders, subtle UI elements)
  Dark Gray (text): #374151 (primary text)
  Medium Gray (text): #6B7280 (secondary text)
  Light Gray (text): #9CA3AF (tertiary text, disabled states)

Neutral Background (Dark Mode):
  Dark Canvas: #0F172A or #1E293B
  Slightly Lighter: #1E293B or #334155 (cards, elevated surfaces)
  Borders/Dividers: #475569
  Light Gray (text): #E2E8F0 (primary text)
  Medium Gray (text): #CBD5E1 (secondary text)
  Light Gray (text): #94A3B8 (tertiary text, disabled states)

Semantic Colors:

  Success (Positive):
    Light: #10B981 (Emerald Green)
    Dark: #34D399
    Use: Completed actions, saved items, positive feedback.

  Warning (Caution):
    Light: #F59E0B (Amber/Orange)
    Dark: #FBBF24
    Use: Non-critical alerts, offline state, gentle warnings.

  Error (Critical):
    Light: #EF4444 (Bright Red)
    Dark: #F87171
    Use: Error messages, critical failures, deletions.

  Info (Informational):
    Light: #3B82F6 (Blue)
    Dark: #60A5FA
    Use: Informational messages, tips, additional context.

Vibe Colors (One primary color per vibe; used in route polylines, category badges, POI markers):

  Creative (Purple)
    Light Mode: #A855F7
    Dark Mode: #D8B4FE
    Hex: #A855F7 (amethyst)

  Foodie (Orange)
    Light Mode: #F97316
    Dark Mode: #FDBA74
    Hex: #F97316 (vibrant orange)

  Nature Escape (Green)
    Light Mode: #16A34A
    Dark Mode: #6EE7B7
    Hex: #16A34A (forest green)

  History Buff (Deep Blue)
    Light Mode: #1E40AF
    Dark Mode: #93C5FD
    Hex: #1E40AF (navy blue)

  Nightlife (Electric)
    Light Mode: #D946EF
    Dark Mode: #E879F9
    Hex: #D946EF (neon fuchsia)

  Hidden Gems (Gold)
    Light Mode: #D97706
    Dark Mode: #FCD34D
    Hex: #D97706 (warm gold)

  Local Favorites (Teal—matches primary)
    Light Mode: #0891B2
    Dark Mode: #06B6D4
    Hex: #0891B2 (bright teal)

Accessibility:
  - All text colors meet WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text).
  - For dark mode: Colors are adjusted to maintain readability without appearing washed out.
  - Color is never the sole differentiator; icons, text, patterns, or positioning provide redundancy.
  - Links are underlined or have additional visual indicator (not color alone).

---

COMPONENT LIBRARY & SPECIFICATIONS

BUTTON COMPONENTS

Button: Primary (Large CTAs)
  Dimensions: 48–56px height (touch target >= 44pt); full width minus margins (typically 24px left/right).
  Padding: 18px vertical, 24px horizontal (minimum).
  Background: Primary color (#0891B2 light, #06B6D4 dark).
  Text: 16–18px, 600 weight, white, center-aligned.
  Border Radius: 12px.
  Border: None (solid background).
  Shadow: Subtle drop shadow (0 4px 12px rgba(0, 0, 0, 0.1) light mode; 0 4px 8px rgba(0, 0, 0, 0.3) dark mode).
  Icon (Optional): Left-aligned, 20×20px, white fill.
  State Interactions:
    Enabled: Full opacity, standard shadow.
    Hover/Focus: Slight background lightening (+5% brightness), enhanced shadow.
    Pressed: Background darkens (-10% brightness), shadow reduces.
    Disabled: Opacity 50%, no shadow, cursor default.
  Animation: Scale 0.95x on tap; scale back 1x (100ms, ease-out).

Button: Secondary (Important but not primary)
  Dimensions: 44–48px height; full width minus margins or auto-width.
  Padding: 14px vertical, 20px horizontal.
  Background: Transparent.
  Text: 16px, 600 weight, primary color (#0891B2 light, #06B6D4 dark).
  Border: 2–3px solid primary color.
  Border Radius: 12px.
  Shadow: None (or very subtle on hover).
  State Interactions:
    Enabled: Full opacity.
    Hover/Focus: Background tints to primary color with 10% opacity; shadow appears.
    Pressed: Background tints to primary color with 20% opacity.
    Disabled: Opacity 40%, text color grayed.
  Animation: Scale 0.97x on tap; scale back 1x (100ms, ease-out).

Button: Tertiary (Low-priority actions)
  Dimensions: 40–44px height (or auto-height for inline text).
  Padding: 10px vertical, 16px horizontal (or none for link style).
  Background: Transparent.
  Text: 14–16px, 500 weight, secondary color or primary color, lowercase or sentence case.
  Border: None.
  Underline: Optional (for link-like appearance).
  Shadow: None.
  State Interactions:
    Enabled: Full opacity.
    Hover/Focus: Text color shifts to secondary color; slight background tint (5% opacity primary).
    Pressed: Text color darkens or shifts hue slightly.
    Disabled: Opacity 40%.
  Animation: Minimal; opacity fade on state change.

Icon Button (Compact, circular or square)
  Dimensions: 44×44pt minimum (touch target).
  Background: Transparent or subtle background tint.
  Icon: 24×24px, stroke weight 2px, primary color or context-dependent.
  Border Radius: 8–12px (or full circle if square target).
  State Interactions:
    Enabled: Full opacity.
    Hover/Focus: Background tints (10% opacity primary) or icon color brightens.
    Pressed: Background tints (20% opacity).
    Disabled: Opacity 40%.

---

CARD COMPONENTS

POI Card (Preview or Navigation)
  Dimensions: Full width minus 24px margins; height 100–120px (compact) or 140–160px (expanded).
  Padding: 12px horizontal, 10px vertical (compact).
  Background: White (light mode), #1E293B or #334155 (dark mode).
  Border: 1px solid medium gray (#E5E7EB light, #475569 dark).
  Border Radius: 12px.
  Shadow: 0 2px 8px rgba(0, 0, 0, 0.08) light mode; 0 4px 12px rgba(0, 0, 0, 0.3) dark mode.
  Content Layout:
    Row: Icon (24×24px) | Content (name, description) | Chevron or Image (40×40px).
  Text Hierarchy:
    Title: 16px, 600 weight, primary text color.
    Description: 14px, 400 weight, secondary text color.
    Metadata (distance, category): 12px, 400 weight, tertiary text color.
  Image (Optional): 40×40px, rounded corners (8px), aspect ratio 1:1 (cover).
  Interaction: Tap to expand or navigate; highlight with border or background tint.
  Selection State: Border becomes 3–4px solid primary color; slight scale (1.02x).

Summary Card (Route overview)
  Dimensions: Full width minus 24px margins; height 60–80px.
  Padding: 12px horizontal, 10px vertical.
  Background: Very light gray (#F8F8F8 light, #1E293B dark).
  Border: 1px solid medium gray.
  Border Radius: 12px.
  Layout: Horizontal, icon-text-value groups.
  Content:
    Icon: 24×24px, category or mode-specific.
    Label: 14px, secondary text color.
    Value: 18px, 600 weight, primary text color.
  Example: "23 min walk" or "1.2 km journey".

Skeleton Card (Loading state)
  Dimensions: Same as target card (POI card, summary card, etc.).
  Background: Light gray (#F3F4F6 light, #334155 dark).
  Content: Placeholder lines (4px height) with rounded ends; 8–12px spacing.
  Animation: Shimmer overlay (left-to-right gradient, 1.5s infinite, ease-in-out).

---

MODAL & BOTTOM SHEET

Bottom Sheet (POI details, vibe selection, etc.)
  Dimensions: Typically 80–90% viewport height on mobile; can snap to multiple heights.
  Background: White (light) or dark surface (dark mode).
  Border Radius: 20–24px (top corners only; other corners may be square or clipped).
  Shadow: 0 –8px 24px rgba(0, 0, 0, 0.15) (shadow above, not below).
  Handle: Small bar indicator (40×4px, light gray, rounded), centered at top, 12px margin.
  Content Padding: 16–24px (all directions).
  Scroll: Content within sheet scrolls independently of map/background.
  Interaction: Draggable; snap points at bottom, mid, and top.
  Backdrop: Translucent dark overlay (black 50% opacity), slightly blurs background (iOS style).
  Animation: Slides up from bottom (300–350ms, ease-out-cubic).

Full-Screen Modal (Onboarding, detailed information)
  Dimensions: 100% viewport (minus safe areas).
  Background: White (light) or dark surface (dark mode).
  Close Button: Top-right X button (24×24pt, primary color), or back chevron if navigational.
  Content Padding: 20–24px.
  Animation: Fade + slight scale (0.95x → 1x, 300ms, ease-out-cubic).
  Backdrop: Translucent (same as bottom sheet).

---

CHIPS & BADGES

Category Chip / Badge
  Dimensions: Auto-width; height 28–32px.
  Padding: 6–8px horizontal, 4–6px vertical.
  Background: Vibe color (20% opacity) or secondary color (10% opacity).
  Text: 12px, 500 weight, vibe color or primary color.
  Border: 1px solid vibe color (optional; adds definition).
  Border Radius: 6–8px.
  Icon (Optional): 14×14px, left-aligned, vibe color fill.
  Example: "Creative," "Foodie," "Must-See," "Photo Spot."

Status Chip
  Dimensions: Auto-width; height 24–28px.
  Padding: 6px horizontal, 4px vertical.
  Background: Semantic color (20% opacity): green for success, yellow for warning, red for error.
  Text: 11–12px, 500 weight, semantic color (darker shade).
  Border Radius: 6px.
  Examples: "Saved," "Offline," "In Progress," "Complete."

---

MAP PINS & MARKERS

POI Pin (Default)
  Shape: Rounded square or soft rectangle (varies by category).
  Dimensions: 36–40px; aspect ratio 1:1 or 3:4.
  Background: Vibe color or category-specific color.
  Icon: 16–20px, white fill, centered.
  Border: 2px white or light border (defines edge).
  Shadow: Drop shadow (2px offset, 4–6px blur, black 30% opacity).
  Label: Number (1, 2, 3, etc.) or category initials, white text, 12px, 600 weight, centered below or inside.
  Interaction:
    Default: Opaque, standard shadow.
    Hover/Tap: Slight scale (1.1x), enhanced shadow, glow effect (subtle highlight).
    Selected: Scale 1.15x, brighten background (+10% lightness), enhanced glow.

User Location Pin
  Shape: Circle with directional arrow inside.
  Dimensions: 32×32px.
  Background: Primary color (#0891B2) with 20% opacity ring around it.
  Icon: Arrow or chevron, white fill, rotates to match device compass bearing (or north).
  Animation: Pulse (opacity 0.8–1.0, 2s cycle, ease-in-out); ring expands and fades (2s cycle).
  Shadow: Very subtle (if any).

Destination Pin
  Shape: Teardrop or map-pin icon.
  Dimensions: 40–48px height.
  Background: Destination color (secondary or vibe color).
  Icon: Flag, star, or location icon inside, white fill.
  Label (Optional): Destination name in small text (10–12px) below pin.
  Shadow: Drop shadow (3px offset, 6px blur, black 25% opacity).

Route Polyline
  Stroke Width: 4–6px (depending on zoom level and device).
  Color: Vibe color (matches the selected mood).
  Opacity: Full opacity (1.0) for active route; 0.5 or grayed for completed sections.
  Dash Pattern: Optional; solid line or dashed for different route types (walking vs. driving).
  Cap Style: Rounded (feels friendlier than sharp caps).
  Animation: Animated stroke-dash (draws on route preview screen; 800ms–1.2s duration).

---

SPACING & LAYOUT

Base Unit: 8px grid.
  All spacing uses multiples of 8px or 4px for fine-tuning.
  Margins: 16px, 24px, 32px (multiples of 8).
  Padding: 8px, 12px, 16px, 20px, 24px (8px grid + 4px intermediate values).

Screen Margins:
  Mobile (portrait): 16px left/right (safe area included in calculation).
  Tablet: 24–32px left/right (or percent-based for responsive layouts).
  Safe Areas: Explicitly respected on notched/dynamic island devices (iOS) and rounded-corner devices (Android).

Component Spacing:
  Buttons stacked vertically: 12px between buttons.
  Cards in list: 12px between items (or 16px for visual separation).
  Text within card: 8–12px between elements.
  Section headers and content: 16px gap.
  Modal internal padding: 20–24px all directions (or 16px on smaller screens).

Responsive Breakpoints (if applicable):
  Mobile Small (< 375px): Reduce padding/margins by 1–2px.
  Mobile Standard (375–414px): Base spacing (16px margins, etc.).
  Mobile Large (414–480px): Slightly increase spacing (18–20px margins).
  Tablet (480px+): 24–32px margins; more generous spacing overall.

Z-Index Hierarchy (for layered elements):
  Background Map: z-index 1
  Map Overlays (pins, polylines): z-index 10
  Navigation Bar (top-right POI indicator): z-index 20
  Bottom Sheet: z-index 30
  Backdrop (dim overlay): z-index 25 (behind sheet)
  Modals (full-screen): z-index 40
  Toasts/Notifications: z-index 50
  Floating Action Button: z-index 35
  Contextual Prompts (center overlays): z-index 45

---

ICONOGRAPHY

Icon Style: Outline or filled icons, stroke-weight 2px (outline) or solid fill (filled).
  Rationale: Outline icons feel lighter and more refined; filled icons create bolder visual statements.
  System: Use consistent icon system across app (e.g., SF Symbols on iOS, Material Design Icons on Android, or custom SVG set).

Common Icon Set:

  Navigation / Wayfinding:
    Chevron right, Chevron left, Chevron up, Chevron down
    Map, Compass, Navigation arrow, Location pin
    Walk, Bicycle, Car icons (for transport mode)

  Actions:
    Search, Filter, Settings, Edit, Share, Download, Bookmark, Heart (favorite)
    Camera, Photo, Image, Video
    Save, Delete, Close (X), Back (arrow)
    Menu (hamburger), More options (three dots)

  Information:
    Info, Help, Question mark, Lightbulb (idea)
    Warning, Alert, Error (exclamation)
    Check (success), Check circle
    Clock, Calendar, Time

  Categories / Content:
    Palette (Creative), Fork & Knife (Foodie), Leaf (Nature), Building (History)
    Moon / Star (Nightlife), Compass (Hidden Gems), Heart (Local Favorites)
    Gallery, Restaurant, Park, Museum, Bar, etc. (specific POI types)

Icon Sizing:
  Small (16×16px): Inline with text, metadata, badge content.
  Medium (20–24px): Button icons, category labels, section headers.
  Large (32–40px): POI pin icons, primary call-to-action, major categories.
  XL (48–64px): Contextual prompts, onboarding illustrations, full-screen modals.

Icon Colors:
  Primary: Primary brand color (#0891B2 light, #06B6D4 dark).
  Vibe-Specific: Use vibe color for category icons (Creative = purple, Foodie = orange, etc.).
  Neutral: Medium gray (#6B7280 light, #CBD5E1 dark) for secondary or disabled states.
  Semantic: Green for success, yellow for warning, red for error.

Icon Styling:
  Stroke Width: 2px for outline icons; 2.5px for larger icons (better rendering).
  Corner Radius: Slight rounding (4–6px) on icon corners for softness.
  Padding: Icons optionally have subtle background circles (24–32px) on larger implementations.
  Animation: Icons can rotate (compass), pulse, or fade into view; avoid excessive animation.

---

ACCESSIBILITY IN VISUAL DESIGN

Contrast Ratios:
  Normal text (< 18px): 4.5:1 or higher (WCAG AA).
  Large text (18px+ or 14px 700 weight): 3:1 or higher (WCAG AA).
  AAA compliance (recommended): 7:1 normal text, 4.5:1 large text.
  Test tools: WebAIM Contrast Checker, Stark (Figma plugin).

Color Usage:
  Color is never the sole differentiator; always pair with text, icons, or patterns.
  Links: Underlined or have border; not color alone.
  Buttons: Use text labels, icons, and borders in addition to color.
  Error states: Use icon + text + color (red icon, red text, red border).

Typography for Accessibility:
  Font sizes: 14px minimum for body text; 16px minimum for buttons.
  Line height: 1.4 or higher for body text; 1.6 or higher for small text.
  Letter spacing: Generous for small text (0.02em or higher); avoid tight spacing.
  Font weight: Avoid very thin weights (< 400) for body text.
  Avoid ALL CAPS: Use sentence case or title case; all caps reduces readability.

Interactive Elements:
  Touch targets: All buttons, links, and interactive elements are at least 44×44pt.
  Focus indicators: Clear, visible focus state (border, background tint, or glow) for keyboard navigation.
  Spacing: Interactive elements have sufficient spacing (minimum 8–12px) to prevent accidental taps.

Dark Mode:
  Ensure sufficient contrast in dark mode; lightened colors may lose contrast.
  Use high-contrast colors in dark mode (e.g., brighter teals, corals).
  Text colors: Light text (#E2E8F0 or #F5F5F5) on dark backgrounds for optimal contrast.
  Avoid pure black text on pure white (use slightly desaturated grays for comfort).

Reduced Motion:
  Respect prefers-reduced-motion media query; disable animations, parallax, and motion-heavy interactions.
  Provide static alternatives (fade instead of slide, scale instead of complex animations).


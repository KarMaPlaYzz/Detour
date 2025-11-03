# DETOUR UX/UI BLUEPRINT
## Part 2: Screen-by-Screen Design Specifications

---

SCREEN 1: ENTRY / WELCOME

Screen Name: Home / Entry Point

User Goal: Understand app purpose and choose between starting a new detour or reviewing past ones.

Layout Description (Top to Bottom):

  Status Bar (System UI)
  - Time, signal, battery visible (standard OS treatment).
  - Background: Matches app theme (light or dark mode).

  Header Section (20% of viewport)
  - Top padding: 16–20px.
  - Headline: "Where to?" in large, bold typography (48–52px).
  - Subheading (Optional, fades in with entrance animation): "Choose a vibe. Find the magic." in lighter weight.
  - Horizontal rule or subtle gradient below text.

  Map Section (40% of viewport)
  - Live map showing user's current location (centered).
  - Map has subtle blue tint or overlay to indicate interactivity.
  - User's location marker is a glowing blue dot with subtle pulse animation (100ms cycle).
  - Map is fully zoomable; pinch gestures enabled.
  - No POI pins visible on entry screen—map is clean.

  Primary Action Container (40% of viewport)
  - Vertically stacked buttons with generous padding (bottom-safe area-aware).

  Button 1: "Start a Detour"
  - Background: Primary brand color (vibrant teal or coral accent).
  - Text: "Start a Detour" (18–20px, bold, white).
  - Corner radius: 12–16px.
  - Padding: 18px vertical, full width minus 24px margins.
  - Shadow: Subtle depth shadow (iOS-style).
  - Haptic on tap: Light impact feedback.

  Button 2: "Browse My Detours"
  - Background: Transparent with 2–3px border in secondary color.
  - Text: "Browse My Detours" (16–18px, medium weight, primary color).
  - Padding: 16px vertical.
  - Haptic on tap: Light impact feedback.

  Bottom Region:
  - "First time here?" link text (14px, subdued color) with optional info icon.
  - Tap opens mini tutorial overlay or help modal.
  - Safe area padding: 12–16px from bottom edge.

Key Interactions:

  - Tap "Start a Detour": Transition to transport mode selector (slide up from bottom, 300ms, ease-out).
  - Tap "Browse My Detours": Navigate to saved detours list.
  - Tap "First time here?": Open lightweight onboarding modal.
  - Pinch/zoom on map: Standard map zoom behavior; map remains in background.
  - Long-press on map: Option to set custom destination (optional UX enhancement).

Accessibility Notes:

  - Headline text: 48px minimum, strong contrast ratio (7:1 or higher).
  - Button text: 18px minimum; touch targets at least 44×44pt.
  - Map is announced as "Interactive map of current location" to screen readers.
  - VoiceOver focus order: Headline → Subheading → Map (announced as region) → Start Detour button → Browse Detours button → Help link.
  - Reduce Motion toggle: Pulse animation removed; only static indicator on location dot.
  - Color not sole differentiator: Buttons use text labels and borders in addition to color.

Emotional Intention:

  This screen should feel open and inviting—not cluttered or utilitarian. The map is present but not overwhelming. The headline and call-to-action create a sense of possibility and agency. The user should feel like an adventure is one tap away. Warmth, curiosity, and a hint of playfulness.

---

SCREEN 2: VIBE SELECTION

Screen Name: Mood / Vibe Picker

User Goal: Communicate their emotional state or interest so the system can generate a matching detour.

Layout Description (Top to Bottom):

  Header / Dismiss Region
  - Status bar + safe area (12px horizontal margin).
  - Title: "What's your vibe?" (28–32px, bold).
  - Subtitle: "Help us tune your detour." (16px, secondary text color, light weight).
  - Right-aligned X or "Close" button (if modal; standard iconography).
  - Hairline separator below header (light gray, 1px).

  Vibe Card Grid (80% of viewport)
  - Scrollable vertical list (or grid of 2 columns on larger screens; single column on mobile for clarity).
  - Each vibe occupies full width minus 24px margins.
  - Spacing between cards: 12–16px.

  Vibe Card Anatomy:
  - Card height: 100–120px.
  - Background: Subtle gradient or solid color distinct to each vibe.
  - Left section (25%): Large icon (48×48px) on colored background circle.
  - Middle section (50%): Vibe name (20px, bold) + brief description (14px, two lines max).
  - Right section (25%): Chevron icon or subtle indication of selection.
  - Corner radius: 12–16px; subtle shadow or border.
  - Border on selection: 3–4px solid accent color.

  Vibe Options (with color associations):
  1. Creative (Purple gradient, lightbulb icon): "Galleries, studios, and unexpected design."
  2. Foodie (Warm orange, fork icon): "Markets, cafés, and hidden eats."
  3. Nature Escape (Green, leaf icon): "Parks, trails, and green corners."
  4. History Buff (Deep blue, landmark icon): "Museums, monuments, and stories."
  5. Nightlife (Neon accent, moon icon): "Bars, venues, and evening energy."
  6. Hidden Gems (Gold/silver, compass icon): "Secret spots locals love."
  7. Local Favorites (Teal, heart icon): "Community favorites and gathering spots."

  Footer Section (10% of viewport)
  - "Skip" button (tertiary style): 14px, secondary color.
  - Text: "Or let us pick for you." (14px, light gray).
  - Safe area padding: 16px bottom.

Key Interactions:

  - Tap a vibe card: Border highlights; card scales slightly (1.02x) with spring animation (300ms, ease-out).
  - Confirm selection: "Next" button appears or slides up from bottom; tapping it advances to route preview.
  - Swipe down: Dismiss modal and return to entry screen (if needed).
  - Tap "Skip": System defaults to "Local Favorites" and proceeds.
  - Long-press on vibe: Optional—shows expanded description or example POIs for that vibe.

Accessibility Notes:

  - Card headings: 20px minimum; strong contrast against card background.
  - Description text: 14px minimum; readable line-height (1.5 or higher).
  - Touch targets: Full card is tappable; minimum 60×100px effective area.
  - VoiceOver: Each card announces as "Vibe option: [Name], [Description]. Double-tap to select."
  - Keyboard navigation: Tab through cards; Enter or Space to select; Escape to dismiss.
  - Color + icon redundancy: Each vibe uses distinct icon and name; color is reinforcing, not primary identifier.
  - Reduce Motion: Spring animations replaced with simple fade-in selection state; card scale removed.

Emotional Intention:

  This screen is playful and reflective. Users should feel like they're being understood, not categorized. Each vibe card should have visual personality—not corporate or generic. The act of selecting a vibe should feel like expressing themselves, which builds investment in the resulting detour. Tone: "We get you."

---

SCREEN 3: ROUTE PREVIEW

Screen Name: Detour Overview / Preview

User Goal: Visualize the generated route, review POIs, and commit to or reject the experience before navigation begins.

Layout Description (Top to Bottom):

  Header / Navigation Bar
  - Status bar + safe area (horizontal margin 16px).
  - Left-aligned back button (chevron or X, 24×24px).
  - Centered title: "Your Detour" (24px, bold).
  - Right-aligned close or "Adjust" button (optional; 24×24px).

  Map Section (45% of viewport)
  - Live, interactive map showing:
    • User's current location (blue dot with pulse).
    • Final destination marker (destination pin; color matches vibe).
    • Generated route polyline (color matches vibe; 4–6px stroke width).
    • Top 5–7 POIs along route, marked with numbered pins (1, 2, 3, etc.) or distinct icons.
  - Map is fully zoomable and pannable.
  - Tap on any POI pin: Inline preview sheet slides up (see below).

  Route Summary Card (Sticky, below map)
  - Horizontal layout:
    • Start location name (14px, light weight) | "to" | Destination name (14px).
    • Transport mode icon (16px, grayed or colored based on mode).
    • Estimated time (18px, bold; e.g., "23 min walk").
    • Estimated distance (14px, secondary color; e.g., "1.2 km").
  - Subtle divider line below.

  POI List Section (45% of viewport, scrollable)
  - Header: "Points of Interest" (18px, bold).
  - List of POI cards, each containing:
    • POI icon or category tag (Creative, Food, Nature, etc.).
    • POI name (16px, bold).
    • Brief storytelling snippet (14px, 1–2 lines; e.g., "Hidden rooftop gallery with indie installations").
    • Distance from route or time to reach (12px, secondary color).
    • Optional thumbnail image (40×40px, rounded corners).
  - Card padding: 12px horizontal, 10px vertical.
  - Spacing between cards: 8px.
  - Scrolling within list does not affect map visibility.

  Action Button Row (Bottom, safe area-aware)
  - Primary Button: "Begin Detour" (18px, bold, white text, full width minus margins).
    • Background: Primary brand color (matches vibe).
    • Padding: 18px vertical.
    • Corner radius: 12px.
    • Haptic: Light impact on tap.
  - Secondary Button Row (below, if space allows):
    • "Adjust Route" (tertiary style, 16px, border).
    • "Save for Later" (tertiary style, 16px, border).
  - Spacing: 12px between buttons.
  - Bottom safe area padding: 16–20px.

Key Interactions:

  - Tap POI card: Expands to show full details—description, photo, category, "Learn More" link.
  - Tap "Begin Detour": Transition to full-screen navigation mode (slide animation, 400ms, ease-out).
  - Tap "Adjust Route": Modal appears with options to regenerate (new vibe, transport mode, etc.).
  - Tap "Save for Later": Toast confirmation appears; detour is stored locally.
  - Swipe down on POI list: List scrolls; map remains sticky in background.
  - Pinch on map: Zoom in/out; list moves out of view (parallax effect).
  - Tap route polyline: Inline hint appears: "This is your route."
  - Shake device (optional): Triggers regeneration with same vibe.

Accessibility Notes:

  - Map is announced as "Interactive map showing your detour route and points of interest. Zoom in or out to explore."
  - POI list items: 16px minimum heading; 14px minimum description.
  - Touch targets: POI cards at least 44×44pt; buttons 60×44pt.
  - VoiceOver focus order: Back button → Title → Map region → POI list → Begin button → Secondary buttons.
  - Keyboard: Tab through POIs; Arrow keys for list navigation; Enter to expand/select.
  - Color + text redundancy: POI categories use icons and text; route polyline uses width and animation, not color alone.
  - Reduce Motion: Parallax removed; map and list both visible at standard scroll position; entrance animations use fade rather than slide.

Emotional Intention:

  This is the moment of commitment. The screen balances information density with clarity—users want to know what they're getting into, but not feel overwhelmed. The map + storytelling snippets create anticipation. The tone is confident ("Your detour is ready") while inviting further exploration. Small visual flourishes (vibe-colored accents, smooth animations) reinforce the curated nature of the experience.

---

SCREEN 4: ON-THE-WAY MODE / NAVIGATION

Screen Name: Active Navigation

User Goal: Follow the route while receiving timely, contextual storytelling and POI engagement opportunities.

Layout Description (Top to Bottom):

  Full-Screen Map (70% of viewport)
  - Map occupies entire screen below status bar.
  - User's current location: Blue dot with directional arrow (updates in real-time).
  - Route polyline: Rendered with 5–6px stroke; color matches vibe.
  - Completed route section: Lighter opacity or grayed out.
  - Next POI ahead: Pin with large icon or number; subtle pulsing animation.
  - Other upcoming POIs: Numbered pins, neutral color.
  - User location auto-centers on map; map rotates with compass bearing (optional; toggle in settings).

  Navigation Bar (Sticky, top-right corner, 10% of viewport)
  - Compact card showing:
    • Next POI name (14px, bold).
    • Distance to next POI (18px, bold, primary color).
    • Time estimate (14px, secondary color).
    • Chevron icon indicating distance.
  - Background: Transparent with 80% opacity white/dark blur (glassmorphism).
  - Corner radius: 12px; padding: 10px horizontal, 8px vertical.
  - Tap to expand: Shows full POI details in modal overlay.
  - Position: Right-aligned, 12px margin from edges.

  Bottom Sheet / POI Details Panel (20% of viewport, swipeable)
  - Header (Drag handle):
    • Horizontal bar indicator (visible drag handle, 4px height, 40px width).
  - POI Card Header:
    • POI category icon (24×24px, tinted with vibe color).
    • POI name (18px, bold).
    • Distance from route or ETA (16px, secondary color).
    • Right-aligned: "More Info" or expand chevron (24×24px).
  - POI Content:
    • Brief description or storytelling prompt (16px, 2–3 lines).
    • Category tag or badges (e.g., "Must-See," "Photo Spot," "Hidden Gem").
    • Optional thumbnail image (if available; 280px width, 160px height, rounded corners).
  - Action Buttons (Horizontal row):
    • "Learn More" (secondary button, 14px): Opens external link or detailed modal.
    • "Skip to Next" (tertiary, 14px): Advances to next POI without engagement.
  - Bottom padding: Safe area + 12px.

  Contextual Prompt Overlay (Conditional, appears as user approaches POI)
  - Semi-transparent modal center-screen.
  - Large icon (64×64px) related to POI or category.
  - Headline (20px, bold): "Look for the..." or "You've arrived at..."
  - Descriptive text (16px, 1–2 lines): Contextual storytelling or interesting fact.
  - Optional animation: Icon grows/animates on appearance (300ms entrance).
  - Auto-dismiss after 5–7 seconds, or dismiss button (X, 24×24px, top-right).

  Floating Action Button (Conditional)
  - If POI is camera-enabled (photo spot):
    • Camera icon button (48×48pt, positioned bottom-right at 12px margin).
    • Tap: Opens camera in AR mode or standard photo capture.
    • Long-press: Options to save, share, or tag location.

Key Interactions:

  - Drag POI sheet up: Expands to full details; map minimizes.
  - Drag POI sheet down: Collapses back to compact card; map returns to full screen.
  - Swipe horizontally on POI card: Moves to next/previous POI; sheet updates content (200ms animation).
  - Tap "Learn More": Opens modal with extended POI details, Wikipedia links, social media, or booking links (context-dependent).
  - Tap "Skip to Next": Dismisses current POI; bottom sheet animates to show next POI (200ms).
  - Tap "More Info" chevron: Bottom sheet expands to full-screen detail view.
  - Tap on any POI pin on map: Bottom sheet updates to that POI's details.
  - Tap camera button: Camera app (or in-app camera) opens; photo is auto-tagged with location/POI name.
  - Tap navigation bar: Expands to show full next-POI details.
  - Pinch on map: Zoom in/out; bottom sheet remains pinned and scales proportionally.

  Haptic Feedback:
  - Light tap when approaching POI (within 50m).
  - Medium impact when arriving at POI destination.
  - Light tap on POI sheet interactions (expand/collapse).
  - Medium tap on "Skip" or major state changes.

Accessibility Notes:

  - Map is announced as "Interactive navigation map showing your current location and route."
  - Navigation bar: 18px minimum for distance text; high contrast.
  - POI sheet: Card headers 18px minimum; descriptions 16px minimum; line-height 1.5 or higher.
  - Touch targets: POI action buttons at least 44×44pt; floating action button 48pt.
  - VoiceOver focus order: Current location → Next POI name and distance → POI details → Action buttons.
  - Keyboard: Tab through buttons; Arrow keys (if applicable) move through POI list; Enter to confirm actions.
  - Gesture alternatives: All gestures have keyboard or button equivalents (e.g., chevron button instead of swipe).
  - Reduce Motion: Contextual prompts fade in instead of growing; parallax animations removed; entrance animations simplified.
  - Heading hierarchy: Main headings (POI names) 18px+; secondary (descriptions) 16px; tertiary (categories) 14px or smaller.

Emotional Intention:

  This screen prioritizes presence and discovery over optimization. The map is always in focus, allowing spatial awareness. The bottom sheet acts as a lightweight guide—present but not intrusive. Contextual prompts arrive at exactly the right moment (when user nears a POI), creating a sense of delight and serendipity. The tone is narrative and inviting: "You've found something special." Interactions should feel fluid and responsive, reinforcing the sense of active exploration.

---

SCREEN 5: ARRIVAL & REFLECTION

Screen Name: Detour Completion / Journey Summary

User Goal: Reflect on the experience, capture memories, and optionally share or save the detour.

Layout Description (Top to Bottom):

  Header Section (15% of viewport)
  - Status bar + safe area.
  - Centered title: "You've arrived!" (28–32px, bold).
  - Subheading: "How was your detour?" (16px, light weight, secondary color).

  Summary Map (20% of viewport)
  - Small, non-interactive map showing full route taken.
  - Route polyline visible; start and end points marked.
  - User's actual path overlaid lightly (if tracking data available).
  - Caption: "You traveled X km" or "23 min journey" (14px, center-aligned).

  Journey Stats Card (15% of viewport)
  - Horizontal grid (3 columns) showing:
    Column 1: POI Icon | "7 POIs" (12px label, 16px value, centered).
    Column 2: Photo Icon | "3 Photos" (12px label, 16px value, centered).
    Column 3: Clock Icon | "23 min" (12px label, 16px value, centered).
  - Light gray background; rounded corners; padding 12px.

  Emotional Reflection Section (20% of viewport)
  - Headline: "How did this detour make you feel?" (18px, bold).
  - Subheading: "Help us learn what resonates." (14px, secondary color).
  - Emoji reaction row (5 options, horizontally aligned, center):
    • 😊 Happy
    • 😍 Amazed
    • 🤔 Thoughtful
    • 😌 Peaceful
    • 🎉 Energized
  - Each emoji is tappable (48×48pt); selected emoji highlights with scale animation (1.2x) and background circle.
  - Optional text field below (if user taps "Other"): "Tell us more..." placeholder, max 140 characters.

  Detour Highlights Section (15% of viewport, scrollable horizontal)
  - Headline: "Your highlights" (18px, bold).
  - Scrollable gallery of top 3–5 POIs visited or photos captured.
  - Each item: 80×100px card with image thumbnail, POI name overlay (12px, white text, text shadow).
  - Tap to expand and view full image or POI details.
  - Spacing: 8px between items; 16px margins.

  Action Buttons Section (15% of viewport)
  - Full-width primary button: "Share This Detour"
    • Background: Primary brand color.
    • Text: "Share This Detour" (16px, bold, white).
    • Icon: Share icon (20×20px) left-aligned within button.
    • Padding: 16px vertical; corner radius 12px.
  - Secondary button: "Save for Later"
    • Border style; text color primary; 16px.
    • Icon: Bookmark icon.
  - Tertiary button row (below, if space):
    • "Start Another Detour" (14px, link style, teal/primary color).
    • " | " (divider).
    • "View Route Details" (14px, link style).
  - Safe area padding: 16–20px bottom.

Key Interactions:

  - Tap emoji: Selection animates (scale + highlight); optional text field becomes visible or text is attached to response.
  - Tap "Share This Detour": Native share sheet appears (iOS/Android); options include Messages, Email, Social (Twitter, Instagram), or Copy Link.
    • Shared item includes: Route map image, POI list, vibe used, time taken, optional user message.
  - Tap "Save for Later": Toast confirmation appears; detour is added to "My Detours" collection locally.
  - Tap POI in highlights: Full-screen modal opens showing photo(s), POI name, category, address, external links.
  - Tap "View Route Details": Opens detailed breakdown (all POIs, distances, notes).
  - Tap "Start Another Detour": Navigate back to home screen or vibe selector (depending on UX flow preference).
  - Swipe horizontally on highlights: Carousel scrolls to next POI/photo.
  - Long-press on highlight: Option to edit caption, delete, or share individual photo.

Accessibility Notes:

  - Title: 28px minimum; strong contrast.
  - Stats values: 16px minimum; icons 24×24pt.
  - Emoji buttons: 48×48pt touch targets; announced as "[Emoji name] feeling option. Double-tap to select."
  - Text field: 14px minimum; clear focus indicator (border or outline).
  - Button text: 16px minimum; high contrast.
  - VoiceOver focus order: Title → Stats → Reflection section → Emoji buttons → Highlights carousel → Action buttons.
  - Keyboard: Tab through buttons and emojis; Arrow keys navigate carousel; Enter to select/confirm.
  - Emoji not sole indicator: Each emoji is labeled; selected state uses border and scale, not color alone.
  - Reduce Motion: Emoji scale animations removed; selection uses simple border or background change; carousel uses fade rather than slide.

Emotional Intention:

  This screen is reflective and celebratory. The user should feel proud of their journey and encouraged to share or revisit. The reflection prompt is warm and curious, not clinical. Highlighting their top moments (POIs, photos) creates a sense of personal achievement. The tone is "You did something cool today." Small details—emoji animations, smooth transitions, celebratory language—reinforce joy and satisfaction. The call-to-action is open: share, save, or start again, all without pressure.


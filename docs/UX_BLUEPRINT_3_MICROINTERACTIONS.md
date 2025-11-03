# DETOUR UX/UI BLUEPRINT
## Part 3: Microinteractions & Motion Design

---

MICROINTERACTIONS & MOTION DESIGN PRINCIPLES

Detour's motion language is intentional, subtle, and purposeful. Animations serve two primary functions: they provide feedback (confirming user actions) and they guide attention (directing the eye to relevant information). All motion adheres to the principle of "invisible motion"—the user should feel the effect, not consciously watch the animation. Timing is the critical variable: quick interactions (< 200ms) feel snappy; longer, complex transitions (300–500ms) guide the eye and provide narrative flow.

---

CORE TIMING & EASING

Base Unit: All timing is built on a 100ms grid.
- Micro-interactions (feedback): 100–200ms
- Element transitions (screen changes, sheet reveals): 300–400ms
- Delayed actions (contextual prompts, storytelling): 500–800ms
- Long-form transitions (full-screen navigation): 800ms–1s

Easing Curves:
- Entrance animations: ease-out-quad or ease-out-cubic (starts fast, slows to completion; feels natural and light).
- Confirmation feedback: spring or ease-out (snappy, satisfying).
- Exit animations: ease-in-quad (feels like momentum leaving the screen).
- Delayed reveals: ease-in-out-cubic (smooth and deliberate).
- Camera/map pans: ease-out-cubic (feels purposeful, not robotic).

Haptic Patterns:
- Light impact (13ms duration): Selection, tap feedback, sheet collapse.
- Medium impact (20ms duration): Confirmation, POI arrival, bottom sheet expand.
- Heavy impact (25ms duration): Error, major state change, navigation start.
- Selection pattern (light + light, 50ms delay): Toggling options, selecting vibe.

---

TRANSITION FLOWS BY SCREEN

ENTRY SCREEN → TRANSPORT SELECTOR

Action: User taps "Start a Detour."
Animation:
  - "Start a Detour" button: Scale 0.95x on tap (30ms); scale back to 1x (100ms, ease-out).
  - Haptic: Light impact.
  - Fade-out entry screen content (map, headline, buttons): 150ms, linear (or keep visible as blur backdrop).
  - Transport selector modal slides up from bottom: 350ms, ease-out-cubic.
    • From position: Y = 100% (below viewport).
    • To position: Y = 0 (snapped to safe area top).
    • Initial scale: 0.98x (subtle depth effect); scales to 1x during animation.
  - Backdrop (entry screen or blur): Darkens to 50% opacity (300ms, ease-out).
Result: User sees transport modal slide up smoothly while previous screen dims. Light haptic provides confirmation that tap registered.

---

TRANSPORT SELECTOR → VIBE SELECTION

Action: User selects transport mode (e.g., Walking).
Animation:
  - Selected transport option: Highlight with 3–4px accent border; subtle scale 1.02x (150ms, spring-ease).
  - Haptic: Light impact (confirms selection).
  - "Next" button appears (or becomes enabled) from bottom, slides up 100px over 250ms, ease-out.
  - Deselected options: Slightly fade (opacity 0.7) when one option is selected (optional; creates visual hierarchy).
  - After user taps "Next": Transport selector fades out (200ms, ease-in); vibe selector slides up from bottom (350ms, ease-out-cubic), same pattern as above.
  - Backdrop remains semi-opaque throughout.
Result: Selection feels responsive and immediate. Modal transitions feel seamless, like moving deeper into the experience.

---

VIBE SELECTION → ROUTE GENERATION (LOADING STATE)

Action: User selects vibe and system begins route generation.
Animation:
  - Vibe card selection: Border highlights (3–4px, accent color); card scales 1.02x (150ms, spring).
  - Haptic: Selection pattern (light + light, 50ms delay).
  - "Next" or "Confirm" button appears, animates in from bottom (100ms, ease-out).
  - User taps "Confirm": Modal fades out (200ms, ease-in); navigation screen fades in with full-screen map.
  - Loading state appears on map: Subtle pulsing animated dots at 3–5 random locations along route corridor (opacity pulse 0.5–1.0, 1.5s cycle, ease-in-out).
  - Loading headline: "Discovering your route..." (or variant).
    • Animates in with fade + subtle scale (0.95x → 1x, 300ms, ease-out-cubic).
    • Optional: Animated ellipsis ("Discovering...") where dots animate in sequence over 600ms, repeat.
  - Skeleton loading cards (if POI list visible): Subtle gray shimmer animation across cards (1s cycle, infinite, ease-in-out). Alternative: Placeholder cards fade in one by one (100ms stagger between each).
Result: User understands the app is working. Motion communicates progress and prevents perceived lag. Tone is calm and intentional, not frantic.

---

ROUTE PREVIEW ANIMATIONS

Action: Route preview appears after generation.
Animation:
  - Map container: Fades in with scale 0.98x → 1x (350ms, ease-out-cubic).
  - Route polyline: Draws from start to end point with animated stroke dash animation.
    • Animation duration: 800ms–1.2s (feel of drawing the path).
    • Path length is calculated; stroke-dasharray and stroke-dashoffset animate.
    • Color matches vibe.
  - POI pins: Appear sequentially as polyline draws; each pin scales 0 → 1x with fade (150ms, spring-ease), staggered by 100ms.
    • Numbered pins (1, 2, 3, etc.) pop in at calculated positions.
  - Summary card (below map): Slides up from bottom 100px over 300ms, ease-out-cubic (after polyline completes).
  - POI list cards: Fade in and slide up 50px from bottom, staggered by 80ms per card. Total animation time: 300–400ms per card.
  - Action buttons: Scale from 0 → 1x with fade, ease-out (300ms), triggered after POI list completes.
Result: Choreographed sequence creates a sense of anticipation. User watches the route "reveal" itself, building excitement for the journey ahead.

---

POI CARD INTERACTIONS

Action: User taps a POI card in preview or navigation screen.
Animation:
  - Card shadow increases (depth effect); slight scale 1.02x (100ms, ease-out).
  - Haptic: Light impact.
  - Card border or background highlights (color shift or border addition, 150ms).
  - If modal expands: Card remains in view, overlay modal slides up from bottom (350ms, ease-out-cubic); backdrop dims (250ms, ease-out).
  - POI details fade in as modal appears (200ms, ease-out, offset by 100ms from modal start).
  - Image (if present) loads and fades in with subtle scale 1.05x → 1x (300ms, ease-out-cubic).

Action: User dismisses POI details.
Animation:
  - Modal slides down and fades out (300ms, ease-in-cubic).
  - Backdrop lightens back to original (200ms).
  - POI card returns to neutral state (scale 1x, no highlight).
Result: Feels like peeking into details, then returning to the main view. Interaction feels reversible and safe.

---

NAVIGATION SHEET INTERACTIONS

Action: User drags bottom sheet upward to expand.
Animation:
  - Sheet follows finger position (interactive drag, not animated until released).
  - Backdrop map slightly scales or blurs in parallel (subtle parallax, 0.98x at 50% sheet height).
  - When released above 50% of viewport height: Sheet animates to top position (300ms, ease-out-cubic).
  - When released below 50%: Sheet animates back down to compact position (250ms, ease-out-cubic).
  - Haptic: Light tap when snap-point is crossed (directional).

Action: User drags sheet downward to collapse.
Animation:
  - Mirror of expand behavior; reverse direction and timing.
  - If dragged past bottom: Sheet snaps back with slight overshoot (spring physics), 200ms, ease-out.

Action: User swipes horizontally on POI card to move to next POI.
Animation:
  - Current POI card slides left and fades out (200ms, ease-in-quad).
  - Next POI card slides in from right and fades in (200ms, ease-out-quad), with slight stagger (50ms delay before start).
  - Map updates to show next POI as "next" (smooth pan, if camera center changes; 400ms, ease-out-cubic).
  - Haptic: Light tap at end of swipe.
Result: Fluid, gallery-like navigation through POIs. Swipe direction intuitively matches motion direction.

---

CONTEXTUAL PROMPT ANIMATIONS

Action: User approaches a POI (within 50m).
Animation:
  - Light haptic: Light impact (signals proximity).
  - Contextual prompt modal (if enabled):
    • Appears center-screen with fade + scale (0.9x → 1x, 300ms, ease-out-cubic).
    • Icon animates in with slight scale (0.8x → 1.1x, then 1x; springy feel, 400ms, spring-ease).
    • Text fades in after icon (200ms offset, 300ms duration).
    • Auto-dismiss after 5–7 seconds: Opacity fades out (300ms, ease-in), scale contracts (1x → 0.95x, 300ms).
  - Backdrop (map): Slightly darkens or blurs (250ms, ease-out).
  - POI pin on map: Subtle pulsing animation intensifies (pulse cycle 500ms, 1.0–0.6 opacity range).
Result: User is gently alerted without interrupting navigation. Motion feels like a friendly nudge, not a pop-up interruption.

---

MAP PANNING & CAMERA ANIMATIONS

Action: System auto-centers map on user location or next POI.
Animation:
  - Map camera pans smoothly (ease-out-cubic, 400–600ms) to new center.
  - Zoom level transitions smoothly if changing (300ms, ease-out).
  - Route remains visible (if zoom fits entire route; otherwise, new zoom highlights current segment and next POI).
  - No jarring jumps; continuous smooth motion.

Action: User pinches to zoom map.
Animation:
  - Pinch gesture directly controls zoom level (interactive; no delay).
  - When gesture ends, slight momentum-based overshoot (spring physics); snap to nearest discrete zoom level if desired (200ms, spring).
  - Haptic: Light tick feedback at zoom boundaries (minimum/maximum zoom reached).
Result: Feels responsive and natural. Map zoom behavior is familiar from Apple Maps / Google Maps.

---

BUTTON & TOUCH FEEDBACK

Generic Button Tap:
  - On down: Scale 0.95x (instant).
  - On up (if held < 200ms): Scale back to 1x, ease-out (100ms); haptic light impact.
  - If drag outside bounds: Scale stays 0.95x; haptic canceled if released outside.
  - If held > 500ms and "long-press" action available: Haptic medium impact; action hint appears (optional).

Large Action Button (Primary CTAs like "Begin Detour"):
  - Background color subtly brightens on tap (shadow deepens; +10% lightness).
  - Text remains white with slight glow or shadow for depth.
  - On release: Color fades back to normal (150ms, ease-out).
  - Haptic: Medium impact (more satisfying than secondary buttons).

Toggle / Option Selection:
  - On tap: Selected state animates in (100–150ms, spring).
  - Border or background color transitions (150ms, ease-out).
  - Haptic: Selection pattern (light + light, 50ms delay).
  - Deselected neighbors (if radio group): Opacity fades to 0.6 (optional, 150ms).

---

EMOJI REACTION BUTTONS

Action: User taps emoji to select mood.
Animation:
  - Scale: 1x → 1.3x (spring overshoot; lands at 1.15x then settles to 1x), 400ms, spring-ease.
  - Rotation: +10deg → -10deg → 0deg (subtle wiggle, 300ms, spring).
  - Background circle appears behind emoji (if not present) with fade-in (150ms, ease-out).
  - Haptic: Medium impact (celebration-like).
  - Glow effect (optional): Faint radial gradient expands outward, fades away (400ms, ease-out).
  - Deselected emojis (if selection is radio): Opacity fades to 0.5 (150ms, ease-out); scale slightly reduces (0.9x, 150ms).
Result: Feels playful and celebratory. The springy animation encourages interaction and feels rewarding.

---

LOADING & SKELETON STATES

Skeleton Card Shimmer:
  - Placeholder cards rendered in light gray (or dark gray in dark mode).
  - Shimmer animation (left-to-right gradient overlay):
    • Gradient: Translucent white at center, transparent at edges.
    • Animation: Moves from left edge (X: -100%) to right edge (X: 100%), 1.5s duration, ease-in-out.
    • Infinite repeat; slight delay between cards (100ms stagger) for visual wave effect.
  - Opacity of skeleton cards: 0.6 (subtle presence, not jarring).

Pulsing Dots (Route Generation Loading):
  - Small circular dots (4–6px diameter) appear at 3–5 random points along projected route.
  - Dots pulse: Opacity 0.4 → 1.0 → 0.4, 1.5s cycle, ease-in-out.
  - Each dot has random delay (0–500ms offset) so pulses are staggered, creating "wave" effect.
  - Color: Slightly desaturated version of vibe color.

Spinner (Alternative Loading):
  - If used instead of dots: 48px diameter circle, 4px stroke.
  - Rotation: 360deg over 1s, continuous linear rotation.
  - Stroke color: Primary brand color or vibe color.
  - Opacity: 0.7 (not full black; softer appearance).
  - Optional "breathing" animation: Opacity 0.7 → 0.9 → 0.7, 2s cycle (makes it feel less robotic).

---

HAPTIC FEEDBACK PATTERNS

Light Impact (UIImpactFeedbackStyle.light on iOS; HapticFeedbackType.LIGHT on Android):
  - Duration: ~13ms
  - Intensity: Subtle, delicate
  - Use cases: Tapping UI elements, collapsing bottom sheet, toggling options, minor state changes
  - Frequency: Multiple light impacts can occur in quick succession (e.g., selection pattern)

Medium Impact (UIImpactFeedbackStyle.medium):
  - Duration: ~20ms
  - Intensity: Noticeable but not alarming
  - Use cases: Confirming selections, expanding bottom sheet, POI arrival (50m proximity), primary button actions, modal dismissal
  - Frequency: Single impact per major interaction

Heavy Impact (UIImpactFeedbackStyle.heavy):
  - Duration: ~25ms
  - Intensity: Pronounced; should be used sparingly
  - Use cases: Navigation start ("Begin Detour"), error states, arrival at final destination, completion milestone
  - Frequency: Rare (once per major flow transition)

Selection Pattern (Two Light Impacts with 50ms Delay):
  - Light + 50ms silence + Light
  - Use case: Toggling a vibe option, choosing transport mode, confirming a setting
  - Creates a "tick-tick" rhythm that feels intentional and playful

Directional Haptics (if platform supports):
  - Swipe left: Light tap at swipe start; light tap at swipe end (if direction confirmed)
  - Approaching POI: Escalating light taps (every 10m: 1 tap at 50m, 2 taps at 30m, 3 taps at 10m)
  - Drift from route: Medium impact (one-time notification)

Sound Cues (Optional):
  - Positive confirmation: Subtle "chime" sound (50–100ms, high pitch, optional; respect mute toggle)
  - Navigation start: Soft "swoosh" or "launch" sound (100–150ms; optional; respect mute toggle)
  - Arrival notification: Gentle "arrival" chime (200–300ms; prioritize haptic over sound for accessibility)
  - All sounds: Optional; always respect device mute switch and accessibility preferences

---

ACCESSIBILITY ANIMATIONS

Reduced Motion Preferences:

For users with vestibular or motion sensitivity (prefers-reduced-motion media query):
  - All entrance/exit animations: Replace with instant fade (opacity 0 → 1 or 1 → 0, no scale/slide).
  - All parallax effects: Disabled; content renders at standard positions.
  - All spring physics / overshoot: Replaced with simple ease-out easing.
  - All carousel animations (swipe transitions): Instant cut or simple fade; no slide direction.
  - All rotations (emoji wiggle, spinner): Removed; static or simple pulse instead.
  - All scale animations on tap: Removed; color change or border change instead.
  - Haptic feedback: Preserved (vibration is different from motion sensitivity; consult accessibility docs).
  - Timing: All remaining animations should be <= 300ms (no prolonged motion).

Example: POI card tap
  - Standard (motion enabled): Scale 0.95x on down, scales back 1x on up (100ms, ease-out); fade + scale entry animation (300ms, ease-out-cubic).
  - Reduced motion: Scale animation removed; only background color change on tap. Entry animation is instant fade (no scale; 0 → 1 opacity, instant or very fast < 50ms).

Dark Mode & Contrast:
  - All animations preserve contrast ratios (no animations that reduce text/button legibility).
  - Haptic feedback: Works identically in light and dark modes (no reliance on visual cues alone).

---

SOUND DESIGN (OPTIONAL LAYER)

Sound serves as reinforcement, not primary feedback. All sounds are optional and can be muted globally or per interaction.

Signature Sounds:

  Positive Confirmation (POI arrival, selection confirmed, action complete)
  - Pitch: G5 (784 Hz), slightly bright
  - Duration: 80ms attack, 150ms decay
  - Quality: Soft sine wave or bell-like tone
  - Example: "chime.aiff" or custom synthesized tone

  Navigation Launch (Begin Detour)
  - Pitch: C5 to E5 (262–330 Hz) rising pitch
  - Duration: 250–300ms total (ascending pitch curve)
  - Quality: Smooth, fluid, uplifting
  - Example: "launch.aiff" or custom synth sweep

  Arrival / Milestone Completion
  - Pitch: E4 to G4 to E5 (simple three-note chord)
  - Duration: 150ms per note (450ms total)
  - Quality: Warm, celebratory, not harsh
  - Example: Custom three-note progression

  Error or Deviation (Lost signal, route unavailable)
  - Pitch: A3 (220 Hz), slightly low/warning tone
  - Duration: 150–200ms (single note)
  - Quality: Soft but noticeable; not alarming
  - Example: "caution.aiff" or single low tone

All sounds: < -6dB relative to system volume; fade in and out smoothly (no hard starts/stops).


# DETOUR UX/UI BLUEPRINT
## Part 1: App Overview & User Flow

---

APP OVERVIEW

Detour is a discovery-first navigation application that reimagines how people move through the world. Rather than optimizing for speed, Detour prioritizes meaningful exploration by generating routes that align with users' emotional states and personal interests. The app functions as a conversational guide, transforming routine journeys into opportunities for serendipity, cultural discovery, and local connection.

The UX philosophy centers on reducing decision friction while maximizing emotional resonance. Users make one core choice upfront—selecting a "vibe" that reflects their current mood or interests (e.g., "Creative," "Foodie," "Nature Escape")—and then surrender to an intelligently curated experience. The interface operates on a principle of progressive disclosure: the map is always primary, but contextual storytelling, POI details, and social moments emerge at precisely the right moments. Animations are subtle and purposeful; copy is warmly witty, never corporate; and accessibility is foundational, not retrofitted.

---

USER FLOW DIAGRAM (TEXTUAL)

Stage 1: Entry & Orientation
- User opens app.
- System detects location and displays a welcome state with two CTA buttons: "Start a Detour" and "Browse My Detours."
- New users see a micro-guided tutorial overlay (optional, can be skipped).
- Goal: Establish context instantly—user understands they are about to discover, not rush.

Stage 2: Mode Selection
- User taps "Start a Detour."
- Transport mode selector appears (Walking, Cycling, Driving).
- User selects their travel method.
- Transition: System moves to destination input.

Stage 3: Destination & Vibe Selection
- User inputs destination (text search, map tap, or "Surprise Me").
- Upon destination confirmation, vibe selector modal slides up from bottom.
- Vibe options: Creative, Foodie, Nature Escape, History Buff, Nightlife, Hidden Gems, Local Favorites.
- Each vibe displays a short description and icon.
- User selects one vibe (or system defaults to "Local Favorites" if user skips).
- Key decision point: User's mood-to-route mapping is now fixed.

Stage 4: Route Generation & Preview
- System processes destination, vibe, and current location.
- Backend requests POI data from LLM service and map database.
- Loading state: Animated map with subtle pulsing dots; copy reads "Discovering your route..." or similar warmth.
- Route preview screen displays:
  - Full map with generated route polyline.
  - Inline list of top 5–7 POIs with brief storytelling snippets.
  - Start and estimated arrival time.
  - Action buttons: "Begin Detour" (primary), "Adjust Route" (secondary), "Save for Later" (tertiary).
- Key decision point: User commits to the detour or requests regeneration.

Stage 5: On-the-Way Mode
- User taps "Begin Detour."
- Interface transitions to full-screen map with:
  - Navigation bar showing next POI, distance, and remaining time.
  - Bottom sheet with POI details, photo, storytelling prompt, and "Learn More" option.
  - Minimal UI chrome—map dominates.
- As user approaches each POI, contextual prompt appears: "Look for the blue door on your left" or "This café opened in 1962."
- User can swipe through POI details, skip to next, or pause for deeper engagement.
- System tracks time spent at each location.

Stage 6: Route Completion & Reflection
- User reaches final destination.
- Reflection screen appears with:
  - Summary of route taken (visual journey map).
  - POIs visited, photos captured, time engaged.
  - Emotional prompt: "How did this detour make you feel?" (emoji reaction or short text).
  - Share button: Send route to friends or social media.
  - Option to save detour for future reference.
- Final CTA: "Start Another Detour" or "Return to Map."

---

KEY DECISION POINTS & BRANCHES

1. Transport Mode: Walking, Cycling, or Driving affects POI density, distance, and storytelling depth.
2. Destination Input: User can search, tap map, or request randomization.
3. Vibe Selection: Determines which POIs surface and which narratives LLM generates.
4. Route Approval: User can regenerate or accept the preview.
5. Engagement During Navigation: User can skip POIs, pause for longer engagement, or return to detour overview.
6. Reflection Action: User shares, saves, or discards the experience.

---

ERROR & EDGE CASE FLOWS

Scenario: No Internet Connection
- Offline mode displays cached favorite detours and map tiles.
- CTAs disabled with gentle message: "You're offline. Previous detours are available."

Scenario: Route Generation Fails
- Fallback to alternative vibe or closest matching route.
- Error message remains lighthearted: "That vibe is being finicky. Try another?"

Scenario: User Close to Destination
- System suggests shorter detours or micro-explorations of immediate neighborhood.

Scenario: User Deviates from Route
- Gentle notification: "Wandered somewhere interesting?" with option to re-navigate or save new route.

---

MENTAL MODEL

The user thinks of Detour as a knowledgeable friend who knows the city and shares their interests. The app reduces cognitive load by:
- Eliminating route choice (one curated path presented).
- Embedding stories into navigation (no separate guidebook).
- Using visual hierarchy to spotlight the map (not settings or menus).
- Rewarding curiosity with timely, relevant prompts.


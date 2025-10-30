You are an expert Expo + React Native engineer. Build a first releasable prototype of the “Detour” mobile app using Expo (managed workflow) with TypeScript for iOS and Android.

Primary goal
- Core flow: user enters start and end coordinates (lat,lng) and selects an interest.
- App fetches a direct route (Google Directions), finds a relevant POI near the route (Google Places Nearby Search), then requests a detour route with that POI as a waypoint.
- Draw the route on a map (Polyline) with markers for start, POI, and end.
- Let users save detours locally and view them later.

Important constraints
- Use Expo (managed workflow), TypeScript, and Expo Router for navigation.
- Do NOT hardcode or pin exact package versions. Do not include explicit version strings in package.json.
- Provide a separate SETUP.md with the exact “npx expo install …” commands so dependencies get correct versions automatically.
- Prefer native fetch over axios to reduce dependencies.
- Keep the build compatible with the latest stable Expo SDK.

Output requirements
- Output the complete project as multiple files in this single response using file blocks.
- For every file, wrap contents in a fenced code block and include a header with the file name: ```lang name=path/filename.ext```
- For Markdown files, use four backticks.
- Include all required source files and config to run with “npx expo start”.
- No placeholders like “…”. Provide working, coherent code.

App scope (v1.0)
- Inputs: two text fields for start and end (lat,lng), one dropdown for interest (“Street Art”, “Architecture”, “Cafes”).
- Routing:
  1) Get a direct route via Google Directions API from start to end.
  2) Compute a search center from route.bounds midpoint.
  3) Query Google Places Nearby Search for the selected interest near the center (radius ~2000m).
  4) Pick the first valid result as the POI.
  5) Request a Directions route with the POI as a waypoint to generate the detour.
- Map: show route Polyline and three Markers (start, POI, end) using react-native-maps.
- Save: allow saving detours locally (AsyncStorage) with name, interest, POI details, encoded polyline, start/end locations, timestamps, status (“planned”).
- “My Detours” tab: list saved detours (newest first), open a saved detour to redraw the route and markers, and allow delete.

Non-goals (defer)
- No auth, no cloud backend.
- No address geocoding/autocomplete (lat,lng only).
- No multi-POI chaining or ranking beyond “first suitable result”.
- No monetization.

Design system
- Palette (Urban Explorer):
  - Background: #121212
  - Card: #1E1E1E
  - TextPrimary: #FFFFFF
  - TextSecondary: #B3B3B3
  - Accent/CTA: #00A8FF
  - RoutePolyline: #00A8FF
  - POIMarker: #FFD600
- Typography: Headings Montserrat (bold), Body Roboto.
- Layout:
  - Full-screen Map.
  - Floating top card with inputs: Start, End, Interest, and “Find Detour”.
  - If a route exists, show “Save Detour” button.
  - Bottom tabs: Explore (map) and My Detours.

Technical requirements
- Expo managed workflow (TypeScript).
- Navigation: Expo Router (tabs).
- Map: react-native-maps (Expo-compatible).
- Storage: @react-native-async-storage/async-storage.
- Env/config: app.config.ts with extra.GOOGLE_MAPS_API_KEY, read via expo-constants.
- Networking: use fetch for Google Directions and Places APIs.
- Polyline decoding: implement a standard decoder utility to [{ latitude, longitude }].

Project structure
- app.config.ts (Expo config with iOS/Android Google Maps keys in config and extra.GOOGLE_MAPS_API_KEY)
- package.json (no explicit versions; keep deps minimal)
- tsconfig.json
- babel.config.js
- .env.example (not .env)
- README.md
- SETUP.md (commands to install deps with “npx expo install …” so correct versions are applied)
- app/
  - _layout.tsx (Tabs layout)
  - (tabs)/
    - index.tsx (Explore screen)
    - my-detours.tsx (My Detours screen)
- src/
  - components/
    - MapViewComponent.tsx
    - InputFormComponent.tsx
    - SaveDetourModal.tsx
  - services/
    - DetourService.ts
    - PolylineDecoder.ts
    - StorageService.ts
  - styles/
    - theme.ts
  - types/
    - detour.ts

Implementation details (strict)
- Input validation:
  - Parse “lat,lng” safely; show user-friendly errors if invalid.
- Interests mapping -> Places types/keywords:
  - Street Art: type=tourist_attraction, keyword="street art|mural"
  - Architecture: type=tourist_attraction, keyword="architecture|building"
  - Cafes: type=cafe, keyword="cafe|coffee"
- DetourService flow:
  - Fetch direct route via Directions API (overview_polyline, bounds).
  - Compute search center from bounds.{northeast,southwest}.
  - Fetch Places Nearby Search using interest mapping at search center.
  - Choose first result; request Directions with waypoints=POI to get detour route.
  - Return decoded coordinates, encoded polyline string, markers, POI details, and interest.
- StorageService:
  - Save list in AsyncStorage under a single key.
  - Saved detour fields:
    - id (UUID), name, createdAt (ISO), status ("planned"), interest
    - startLocation {latitude, longitude}, endLocation {latitude, longitude}
    - poi {name, vicinity, rating, location {latitude, longitude}}
    - encodedPolyline
- MapViewComponent:
  - Renders a MapView with Polyline and Markers using theme colors.
- InputFormComponent:
  - Accepts three inputs (start, end, interest), calls onFindDetour with parsed coordinates and the interest.
- SaveDetourModal:
  - Prompts for a detour name and invokes save logic.
- MyDetours screen:
  - Lists saved items (newest first). Tap to load and display a detail map with route/markers; support delete.
- Error handling:
  - No POIs found, no route found, and network errors -> user-friendly alerts and inline messages. Allow retry.
- Permissions:
  - Optional: use expo-location to center map on current position; do not block core flow if denied.

Environment and keys (Expo)
- Use app.config.ts:
  - ios.config.googleMapsApiKey
  - android.config.googleMaps.apiKey
  - extra: { GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY }
- Read in app via expo-constants (Constants.expoConfig?.extra or Constants.manifest?.extra).
- Provide .env.example with GOOGLE_MAPS_API_KEY placeholder.
- Do not commit .env.

Testing scenarios
- Happy path: valid LA coordinates + “Cafes” -> route with waypoint renders; save and view in My Detours.
- No POIs: obscure area or unmatched interest -> graceful message.
- Bad input: malformed lat,lng -> validation message.
- Offline: fetch fails -> user-friendly retry prompt.

Coding notes
- Use functional components and React hooks.
- Keep components small and typed.
- Seperate them in components if too big.
- Use theme tokens for colors/spacing.
- Ensure MapView has a sensible initialRegion; polyline uses theme RoutePolyline color.
- Include a small utility to parse/validate “lat,lng”.

Acceptance checklist
- “npx expo start” compiles and runs in iOS Simulator and Android Emulator.
- Explore tab: inputs -> Find Detour -> route + markers render.
- Save Detour -> appears in My Detours list; can open and redraw; can delete.
- No package versions are hardcoded; dependency installation is delegated to SETUP.md commands using “npx expo install …”.

Now, generate ALL files needed for the first prototype 
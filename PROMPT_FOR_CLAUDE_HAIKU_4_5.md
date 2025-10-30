You are an expert React Native engineer. Build a first releasable prototype of the “Detour” mobile app (iOS + Android). The app discovers dynamic POIs along a route using Google Directions + Places APIs, draws a detour route via a waypoint POI, and lets users locally save and view detours.

Output requirements
- Output the complete project as multiple files in this single response using file blocks.
- For every file, wrap contents in a fenced code block and include a header with the file name: ```lang name=path/filename.ext```
- For Markdown files, use four backticks.
- Include all necessary source files, configuration changes, and native files (Android and iOS) that require edits for a clean build.
- Do not omit files or use placeholders like “...”.
- Prefer JavaScript over TypeScript to reduce setup complexity.
- Target React Native >= 0.74.

App scope (v1.0)
- Single core flow: user enters start and end coordinates (lat,lng) and selects an “interest”.
- App fetches a direct route between start and end with Google Directions API.
- Determine a search center from route bounds midpoint.
- Use Google Places Nearby Search to find a POI matching the “interest” near the route center.
- Request a second Directions route with the POI as a waypoint to produce the detour route.
- Show route on a map (Polyline) with markers for start, POI, end.
- Allow saving detours locally (AsyncStorage) with name, interest, POI details, encoded polyline, start/end locations, timestamps, status.
- Provide a “My Detours” screen to list and view saved detours and re-draw the route.

Non-goals (defer to v1.1+)
- No user authentication, no cloud backend.
- No address geocoding/autocomplete (lat,lng only).
- No multi-POI chaining or ranking beyond “first suitable result”.
- No monetization or curated packs.

Design system
- Palette (Urban Explorer)
  - Background: #121212
  - Card: #1E1E1E
  - TextPrimary: #FFFFFF
  - TextSecondary: #B3B3B3
  - Accent/CTA: #00A8FF
  - RoutePolyline: #00A8FF
  - POIMarker: #FFD600
- Typography: Headings Montserrat (bold), Body Roboto.
- Layout:
  - Full-screen map.
  - Floating top card with inputs: “Start”, “End” (lat,lng), “Interest”.
  - Primary button: “Find Detour”.
  - If a route is shown, display “Save Detour” button.
  - Bottom tab navigation: Explore (map) and My Detours.

Technical requirements
- React Native CLI app (not Expo).
- Dependencies:
  - react-native-maps
  - axios
  - @react-native-async-storage/async-storage
  - @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
  - react-native-screens react-native-safe-area-context
  - react-native-config (for .env keys)
- iOS and Android native setup for react-native-maps and react-native-config with Google Maps API keys.
- Use Hermes engine (default in RN 0.74).
- Secure keys via platform restrictions; keys still live in client for prototype.

Project structure
- App.js
- .env (not committed)
- package.json
- android/ and ios/ native configs updated accordingly
- src/
  - screens/
    - MapScreen.js
    - MyDetoursScreen.js
  - components/
    - MapViewComponent.js
    - InputFormComponent.js
    - SaveDetourModal.js
  - services/
    - DetourService.js
    - PolylineDecoder.js
    - StorageService.js
  - navigation/
    - AppNavigator.js
  - styles/
    - theme.js
- README.md

Implementation details (strict)
- Input format: text inputs for lat,lng (e.g., “34.0522,-118.2437”). Validate format; surface friendly errors.
- Interest selection: simple dropdown or segmented control with ["Street Art", "Architecture", "Cafes"].
- DetourService:
  - get direct route via Directions API -> use route.bounds midpoint as Places search center (radius 2000m).
  - interestMapping -> Google Places types/keywords:
    - Street Art: type=tourist_attraction, keyword="street art|mural"
    - Architecture: type=tourist_attraction, keyword="architecture|building"
    - Cafes: type=cafe, keyword="cafe|coffee"
  - pick first Places result as POI.
  - request Directions again with waypoints=POI to get detour route.
  - return decoded coordinates array, encoded polyline string, markers, POI details, interest.
- PolylineDecoder: implement standard Google polyline decode to [{ latitude, longitude }].
- StorageService (AsyncStorage): save, list, remove.
  - Saved detour fields:
    - id (UUID), name, createdAt (ISO), status ("planned"), interest
    - startLocation {lat,lng}, endLocation {lat,lng}
    - poi {name, vicinity, rating, location {lat,lng}}
    - encodedPolyline
- MapViewComponent: renders MapView, Polyline, and Markers; accepts theme colors.
- InputFormComponent: handles inputs; calls onFindDetour with parsed coordinates and interest.
- SaveDetourModal: simple modal to name and save current detour.
- MyDetoursScreen: lists saved detours (newest first). Tap to view details with re-drawn route and markers; delete action.
- AppNavigator: bottom tabs (Explore, My Detours) with themed styles.
- Theme: export colors, spacing, typography tokens.
- Error handling: no route found, no POIs found, network errors -> user-friendly alerts and inline messages. Allow retry.
- Permissions: optional location permission to center map on current location; do not block core flow if denied.

Native configuration (must include)
- Android:
  - Add react-native-config setup.
  - Add Google Maps API key via AndroidManifest metadata and ensure maps loads.
  - Gradle configuration for react-native-maps (Google Maps) and config library.
- iOS:
  - Add Google Maps SDK key via AppDelegate.m and Info.plist as required by react-native-maps (if needed).
  - Link react-native-config and ensure XCConfig integration so .env variables are available.
  - Add NSLocationWhenInUseUsageDescription to Info.plist.

Environment
- .env (do not commit):
  - GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_KEY"
- Add .env to .gitignore.
- Explain enabling APIs: Directions API and Places API in Google Cloud Console and key restrictions.

Testing scenarios
- Happy path: LA downtown start/end with interest “Cafes”. Confirm route with waypoint, polyline renders, markers show. Save detour, then view it in My Detours and redraw.
- No POIs: use interest "Spooky History" (not mapped) or remote area -> show “No POIs near your route. Try a different interest.”
- Bad input: malformed lat,lng -> validation error.
- Network error: simulate offline -> user-friendly prompt to retry.

Deliverables to output now
Produce ALL of the following files with complete content:

1) package.json with all deps and scripts
2) .env.example (not .env) with placeholder key and instructions
3) App.js bootstrapping navigation
4) src/navigation/AppNavigator.js
5) src/styles/theme.js
6) src/components/MapViewComponent.js
7) src/components/InputFormComponent.js
8) src/components/SaveDetourModal.js
9) src/screens/MapScreen.js
10) src/screens/MyDetoursScreen.js
11) src/services/PolylineDecoder.js
12) src/services/DetourService.js
13) src/services/StorageService.js
14) Android native changes:
    - android/app/src/main/AndroidManifest.xml (with meta-data for Google Maps key)
    - android/build.gradle and android/app/build.gradle config for react-native-config
    - android/gradle.properties updates if needed
15) iOS native changes:
    - ios/DetourApp/AppDelegate.m (or AppDelegate.mm) showing Google Maps key injection if using that path, or instructions if not required
    - ios/DetourApp/Info.plist entries for location usage and any Google Maps keys required
    - ios/DetourApp.xcodeproj/project.pbxproj or configuration snippets to integrate react-native-config (.xcconfig) — provide the changes as text blocks with clear diffs or final state
16) README.md with setup, build, and run instructions for iOS and Android, plus API key setup and palette reference.

Coding notes
- Ensure imports and package versions align.
- Use functional components and React hooks.
- Keep code clean, commented where non-trivial.
- Prefer small, reusable components and clear prop contracts.
- Ensure MapView initialRegion is sensible and Polyline uses theme color.
- Include simple utility to parse and validate "lat,lng" string safely.

Acceptance checklist (must pass)
- Android debug build runs in emulator/device, map renders, POIs are fetched, route/waypoint drawn, save & view detours works.
- iOS debug build runs in simulator/device with working map and same flow.
- No TypeScript or Expo dependencies.
- All files provided; no “TODO” placeholders.
- .env.example provided and referenced; .env not committed.

Now, generate the full project files in file blocks as specified.
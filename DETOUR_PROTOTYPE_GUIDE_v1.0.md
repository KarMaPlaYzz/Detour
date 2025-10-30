```markdown
# Detour — Prototype Guide (v1.0)

Purpose
-------
This document is a single, focused implementation guide for building a first releasable Detour prototype (v1.0). The goal is to produce a working app that demonstrates the core product promise:
"Given a start, an end, and an interest, produce a route that includes an interesting Point of Interest (POI) discovered dynamically near the route, and allow the user to save/view detours locally."

Scope & Design Decisions (v1.0)
--------------------------------
- Platform: React Native (iOS + Android).
- Map: react-native-maps (MapView, Marker, Polyline).
- Dynamic POIs: Google Directions API + Google Places Nearby Search.
- Persistence (v1.0): Local-only save using AsyncStorage. (No backend or auth for first release.)
- Inputs: For maximum simplicity in prototype, accept lat,lng text inputs (e.g., "34.0522,-118.2437") and optionally add a follow-up task to add address geocoding.
- UI: Single main screen (map + overlay input card). Secondary screen "My Detours" for saved detours.
- Minimal feature list to release fast and validated:
  1. Input start/end coordinates and interest.
  2. Request direct route -> query Places -> request detour route with waypoint -> display route and markers.
  3. Save detour locally with name, POI, encoded polyline, timestamps, status ('planned' by default).
  4. List saved detours and view a saved detour (redraw polyline and markers).
- Keep API usage / billing safety in mind: warn user about API key usage and quotas.

Files & Project Structure
-------------------------
- App.js
- .env
- package.json
- src/
  - components/
    - MapViewComponent.js
    - InputFormComponent.js
    - SaveDetourModal.js
  - screens/
    - MapScreen.js
    - MyDetoursScreen.js
  - services/
    - DetourService.js
    - PolylineDecoder.js
    - StorageService.js
  - styles/
    - theme.js
- android/ ios/ (native config for react-native-maps and API keys)

Key Dependencies
----------------
- react-native
- react-native-maps
- axios
- @react-native-async-storage/async-storage
- react-navigation (stack + bottom tabs)
- react-native-dotenv or react-native-config (for .env keys)

Environment Setup
-----------------
- Create .env (DO NOT commit)
  - GOOGLE_MAPS_API_KEY="YOUR_GOOGLE_MAPS_KEY"
- Enable on Google Cloud:
  - Directions API
  - Places API
  - Restrict key by app (Android package / iOS bundle) or by HTTP refferer when possible.
- Add .env to .gitignore.

Core Implementation Notes & Snippets
-----------------------------------

1) DetourService.js (dynamic POI discovery + routing)
- Responsibilities:
  - Get direct route between origin and destination (Directions API).
  - Calculate a search center (route bounds midpoint) and search for POIs by interest (Places Nearby Search).
  - Choose best POI (v1.0: first result; optional: rank by proximity to route or rating).
  - Request Directions again with POI as waypoint and return decoded coordinates + markers + encoded polyline.

Essential Snippet (simplified):
```javascript
// src/services/DetourService.js
import axios from 'axios';
import Config from 'react-native-dotenv'; // or react-native-config
import { decode } from './PolylineDecoder';

const KEY = Config.GOOGLE_MAPS_API_KEY;
const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';
const PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

const interestMapping = {
  'Street Art': { type: 'tourist_attraction', keyword: 'street art|mural' },
  'Architecture': { type: 'tourist_attraction', keyword: 'architecture|building' },
  'Cafes': { type: 'cafe', keyword: 'cafe|coffee' },
};

export async function getDetourRoute({ start, end, interest, radius = 2000 }) {
  const origin = `${start.latitude},${start.longitude}`;
  const destination = `${end.latitude},${end.longitude}`;

  // 1. Get direct route
  const direct = await axios.get(`${DIRECTIONS_URL}?origin=${origin}&destination=${destination}&key=${KEY}`);
  if (!direct.data.routes.length) throw new Error('No initial route found');
  const route = direct.data.routes[0];

  // 2. Determine search center (midpoint of route bounds)
  const { bounds } = route;
  const searchCenter = {
    latitude: (bounds.northeast.lat + bounds.southwest.lat) / 2,
    longitude: (bounds.northeast.lng + bounds.southwest.lng) / 2,
  };

  // 3. Search Places
  const mapInterest = interestMapping[interest] || { keyword: interest };
  const placesUrl = `${PLACES_URL}?location=${searchCenter.latitude},${searchCenter.longitude}&radius=${radius}&key=${KEY}&keyword=${encodeURIComponent(mapInterest.keyword || interest)}${mapInterest.type ? `&type=${mapInterest.type}` : ''}`;
  const placesRes = await axios.get(placesUrl);
  if (!placesRes.data.results.length) throw new Error('No POIs found near route');

  // 4. Pick best POI (first result for v1.0)
  const poi = placesRes.data.results[0];
  const poiLat = poi.geometry.location.lat;
  const poiLng = poi.geometry.location.lng;

  // 5. Get detour route with waypoint
  const waypoint = `${poiLat},${poiLng}`;
  const detourRes = await axios.get(`${DIRECTIONS_URL}?origin=${origin}&destination=${destination}&waypoints=${waypoint}&key=${KEY}`);
  if (!detourRes.data.routes.length) throw new Error('No detour route found');

  const finalRoute = detourRes.data.routes[0];
  const coords = decode(finalRoute.overview_polyline.points);

  return {
    coordinates: coords,
    encodedPolyline: finalRoute.overview_polyline.points,
    markers: [
      { latitude: start.latitude, longitude: start.longitude, title: 'Start' },
      { latitude: poiLat, longitude: poiLng, title: poi.name },
      { latitude: end.latitude, longitude: end.longitude, title: 'End' },
    ],
    poi: {
      name: poi.name,
      vicinity: poi.vicinity,
      rating: poi.rating,
      location: { latitude: poiLat, longitude: poiLng },
    },
    interest,
  };
}
```

2) PolylineDecoder.js
- Standard decoder to convert encoded polyline to array of {latitude, longitude}.

3) StorageService.js
- Simple wrapper around AsyncStorage to save, list, load, delete saved detours.

Snippet:
```javascript
// src/services/StorageService.js
import AsyncStorage from '@react-native-async-storage/async-storage';
const KEY = 'DETOUR_SAVED_LIST';

export async function saveDetourLocal(detourObj) {
  const raw = await AsyncStorage.getItem(KEY);
  const list = raw ? JSON.parse(raw) : [];
  list.unshift(detourObj); // newest first
  await AsyncStorage.setItem(KEY, JSON.stringify(list));
  return detourObj;
}

export async function listDetoursLocal() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function removeDetourLocal(id) {
  const raw = await AsyncStorage.getItem(KEY);
  const list = raw ? JSON.parse(raw) : [];
  const filtered = list.filter(d => d.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(filtered));
  return filtered;
}
```

4) Save Flow
- After generating a detour, show SaveDetourModal to enter name.
- Save object to AsyncStorage with:
  - id (UUID)
  - name
  - createdAt
  - interest
  - startLocation
  - endLocation
  - poi (name, location, vicinity)
  - encodedPolyline
  - status: 'planned'

5) MapScreen.js
- Coordinates state
- markers state
- isLoading, error state
- onFindDetour -> parse user lat,lng -> call getDetourRoute -> set route + markers
- show Save button when route exists

6) MyDetoursScreen.js
- Fetch list from StorageService
- Show list grouped by status (planned / completed)
- On select: decode stored encodedPolyline (with PolylineDecoder) to coordinates and display route + markers
- Provide delete/rename actions in UI

Design and Palette (v1.0)
-------------------------
Pick one palette to ship quickly. Recommended: "Urban Explorer" (dark) for initial charm.

Urban Explorer:
- Background: #121212
- Card: #1E1E1E
- Text primary: #FFFFFF
- Text secondary: #B3B3B3
- Accent / CTA: #00A8FF
- Route polyline: #00A8FF
- POI marker: #FFD600

Typography:
- Headings: Montserrat (bold)
- Body/UI: Roboto

Simple layout:
- Full-screen Map
- Floating top card for inputs (Start, End, Interest)
- Floating Save button in results view
- Bottom tab navigation: "Explore" (map), "My Detours"

UX Decisions for v1.0
---------------------
- Input format: lat,lng strings to eliminate geocoding complexity. (Add geocoding after basic validation.)
- If user needs address->geocode: add optional geocoding call to Google Geocoding API later (v1.1).
- For POI selection: v1.0 uses first result; later versions can rank by route proximity, rating, or user preferences.
- Permissions: Request location permission for "center map on current location" but don't require it to function.

Privacy & Billing Considerations
-------------------------------
- Client-side API keys expose quota risk. For prototype:
  - Restrict API key by app package name / iOS bundle ID.
  - Warn in README about quota & costs.
  - Consider proxying API calls through a simple server with an API key in server env for production to hide keys and enable quotas/monitoring.
- Inform users in-app about usage of location and external APIs (Google).

Testing & Release Checklist (v1.0)
----------------------------------
- [ ] Android: Configure Google Maps API key in android manifest and metadata.
- [ ] iOS: Configure Google Maps API key in AppDelegate and Info.plist.
- [ ] E2E test: Input known coordinates and interest -> detour route appears -> Save -> Open from My Detours.
- [ ] Handle edge cases:
  - No POIs found -> graceful message & suggestion to change interest or increase radius.
  - No route found -> show clear error.
  - API failures -> retry/backoff or human-readable error.
- [ ] Unit test DetourService logic (mock axios).
- [ ] Test rate limits & quotas with a dev key.
- [ ] Add onboarding that explains the experimental nature of the prototype.

1.0 Implementation Insights & Tradeoffs
--------------------------------------
- Using local storage (AsyncStorage) gets a shippable product faster and avoids the complexity of auth and backend. It's perfectly acceptable for prototype validation.
- Dynamic POI discovery via Google Places ensures relevance but exposes API key on client; mitigate with key restrictions. For a production 1.1 timeline, add a backend that proxies requests and enforces quotas.
- Input as lat,lng is fast for prototyping; after validating product-market fit, add address autocomplete (Places Autocomplete) and geocoding.
- POI selection strategy for v1.0 is intentionally simple. Later improvements:
  - Score POIs by detour distance added, rating, and user preferences.
  - Allow multiple POIs on a detour (chain waypoints).
- Saving detours locally allows testing MVP engagement. Move to Firestore + Auth in v1.1 to enable cross-device sync and monetization (curated packs, sponsored POIs).

Estimated Implementation Steps (developer timeline)
--------------------------------------------------
Day 0-1
- Project bootstrap, install deps, set up .env + API key.
- Implement MapScreen plus MapViewComponent and InputFormComponent.

Day 2
- Implement DetourService dynamic calls & Polyline decoder.
- Wire up map drawing and basic error handling.

Day 3
- Implement SaveDetourModal + StorageService (AsyncStorage).
- Implement MyDetoursScreen to list and view saved detours.

Day 4
- UI polish (colors, cards), test on iOS & Android, debug native configs.
- Add unit tests for DetourService and StorageService.

Day 5
- QA, e2e test, prepare release notes, build beta (TestFlight / Play Internal).

What I did here
---------------
I consolidated all prior decisions and sample files into a single, focused guide for v1.0. I prioritized a dynamic POI discovery flow while keeping persistence local to enable a fast, releasable prototype. I included file layout, sample code snippets for core services and storage, design palette, testing checklist, and clear next-step recommendations for v1.1.

What's next
----------
Implement the files and wiring in the project following the structure above. Start with DetourService -> MapScreen -> Save flow -> MyDetours, iterating quickly with mocks for axios if you must avoid real API calls during early development. After confirming the core experience in user tests, plan the backend migration (Firestore + Auth) and address API key security.

If you want, I can:
- Generate full file contents for each file listed (ready-to-paste), or
- Produce a minimal working PR that adds these files into the repository with basic implementation stubs and working DetourService, or
- Convert the lat,lng inputs into address autocomplete + geocoding for the prototype now.
```
# Detour - Mobile App Prototype (v1.0)

**Detour** is a React Native mobile app (iOS + Android) that helps users discover interesting points of interest (POIs) along their routes. Enter a start and end location with a selected interest (Street Art, Architecture, Cafes), and Detour will dynamically find a relevant POI near your route and create a detour that includes it.

## Features

- **Dynamic POI Discovery**: Uses Google Directions API and Google Places Nearby Search to find interesting stops along your route
- **Interactive Map**: View your route with markers for start, POI, and destination using react-native-maps
- **Local Persistence**: Save and manage your detours locally with AsyncStorage
- **Cross-Platform**: Works on both iOS and Android using Expo managed workflow

## Tech Stack

- **Framework**: Expo (managed workflow) + React Native
- **Language**: TypeScript
- **Navigation**: Expo Router (file-based routing)
- **Maps**: react-native-maps
- **APIs**: Google Directions API, Google Places API
- **Storage**: AsyncStorage

## Quick Start

See [SETUP.md](./SETUP.md) for detailed installation and configuration instructions.

## Project Structure

```
app/
  _layout.tsx              # Root layout with tabs
  (tabs)/
    index.tsx              # Explore screen (main map interface)
    my-detours.tsx         # Saved detours list
src/
  components/
    MapViewComponent.tsx   # Map display with polyline and markers
    InputFormComponent.tsx # Input form for start/end/interest
    SaveDetourModal.tsx    # Modal to save a detour
  services/
    DetourService.ts       # Core logic for route and POI discovery
    PolylineDecoder.ts     # Decode Google polyline format
    StorageService.ts      # AsyncStorage wrapper
  styles/
    theme.ts               # Design system tokens
  types/
    detour.ts              # TypeScript interfaces
```

## Usage

1. **Find a Detour**:
   - Open the Explore tab
   - Enter start coordinates (e.g., `34.0522,-118.2437`)
   - Enter end coordinates (e.g., `34.0407,-118.2468`)
   - Select an interest (Street Art, Architecture, or Cafes)
   - Tap "Find Detour"

2. **Save a Detour**:
   - After generating a route, tap "Save Detour"
   - Enter a name for your detour
   - Access it later in "My Detours"

3. **View Saved Detours**:
   - Go to "My Detours" tab
   - Tap any saved detour to view it on the map
   - Delete detours by tapping the delete button

## API Costs & Quotas

This app makes client-side API calls to Google Maps APIs. Be aware of:
- **Directions API**: ~$5 per 1,000 requests
- **Places Nearby Search**: ~$32 per 1,000 requests

Restrict your API key to your app's iOS bundle ID and Android package name to prevent unauthorized use. Monitor usage in Google Cloud Console.

## Limitations (v1.0)

- **No Address Geocoding**: Inputs are lat/lng only (geocoding planned for v1.1)
- **Single POI**: Only returns one POI per detour
- **Local Storage Only**: No cloud sync or authentication
- **Basic POI Selection**: Uses first result from Places API

## Privacy

- Location data is only used locally on your device
- API calls are made directly from the client to Google
- No user data is collected or sent to any backend

## License

MIT

## Contributing

This is a prototype. Contributions, issues, and feature requests are welcome!
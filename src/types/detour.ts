export interface Location {
  latitude: number;
  longitude: number;
}

export interface POI {
  [key: string]: any;
  name: string;
  location: Location;
}

export interface Marker {
  latitude: number;
  longitude: number;
  title: string;
  description?: string;
}

export interface DetourRoute {
  coordinates: Location[];
  encodedPolyline: string;
  markers: Marker[];
  poi?: POI;
  pois?: POI[];
  allPOIs?: POI[]; // All discovered POIs for the list (separate from selected pois)
  interest?: string;
  durations?: {
    car?: number;        // seconds
    walk?: number;       // seconds
    bike?: number;       // seconds
    transit?: number;    // seconds
  };
  durationsWithTraffic?: {
    car?: number;        // seconds with traffic
    walk?: number;       // seconds
    bike?: number;       // seconds
    transit?: number;    // seconds
  };
}

export interface SavedDetour {
  id: string;
  name: string;
  createdAt: string;
  status: 'planned' | 'completed';
  interest: string;
  startLocation: Location;
  endLocation: Location;
  poi: POI;
  encodedPolyline: string;
}

export type Interest = string; // Now supports any POI type from Google Places API

// UX Blueprint Vibes (7 core vibes per UX_BLUEPRINT_2)
export type Vibe = 
  | 'Creative' 
  | 'Foodie' 
  | 'Nature Escape' 
  | 'History Buff' 
  | 'Nightlife' 
  | 'Hidden Gems' 
  | 'Local Favorites';

// Transport modes (UX_BLUEPRINT_2)
export type TransportMode = 'walking' | 'cycling' | 'driving';

// Vibe metadata for UI display
export interface VibeOption {
  id: Vibe;
  name: string;
  description: string;
  icon: string;
  color: string;
  gradient?: [string, string];
}

export interface InterestMapping {
  type?: string;
  keyword: string;
}

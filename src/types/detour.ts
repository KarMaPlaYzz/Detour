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
  interest?: string;
  durations?: {
    car?: number;        // seconds
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

export type Interest = 'Street Art' | 'Architecture' | 'Cafes';

export interface InterestMapping {
  type?: string;
  keyword: string;
}

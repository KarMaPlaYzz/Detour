export interface Location {
  latitude: number;
  longitude: number;
}

export interface POI {
  name: string;
  vicinity: string;
  rating?: number;
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
  poi: POI;
  interest: string;
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

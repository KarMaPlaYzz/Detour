import { DetourRoute, Interest, InterestMapping, Location } from '@/types/detour';
import Constants from 'expo-constants';
import { decode } from './PolylineDecoder';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || 
                            Constants.manifest?.extra?.GOOGLE_MAPS_API_KEY;

const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';
const PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';

// Interest mapping to Google Places types and keywords
const interestMapping: Record<Interest, InterestMapping> = {
  'Street Art': { type: 'tourist_attraction', keyword: 'street art|mural' },
  'Architecture': { type: 'tourist_attraction', keyword: 'architecture|building' },
  'Cafes': { type: 'cafe', keyword: 'cafe|coffee' },
};

export interface GetDetourRouteParams {
  start: Location | string;
  end: Location | string;
  interest: Interest;
  radius?: number;
}

/**
 * Main function to get a detour route with a POI
 */
export async function getDetourRoute({
  start,
  end,
  interest,
  radius = 2000,
}: GetDetourRouteParams): Promise<DetourRoute> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured. Please check your .env file.');
  }

  try {
    // Step 1: Get direct route to calculate bounds
    const directRoute = await fetchDirectRoute(start, end);
    
    // Extract actual start/end coordinates from the route
    const startLocation = {
      latitude: directRoute.legs[0].start_location.lat,
      longitude: directRoute.legs[0].start_location.lng,
    };
    const endLocation = {
      latitude: directRoute.legs[0].end_location.lat,
      longitude: directRoute.legs[0].end_location.lng,
    };
    
    // Step 2: Decode the route to get actual path points
    const routeCoordinates = decode(directRoute.overview_polyline.points);
    
    // Step 3: Find POI along the actual route path
    const poi = await findPOIAlongRoute(routeCoordinates, interest, radius);
    
    // Step 4: Get detour route with POI as waypoint
    const detourRoute = await fetchDetourRoute(start, end, poi.location);
    
    // Step 5: Decode polyline and prepare response
    const coordinates = decode(detourRoute.overview_polyline.points);
    
    return {
      coordinates,
      encodedPolyline: detourRoute.overview_polyline.points,
      markers: [
        {
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
          title: 'Start',
          description: 'Starting point',
        },
        {
          latitude: poi.location.latitude,
          longitude: poi.location.longitude,
          title: poi.name,
          description: poi.vicinity,
        },
        {
          latitude: endLocation.latitude,
          longitude: endLocation.longitude,
          title: 'End',
          description: 'Destination',
        },
      ],
      poi: {
        name: poi.name,
        vicinity: poi.vicinity,
        rating: poi.rating,
        location: poi.location,
      },
      interest,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate detour route');
  }
}

/**
 * Fetch direct route from Google Directions API
 */
async function fetchDirectRoute(start: Location | string, end: Location | string) {
  const origin = typeof start === 'string' ? encodeURIComponent(start) : `${start.latitude},${start.longitude}`;
  const destination = typeof end === 'string' ? encodeURIComponent(end) : `${end.latitude},${end.longitude}`;
  
  const url = `${DIRECTIONS_URL}?origin=${origin}&destination=${destination}&key=${GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
    throw new Error('No route found between start and end locations');
  }
  
  return data.routes[0];
}

/**
 * Find POI along the actual route path using Google Places API
 * Searches at multiple points along the route to find POIs near the path
 */
async function findPOIAlongRoute(
  routeCoordinates: Location[],
  interest: Interest,
  radius: number
) {
  const mapping = interestMapping[interest] || { keyword: interest };
  
  // Sample points along the route (every 25% of the way)
  // Skip start (0%) and end (100%), focus on middle portions
  const sampleIndices = [
    Math.floor(routeCoordinates.length * 0.25),
    Math.floor(routeCoordinates.length * 0.5),
    Math.floor(routeCoordinates.length * 0.75),
  ];
  
  // Try each sample point until we find POIs
  for (const index of sampleIndices) {
    const searchPoint = routeCoordinates[index];
    
    let url = `${PLACES_URL}?location=${searchPoint.latitude},${searchPoint.longitude}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
    
    if (mapping.keyword) {
      url += `&keyword=${encodeURIComponent(mapping.keyword)}`;
    }
    
    if (mapping.type) {
      url += `&type=${mapping.type}`;
    }
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      // Found POIs at this point, use the first one
      const place = data.results[0];
      
      return {
        name: place.name,
        vicinity: place.vicinity || place.formatted_address || 'Unknown location',
        rating: place.rating,
        location: {
          latitude: place.geometry.location.lat,
          longitude: place.geometry.location.lng,
        },
      };
    }
  }
  
  // If no POIs found at any sample point
  throw new Error(`No ${interest} POIs found along the route. Try a different interest or area.`);
}

/**
 * Fetch detour route with POI as waypoint
 */
async function fetchDetourRoute(
  start: Location | string,
  end: Location | string,
  waypoint: Location
) {
  const origin = typeof start === 'string' ? encodeURIComponent(start) : `${start.latitude},${start.longitude}`;
  const destination = typeof end === 'string' ? encodeURIComponent(end) : `${end.latitude},${end.longitude}`;
  const waypointStr = `${waypoint.latitude},${waypoint.longitude}`;
  
  const url = `${DIRECTIONS_URL}?origin=${origin}&destination=${destination}&waypoints=${waypointStr}&key=${GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
    throw new Error('No detour route found with the selected POI');
  }
  
  return data.routes[0];
}

/**
 * Validate lat/lng input format
 */
export function parseLatLng(input: string): Location | null {
  const trimmed = input.trim();
  const parts = trimmed.split(',');
  
  if (parts.length !== 2) return null;
  
  const latitude = parseFloat(parts[0].trim());
  const longitude = parseFloat(parts[1].trim());
  
  if (isNaN(latitude) || isNaN(longitude)) return null;
  if (latitude < -90 || latitude > 90) return null;
  if (longitude < -180 || longitude > 180) return null;
  
  return { latitude, longitude };
}

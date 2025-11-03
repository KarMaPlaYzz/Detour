import { DetourRoute, Interest, InterestMapping, Location } from '@/types/detour';
import Constants from 'expo-constants';
import { decode } from './PolylineDecoder';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || 
                            Constants.manifest?.extra?.GOOGLE_MAPS_API_KEY;

const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';
const PLACES_URL = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json';
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const PLACE_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

// Interest mapping to Google Places types and keywords
const interestMapping: Record<Interest, InterestMapping> = {
  'Street Art': { type: 'tourist_attraction', keyword: 'street art|mural' },
  'Architecture': { type: 'tourist_attraction', keyword: 'architecture|building' },
  'Cafes': { type: 'cafe', keyword: 'cafe|coffee' },
};

/**
 * Check if a place is likely a building/indoor venue vs an open area
 * Filters out plazas, parks, and other open spaces that don't have a clear destination
 */
function isActualBuilding(types?: string[]): boolean {
  if (!types || types.length === 0) return true; // Assume building if no type info

  // Types that indicate open areas/outdoor spaces
  const openAreaTypes = new Set([
    'plaza',
    'park',
    'natural_feature',
    'route',
    'locality',
    'political',
    'administrative_area_level_1',
    'administrative_area_level_2',
    'administrative_area_level_3',
    'administrative_area_level_4',
    'administrative_area_level_5',
    'country',
    'postal_code',
    'sublocality',
    'sublocality_level_1',
    'sublocality_level_2',
    'intersection',
    'premise',
  ]);

  // Types that indicate actual buildings/indoor venues (high priority)
  const buildingTypes = new Set([
    'cafe',
    'restaurant',
    'bar',
    'museum',
    'art_gallery',
    'tourist_attraction',
    'shopping_mall',
    'store',
    'library',
    'church',
    'mosque',
    'synagogue',
    'temple',
    'movie_theater',
    'amusement_park',
    'zoo',
    'aquarium',
    'bowling_alley',
    'casino',
    'lodging',
    'hostel',
    'hotel',
    'spa',
    'gym',
    'bank',
    'post_office',
    'pharmacy',
    'hospital',
    'doctor',
    'night_club',
    'book_store',
    'clothing_store',
    'gas_station',
    'parking',
  ]);

  // Check if it has a building type
  const hasBuilding = types.some(t => buildingTypes.has(t));
  if (hasBuilding) return true;

  // Check if it has an open area type (and no building type)
  const hasOpenArea = types.some(t => openAreaTypes.has(t));
  if (hasOpenArea) return false;

  // Default to true if unclear
  return true;
}

export interface GetBasicRouteParams {
  start: Location | string;
  end: Location | string;
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}

export interface GetDetourRouteParams {
  start: Location | string;
  end: Location | string;
  interest: Interest;
  radius?: number;
}

export interface SearchPOIsParams {
  coordinates: Location[];
  interest: Interest;
  radius?: number;
}

/**
 * Convert coordinates to a human-readable address
 */
export async function reverseGeocodeLocation(location: Location): Promise<string | null> {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const url = `${GEOCODING_URL}?latlng=${location.latitude},${location.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.results && data.results.length > 0) {
      // Return the first result which is the most specific address
      return data.results[0].formatted_address;
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}

/**
 * Convert a location (address string or coordinates) to coordinates
 */
async function geocodeLocation(location: Location | string): Promise<Location | null> {
  // If already coordinates, return as is
  if (typeof location === 'object' && 'latitude' in location && 'longitude' in location) {
    return location;
  }

  // If it's a string that looks like coordinates
  if (typeof location === 'string') {
    const latLng = parseLatLng(location);
    if (latLng) {
      return latLng;
    }

    // Otherwise geocode the address
    const address = encodeURIComponent(location);
    const url = `${GEOCODING_URL}?address=${address}&key=${GOOGLE_MAPS_API_KEY}`;
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        const result = data.results[0];
        return {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  return null;
}

/**
 * Get a basic route without searching for POIs
 * This is the initial search that shows the route and markers
 */
export async function getBasicRoute({
  start,
  end,
  mode = 'driving',
}: GetBasicRouteParams): Promise<Omit<DetourRoute, 'poi' | 'pois' | 'interest'>> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured. Please check your .env file.');
  }

  try {
    // Convert start/end to coordinates if they're addresses
    const startCoords = await geocodeLocation(start);
    const endCoords = await geocodeLocation(end);
    
    if (!startCoords) {
      throw new Error(`Could not find location: "${typeof start === 'string' ? start : 'Current Location'}". Try entering a more specific address.`);
    }
    if (!endCoords) {
      throw new Error(`Could not find location: "${typeof end === 'string' ? end : 'Current Location'}". Try entering a more specific address.`);
    }

    // Get direct route for the selected transportation mode
    const directRoute = await fetchDirectRoute(startCoords, endCoords, mode);
    
    // Validate route has legs
    if (!directRoute.legs || directRoute.legs.length === 0) {
      throw new Error('Direct route has no legs');
    }
    if (!directRoute.legs[0].start_location || !directRoute.legs[0].end_location) {
      throw new Error('Direct route missing start or end location');
    }
    
    // Extract actual start/end coordinates from the route
    const startLocation = {
      latitude: directRoute.legs[0].start_location.lat,
      longitude: directRoute.legs[0].start_location.lng,
    };
    const endLocation = {
      latitude: directRoute.legs[0].end_location.lat,
      longitude: directRoute.legs[0].end_location.lng,
    };
    
    // Decode the route to get actual path points
    const coordinates = decode(directRoute.overview_polyline.points);
    
    // Fetch durations for all transportation modes
    const { durations, durationsWithTraffic } = await fetchDurationsForAllModes(startCoords, endCoords);
    
    return {
      coordinates,
      encodedPolyline: directRoute.overview_polyline.points,
      markers: [
        {
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
          title: 'Start',
          description: 'Starting point',
        },
        {
          latitude: endLocation.latitude,
          longitude: endLocation.longitude,
          title: 'End',
          description: 'Destination',
        },
      ],
      durations,
      durationsWithTraffic,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate route');
  }
}

/**
 * Discover available POI types/categories along a route
 * Samples the route and collects all unique POI types found
 */
export async function discoverPOITypes(
  coordinates: Location[],
  radius: number = 800
): Promise<{ [key: string]: string }> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured. Please check your .env file.');
  }

  try {
    // Sample points along the route
    const samplePoints: Location[] = [];
    const step = Math.max(1, Math.floor(coordinates.length / 6)); // Sample 6 points
    
    for (let i = 0; i < coordinates.length; i += step) {
      samplePoints.push(coordinates[i]);
    }
    
    if (samplePoints[samplePoints.length - 1] !== coordinates[coordinates.length - 1]) {
      samplePoints.push(coordinates[coordinates.length - 1]);
    }

    // Whitelist of tourist-friendly POI types
    const touristPOIWhitelist = new Set([
      'tourist_attraction', 'art_gallery', 'museum', 'amusement_park', 'zoo',
      'aquarium', 'monument', 'historic', 'church', 'mosque', 'synagogue',
      'temple', 'park', 'natural_feature', 'water', 'beach', 'mountain',
      'lake', 'forest', 'garden', 'botanical_garden', 'stadium', 'spa',
      'cafe', 'restaurant', 'bakery', 'bar', 'coffee', 'ice_cream_shop',
      'night_club', 'movie_theater', 'bowling_alley', 'casino', 'lodging',
      'hostel', 'shopping_mall', 'book_store', 'clothing_store', 'library',
      'street_art', 'mural', 'graffiti', 'city_hall', 'courthouse',
      'airport', 'train_station', 'bus_station', 'subway_station', 'taxi_stand',
      'gym', 'bank', 'post_office', 'pharmacy', 'hospital', 'doctor', 'supermarket'
    ]);

    // Exclude administrative/confusing types
    const excludeTypes = new Set([
      'sublocality', 'sublocality_level_1', 'sublocality_level_2',
      'administrative_area_level_1', 'administrative_area_level_2',
      'administrative_area_level_3', 'administrative_area_level_4',
      'administrative_area_level_5', 'country', 'postal_code',
      'plus_code', 'point_of_interest', 'establishment', 'premise',
    ]);

    // Collect all unique POI types
    const poiTypesMap = new Map<string, number>(); // type -> count

    for (const searchPoint of samplePoints) {
      const url = `${PLACES_URL}?location=${searchPoint.latitude},${searchPoint.longitude}&radius=${radius}&key=${GOOGLE_MAPS_API_KEY}`;
      
      try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status === 'OK' && data.results && data.results.length > 0) {
          for (const place of data.results) {
            if (place.types && Array.isArray(place.types)) {
              for (const type of place.types) {
                // Only include whitelisted tourist POI types
                if (touristPOIWhitelist.has(type)) {
                  poiTypesMap.set(type, (poiTypesMap.get(type) || 0) + 1);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching POI types at sample point:', error);
      }
    }

    // Convert to user-friendly format
    // Define priority for interesting POI types (higher = more interesting for tourists)
    const poiPriority: Record<string, number> = {
      'tourist_attraction': 100,
      'art_gallery': 95,
      'museum': 95,
      'street_art': 90,
      'mural': 90,
      'monument': 90,
      'historic': 85,
      'amusement_park': 85,
      'zoo': 85,
      'aquarium': 85,
      'church': 80,
      'temple': 80,
      'mosque': 80,
      'synagogue': 80,
      'park': 75,
      'natural_feature': 75,
      'beach': 75,
      'mountain': 75,
      'garden': 75,
      'night_club': 70,
      'restaurant': 65,
      'cafe': 60,
      'bar': 60,
      'coffee': 55,
      'movie_theater': 55,
      'bowling_alley': 50,
      'casino': 50,
      'shopping_mall': 45,
      'spa': 40,
      'gym': 30,
      'bank': 20,
      'pharmacy': 15,
      'hospital': 10,
    };

    // Sort by interest priority first, then by frequency
    const sortedTypes = Array.from(poiTypesMap.entries())
      .sort((a, b) => {
        const priorityA = poiPriority[a[0]] || 0;
        const priorityB = poiPriority[b[0]] || 0;
        
        // If priorities differ significantly, use priority
        if (Math.abs(priorityA - priorityB) > 10) {
          return priorityB - priorityA;
        }
        
        // Otherwise, use frequency as tiebreaker
        return b[1] - a[1];
      })
      .slice(0, 10); // Limit to top 10 types

    const result: { [key: string]: string } = {};
    sortedTypes.forEach(([type]) => {
      result[type] = formatPOIType(type);
    });

    return result;
  } catch (error) {
    console.error('Error discovering POI types:', error);
    return {};
  }
}

/**
 * Format Google Places API types to user-friendly display names (English only)
 */
function formatPOIType(type: string): string {
  // English translations for common POI types
  const translations: Record<string, string> = {
    // Attractions & Entertainment
    'tourist_attraction': 'Tourist Attractions',
    'amusement_park': 'Amusement Parks',
    'aquarium': 'Aquariums',
    'art_gallery': 'Art Galleries',
    'museum': 'Museums',
    'movie_theater': 'Movie Theaters',
    'zoo': 'Zoos',
    'casino': 'Casinos',
    'bowling_alley': 'Bowling Alleys',
    'night_club': 'Night Clubs',
    'bar': 'Bars',
    'stadium': 'Stadiums',
    'spa': 'Spas',
    
    // Food & Dining
    'cafe': 'Cafés',
    'restaurant': 'Restaurants',
    'bakery': 'Bakeries',
    'bar_supply_store': 'Bar Supplies',
    'food': 'Food',
    'meal_delivery': 'Food Delivery',
    'meal_takeaway': 'Takeaway',
    'ice_cream_shop': 'Ice Cream',
    'coffee': 'Coffee Shops',
    'fast_food': 'Fast Food',
    
    // Lodging
    'lodging': 'Hotels',
    'hostel': 'Hostels',
    'campground': 'Campgrounds',
    
    // Shopping
    'shopping_mall': 'Shopping Malls',
    'store': 'Stores',
    'book_store': 'Bookstores',
    'clothing_store': 'Clothing',
    'supermarket': 'Supermarkets',
    'general_contractor': 'Contractors',
    
    // Services
    'gas_station': 'Gas Stations',
    'parking': 'Parking',
    'car_rental': 'Car Rentals',
    'pharmacy': 'Pharmacies',
    'hospital': 'Hospitals',
    'doctor': 'Doctors',
    'bank': 'Banks',
    'atm': 'ATMs',
    'post_office': 'Post Offices',
    'library': 'Libraries',
    'gym': 'Gyms',
    
    // Culture & Architecture
    'church': 'Churches',
    'mosque': 'Mosques',
    'synagogue': 'Synagogues',
    'temple': 'Temples',
    'city_hall': 'City Halls',
    'courthouse': 'Courthouses',
    'cemetery': 'Cemeteries',
    'historic': 'Historic Sites',
    'architectural': 'Architecture',
    
    // Nature & Outdoors
    'park': 'Parks',
    'hiking': 'Hiking',
    'natural_feature': 'Natural Features',
    'water': 'Water Features',
    'mountain': 'Mountains',
    'lake': 'Lakes',
    'beach': 'Beaches',
    'forest': 'Forests',
    'garden': 'Gardens',
    'botanical_garden': 'Botanical Gardens',
    
    // Transportation
    'airport': 'Airports',
    'bus_station': 'Bus Stations',
    'train_station': 'Train Stations',
    'subway_station': 'Subway Stations',
    'taxi_stand': 'Taxi Stands',
    
    // Arts & Street Art
    'street_art': 'Street Art',
    'mural': 'Murals',
    'graffiti': 'Graffiti',
    'street_art_gallery': 'Street Art',
  };

  // Check if we have a translation
  if (translations[type]) {
    return translations[type];
  }

  // Fallback: Check if any key matches part of the type
  for (const [key, value] of Object.entries(translations)) {
    if (type.includes(key)) {
      return value;
    }
  }

  // Final fallback: Convert snake_case to Title Case
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Create a mapping for dynamic interests based on discovered POI types
 */
export function createDynamicInterestMapping(poiTypes: { [key: string]: string }): Record<string, InterestMapping> {
  const mapping: Record<string, InterestMapping> = {};
  
  for (const [type, displayName] of Object.entries(poiTypes)) {
    mapping[displayName] = { 
      type,
      keyword: type.replace(/_/g, '|'),
    };
  }
  
  return mapping;
}

/**
 * Search for POIs along a route based on selected interest
 */
export async function searchPOIsAlongRoute({
  coordinates,
  interest,
  radius = 2000,
}: SearchPOIsParams): Promise<{
  poi: any;
  pois: any[];
}> {
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured. Please check your .env file.');
  }

  try {
    const { bestPOI, allPOIs } = await findPOIAlongRoute(coordinates, interest, radius);

    return {
      poi: {
        ...bestPOI,
      },
      pois: allPOIs.slice(0, 8).map(p => ({
        ...p,
      })),
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to search for POIs');
  }
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
    // Convert start/end to coordinates if they're addresses
    const startCoords = await geocodeLocation(start);
    const endCoords = await geocodeLocation(end);
    
    if (!startCoords) {
      throw new Error(`Could not find location: "${typeof start === 'string' ? start : 'Current Location'}". Try entering a more specific address.`);
    }
    if (!endCoords) {
      throw new Error(`Could not find location: "${typeof end === 'string' ? end : 'Current Location'}". Try entering a more specific address.`);
    }

    // Step 1: Get direct route to calculate bounds
    const directRoute = await fetchDirectRoute(startCoords, endCoords);
    
    // Validate route has legs
    if (!directRoute.legs || directRoute.legs.length === 0) {
      throw new Error('Direct route has no legs');
    }
    if (!directRoute.legs[0].start_location || !directRoute.legs[0].end_location) {
      throw new Error('Direct route missing start or end location');
    }
    
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
    
    // Step 3: Find POIs along the actual route path
    const { bestPOI, allPOIs } = await findPOIAlongRoute(routeCoordinates, interest, radius);
    
    // Step 4: Use the direct route (not a detour through POI)
    // The POIs are just displayed as information, not as waypoints
    const coordinates = decode(directRoute.overview_polyline.points);
    
    return {
      coordinates,
      encodedPolyline: directRoute.overview_polyline.points,
      markers: [
        {
          latitude: startLocation.latitude,
          longitude: startLocation.longitude,
          title: 'Start',
          description: 'Starting point',
        },
        {
          latitude: endLocation.latitude,
          longitude: endLocation.longitude,
          title: 'End',
          description: 'Destination',
        },
      ],
      poi: {
        ...bestPOI,
      },
      pois: allPOIs.slice(0, 8).map(p => ({
        ...p,
      })),
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
async function fetchDirectRoute(
  start: Location | string,
  end: Location | string,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
) {
  const origin = typeof start === 'string' ? encodeURIComponent(start) : `${start.latitude},${start.longitude}`;
  const destination = typeof end === 'string' ? encodeURIComponent(end) : `${end.latitude},${end.longitude}`;
  
  const url = `${DIRECTIONS_URL}?origin=${origin}&destination=${destination}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
    throw new Error('No route found between start and end locations');
  }
  
  return data.routes[0];
}

/**
 * Fetch durations for all transportation modes, including traffic for driving
 */
async function fetchDurationsForAllModes(
  start: Location | string,
  end: Location | string
): Promise<{ 
  durations: { car?: number; walk?: number; bike?: number; transit?: number };
  durationsWithTraffic: { car?: number; walk?: number; bike?: number; transit?: number };
}> {
  const origin = typeof start === 'string' ? encodeURIComponent(start) : `${start.latitude},${start.longitude}`;
  const destination = typeof end === 'string' ? encodeURIComponent(end) : `${end.latitude},${end.longitude}`;
  
  const modes = ['driving', 'walking', 'bicycling', 'transit'];
  const modeMap = { driving: 'car', walking: 'walk', bicycling: 'bike', transit: 'transit' };
  const durations: Record<string, number> = {};
  const durationsWithTraffic: Record<string, number> = {};
  
  // Fetch all modes in parallel
  const promises = modes.map(async (mode) => {
    try {
      // For driving mode, include departure_time=now to get traffic data
      let url = `${DIRECTIONS_URL}?origin=${origin}&destination=${destination}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;
      if (mode === 'driving') {
        url += '&departure_time=now';
      }
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const leg = data.routes[0].legs?.[0];
        const modeKey = modeMap[mode as keyof typeof modeMap];
        
        // Regular duration
        const duration = leg?.duration?.value;
        if (duration !== undefined && duration > 0) {
          durations[modeKey] = duration;
        }
        
        // Duration with traffic (only available for driving)
        const durationWithTraffic = leg?.duration_in_traffic?.value;
        if (durationWithTraffic !== undefined && durationWithTraffic > 0) {
          durationsWithTraffic[modeKey] = durationWithTraffic;
        } else if (duration) {
          // Fallback to regular duration if traffic data not available
          durationsWithTraffic[modeKey] = duration;
        }
      } else {
        console.warn(`API status not OK for ${mode}:`, data.status, data.error_message);
      }
    } catch (error) {
      console.error(`Error fetching ${mode} duration:`, error);
    }
  });
  
  await Promise.all(promises);
  console.log('Fetched durations:', durations);
  console.log('Fetched durations with traffic:', durationsWithTraffic);
  return { durations, durationsWithTraffic };
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
  
  // Sample points along the ENTIRE route path - balanced sampling
  // Create sample points at regular intervals along the route
  const samplePoints: Location[] = [];
  const step = Math.max(1, Math.floor(routeCoordinates.length / 5)); // Sample 5 points (start, mid-points, end)
  
  for (let i = 0; i < routeCoordinates.length; i += step) {
    samplePoints.push(routeCoordinates[i]);
  }
  
  // Ensure we sample the end point
  if (samplePoints[samplePoints.length - 1] !== routeCoordinates[routeCoordinates.length - 1]) {
    samplePoints.push(routeCoordinates[routeCoordinates.length - 1]);
  }

  // First, collect ALL raw results from all sample points
  const rawPlaceMap = new Map<string, any>(); // Use placeId as key for deduplication
  
  // Try each sample point and collect POIs
  for (const searchPoint of samplePoints) {
    // Search in reasonable radius for POIs
    const searchRadius = Math.min(radius, 1000); // 1000m search radius
    
    let url = `${PLACES_URL}?location=${searchPoint.latitude},${searchPoint.longitude}&radius=${searchRadius}&key=${GOOGLE_MAPS_API_KEY}`;
    
    if (mapping.keyword) {
      url += `&keyword=${encodeURIComponent(mapping.keyword)}`;
    }
    
    if (mapping.type) {
      url += `&type=${mapping.type}`;
    }
    
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.results && data.results.length > 0) {
        // Collect all raw results, deduplicating by placeId
        for (const place of data.results) {
          if (place.place_id && !rawPlaceMap.has(place.place_id)) {
            rawPlaceMap.set(place.place_id, place);
          }
        }
      }
    } catch (error) {
      console.error('Error searching for POI:', error);
    }
  }
  
  // NOW filter the deduplicated results
  const allPOIs: Array<{
    [key: string]: any;
    name: string;
    location: Location;
    distanceToRoute: number;
  }> = [];

  for (const place of rawPlaceMap.values()) {
    const poiLocation = {
      latitude: place.geometry.location.lat,
      longitude: place.geometry.location.lng,
    };
    
    // Find the closest point on the route to this POI
    const distanceToRoute = getClosestDistanceToRoute(poiLocation, routeCoordinates);
    
    // Check if it's an actual building
    const isBuilding = isActualBuilding(place.types);
    
    // Check if POI is within the logical bounding box of the route
    const isWithinRouteBounds = isPoiWithinRouteBounds(poiLocation, routeCoordinates);
    
    // Only keep POIs that are: 1) close (≤200m), 2) actual buildings, 3) within bounds
    if (distanceToRoute <= 200 && isBuilding && isWithinRouteBounds) {
      const poiData: {
        [key: string]: any;
        name: string;
        location: Location;
        distanceToRoute: number;
      } = {
        name: place.name,
        location: poiLocation,
        distanceToRoute,
        vicinity: place.vicinity || place.formatted_address,
        rating: place.rating,
        types: place.types,
        placeId: place.place_id,
        photos: place.photos,
        openingHours: place.opening_hours,
        businessStatus: place.business_status,
        formattedAddress: place.formatted_address,
        geometry: place.geometry,
        plusCode: place.plus_code,
        ...place,
      };
      allPOIs.push(poiData);
    } else if (distanceToRoute > 200) {
      console.log(`[findPOIAlongRoute] ℹ️ Filtered: "${place.name}" - too far (${Math.round(distanceToRoute)}m)`);
    } else if (!isBuilding) {
      console.log(`[findPOIAlongRoute] ⛔ Filtered: "${place.name}" - open area`);
    } else if (!isWithinRouteBounds) {
      console.log(`[findPOIAlongRoute] 🔴 Filtered: "${place.name}" - outside bounds`);
    }
  }
  
  if (allPOIs.length === 0) {
    throw new Error(`No ${interest} POIs found along the route. Try a different interest or area.`);
  }
  
  console.log(`[findPOIAlongRoute] ✅ Found ${allPOIs.length} valid POIs (filtered out open areas/plazas)`);
  
  // Remove duplicates by checking if POI already exists in array
  const uniquePOIs: typeof allPOIs = [];
  const seenNames = new Set<string>();
  
  for (const poi of allPOIs) {
    if (!seenNames.has(poi.name)) {
      seenNames.add(poi.name);
      uniquePOIs.push(poi);
    }
  }
  
  // Fetch detailed information for all POIs with rate limiting
  // Process in batches of 3 with small delays to respect API quotas
  const enhancedPOIs: typeof allPOIs = [];
  const batchSize = 3;
  const delayMs = 100;
  
  for (let i = 0; i < uniquePOIs.length; i += batchSize) {
    const batch = uniquePOIs.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (poi) => {
        if (poi.placeId) {
          try {
            const details = await fetchPlaceDetails(poi.placeId);
            if (details) {
              console.log('Merging details for:', poi.name, {
                hasOpeningHours: !!details.opening_hours,
                hasFormattedAddress: !!details.formatted_address,
              });
              
              // Convert opening_hours snake_case to camelCase for consistency
              let openingHours = details.opening_hours || poi.opening_hours;
              if (openingHours && openingHours.weekday_text) {
                openingHours = {
                  ...openingHours,
                  weekdayText: openingHours.weekday_text,
                };
              }
              
              return {
                ...poi,
                opening_hours: openingHours,
                openingHours: openingHours,
                formattedAddress: details.formatted_address || poi.formattedAddress,
                business_status: details.business_status || poi.business_status,
                businessStatus: details.business_status || poi.businessStatus,
                rating: details.rating || poi.rating,
                user_ratings_total: details.user_ratings_total || poi.user_ratings_total,
              };
            }
          } catch (error) {
            console.warn(`Failed to fetch details for ${poi.name}:`, error);
          }
        }
        return poi;
      })
    );
    
    enhancedPOIs.push(...batchResults);
    
    // Add delay between batches (except after the last batch)
    if (i + batchSize < uniquePOIs.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  // Sort by distance to route and rating
  enhancedPOIs.sort((a, b) => {
    const distDiff = a.distanceToRoute - b.distanceToRoute;
    if (distDiff !== 0) return distDiff;
    return (b.rating || 0) - (a.rating || 0);
  });
  
  const bestPOI = enhancedPOIs[0];
  
  return {
    bestPOI: {
      ...bestPOI,
    },
    allPOIs: enhancedPOIs.map(p => ({
      ...p,
    })),
  };
}

/**
 * Fetch detailed information for a place including opening hours
 */
async function fetchPlaceDetails(placeId: string): Promise<any> {
  if (!GOOGLE_MAPS_API_KEY) {
    return null;
  }

  try {
    const url = `${PLACE_DETAILS_URL}?place_id=${placeId}&fields=opening_hours,formatted_address,business_status,rating,user_ratings_total,types,photos&key=${GOOGLE_MAPS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'OK' && data.result) {
      console.log('Place Details API Response:', {
        placeId,
        opening_hours: data.result.opening_hours,
        formatted_address: data.result.formatted_address,
      });
      return data.result;
    } else {
      console.warn('Place Details API error:', data.status, data.error_message);
    }
  } catch (error) {
    console.error('Error fetching place details:', error);
  }
  
  return null;
}

/**
 * Check if a POI is within the logical bounds of the route
 * This prevents POIs that are technically within 200m but far off to the side
 */
function isPoiWithinRouteBounds(poi: Location, routeCoordinates: Location[]): boolean {
  if (routeCoordinates.length < 2) return true;
  
  const start = routeCoordinates[0];
  const end = routeCoordinates[routeCoordinates.length - 1];
  
  // Calculate the bounding box with minimal margin
  // ~0.002 degrees ≈ 200 meters at equator
  const latMin = Math.min(start.latitude, end.latitude) - 0.002;
  const latMax = Math.max(start.latitude, end.latitude) + 0.002;
  const lonMin = Math.min(start.longitude, end.longitude) - 0.002;
  const lonMax = Math.max(start.longitude, end.longitude) + 0.002;
  
  // Check if POI is within the bounding box (with strict bounds)
  const isWithinBounds = poi.latitude >= latMin && 
         poi.latitude <= latMax && 
         poi.longitude >= lonMin && 
         poi.longitude <= lonMax;

  if (!isWithinBounds) {
    console.log(`[isPoiWithinRouteBounds] POI outside bounds: lat=${poi.latitude.toFixed(4)} (${latMin.toFixed(4)}-${latMax.toFixed(4)}), lon=${poi.longitude.toFixed(4)} (${lonMin.toFixed(4)}-${lonMax.toFixed(4)})`);
  }
  
  return isWithinBounds;
}

/**
 * Calculate the shortest distance from a point to a polyline (route)
 * Returns distance in meters
 */
function getClosestDistanceToRoute(point: Location, routeCoordinates: Location[]): number {
  let minDistance = Infinity;
  
  for (let i = 0; i < routeCoordinates.length - 1; i++) {
    const segment = [routeCoordinates[i], routeCoordinates[i + 1]];
    const distance = distanceFromPointToSegment(point, segment[0], segment[1]);
    minDistance = Math.min(minDistance, distance);
  }
  
  return minDistance;
}

/**
 * Calculate perpendicular distance from a point to a line segment
 * Returns distance in meters
 */
function distanceFromPointToSegment(point: Location, segStart: Location, segEnd: Location): number {
  const R = 6371000; // Earth's radius in meters
  
  // Convert to radians
  const lat1 = toRad(segStart.latitude);
  const lon1 = toRad(segStart.longitude);
  const lat2 = toRad(segEnd.latitude);
  const lon2 = toRad(segEnd.longitude);
  const lat3 = toRad(point.latitude);
  const lon3 = toRad(point.longitude);
  
  // Calculate distance using haversine formula
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distAB = R * c;
  
  const dLat3 = lat3 - lat1;
  const dLon3 = lon3 - lon1;
  
  const a3 = Math.sin(dLat3 / 2) * Math.sin(dLat3 / 2) +
             Math.cos(lat1) * Math.cos(lat3) *
             Math.sin(dLon3 / 2) * Math.sin(dLon3 / 2);
  
  const c3 = 2 * Math.atan2(Math.sqrt(a3), Math.sqrt(1 - a3));
  const distAP = R * c3;
  
  // Calculate cross-track distance
  const dXt = Math.asin(Math.sin(distAP / R) * Math.sin(toRad(bearing(segStart, point)) - toRad(bearing(segStart, segEnd)))) * R;
  
  return Math.abs(dXt);
}

function toRad(degree: number): number {
  return degree * (Math.PI / 180);
}

function bearing(start: Location, end: Location): number {
  const lat1 = toRad(start.latitude);
  const lon1 = toRad(start.longitude);
  const lat2 = toRad(end.latitude);
  const lon2 = toRad(end.longitude);
  
  const dLon = lon2 - lon1;
  const y = Math.sin(dLon) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) -
            Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
  
  return Math.atan2(y, x) * (180 / Math.PI);
}

/**
 * Fetch detour route with POI as waypoint
 */
async function fetchDetourRoute(
  start: Location | string,
  end: Location | string,
  waypoint: Location,
  mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
) {
  const origin = typeof start === 'string' ? encodeURIComponent(start) : `${start.latitude},${start.longitude}`;
  const destination = typeof end === 'string' ? encodeURIComponent(end) : `${end.latitude},${end.longitude}`;
  const waypointStr = `${waypoint.latitude},${waypoint.longitude}`;
  
  const url = `${DIRECTIONS_URL}?origin=${origin}&destination=${destination}&waypoints=${waypointStr}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
    throw new Error('No detour route found with the selected POI');
  }
  
  return data.routes[0];
}

/**
 * Calculate the great-circle distance between two coordinates in meters
 * Uses haversine formula for accurate distance calculation
 */
function calculateDistance(loc1: Location, loc2: Location): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(loc1.latitude)) *
      Math.cos(toRad(loc2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Get the closest point on the direct route to a given location
 * Returns the distance from location to the closest point on the route
 */
function getClosestPointOnRoute(location: Location, routeCoordinates: Location[]): { index: number; distance: number } {
  let minDistance = Infinity;
  let closestIndex = 0;

  for (let i = 0; i < routeCoordinates.length; i++) {
    const distance = calculateDistance(location, routeCoordinates[i]);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = i;
    }
  }

  return { index: closestIndex, distance: minDistance };
}

/**
 * Optimize the order of multiple POIs to minimize detour distance
 * Uses a greedy nearest-neighbor approach with consideration for the direct route path
 * Ensures POIs are visited in a logical order that doesn't backtrack unnecessarily
 */
function optimizePOIOrder(pois: Array<{ location: Location; name: string }>, routeCoordinates: Location[]): Array<{ location: Location; name: string; routeIndex: number }> {
  console.log(`[optimizePOIOrder] ▼ Input: [${pois.map(p => p.name).join(', ')}], route: ${routeCoordinates.length} pts`);
  
  if (pois.length <= 1) {
    const result = pois.map(poi => ({
      ...poi,
      routeIndex: getClosestPointOnRoute(poi.location, routeCoordinates).index,
    }));
    console.log(`[optimizePOIOrder] ▲ Single/none, returning as-is`);
    return result;
  }

  // Calculate position of each POI on the direct route (0 = start, 1 = end)
  const poiWithRouteIndex = pois.map(poi => {
    const { index, distance } = getClosestPointOnRoute(poi.location, routeCoordinates);
    return {
      ...poi,
      routeIndex: index,
    };
  });

  // Sort POIs by their position on the direct route
  // This ensures we visit them in the order they appear along the path
  const sortedPOIs = poiWithRouteIndex.sort((a, b) => a.routeIndex - b.routeIndex);
  
  console.log(`[optimizePOIOrder] ▲ Sorted: [${sortedPOIs.map(p => p.name).join(' → ')}]`);
  return sortedPOIs;
}

/**
 * Generate a detour route with a specific POI as waypoint
 * Shows the user what the route looks like if they stop at this POI
 * Respects the selected transport mode
 */
export async function generateDetourWithPOI({
  start,
  end,
  poi,
  mode = 'walking',
}: {
  start: Location | string;
  end: Location | string;
  poi: { location: Location; name: string };
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}): Promise<{
  coordinates: Location[];
  encodedPolyline: string;
  markers: any[];
  extraDistance: number;
  extraTime: number;
  directDistance: number;
  directTime: number;
}> {
  console.log(`[generateDetourWithPOI] ▼ POI: "${poi.name}", mode: ${mode}`);
  
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  try {
    // Step 1: Get the direct route (no detour)
    console.log(`[generateDetourWithPOI] Step 1: Fetching direct route...`);
    const directRoute = await fetchDirectRoute(start, end, mode);
    
    if (!directRoute.legs || directRoute.legs.length === 0) {
      throw new Error('Direct route has no legs');
    }
    
    if (!directRoute.legs[0].distance || !directRoute.legs[0].duration) {
      throw new Error('Direct route missing distance or duration data');
    }
    
    const directDistance = directRoute.legs[0].distance.value;
    const directTime = directRoute.legs[0].duration.value;
    console.log(`[generateDetourWithPOI] Direct: ${directDistance}m, ${directTime}s`);

    // Step 2: Get the detour route (through POI)
    console.log(`[generateDetourWithPOI] Step 2: Fetching detour route via POI at ${poi.location.latitude.toFixed(4)},${poi.location.longitude.toFixed(4)}...`);
    const detourRoute = await fetchDetourRoute(start, end, poi.location, mode);
    
    if (!detourRoute.legs || detourRoute.legs.length === 0) {
      throw new Error('Detour route has no legs');
    }
    
    const detourDistance = detourRoute.legs.reduce(
      (sum: number, leg: any) => {
        if (!leg.distance || !leg.distance.value) {
          console.warn('[generateDetourWithPOI] Warning: leg missing distance value', leg);
          return sum;
        }
        return sum + leg.distance.value;
      },
      0
    );
    const detourTime = detourRoute.legs.reduce(
      (sum: number, leg: any) => {
        if (!leg.duration || !leg.duration.value) {
          console.warn('[generateDetourWithPOI] Warning: leg missing duration value', leg);
          return sum;
        }
        return sum + leg.duration.value;
      },
      0
    );
    console.log(`[generateDetourWithPOI] Detour: ${detourDistance}m, ${detourTime}s (+${detourDistance - directDistance}m, +${Math.round((detourTime - directTime) / 60)}min)`);

    // Step 3: Log route legs for debugging
    console.log(`[generateDetourWithPOI] Route has ${detourRoute.legs.length} legs:`);
    detourRoute.legs.forEach((leg: any, idx: number) => {
      console.log(`  Leg ${idx}: ${leg.start_address} → ${leg.end_address}: ${leg.distance?.value || 0}m`);
    });

    // Step 4: Decode the detour polyline
    if (!detourRoute.overview_polyline || !detourRoute.overview_polyline.points) {
      throw new Error('Detour route missing polyline data');
    }
    
    const coordinates = decode(detourRoute.overview_polyline.points);
    console.log(`[generateDetourWithPOI] Decoded polyline: ${coordinates.length} points`);

    // Step 5: Build markers array
    if (!detourRoute.legs[0].start_location || !detourRoute.legs[detourRoute.legs.length - 1].end_location) {
      throw new Error('Detour route missing start or end location');
    }
    
    const markers = [
      {
        latitude:
          detourRoute.legs[0].start_location.lat,
        longitude:
          detourRoute.legs[0].start_location.lng,
        title: 'Start',
        description: 'Starting point',
      },
      {
        latitude: poi.location.latitude,
        longitude: poi.location.longitude,
        title: poi.name,
        description: 'Stop here',
      },
      {
        latitude:
          detourRoute.legs[detourRoute.legs.length - 1].end_location.lat,
        longitude:
          detourRoute.legs[detourRoute.legs.length - 1].end_location.lng,
        title: 'End',
        description: 'Destination',
      },
    ];

    console.log(`[generateDetourWithPOI] ▲ COMPLETE - markers:`, markers.map((m, i) => `[${i}] ${m.title}: ${m.latitude.toFixed(4)},${m.longitude.toFixed(4)}`));
    
    return {
      coordinates,
      encodedPolyline: detourRoute.overview_polyline.points,
      markers,
      extraDistance: detourDistance - directDistance,
      extraTime: detourTime - directTime,
      directDistance,
      directTime,
    };
  } catch (error) {
    console.error('Error generating detour with POI:', error);
    throw error;
  }
}

/**
 * Generate an optimized detour route with multiple POIs
 * Automatically orders POIs based on their position along the direct route
 * to minimize backtracking and create a logical journey
 * 
 * Example: If start is north and end is south, and POI1 is north and POI2 is in between,
 * the route will be: start → POI1 → POI2 → end (NOT start → POI2 → POI1 → end)
 */
export async function generateDetourWithMultiplePOIs({
  start,
  end,
  pois,
  mode = 'walking',
}: {
  start: Location | string;
  end: Location | string;
  pois: Array<{ location: Location; name: string }>;
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit';
}): Promise<{
  coordinates: Location[];
  encodedPolyline: string;
  markers: any[];
  extraDistance: number;
  extraTime: number;
  directDistance: number;
  directTime: number;
  visitOrder: Array<{ location: Location; name: string }>;
}> {
  console.log(`[generateDetourWithMultiplePOIs] ▼ POIs: [${pois.map(p => p.name).join(', ')}], mode: ${mode}`);
  
  if (!GOOGLE_MAPS_API_KEY) {
    throw new Error('Google Maps API key is not configured');
  }

  if (!pois || pois.length === 0) {
    throw new Error('At least one POI is required');
  }

  try {
    // Step 1: Get the direct route to understand the path
    console.log(`[generateDetourWithMultiplePOIs] Step 1: Direct route...`);
    const directRoute = await fetchDirectRoute(start, end, mode);
    
    // Validate direct route
    if (!directRoute.legs || directRoute.legs.length === 0) {
      throw new Error('Direct route has no legs');
    }
    if (!directRoute.legs[0].distance || !directRoute.legs[0].duration) {
      throw new Error('Direct route missing distance or duration data');
    }
    
    const directDistance = directRoute.legs[0].distance.value;
    const directTime = directRoute.legs[0].duration.value;
    
    // Decode the direct route to get route coordinates
    const directRouteCoordinates = decode(directRoute.overview_polyline.points);
    console.log(`[generateDetourWithMultiplePOIs] Direct: ${directDistance}m, ${directTime}s, ${directRouteCoordinates.length} pts`);

    // Step 2: Optimize the order of POIs based on their position on the direct route
    console.log(`[generateDetourWithMultiplePOIs] Step 2: Optimizing...`);
    const optimizedPOIs = optimizePOIOrder(pois, directRouteCoordinates);

    // Step 3: Build waypoints string with POIs in optimized order
    const waypointLocations = optimizedPOIs.map(poi => {
      const lat = typeof poi.location.latitude === 'number' ? poi.location.latitude.toString() : poi.location.latitude;
      const lon = typeof poi.location.longitude === 'number' ? poi.location.longitude.toString() : poi.location.longitude;
      console.log(`[generateDetourWithMultiplePOIs] POI "${poi.name}": ${lat},${lon}`);
      return `${lat},${lon}`;
    }).join('|');
    console.log(`[generateDetourWithMultiplePOIs] Waypoints: ${waypointLocations}`);

    // Step 4: Get the detour route with all waypoints in optimal order
    console.log(`[generateDetourWithMultiplePOIs] Step 3: Fetching optimized route...`);
    const origin = typeof start === 'string' ? encodeURIComponent(start) : `${(start as Location).latitude},${(start as Location).longitude}`;
    const destination = typeof end === 'string' ? encodeURIComponent(end) : `${(end as Location).latitude},${(end as Location).longitude}`;
    
    console.log(`[generateDetourWithMultiplePOIs] Start (origin): ${origin}`);
    console.log(`[generateDetourWithMultiplePOIs] End (dest): ${destination}`);
    
    const url = `${DIRECTIONS_URL}?origin=${origin}&destination=${destination}&waypoints=${waypointLocations}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;
    console.log(`[generateDetourWithMultiplePOIs] URL: ${url.substring(0, 150)}...`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status !== 'OK' || !data.routes || data.routes.length === 0) {
      console.error(`[generateDetourWithMultiplePOIs] API Error:`, data);
      throw new Error('Could not generate optimized route with all POIs');
    }
    
    const detourRoute = data.routes[0];
    
    // Validate detour route
    if (!detourRoute.legs || detourRoute.legs.length === 0) {
      throw new Error('Detour route has no legs');
    }
    
    // Log all legs for debugging
    console.log(`[generateDetourWithMultiplePOIs] Route has ${detourRoute.legs.length} legs:`);
    detourRoute.legs.forEach((leg: any, idx: number) => {
      const distance = leg.distance?.value || 0;
      console.log(`  Leg ${idx}: ${leg.start_address} → ${leg.end_address}: ${distance}m`);
    });
    
    const detourDistance = detourRoute.legs.reduce(
      (sum: number, leg: any) => {
        if (!leg.distance || !leg.distance.value) {
          console.warn('[generateDetourWithMultiplePOIs] Warning: leg missing distance value', leg);
          return sum;
        }
        return sum + leg.distance.value;
      },
      0
    );
    const detourTime = detourRoute.legs.reduce(
      (sum: number, leg: any) => {
        if (!leg.duration || !leg.duration.value) {
          console.warn('[generateDetourWithMultiplePOIs] Warning: leg missing duration value', leg);
          return sum;
        }
        return sum + leg.duration.value;
      },
      0
    );
    console.log(`[generateDetourWithMultiplePOIs] Optimized: ${detourDistance}m, ${detourTime}s (+${detourDistance - directDistance}m, +${Math.round((detourTime - directTime) / 60)}min)`);

    // Step 5: Decode the optimized detour polyline
    if (!detourRoute.overview_polyline || !detourRoute.overview_polyline.points) {
      throw new Error('Detour route missing polyline data');
    }
    const coordinates = decode(detourRoute.overview_polyline.points);

    // Step 6: Build markers array with start, POIs in order, and end
    if (!detourRoute.legs[0].start_location || !detourRoute.legs[detourRoute.legs.length - 1].end_location) {
      throw new Error('Detour route missing start or end location');
    }
    
    const markers = [
      {
        latitude: detourRoute.legs[0].start_location.lat,
        longitude: detourRoute.legs[0].start_location.lng,
        title: 'Start',
        description: 'Starting point',
      },
      ...optimizedPOIs.map((poi, index) => ({
        latitude: poi.location.latitude,
        longitude: poi.location.longitude,
        title: poi.name,
        description: `Stop ${index + 1} of ${optimizedPOIs.length}`,
      })),
      {
        latitude: detourRoute.legs[detourRoute.legs.length - 1].end_location.lat,
        longitude: detourRoute.legs[detourRoute.legs.length - 1].end_location.lng,
        title: 'End',
        description: 'Destination',
      },
    ];

    console.log(`[generateDetourWithMultiplePOIs] ▲ COMPLETE - visit order: [${optimizedPOIs.map(p => p.name).join(' → ')}]`);
    return {
      coordinates,
      encodedPolyline: detourRoute.overview_polyline.points,
      markers,
      extraDistance: detourDistance - directDistance,
      extraTime: detourTime - directTime,
      directDistance,
      directTime,
      visitOrder: optimizedPOIs,
    };
  } catch (error) {
    console.error(`[generateDetourWithMultiplePOIs] ✗ ERROR:`, error);
    throw error;
  }
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

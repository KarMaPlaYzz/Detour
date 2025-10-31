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
    const durations = await fetchDurationsForAllModes(startCoords, endCoords);
    
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
 * Fetch durations for all transportation modes
 */
async function fetchDurationsForAllModes(
  start: Location | string,
  end: Location | string
): Promise<{ car?: number; walk?: number; bike?: number; transit?: number }> {
  const origin = typeof start === 'string' ? encodeURIComponent(start) : `${start.latitude},${start.longitude}`;
  const destination = typeof end === 'string' ? encodeURIComponent(end) : `${end.latitude},${end.longitude}`;
  
  const modes = ['driving', 'walking', 'bicycling', 'transit'];
  const modeMap = { driving: 'car', walking: 'walk', bicycling: 'bike', transit: 'transit' };
  const durations: Record<string, number> = {};
  
  // Fetch all modes in parallel
  const promises = modes.map(async (mode) => {
    try {
      const url = `${DIRECTIONS_URL}?origin=${origin}&destination=${destination}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.status === 'OK' && data.routes && data.routes.length > 0) {
        const duration = data.routes[0].legs?.[0]?.duration?.value;
        if (duration !== undefined && duration > 0) {
          durations[modeMap[mode as keyof typeof modeMap]] = duration;
        } else {
          console.warn(`No valid duration for ${mode}:`, data.routes[0].legs?.[0]?.duration);
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
  return durations;
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
  
  // Sample points along the ENTIRE route path - dense sampling for better coverage
  // Create sample points at regular intervals along the route
  const samplePoints: Location[] = [];
  const step = Math.max(1, Math.floor(routeCoordinates.length / 8)); // Sample 8+ points
  
  for (let i = 0; i < routeCoordinates.length; i += step) {
    samplePoints.push(routeCoordinates[i]);
  }
  
  // Ensure we sample the end point
  if (samplePoints[samplePoints.length - 1] !== routeCoordinates[routeCoordinates.length - 1]) {
    samplePoints.push(routeCoordinates[routeCoordinates.length - 1]);
  }
  
  const allPOIs: Array<{
    [key: string]: any;
    name: string;
    location: Location;
    distanceToRoute: number;
  }> = [];

  // Try each sample point and collect POIs
  for (const searchPoint of samplePoints) {
    // For close routes, search in smaller radius. For longer routes, use more reasonable radius
    const searchRadius = Math.min(radius, 800); // Much smaller search radius - 800m max
    
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
        // Calculate distance from each POI to the route
        for (const place of data.results) {
          const poiLocation = {
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
          };
          
          // Find the closest point on the route to this POI
          const distanceToRoute = getClosestDistanceToRoute(poiLocation, routeCoordinates);
          
          // Only keep POIs that are VERY close to the route (within 300m)
          if (distanceToRoute <= 300) {
            // Dynamically capture all available fields from the API response
            const poiData: {
              [key: string]: any;
              name: string;
              location: Location;
              distanceToRoute: number;
            } = {
              name: place.name,
              location: poiLocation,
              distanceToRoute,
              // Capture all available fields from the place object
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
              // Include any additional fields that might be present
              ...place,
            };
            allPOIs.push(poiData);
          }
        }
      }
    } catch (error) {
      console.error('Error searching for POI:', error);
    }
  }
  
  if (allPOIs.length === 0) {
    throw new Error(`No ${interest} POIs found along the route. Try a different interest or area.`);
  }
  
  // Remove duplicates by checking if POI already exists in array
  const uniquePOIs: typeof allPOIs = [];
  const seenNames = new Set<string>();
  
  for (const poi of allPOIs) {
    if (!seenNames.has(poi.name)) {
      seenNames.add(poi.name);
      uniquePOIs.push(poi);
    }
  }
  
  // Fetch detailed information for top POIs to get opening hours and other details
  const enhancedPOIs = await Promise.all(
    uniquePOIs.slice(0, 10).map(async (poi) => {
      if (poi.placeId) {
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
      }
      return poi;
    })
  );
  
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

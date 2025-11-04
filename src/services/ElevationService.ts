/**
 * Elevation Service
 * Calculates elevation data for routes and provides visualization info
 */

import { Location } from '@/types/detour';
import Constants from 'expo-constants';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || 
                            Constants.manifest?.extra?.GOOGLE_MAPS_API_KEY;

const ELEVATION_API_URL = 'https://maps.googleapis.com/maps/api/elevation/json';

export interface ElevationPoint {
  latitude: number;
  longitude: number;
  elevation: number; // in meters
  elevationFt: number; // in feet
}

export interface ElevationProfile {
  points: ElevationPoint[];
  minElevation: number;
  maxElevation: number;
  elevationGain: number; // total uphill
  elevationLoss: number; // total downhill
  difficulty: 'easy' | 'moderate' | 'challenging';
}

/**
 * Fetch elevation data from Google Elevation API
 * Note: API has a limit of 512 locations per request
 */
export async function fetchElevationData(
  coordinates: Location[]
): Promise<ElevationPoint[]> {
  if (!GOOGLE_MAPS_API_KEY || coordinates.length === 0) {
    console.warn('No API key or coordinates for elevation data');
    return [];
  }

  try {
    // Sample coordinates if we have too many (max 512 per request)
    let sampled = coordinates;
    if (coordinates.length > 512) {
      const step = Math.ceil(coordinates.length / 512);
      sampled = coordinates.filter((_, i) => i % step === 0);
    }

    // Format locations for API
    const locations = sampled
      .map(coord => `${coord.latitude},${coord.longitude}`)
      .join('|');

    const url = `${ELEVATION_API_URL}?locations=${locations}&key=${GOOGLE_MAPS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return data.results.map((result: any) => ({
        latitude: result.location.lat,
        longitude: result.location.lng,
        elevation: result.elevation,
        elevationFt: result.elevation * 3.28084,
      }));
    } else {
      console.error('Elevation API error:', data.error_message);
      return [];
    }
  } catch (error) {
    console.error('Error fetching elevation data:', error);
    return [];
  }
}

/**
 * Calculate elevation profile from elevation points
 */
export function calculateElevationProfile(
  elevationPoints: ElevationPoint[]
): ElevationProfile {
  if (elevationPoints.length === 0) {
    return {
      points: [],
      minElevation: 0,
      maxElevation: 0,
      elevationGain: 0,
      elevationLoss: 0,
      difficulty: 'easy',
    };
  }

  let elevationGain = 0;
  let elevationLoss = 0;
  let minElevation = elevationPoints[0].elevation;
  let maxElevation = elevationPoints[0].elevation;

  for (let i = 1; i < elevationPoints.length; i++) {
    const current = elevationPoints[i].elevation;
    const previous = elevationPoints[i - 1].elevation;
    const diff = current - previous;

    if (diff > 0) {
      elevationGain += diff;
    } else {
      elevationLoss += Math.abs(diff);
    }

    minElevation = Math.min(minElevation, current);
    maxElevation = Math.max(maxElevation, current);
  }

  // Determine difficulty based on total elevation gain
  let difficulty: 'easy' | 'moderate' | 'challenging' = 'easy';
  if (elevationGain > 100) difficulty = 'moderate';
  if (elevationGain > 300) difficulty = 'challenging';

  return {
    points: elevationPoints,
    minElevation,
    maxElevation,
    elevationGain,
    elevationLoss,
    difficulty,
  };
}

/**
 * Get color for elevation based on intensity
 * Green (low) -> Yellow -> Orange -> Red (high)
 */
export function getElevationColor(
  elevation: number,
  minElevation: number,
  maxElevation: number
): string {
  const range = maxElevation - minElevation;
  if (range === 0) return '#0099FF';

  const normalized = (elevation - minElevation) / range;

  if (normalized < 0.25) return '#0099FF'; // Blue - flat
  if (normalized < 0.5) return '#66BB6A'; // Green - slight uphill
  if (normalized < 0.75) return '#FFB627'; // Orange - moderate uphill
  return '#FF6B6B'; // Red - steep uphill
}

/**
 * Calculate slope percentage between two points
 */
export function calculateSlope(
  point1: ElevationPoint,
  point2: ElevationPoint,
  distanceMeters: number
): number {
  if (distanceMeters === 0) return 0;

  const elevationDiff = point2.elevation - point1.elevation;
  const slopePercent = (elevationDiff / distanceMeters) * 100;

  return Math.abs(slopePercent);
}

/**
 * Interpolate elevation data to match original coordinates
 * Since we sample coordinates for API, we need to interpolate back
 */
export function interpolateElevation(
  originalCoordinates: Location[],
  elevationPoints: ElevationPoint[]
): ElevationPoint[] {
  if (elevationPoints.length === 0) {
    return originalCoordinates.map(coord => ({
      ...coord,
      elevation: 0,
      elevationFt: 0,
    }));
  }

  // If we have enough elevation points, use them directly
  if (elevationPoints.length >= originalCoordinates.length * 0.8) {
    return elevationPoints;
  }

  // Otherwise, interpolate between points
  const result: ElevationPoint[] = [];

  for (const coord of originalCoordinates) {
    // Find closest elevation point
    let closestPoint = elevationPoints[0];
    let minDistance = Infinity;

    for (const elevPoint of elevationPoints) {
      const distance =
        Math.pow(elevPoint.latitude - coord.latitude, 2) +
        Math.pow(elevPoint.longitude - coord.longitude, 2);

      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = elevPoint;
      }
    }

    result.push({
      latitude: coord.latitude,
      longitude: coord.longitude,
      elevation: closestPoint.elevation,
      elevationFt: closestPoint.elevationFt,
    });
  }

  return result;
}

/**
 * Format elevation gain/loss for display
 */
export function formatElevation(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Get difficulty description
 */
export function getDifficultyDescription(difficulty: 'easy' | 'moderate' | 'challenging'): string {
  switch (difficulty) {
    case 'easy':
      return 'Easy - Mostly flat';
    case 'moderate':
      return 'Moderate - Some hills';
    case 'challenging':
      return 'Challenging - Steep sections';
  }
}

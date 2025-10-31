import { Location } from '@/types/detour';

/**
 * Calculate the turn angle (in degrees) at a point
 * Returns 0° for straight ahead, 90° for right angle, 180° for U-turn
 */
function calculateTurnAngle(p0: Location, p1: Location, p2: Location): number {
  // Vector from p1 to p0 (incoming direction)
  const incoming = {
    lat: p0.latitude - p1.latitude,
    lng: p0.longitude - p1.longitude,
  };

  // Vector from p1 to p2 (outgoing direction)
  const outgoing = {
    lat: p2.latitude - p1.latitude,
    lng: p2.longitude - p1.longitude,
  };

  // Normalize vectors
  const incomingMag = Math.sqrt(incoming.lat * incoming.lat + incoming.lng * incoming.lng);
  const outgoingMag = Math.sqrt(outgoing.lat * outgoing.lat + outgoing.lng * outgoing.lng);

  if (incomingMag === 0 || outgoingMag === 0) return 0; // No turn

  const incomingNorm = {
    lat: incoming.lat / incomingMag,
    lng: incoming.lng / incomingMag,
  };

  const outgoingNorm = {
    lat: outgoing.lat / outgoingMag,
    lng: outgoing.lng / outgoingMag,
  };

  // Dot product of normalized vectors
  const dotProduct = incomingNorm.lat * outgoingNorm.lat + incomingNorm.lng * outgoingNorm.lng;
  
  // Angle between vectors (0° = straight, 180° = U-turn)
  const angleRad = Math.acos(Math.max(-1, Math.min(1, dotProduct)));
  const angleDeg = (angleRad * 180) / Math.PI;

  // Convert to turn angle (0° = straight, 90° = right angle, 180° = U-turn)
  return 180 - angleDeg;
}

/**
 * Smooth only sharp corners in a polyline while preserving road accuracy
 * Uses local spline interpolation only at the corner point itself
 * 
 * @param coordinates - Array of lat/lng coordinates
 * @param cornerThreshold - Turn angle threshold for smoothing in degrees (ignored, smooths all turns > 20°)
 * @param interpolationPoints - Number of points to interpolate at each corner (default 5)
 * @returns Smoothed coordinates array
 */
export function smoothSharpCorners(
  coordinates: Location[],
  cornerThreshold: number = 0,
  interpolationPoints: number = 5
): Location[] {
  if (coordinates.length < 3) {
    return coordinates;
  }

  const result: Location[] = [coordinates[0]];

  for (let i = 1; i < coordinates.length - 1; i++) {
    const p0 = coordinates[i - 1];
    const p1 = coordinates[i]; // Current corner point
    const p2 = coordinates[i + 1];

    // Calculate turn angle at this point
    const turnAngle = calculateTurnAngle(p0, p1, p2);

    // If this is a sharp corner (>20° turn), interpolate smoothly around the corner
    if (turnAngle > 20) {
      // Instead of interpolating across the whole segment,
      // create smooth points that approach and leave the corner point
      // This keeps the route on the road while smoothing the turn
      
      const range = 1 / (interpolationPoints + 1); // Points between p0 and p1, and p1 and p2
      
      // Interpolate points approaching the corner (from p0 towards p1)
      for (let t = range; t < 1; t += range) {
        const smoothPoint = catmullRomInterpolate(p0, p0, p1, p2, t);
        result.push(smoothPoint);
      }
      
      // Add the corner point itself
      result.push(p1);
      
      // Interpolate points leaving the corner (from p1 towards p2)
      for (let t = range; t < 1; t += range) {
        const smoothPoint = catmullRomInterpolate(p0, p1, p2, p2, t);
        result.push(smoothPoint);
      }
    } else {
      // For gentle curves, just add the point as-is
      result.push(p1);
    }
  }

  // Add the last point
  result.push(coordinates[coordinates.length - 1]);

  return result;
}

/**
 * Catmull-Rom spline interpolation at parameter t (0 to 1)
 * Generates a smooth curve through four control points
 */
function catmullRomInterpolate(
  p0: Location,
  p1: Location,
  p2: Location,
  p3: Location,
  t: number
): Location {
  // Catmull-Rom matrix coefficients
  const t2 = t * t;
  const t3 = t2 * t;

  // Basis functions for Catmull-Rom
  const q0 = -0.5 * t3 + t2 - 0.5 * t;
  const q1 = 1.5 * t3 - 2.5 * t2 + 1;
  const q2 = -1.5 * t3 + 2 * t2 + 0.5 * t;
  const q3 = 0.5 * t3 - 0.5 * t2;

  // Interpolate latitude and longitude separately
  const latitude =
    q0 * p0.latitude + q1 * p1.latitude + q2 * p2.latitude + q3 * p3.latitude;
  const longitude =
    q0 * p0.longitude + q1 * p1.longitude + q2 * p2.longitude + q3 * p3.longitude;

  return { latitude, longitude };
}

/**
 * Alternative: Douglas-Peucker line simplification followed by smoothing
 * This reduces the number of points while maintaining accuracy
 * Useful for very long routes with many points
 * 
 * @param coordinates - Array of coordinates to simplify
 * @param tolerance - Tolerance in degrees (smaller = more detailed, ~0.0002 is imperceptible)
 * @returns Simplified coordinates
 */
export function simplifyPolyline(coordinates: Location[], tolerance: number = 0.00005): Location[] {
  if (coordinates.length < 3) {
    return coordinates;
  }

  // Find the point with the maximum distance from the line segment
  let maxDistance = 0;
  let maxIndex = 0;

  const firstPoint = coordinates[0];
  const lastPoint = coordinates[coordinates.length - 1];

  for (let i = 1; i < coordinates.length - 1; i++) {
    const distance = perpendicularDistance(coordinates[i], firstPoint, lastPoint);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }

  // If max distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    const leftSegment = simplifyPolyline(coordinates.slice(0, maxIndex + 1), tolerance);
    const rightSegment = simplifyPolyline(coordinates.slice(maxIndex), tolerance);
    // Concatenate, but avoid duplicate at the split point
    return leftSegment.slice(0, -1).concat(rightSegment);
  } else {
    return [firstPoint, lastPoint];
  }
}

/**
 * Calculate perpendicular distance from a point to a line segment
 */
function perpendicularDistance(point: Location, lineStart: Location, lineEnd: Location): number {
  const { latitude: px, longitude: py } = point;
  const { latitude: x1, longitude: y1 } = lineStart;
  const { latitude: x2, longitude: y2 } = lineEnd;

  if (x1 === x2 && y1 === y2) {
    return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  }

  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / ((x2 - x1) ** 2 + (y2 - y1) ** 2);
  t = Math.max(0, Math.min(1, t));

  const closestX = x1 + t * (x2 - x1);
  const closestY = y1 + t * (y2 - y1);

  return Math.sqrt((px - closestX) ** 2 + (py - closestY) ** 2);
}

/**
 * Combined smoothing approach: simplify + smooth sharp corners only
 * 
 * @param coordinates - Original coordinates
 * @param shouldSimplify - Whether to simplify first (default: true for routes > 500 points)
 * @param simplifyTolerance - Tolerance for simplification
 * @param cornerThreshold - Angle threshold for corner smoothing (default 60°)
 * @returns Smoothed coordinates
 */
export function optimizePolyline(
  coordinates: Location[],
  shouldSimplify: boolean = coordinates.length > 500,
  simplifyTolerance: number = 0.0001,
  cornerThreshold: number = 60
): Location[] {
  let processed = coordinates;

  // Step 1: Simplify if needed (reduces computation)
  if (shouldSimplify) {
    processed = simplifyPolyline(processed, simplifyTolerance);
  }

  // Step 2: Apply corner smoothing only
  processed = smoothSharpCorners(processed, cornerThreshold);

  return processed;
}

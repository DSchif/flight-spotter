import { Location } from '../types';

// Convert degrees to radians
const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

// Convert radians to degrees
const toDegrees = (radians: number): number => radians * (180 / Math.PI);

/**
 * Calculate the distance between two points using Haversine formula
 * @returns distance in kilometers
 */
export const calculateDistance = (point1: Location, point2: Location): number => {
  const R = 6371; // Earth's radius in km
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
    Math.cos(toRadians(point2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Calculate the bearing from point1 to point2
 * @returns bearing in degrees (0-360, where 0 is north)
 */
export const calculateBearing = (point1: Location, point2: Location): number => {
  const dLon = toRadians(point2.longitude - point1.longitude);
  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  const bearing = toDegrees(Math.atan2(y, x));

  // Normalize to 0-360
  return (bearing + 360) % 360;
};

/**
 * Check if a bearing is within the view cone defined by left and right bearings
 */
export const isInViewCone = (bearing: number, leftBearing: number, rightBearing: number): boolean => {
  // Normalize all bearings to 0-360
  const normalize = (b: number) => ((b % 360) + 360) % 360;

  bearing = normalize(bearing);
  leftBearing = normalize(leftBearing);
  rightBearing = normalize(rightBearing);

  // If the view cone crosses the 0/360 boundary
  if (leftBearing > rightBearing) {
    return bearing >= leftBearing || bearing <= rightBearing;
  }

  // Normal case
  return bearing >= leftBearing && bearing <= rightBearing;
};

/**
 * Format distance for display
 */
export const formatDistance = (km: number): string => {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
};

/**
 * Format altitude for display
 */
export const formatAltitude = (meters: number | null): string => {
  if (meters === null) return 'N/A';
  const feet = Math.round(meters * 3.28084);
  return `${feet.toLocaleString()}ft`;
};

/**
 * Format speed for display
 */
export const formatSpeed = (metersPerSecond: number | null): string => {
  if (metersPerSecond === null) return 'N/A';
  const knots = Math.round(metersPerSecond * 1.94384);
  return `${knots} kts`;
};

import { Aircraft, Location } from '../types';

const OPENSKY_API_BASE = 'https://opensky-network.org/api';

// Cache for route information to avoid repeated API calls
const routeCache = new Map<string, { origin: string | null; destination: string | null }>();

/**
 * Fetch aircraft data from OpenSky Network API
 * Using the bounding box query to get aircraft in a specific area
 */
export const fetchAircraftInArea = async (
  center: Location,
  radiusKm: number
): Promise<Aircraft[]> => {
  try {
    // Calculate bounding box (approximate, using simple lat/lon)
    const latDelta = radiusKm / 111; // roughly 111km per degree of latitude
    const lonDelta = radiusKm / (111 * Math.cos(center.latitude * Math.PI / 180));

    const lamin = center.latitude - latDelta;
    const lamax = center.latitude + latDelta;
    const lomin = center.longitude - lonDelta;
    const lomax = center.longitude + lonDelta;

    const url = `${OPENSKY_API_BASE}/states/all?lamin=${lamin}&lomin=${lomin}&lamax=${lamax}&lomax=${lomax}`;

    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        console.warn('OpenSky API rate limit exceeded. Please wait before next request.');
        return []; // Return empty array instead of throwing
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.states) {
      return [];
    }

    // Map the array response to our Aircraft type
    return data.states.map((state: any[]): Aircraft => ({
      icao24: state[0],
      callsign: state[1]?.trim() || null,
      originCountry: state[2],
      timePosition: state[3],
      lastContact: state[4],
      longitude: state[5],
      latitude: state[6],
      baroAltitude: state[7],
      onGround: state[8],
      velocity: state[9],
      trueTrack: state[10],
      verticalRate: state[11],
      geoAltitude: state[13],
      squawk: state[14],
      spi: state[15],
      positionSource: state[16],
    })).filter((aircraft: Aircraft) =>
      aircraft.latitude !== null && aircraft.longitude !== null
    );
  } catch (error) {
    console.error('Error fetching aircraft data:', error);
    return [];
  }
};

/**
 * Fetch route information for a specific callsign
 * OpenSky API provides route data separately
 */
export const fetchRouteInfo = async (callsign: string): Promise<{ origin: string | null; destination: string | null }> => {
  // Check cache first
  if (routeCache.has(callsign)) {
    return routeCache.get(callsign)!;
  }

  try {
    const cleanCallsign = callsign.trim();
    // Use local proxy to avoid CORS issues
    const url = `/api/routes/${cleanCallsign}`;

    const response = await fetch(url).catch(() => null);

    if (!response || !response.ok) {
      // Cache null result to avoid repeated failed requests
      const nullResult = { origin: null, destination: null };
      routeCache.set(callsign, nullResult);
      return nullResult;
    }

    const data = await response.json();

    const result = {
      origin: data.route && data.route.length > 0 ? data.route[0] : null,
      destination: data.route && data.route.length > 1 ? data.route[data.route.length - 1] : null,
    };

    // Cache the result
    routeCache.set(callsign, result);

    return result;
  } catch (error) {
    // Silently fail - route data is optional
    const nullResult = { origin: null, destination: null };
    routeCache.set(callsign, nullResult);
    return nullResult;
  }
};

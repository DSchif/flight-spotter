import { useState, useEffect, useCallback } from 'react';
import { Aircraft, ViewConfig, VisibleAircraft } from '../types';
import { fetchAircraftInArea } from '../utils/api';
import { calculateDistance, calculateBearing, isInViewCone } from '../utils/geo';

const POLL_INTERVAL = 10000; // 10 seconds

export const useFlightData = (viewConfig: ViewConfig | null) => {
  const [aircraft, setAircraft] = useState<VisibleAircraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filterAndEnrichAircraft = useCallback(
    (rawAircraft: Aircraft[], config: ViewConfig): VisibleAircraft[] => {
      return rawAircraft
        .map((ac) => {
          if (ac.latitude === null || ac.longitude === null) return null;

          const distance = calculateDistance(config.location, {
            latitude: ac.latitude,
            longitude: ac.longitude,
          });

          const bearing = calculateBearing(config.location, {
            latitude: ac.latitude,
            longitude: ac.longitude,
          });

          return {
            ...ac,
            distance,
            bearing,
          };
        })
        .filter((ac): ac is VisibleAircraft => ac !== null)
        .filter((ac) => {
          // Filter by distance
          if (ac.distance > viewConfig.maxDistance) return false;

          // Filter by view cone
          if (!isInViewCone(ac.bearing, config.leftBearing, config.rightBearing)) {
            return false;
          }

          return true;
        })
        .sort((a, b) => a.distance - b.distance); // Sort by closest first
    },
    [viewConfig]
  );

  useEffect(() => {
    if (!viewConfig) {
      setAircraft([]);
      return;
    }

    let isMounted = true;
    let isFirstFetch = true;

    const fetchData = async () => {
      try {
        // Only show loading spinner on first fetch
        if (isFirstFetch) {
          setLoading(true);
        }
        setError(null);

        const rawAircraft = await fetchAircraftInArea(
          viewConfig.location,
          viewConfig.maxDistance
        );

        if (isMounted) {
          const visibleAircraft = filterAndEnrichAircraft(rawAircraft, viewConfig);
          setAircraft(visibleAircraft);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch aircraft data');
        }
      } finally {
        if (isMounted && isFirstFetch) {
          setLoading(false);
          isFirstFetch = false;
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up polling
    const interval = setInterval(fetchData, POLL_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [viewConfig, filterAndEnrichAircraft]);

  return { aircraft, loading, error };
};

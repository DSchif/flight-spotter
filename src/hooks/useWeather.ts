import { useState, useEffect } from 'react';
import { Location } from '../types';
import { WeatherData, fetchWeather } from '../utils/weather';

const WEATHER_UPDATE_INTERVAL = 300000; // 5 minutes

export const useWeather = (location: Location | null) => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!location) {
      setWeather(null);
      return;
    }

    let isMounted = true;

    const loadWeather = async () => {
      setLoading(true);
      const data = await fetchWeather(location);
      if (isMounted) {
        setWeather(data);
        setLoading(false);
      }
    };

    // Initial fetch
    loadWeather();

    // Update weather periodically
    const interval = setInterval(loadWeather, WEATHER_UPDATE_INTERVAL);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [location]);

  return { weather, loading };
};

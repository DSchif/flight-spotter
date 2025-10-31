import { Location } from '../types';

export interface WeatherData {
  temp: number; // Celsius
  condition: string;
  icon: string;
  description: string;
  humidity: number;
  windSpeed: number;
}

/**
 * Fetch weather data from Open-Meteo API (free, no API key required)
 * https://open-meteo.com/
 */
export const fetchWeather = async (location: Location): Promise<WeatherData | null> => {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Weather fetch failed');
    }

    const data = await response.json();

    if (!data.current) {
      return null;
    }

    const weatherCode = data.current.weather_code;
    const { condition, icon } = getWeatherInfo(weatherCode);

    return {
      temp: Math.round(data.current.temperature_2m),
      condition,
      icon,
      description: condition,
      humidity: data.current.relative_humidity_2m,
      windSpeed: Math.round(data.current.wind_speed_10m),
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
};

/**
 * Map WMO weather codes to conditions and icons
 * https://open-meteo.com/en/docs
 */
const getWeatherInfo = (code: number): { condition: string; icon: string } => {
  if (code === 0) return { condition: 'Clear', icon: '☀️' };
  if (code <= 3) return { condition: 'Partly Cloudy', icon: '⛅' };
  if (code <= 49) return { condition: 'Foggy', icon: '🌫️' };
  if (code <= 59) return { condition: 'Drizzle', icon: '🌦️' };
  if (code <= 69) return { condition: 'Rain', icon: '🌧️' };
  if (code <= 79) return { condition: 'Snow', icon: '❄️' };
  if (code <= 84) return { condition: 'Showers', icon: '🌦️' };
  if (code <= 99) return { condition: 'Thunderstorm', icon: '⛈️' };

  return { condition: 'Unknown', icon: '🌡️' };
};

/**
 * Format temperature for display
 */
export const formatTemperature = (temp: number): string => {
  return `${temp}°F`;
};

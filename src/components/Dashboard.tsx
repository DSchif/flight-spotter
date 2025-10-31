import { useEffect, useState } from 'react';
import { ViewConfig } from '../types';
import { useFlightData } from '../hooks/useFlightData';
import { useWeather } from '../hooks/useWeather';
import { formatTemperature } from '../utils/weather';
import AircraftCard from './AircraftCard';
import MapCard from './MapCard';

interface DashboardProps {
  viewConfig: ViewConfig;
  onReset: () => void;
}

const Dashboard = ({ viewConfig, onReset }: DashboardProps) => {
  const { aircraft, loading, error } = useFlightData(viewConfig);
  const { weather } = useWeather(viewConfig.location);
  const [prevAircraftIds, setPrevAircraftIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set(aircraft.map(ac => ac.icao24));
    setPrevAircraftIds(currentIds);
  }, [aircraft]);

  const getBearingName = (bearing: number): string => {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(bearing / 22.5) % 16;
    return directions[index];
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Flight Spotter</h1>
          <div className="view-info">
            <div className="info-item">
              <strong>Location:</strong> {viewConfig.location.latitude.toFixed(3)}, {viewConfig.location.longitude.toFixed(3)}
            </div>
            <div className="info-item">
              <strong>View:</strong> {getBearingName(viewConfig.leftBearing)} ({viewConfig.leftBearing}°)
              to {getBearingName(viewConfig.rightBearing)} ({viewConfig.rightBearing}°)
            </div>
            <div className="info-item">
              <strong>Range:</strong> {viewConfig.maxDistance}km
            </div>
          </div>
        </div>
        <div className="header-right">
          {weather && (
            <div className="weather-widget">
              <span className="weather-icon">{weather.icon}</span>
              <div className="weather-info">
                <div className="weather-temp">{formatTemperature(weather.temp)}</div>
                <div className="weather-condition">{weather.condition}</div>
              </div>
            </div>
          )}
          <button className="reset-button" onClick={onReset}>
            Reconfigure
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        {loading && aircraft.length === 0 && (
          <div className="status-message">
            <div className="spinner"></div>
            <p>Searching for aircraft...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>Error: {error}</p>
            <p>Note: OpenSky Network API has rate limits. Please wait a moment and try again.</p>
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="aircraft-grid">
              <MapCard viewConfig={viewConfig} aircraft={aircraft} />
              {aircraft.length === 0 ? (
                <div className="no-aircraft-message">
                  <p>No aircraft currently visible in your area.</p>
                  <p>Aircraft data updates every 10 seconds.</p>
                </div>
              ) : (
                aircraft.map((ac) => (
                  <AircraftCard key={ac.icao24} aircraft={ac} />
                ))
              )}
            </div>

            {aircraft.length > 0 && (
              <div className="aircraft-count">
                Tracking {aircraft.length} aircraft
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

import { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Circle, Polygon } from 'react-leaflet';
import { LatLng } from 'leaflet';
import { ViewConfig, Location } from '../types';
import 'leaflet/dist/leaflet.css';

interface SetupProps {
  onComplete: (config: ViewConfig) => void;
  initialConfig?: ViewConfig | null;
}

// Calculate a point at a given distance and bearing from origin
const calculatePoint = (origin: Location, bearing: number, distanceKm: number): [number, number] => {
  const R = 6371; // Earth radius in km
  const bearingRad = bearing * Math.PI / 180;
  const lat1 = origin.latitude * Math.PI / 180;
  const lon1 = origin.longitude * Math.PI / 180;

  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) +
    Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(bearingRad)
  );

  const lon2 = lon1 + Math.atan2(
    Math.sin(bearingRad) * Math.sin(distanceKm / R) * Math.cos(lat1),
    Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
  );

  return [lat2 * 180 / Math.PI, lon2 * 180 / Math.PI];
};

const MapClickHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const Setup = ({ onComplete, initialConfig }: SetupProps) => {
  const [location, setLocation] = useState<Location | null>(initialConfig?.location || null);
  const [leftBearing, setLeftBearing] = useState<number>(initialConfig?.leftBearing ?? 315); // NW
  const [rightBearing, setRightBearing] = useState<number>(initialConfig?.rightBearing ?? 45);  // NE
  const [maxDistance, setMaxDistance] = useState<number>(initialConfig?.maxDistance ?? 10);

  const handleLocationSelect = (lat: number, lng: number) => {
    setLocation({ latitude: lat, longitude: lng });
  };

  const handleSubmit = () => {
    if (!location) {
      alert('Please select a location on the map');
      return;
    }

    onComplete({
      location,
      leftBearing,
      rightBearing,
      maxDistance,
    });
  };

  // Calculate view cone polygon
  const getViewConePolygon = (): [number, number][] => {
    if (!location) return [];

    const points: [number, number][] = [
      [location.latitude, location.longitude]
    ];

    // Generate points along the arc
    let start = leftBearing;
    let end = rightBearing;

    // Handle wrap-around
    if (start > end) {
      end += 360;
    }

    const step = 5; // degrees
    for (let bearing = start; bearing <= end; bearing += step) {
      points.push(calculatePoint(location, bearing % 360, maxDistance));
    }

    // Add the final point
    points.push(calculatePoint(location, rightBearing, maxDistance));

    // Close the polygon
    points.push([location.latitude, location.longitude]);

    return points;
  };

  return (
    <div className="setup-container">
      <div className="setup-panel">
        <h1>Flight Spotter Setup</h1>

        <div className="setup-section">
          <h2>1. Select Your Location</h2>
          <p>Click on the map to set your viewing location</p>
          {location && (
            <div className="location-display">
              Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}
            </div>
          )}
        </div>

        <div className="setup-section">
          <h2>2. Set Vision Bounds</h2>
          <div className="input-group">
            <label>
              Left Bearing (degrees from North):
              <input
                type="number"
                min="0"
                max="360"
                value={leftBearing}
                onChange={(e) => setLeftBearing(Number(e.target.value))}
              />
              <input
                type="range"
                min="0"
                max="360"
                value={leftBearing}
                onChange={(e) => setLeftBearing(Number(e.target.value))}
              />
            </label>
          </div>

          <div className="input-group">
            <label>
              Right Bearing (degrees from North):
              <input
                type="number"
                min="0"
                max="360"
                value={rightBearing}
                onChange={(e) => setRightBearing(Number(e.target.value))}
              />
              <input
                type="range"
                min="0"
                max="360"
                value={rightBearing}
                onChange={(e) => setRightBearing(Number(e.target.value))}
              />
            </label>
          </div>
        </div>

        <div className="setup-section">
          <h2>3. Set Maximum Distance</h2>
          <div className="input-group">
            <label>
              Distance (kilometers):
              <input
                type="number"
                min="1"
                max="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
              />
              <input
                type="range"
                min="1"
                max="100"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
              />
            </label>
          </div>
        </div>

        <button className="start-button" onClick={handleSubmit}>
          Start Spotting
        </button>
      </div>

      <div className="map-container">
        <MapContainer
          center={location ? [location.latitude, location.longitude] : [40.7128, -74.0060]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onLocationSelect={handleLocationSelect} />
          {location && (
            <>
              <Marker position={[location.latitude, location.longitude]} />
              <Polygon
                positions={getViewConePolygon()}
                pathOptions={{ color: 'blue', fillColor: 'lightblue', fillOpacity: 0.3 }}
              />
            </>
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default Setup;

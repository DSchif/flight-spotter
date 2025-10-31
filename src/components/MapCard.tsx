import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polygon, useMap } from 'react-leaflet';
import { Icon, LatLngBounds } from 'leaflet';
import { ViewConfig, VisibleAircraft } from '../types';
import 'leaflet/dist/leaflet.css';

interface MapCardProps {
  viewConfig: ViewConfig;
  aircraft: VisibleAircraft[];
}

// Component to fix map size after mount
const MapSizeFixer = () => {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(timer);
  }, [map]);

  return null;
};

// Calculate a point at a given distance and bearing from origin
const calculatePoint = (origin: { latitude: number; longitude: number }, bearing: number, distanceKm: number): [number, number] => {
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

// Component to handle map bounds fitting
const MapBoundsFitter = ({ viewConePoints }: { viewConePoints: [number, number][] }) => {
  const map = useMap();

  useEffect(() => {
    if (viewConePoints.length > 0) {
      const bounds = new LatLngBounds(viewConePoints);
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [map, viewConePoints]);

  return null;
};

// Custom airplane icon
const createAirplaneIcon = (rotation: number) => {
  const svgIcon = `
    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(${rotation}deg);">
      <path fill="#667eea" d="M21,16v-2l-8-5V3.5C13,2.67,12.33,2,11.5,2S10,2.67,10,3.5V9l-8,5v2l8-2.5V19l-2,1.5V22l3.5-1l3.5,1v-1.5L13,19v-5.5L21,16z"/>
    </svg>
  `;

  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(svgIcon),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Observer icon
const observerIcon = new Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" fill="#e74c3c" stroke="white" stroke-width="2"/>
    </svg>
  `),
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const MapCard = ({ viewConfig, aircraft }: MapCardProps) => {
  // Calculate view cone polygon
  const getViewConePolygon = (): [number, number][] => {
    const points: [number, number][] = [
      [viewConfig.location.latitude, viewConfig.location.longitude]
    ];

    let start = viewConfig.leftBearing;
    let end = viewConfig.rightBearing;

    // Handle wrap-around
    if (start > end) {
      end += 360;
    }

    const step = 5; // degrees
    for (let bearing = start; bearing <= end; bearing += step) {
      points.push(calculatePoint(viewConfig.location, bearing % 360, viewConfig.maxDistance));
    }

    // Add the final point
    points.push(calculatePoint(viewConfig.location, viewConfig.rightBearing, viewConfig.maxDistance));

    // Close the polygon
    points.push([viewConfig.location.latitude, viewConfig.location.longitude]);

    return points;
  };

  const viewConePoints = getViewConePolygon();

  // Calculate center of viewing direction
  const getCenterBearing = () => {
    let left = viewConfig.leftBearing;
    let right = viewConfig.rightBearing;

    // Handle wrap-around (e.g., 350° to 10°)
    if (left > right) {
      right += 360;
    }

    const center = (left + right) / 2;
    return center % 360;
  };

  const centerBearing = getCenterBearing();
  const centerPoint = calculatePoint(viewConfig.location, centerBearing, viewConfig.maxDistance / 2);

  return (
    <div className="map-card">
      <div className="map-card-header">
        <h3>View Area</h3>
        <span className="aircraft-count-badge">{aircraft.length} aircraft</span>
      </div>
      <div className="map-card-container">
        <MapContainer
          center={centerPoint}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          zoomControl={false}
          dragging={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          touchZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapSizeFixer />
          <MapBoundsFitter viewConePoints={viewConePoints} />

          {/* View cone */}
          <Polygon
            positions={viewConePoints}
            pathOptions={{ color: '#667eea', fillColor: '#667eea', fillOpacity: 0.2, weight: 2 }}
          />

          {/* Observer location */}
          <Marker
            position={[viewConfig.location.latitude, viewConfig.location.longitude]}
            icon={observerIcon}
          />

          {/* Aircraft markers */}
          {aircraft.map((ac) => {
            if (ac.latitude === null || ac.longitude === null) return null;

            return (
              <Marker
                key={ac.icao24}
                position={[ac.latitude, ac.longitude]}
                icon={createAirplaneIcon(ac.trueTrack || 0)}
              />
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapCard;

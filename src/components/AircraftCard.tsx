import { useState, useEffect } from 'react';
import { VisibleAircraft } from '../types';
import { formatDistance, formatAltitude, formatSpeed } from '../utils/geo';
import { getAirlineFromCallsign, formatAirlineName, getAircraftPhotoUrl } from '../utils/airlines';

interface AircraftCardProps {
  aircraft: VisibleAircraft;
}

const AircraftCard = ({ aircraft }: AircraftCardProps) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(true);

  const isHelicopter = aircraft.velocity !== null && aircraft.velocity < 80; // Rough heuristic
  const airline = getAirlineFromCallsign(aircraft.callsign);

  useEffect(() => {
    let isMounted = true;

    const loadPhoto = async () => {
      setPhotoLoading(true);
      const url = await getAircraftPhotoUrl(aircraft.icao24);
      if (isMounted) {
        setPhotoUrl(url);
        setPhotoLoading(false);
      }
    };

    loadPhoto();

    return () => {
      isMounted = false;
    };
  }, [aircraft.icao24]);

  return (
    <div className="aircraft-card">
      {photoLoading ? (
        <div className="aircraft-photo-placeholder">
          <span>{isHelicopter ? '🚁' : '✈️'}</span>
        </div>
      ) : photoUrl ? (
        <div className="aircraft-photo">
          <img src={photoUrl} alt={`Aircraft ${aircraft.icao24}`} />
        </div>
      ) : (
        <div className="aircraft-photo-placeholder">
          <span>{isHelicopter ? '🚁' : '✈️'}</span>
        </div>
      )}

      <div className="aircraft-header">
        <div className="aircraft-callsign">
          {aircraft.callsign || aircraft.icao24.toUpperCase()}
        </div>
        {airline && (
          <div className="aircraft-airline">{formatAirlineName(airline)}</div>
        )}
      </div>

      <div className="aircraft-details">
        <div className="detail-row">
          <span className="detail-label">Distance:</span>
          <span className="detail-value">{formatDistance(aircraft.distance)}</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Bearing:</span>
          <span className="detail-value">{Math.round(aircraft.bearing)}°</span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Altitude:</span>
          <span className="detail-value">
            {formatAltitude(aircraft.geoAltitude ?? aircraft.baroAltitude)}
          </span>
        </div>

        <div className="detail-row">
          <span className="detail-label">Speed:</span>
          <span className="detail-value">{formatSpeed(aircraft.velocity)}</span>
        </div>

        {aircraft.trueTrack !== null && (
          <div className="detail-row">
            <span className="detail-label">Heading:</span>
            <span className="detail-value">{Math.round(aircraft.trueTrack)}°</span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">Country:</span>
          <span className="detail-value">{aircraft.originCountry}</span>
        </div>

        {aircraft.squawk && (
          <div className="detail-row">
            <span className="detail-label">Squawk:</span>
            <span className="detail-value">{aircraft.squawk}</span>
          </div>
        )}

        <div className="detail-row">
          <span className="detail-label">Status:</span>
          <span className="detail-value">{aircraft.onGround ? 'On Ground' : 'In Air'}</span>
        </div>
      </div>

      <div className="aircraft-footer">
        <span className="icao24">ICAO24: {aircraft.icao24.toUpperCase()}</span>
      </div>
    </div>
  );
};

export default AircraftCard;

export interface Location {
  latitude: number;
  longitude: number;
}

export interface ViewConfig {
  location: Location;
  leftBearing: number;  // degrees from north (0-360)
  rightBearing: number; // degrees from north (0-360)
  maxDistance: number;  // kilometers
}

export interface Aircraft {
  icao24: string;
  callsign: string | null;
  originCountry: string;
  timePosition: number | null;
  lastContact: number;
  longitude: number | null;
  latitude: number | null;
  baroAltitude: number | null;
  onGround: boolean;
  velocity: number | null;
  trueTrack: number | null;
  verticalRate: number | null;
  geoAltitude: number | null;
  squawk: string | null;
  spi: boolean;
  positionSource: number;
  origin?: string | null;
  destination?: string | null;
}

export interface VisibleAircraft extends Aircraft {
  distance: number; // km
  bearing: number;  // degrees from north
}

export enum AppState {
  SETUP = 'setup',
  DASHBOARD = 'dashboard'
}

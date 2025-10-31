# Flight Spotter

A real-time flight tracking application that shows aircraft and helicopters visible from your window.

## Features

- **Interactive Location Selection**: Click on a map to set your viewing location
- **Customizable View Cone**: Define your left and right vision bounds (bearing angles)
- **Distance Filtering**: Set a maximum distance to filter out aircraft too far to see
- **Real-time Tracking**: Aircraft cards appear when they enter your view and disappear when they leave
- **Interactive Map View**: First card shows a live map of your view area with aircraft positions and orientations
- **Aircraft Photos**: See actual photos of aircraft when available (via hexdb.io API)
- **Airline Information**: Automatically identifies and displays airline names based on callsigns
- **Weather Widget**: Real-time weather conditions displayed in the header with temperature and icon
- **Detailed Information**: View callsign, distance, bearing, altitude, speed, heading, country, and more
- **Automatic Updates**: Flight data refreshes every 10 seconds (no distracting loading spinner)
- **Persistent Configuration**: Your location and view settings are saved and automatically restored on refresh

## Technology Stack

- React 18 with TypeScript
- Vite for fast development
- Leaflet & React-Leaflet for interactive maps
- OpenSky Network API for real-time flight data
- Open-Meteo API for weather data
- hexdb.io API for aircraft photos

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

   **Note for WSL users**: If you encounter permission errors, use:
   ```bash
   npm install --no-bin-links
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Setup Phase**:
   - Click on the map to select your viewing location
   - Adjust the left and right bearing sliders to define your field of view
   - Set the maximum distance for aircraft visibility
   - Click "Start Spotting" to begin

2. **Dashboard Phase**:
   - View the interactive map card showing your view area and all visible aircraft
   - Watch as aircraft cards appear when they enter your viewing area
   - See aircraft photos, airline names, and detailed flight information
   - Monitor current weather conditions in the header
   - Cards automatically update as aircraft move (every 10 seconds)
   - Click "Reconfigure" to change your settings
   - Your configuration is automatically saved and will be restored when you refresh the page

## Data Sources

This application uses several free APIs:

- **[OpenSky Network API](https://opensky-network.org/)**: Real-time aircraft position data (updates every 10 seconds)
- **[Open-Meteo API](https://open-meteo.com/)**: Weather data (no API key required, updates every 5 minutes)
- **[hexdb.io](https://hexdb.io/)**: Aircraft photos by ICAO24 hex code

## Notes

- All APIs used are free and require no API keys
- The OpenSky Network API has rate limits (data updates every 10 seconds)
- Aircraft must be broadcasting ADS-B signals to be detected
- Not all aircraft will have complete information (some may lack callsigns, altitude, etc.)
- Aircraft photos may not be available for all aircraft
- Airline detection is based on ICAO callsign prefixes
- The helicopter detection is a simple heuristic based on velocity (<80 m/s)
- Weather data is in Fahrenheit and updates every 5 minutes

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## License

MIT

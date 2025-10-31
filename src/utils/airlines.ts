// Common airline ICAO codes and their names
const AIRLINE_DATABASE: Record<string, string> = {
  // North America
  'AAL': 'American Airlines',
  'UAL': 'United Airlines',
  'DAL': 'Delta Air Lines',
  'SWA': 'Southwest Airlines',
  'JBU': 'JetBlue Airways',
  'ASA': 'Alaska Airlines',
  'FFT': 'Frontier Airlines',
  'NKS': 'Spirit Airlines',
  'SKW': 'SkyWest Airlines',
  'ENY': 'Envoy Air',
  'RPA': 'Republic Airways',
  'CPZ': 'Compass Airlines',
  'JIA': 'PSA Airlines',
  'PDT': 'Piedmont Airlines',
  'TCF': 'Shuttle America',
  'ACA': 'Air Canada',
  'WJA': 'WestJet',

  // Europe
  'BAW': 'British Airways',
  'DLH': 'Lufthansa',
  'AFR': 'Air France',
  'KLM': 'KLM',
  'RYR': 'Ryanair',
  'EZY': 'easyJet',
  'IBE': 'Iberia',
  'AEE': 'Aegean Airlines',
  'SAS': 'Scandinavian Airlines',
  'FIN': 'Finnair',
  'SWR': 'Swiss International',
  'AUA': 'Austrian Airlines',
  'BEL': 'Brussels Airlines',
  'TAP': 'TAP Air Portugal',
  'EIN': 'Aer Lingus',
  'NAX': 'Norwegian Air',
  'WZZ': 'Wizz Air',
  'VOE': 'Volotea',

  // Asia Pacific
  'ANA': 'All Nippon Airways',
  'JAL': 'Japan Airlines',
  'CPA': 'Cathay Pacific',
  'SIA': 'Singapore Airlines',
  'THA': 'Thai Airways',
  'QFA': 'Qantas',
  'CSN': 'China Southern',
  'CES': 'China Eastern',
  'CCA': 'Air China',
  'KAL': 'Korean Air',
  'AAR': 'Asiana Airlines',
  'MAS': 'Malaysia Airlines',
  'GAR': 'Garuda Indonesia',
  'PAL': 'Philippine Airlines',
  'VNA': 'Vietnam Airlines',

  // Middle East
  'UAE': 'Emirates',
  'ETD': 'Etihad Airways',
  'QTR': 'Qatar Airways',
  'SVA': 'Saudi Arabian Airlines',
  'MEA': 'Middle East Airlines',
  'RJA': 'Royal Jordanian',
  'THY': 'Turkish Airlines',

  // South America
  'GLA': 'LATAM Airlines',
  'AZU': 'Azul Brazilian Airlines',
  'GLO': 'Gol Transportes Aéreos',
  'ARG': 'Aerolíneas Argentinas',
  'AVA': 'Avianca',
  'CMP': 'Copa Airlines',

  // Africa
  'SAA': 'South African Airways',
  'ETH': 'Ethiopian Airlines',
  'EGY': 'EgyptAir',
  'RAM': 'Royal Air Maroc',
  'KQA': 'Kenya Airways',

  // Cargo
  'FDX': 'FedEx',
  'UPS': 'UPS Airlines',
  'GTI': 'Atlas Air',
  'ABX': 'ABX Air',
  'CKS': 'Kalitta Air',

  // Low Cost
  'VRD': 'Virgin Atlantic',
  'JZA': 'Jet2.com',
  'EXS': 'Jet2',
};

/**
 * Extract airline code from callsign
 */
export const getAirlineFromCallsign = (callsign: string | null): string | null => {
  if (!callsign) return null;

  const cleaned = callsign.trim().toUpperCase();

  // Try to extract the airline code (usually first 3 letters)
  const airlineCode = cleaned.substring(0, 3);

  return AIRLINE_DATABASE[airlineCode] || null;
};

/**
 * Get aircraft photo URL from external API
 * Note: Many aircraft photo APIs have CORS restrictions
 */
export const getAircraftPhotoUrl = async (icao24: string): Promise<string | null> => {
  try {
    // Try using aircraft photo databases that support CORS
    // Using airport-data.com's aircraft database
    const response = await fetch(
      `https://api.planespotters.net/pub/photos/hex/${icao24.toUpperCase()}`,
      { mode: 'cors' }
    );

    if (response.ok) {
      const data = await response.json();
      if (data && data.photos && data.photos.length > 0) {
        return data.photos[0].thumbnail_large.src;
      }
    }
  } catch (error) {
    // Silently fail - CORS errors are expected for many aircraft photo APIs
    // Just show the placeholder instead
  }

  return null;
};

/**
 * Format airline name for display
 */
export const formatAirlineName = (airline: string | null): string => {
  return airline || 'Unknown Airline';
};

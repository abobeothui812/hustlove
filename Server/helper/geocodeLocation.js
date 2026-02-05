import { URLSearchParams } from 'url';

const OPENCAGE_ENDPOINT = 'https://api.opencagedata.com/geocode/v1/json';

const parseCoordinates = (geometry) => {
  if (!geometry || typeof geometry !== 'object') {
    return null;
  }

  const { lat, lng } = geometry;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    return null;
  }

  return [lng, lat];
};

export const geocodeLocation = async (query) => {
  if (!query || typeof query !== 'string') {
    return null;
  }

  const apiKey = process.env.OPENCAGE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const searchParams = new URLSearchParams({
    key: apiKey,
    q: query,
    language: 'vi',
    limit: '1',
  });

  try {
    const response = await fetch(`${OPENCAGE_ENDPOINT}?${searchParams.toString()}`);
    if (!response.ok) {
      console.warn('⚠️  Geocoding request failed', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    const result = data?.results?.[0];
    if (!result) {
      return null;
    }

    const coordinates = parseCoordinates(result.geometry);
    if (!coordinates) {
      return null;
    }

    return {
      type: 'Point',
      coordinates,
      formatted: typeof result.formatted === 'string' ? result.formatted : null,
      components: result.components || null,
    };
  } catch (error) {
    console.error('❌ Geocoding lookup failed:', error);
    return null;
  }
};

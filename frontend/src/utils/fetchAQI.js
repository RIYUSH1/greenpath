// frontend/src/utils/fetchAQI.js
import axios from "axios";

/**
 * fetchAQI(city)
 * - geocodes city -> lat/lon using OpenWeather Geocoding
 * - calls OpenWeather Air Pollution endpoint to get AQI (1..5)
 * - returns { aqi, components, lat, lon } or null on failure
 */
export default async function fetchAQI(city) {
  try {
    if (!city) return null;
    const key = import.meta.env.VITE_OPENWEATHER_KEY;
    if (!key) {
      console.warn("VITE_OPENWEATHER_KEY not set");
      return null;
    }

    // 1) Geocode: name -> lat/lon
    const geoRes = await axios.get("https://api.openweathermap.org/geo/1.0/direct", {
      params: { q: city, limit: 1, appid: key },
    });
    if (!geoRes.data || !geoRes.data[0]) return null;
    const { lat, lon } = geoRes.data[0];

    // 2) Air Pollution: lat/lon -> AQI + components
    const aqiRes = await axios.get("https://api.openweathermap.org/data/2.5/air_pollution", {
      params: { lat, lon, appid: key },
    });
    const item = aqiRes.data?.list?.[0];
    if (!item) return null;

    const aqi = item.main?.aqi;
    const components = item.components || null;

    return { aqi, components, lat, lon };
  } catch (err) {
    console.error("fetchAQI error:", err?.response?.data || err.message || err);
    return null;
  }
}

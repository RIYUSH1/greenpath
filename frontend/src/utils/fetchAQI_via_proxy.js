// frontend/src/utils/fetchAQI_via_proxy.js
import axios from "axios";

export default async function fetchAQIProxy(city) {
  try {
    if (!city) return null;
    const res = await axios.get("http://localhost:5000/api/aqi/city", { params: { city } });
    return res.data; // { aqi, components, lat, lon }
  } catch (err) {
    console.error("fetchAQI proxy error:", err?.response?.data || err.message);
    return null;
  }
}

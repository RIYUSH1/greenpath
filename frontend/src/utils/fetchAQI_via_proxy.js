import axios from "axios";
import { API_BASE_URL } from "../api/config";

export default async function fetchAQIProxy(city) {
  try {
    if (!city) return null;
    const res = await axios.get(`${API_BASE_URL}/api/aqi/city`, { params: { city } });
    return res.data;
  } catch (err) {
    console.error("fetchAQI proxy error:", err?.response?.data || err.message);
    return { error: true, message: err?.response?.data?.message || "AQI data unavailable", city };
  }
}

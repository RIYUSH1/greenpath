import axios from "axios";
import { API_BASE_URL } from "./config";

const API_URL = `${API_BASE_URL}/api/night-safety`;

export const fetchNightSafety = async ({ place, lat, lng }) => {
  const response = await axios.post(API_URL, {
    place,   // OR lat, lng
  });
  return response.data;
};

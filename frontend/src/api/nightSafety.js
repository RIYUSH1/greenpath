import axios from "axios";
import { PYTHON_API_URL } from "./config";
const API_URL = `${PYTHON_API_URL}/api/night-safety`;

export const fetchNightSafety = async ({ place, lat, lng }) => {
  const response = await axios.post(API_URL, {
    place,   // OR lat, lng
  });
  return response.data;
};

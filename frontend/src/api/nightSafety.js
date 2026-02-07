import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api/night-safety";

export const fetchNightSafety = async ({ place, lat, lng }) => {
  const response = await axios.post(API_URL, {
    place,   // OR lat, lng
  });
  return response.data;
};

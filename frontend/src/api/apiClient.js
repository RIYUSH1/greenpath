import axios from "axios";
import { API_BASE_URL, PYTHON_API_URL } from "./config";

// Standard client for Node Backend
export const nodeClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60s for Render cold start
  headers: {
    "Content-Type": "application/json",
  },
});

// Standard client for Python AI Backend
export const pythonClient = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 60000, // 60s for Render cold start
  headers: {
    "Content-Type": "application/json",
  },
});

// Response interceptor for unified error handling
const handleResponseError = (error) => {
  if (error.code === 'ECONNABORTED') {
    console.error("⏳ Request timed out. This is likely due to Render's free tier cold start.");
  }
  return Promise.reject(error);
};

nodeClient.interceptors.response.use((res) => res, handleResponseError);
pythonClient.interceptors.response.use((res) => res, handleResponseError);
